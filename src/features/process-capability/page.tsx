import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { areaY, defineChart, lineY, rect, ruleX } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { ExportableChart } from '../dataset-input/exportable-chart'
import { parseNumbers } from '../dataset-input/parse'
import { useEntryValue } from '../dataset-input/runs'
import { ToolLayout, card, field } from '../dataset-input/tool-layout'
import { statRows } from '../stats-card/catalog'
import { StatHint } from '../stats-card/stat-hint'
import { StatsCard } from '../stats-card/stats-card'
import { computeCapability, verdict } from './domain'

const route = getRouteApi('/process-capability')

const toNum = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')))
const round = (x: number) => String(+x.toFixed(3))
const PRESETS = [3, 4, 6]

export function ProcessCapabilityPage() {
  const { run, sel, lie: lieUrl, lse: lseUrl } = route.useSearch()
  const { data, bins, name } = useEntryValue(run)
  const navigate = useNavigate({ from: route.id })

  // limits are typed live; the URL keeps them (small numbers, not data) so links and tool switches in the docs keep them
  const [lieTxt, setLieTxt] = useState(lieUrl?.toString() ?? '')
  const [lseTxt, setLseTxt] = useState(lseUrl?.toString() ?? '')
  const [lie, lse] = [toNum(lieTxt), toNum(lseTxt)]
  const badLimit = (lie !== null && !Number.isFinite(lie)) || (lse !== null && !Number.isFinite(lse))
  const setLimits = (a: string, b: string) => {
    setLieTxt(a)
    setLseTxt(b)
    const ok = (x: number | null) => (x !== null && Number.isFinite(x) ? x : undefined)
    navigate({ search: (p) => ({ ...p, lie: ok(toNum(a)), lse: ok(toNum(b)) }), replace: true })
  }

  const result = useQuery({
    queryKey: ['process-capability', data, bins, lie, lse],
    queryFn: () => computeCapability(parseNumbers(data), bins, lie, lse),
    enabled: data.trim() !== '' && !badLimit,
    retry: false,
  })
  const r = result.data

  const chart = useMemo(
    () =>
      r &&
      defineChart({
        marks: [
          rect(r.d.bars, { x1: 'x1', x2: 'x2', y1: 'base', y2: 'density', fill: '#a5b4fc', fillOpacity: 0.55, stroke: '#4f46e5', strokeWidth: 1 }),
          areaY(r.lower?.region ?? [], { x: 'x', y: 'density', y1: 0, fill: '#dc2626', fillOpacity: 0.4 }),
          areaY(r.upper?.region ?? [], { x: 'x', y: 'density', y1: 0, fill: '#dc2626', fillOpacity: 0.4 }),
          lineY(r.d.curve, { x: 'x', y: 'density', stroke: '#475569', strokeWidth: 2 }),
          ruleX(r.d.rules.filter((x) => x.kind === 'mean'), { x: 'x', stroke: '#16a34a', strokeWidth: 2 }),
          ruleX([lie, lse].flatMap((x) => (x === null ? [] : [{ x }])), { x: 'x', stroke: '#dc2626', strokeWidth: 2.5, strokeDasharray: '6 4' }),
        ],
        scales: {
          x: { scale: scaleLinear, nice: true, axis: { label: 'Valor' } },
          y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Densidade de probabilidade' } },
        },
        tooltip,
      }),
    [r, lie, lse],
  )

  const cpk = r?.stats.cpk
  const v = cpk === undefined ? null : verdict(cpk)

  return (
    <ToolLayout
      title="🏭 Capacidade do processo"
      value={{ data, bins, name }}
      runId={run}
      selected={sel}
      showBins
      submitLabel="Gerar análise"
      onSubmit={(search) => navigate({ search: (p) => ({ ...search, lie: p.lie, lse: p.lse }) })}
    >
      {result.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{result.error.message}</p>
      )}
      {!data.trim() && (
        <div className={`${card} py-12 text-center text-slate-500`}>
          <div className="mb-2 text-4xl">🏭</div>
          Insira os dados (na ordem em que foram medidos) e clique em "Gerar análise".
        </div>
      )}
      {data.trim() && (
        <section className={card}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <StatHint k="spec" run={run} />
          </h2>
          <div className="flex flex-wrap items-end gap-3 text-sm">
            <label className="flex flex-col gap-1 font-medium">
              LIE (inferior)
              <input className={field} inputMode="decimal" placeholder="sem limite" value={lieTxt} onChange={(e) => setLimits(e.target.value, lseTxt)} />
            </label>
            <label className="flex flex-col gap-1 font-medium">
              LSE (superior)
              <input className={field} inputMode="decimal" placeholder="sem limite" value={lseTxt} onChange={(e) => setLimits(lieTxt, e.target.value)} />
            </label>
            {r && (
              <span className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                Sugerir:
                {PRESETS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50"
                    onClick={() => setLimits(round(r.d.stats.mean - k * r.d.stats.sd), round(r.d.stats.mean + k * r.d.stats.sd))}
                  >
                    μ ± {k}σ
                  </button>
                ))}
                <button type="button" className="rounded-lg px-2 py-1 text-slate-500 hover:text-red-600" onClick={() => setLimits('', '')}>
                  Limpar
                </button>
              </span>
            )}
            {v && (
              <span className={`ml-auto rounded-full px-3 py-1 text-sm font-semibold ${v.color}`}>
                Cpk {round(cpk!)} · {v.label}
              </span>
            )}
          </div>
          {badLimit && <p className="mt-2 text-sm text-red-600">Use apenas números nos limites</p>}
          {r && lie === null && lse === null && (
            <p className="mt-2 text-xs text-slate-500">Informe um ou ambos os limites para calcular Cp, Cpk, Pp e Ppk. Altere-os à vontade: tudo se atualiza na hora.</p>
          )}
        </section>
      )}
      {r && chart && (
        <>
          <section className={card}>
            <ExportableChart
              stats={statRows(r.stats)}
              title={name}
              fallbackName="capacidade-do-processo"
              definition={chart}
              height={360}
              ariaLabel="Capacidade do processo"
            />
            <p className="mt-1 text-xs text-slate-500">
              Barras: densidade observada. Curva: normal ajustada (média e σ geral). Linha verde: média; tracejadas vermelhas: LIE e LSE; áreas vermelhas: fração esperada fora da especificação.
            </p>
          </section>
          <StatsCard stats={r.stats} run={run} lie={lieUrl} lse={lseUrl} />
        </>
      )}
    </ToolLayout>
  )
}
