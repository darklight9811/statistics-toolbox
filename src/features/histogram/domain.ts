export type Bin = { label: string; from: number; to: number; count: number; freq: number; density: number; normal: number }

export function parseNumbers(text: string): number[] {
  // comma is a decimal separator ("3,5"); a trailing comma ("1, 2") still parses as 1 and 2
  return text.split(/[\s;]+/).filter(Boolean).map((t) => Number(t.replace(',', '.'))).filter(Number.isFinite)
}

export function computeHistogram(values: number[], bins?: number) {
  const n = values.length
  if (n < 2) throw new Error('Insira pelo menos 2 números')
  const s = [...values].sort((a, b) => a - b)
  const min = s[0], max = s[n - 1]
  const mean = s.reduce((a, b) => a + b, 0) / n
  const q = (p: number) => {
    const i = (n - 1) * p, lo = Math.floor(i)
    return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo)
  }
  const variance = s.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)
  const sd = Math.sqrt(variance)
  const skew = sd === 0 ? 0 : s.reduce((a, b) => a + ((b - mean) / sd) ** 3, 0) / n
  const k = bins || Math.ceil(Math.log2(n) + 1) // Sturges' rule
  const width = (max - min) / k || 1
  const counts = new Array<number>(k).fill(0)
  for (const v of s) counts[Math.min(k - 1, Math.floor((v - min) / width))]++
  const out: Bin[] = counts.map((count, i) => {
    const from = min + i * width, to = from + width
    return { label: `${+from.toFixed(2)}–${+to.toFixed(2)}`, from, to, count, freq: count / n, density: count / n / width, normal: sd ? (n * width * Math.exp(-(((from + width / 2 - mean) / sd) ** 2) / 2)) / (sd * Math.sqrt(2 * Math.PI)) : 0 }
  })
  return {
    bins: out,
    stats: { n, min, max, mean, median: q(0.5), q1: q(0.25), q3: q(0.75), sd, skew, binWidth: width, bins: k },
  }
}
