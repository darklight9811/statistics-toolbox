import { Chart } from '@tanstack/charts/react'
import { useRef, useState, type ComponentProps } from 'react'

const SCALE = 2
const COLS = 4
const ROW_H = 22

export type Stat = readonly [label: string, value: string]

/** Renders the chart's SVG plus the stats grid onto a white-background canvas. */
async function toCanvas(svg: SVGSVGElement, stats: readonly Stat[]): Promise<HTMLCanvasElement> {
  const [, , w, h] = svg.getAttribute('viewBox')!.split(' ').map(Number)
  const font = getComputedStyle(svg).fontFamily
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(w))
  clone.setAttribute('height', String(h))
  // the chart inherits color and font from the page, so pin them for the standalone image
  clone.style.cssText = `color:#334155;font-family:${font.replace(/"/g, "'")}`

  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`
  await img.decode()

  const rows = Math.ceil(stats.length / COLS)
  const statsH = stats.length ? rows * ROW_H + 24 : 0
  const canvas = document.createElement('canvas')
  canvas.width = w * SCALE
  canvas.height = (h + statsH) * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h + statsH)
  ctx.drawImage(img, 0, 0, w, h)

  const colW = (w - 32) / COLS
  stats.forEach(([label, value], i) => {
    const x = 16 + (i % COLS) * colW
    const y = h + 20 + Math.floor(i / COLS) * ROW_H
    ctx.font = `12px ${font}`
    ctx.fillStyle = '#64748b'
    ctx.textAlign = 'left'
    ctx.fillText(label, x + 4, y)
    ctx.font = `bold 12px ui-monospace, Menlo, Consolas, monospace`
    ctx.fillStyle = '#4338ca'
    ctx.textAlign = 'right'
    ctx.fillText(value, x + colW - 14, y)
    ctx.strokeStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.moveTo(x, y + 6)
    ctx.lineTo(x + colW - 10, y + 6)
    ctx.stroke()
  })
  return canvas
}

/** Minimal single-page PDF (A4 width) embedding the canvas as a JPEG — no library needed. */
async function toPdfBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const jpeg = new Uint8Array(await (await fetch(canvas.toDataURL('image/jpeg', 0.95))).arrayBuffer())
  const pw = 595
  const ph = Math.round((pw * canvas.height) / canvas.width)
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const offsets: number[] = []
  let size = 0
  const push = (b: Uint8Array | string) => {
    const u = typeof b === 'string' ? enc.encode(b) : b
    parts.push(u)
    size += u.length
  }
  const NL = '\n'
  const obj = (body: string) => {
    offsets.push(size)
    push(`${offsets.length} 0 obj${NL}${body}${NL}endobj${NL}`)
  }
  push(`%PDF-1.4${NL}`)
  obj('<< /Type /Catalog /Pages 2 0 R >>')
  obj('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  obj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`)
  offsets.push(size)
  push(
    `4 0 obj${NL}<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>${NL}stream${NL}`,
  )
  push(jpeg)
  push(`${NL}endstream${NL}endobj${NL}`)
  const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`
  obj(`<< /Length ${content.length} >>${NL}stream${NL}${content}${NL}endstream`)
  const xref = size
  const rows = offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n ${NL}`).join('')
  push(`xref${NL}0 6${NL}0000000000 65535 f ${NL}${rows}`)
  push(`trailer${NL}<< /Size 6 /Root 1 0 R >>${NL}startxref${NL}${xref}${NL}%%EOF`)
  return new Blob(parts as BlobPart[], { type: 'application/pdf' })
}

function download(href: string, name: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = name
  a.click()
}

const btn =
  'rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60'

const Spinner = () => (
  <span className="mr-1 inline-block size-3 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent align-[-2px]" />
)

/** Chart with PNG / PDF export buttons (chart + stats); both download directly. */
export function ExportableChart({
  title,
  fallbackName,
  stats = [],
  ...chart
}: ComponentProps<typeof Chart> & { title: string; fallbackName: string; stats?: readonly Stat[] }) {
  const box = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<'png' | 'pdf' | null>(null)
  // entry title if present (minus characters invalid in file names), else a generic name
  const filename = () => title.replace(/[\\/:*?"<>|]+/g, '-').trim() || fallbackName
  const svg = () => box.current?.querySelector<SVGSVGElement>('svg.ts-chart') ?? null

  const png = async () => {
    const el = svg()
    if (!el) return
    setBusy('png')
    try {
      download((await toCanvas(el, stats)).toDataURL('image/png'), `${filename()}.png`)
    } finally {
      setBusy(null)
    }
  }

  const pdf = async () => {
    const el = svg()
    if (!el) return
    setBusy('pdf')
    try {
      const url = URL.createObjectURL(await toPdfBlob(await toCanvas(el, stats)))
      download(url, `${filename()}.pdf`)
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-end gap-1">
        {busy && <span className="mr-1 text-xs text-slate-500">Gerando {busy === 'pdf' ? 'PDF' : 'PNG'}…</span>}
        <button type="button" className={btn} disabled={!!busy} onClick={png}>
          {busy === 'png' ? <Spinner /> : '⬇ '}PNG
        </button>
        <button type="button" className={btn} disabled={!!busy} onClick={pdf}>
          {busy === 'pdf' ? <Spinner /> : '📄 '}PDF
        </button>
      </div>
      <div ref={box}>
        <Chart {...chart} />
      </div>
    </div>
  )
}
