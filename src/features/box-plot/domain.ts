export type Group = { label: string; values: number[] }

const quantile = (sorted: number[], p: number) => {
  const pos = (sorted.length - 1) * p
  const lo = Math.floor(pos)
  return sorted[lo] + (sorted[Math.ceil(pos)] - sorted[lo]) * (pos - lo)
}

export function computeBoxPlot(groups: Group[]) {
  if (!groups.length) throw new Error('Nenhum dado para exibir')
  const seen = new Map<string, number>()
  const summaries = groups.map((g) => {
    if (g.values.length < 2) throw new Error(`"${g.label}": insira pelo menos 2 números`)
    // the chart keys boxes by label, so repeated titles get a suffix
    const k = (seen.get(g.label) ?? 0) + 1
    seen.set(g.label, k)
    const label = k > 1 ? `${g.label} (${k})` : g.label
    const s = [...g.values].sort((a, b) => a - b)
    const n = s.length
    const q1 = quantile(s, 0.25), median = quantile(s, 0.5), q3 = quantile(s, 0.75)
    const iqr = q3 - q1 // same 1.5·IQR Tukey fences the chart draws
    const outliers = s.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length
    return { label, values: s, n, min: s[0], q1, median, q3, max: s[n - 1], iqr, mean: s.reduce((a, b) => a + b, 0) / n, outliers }
  })
  return {
    rows: summaries.flatMap((g) => g.values.map((value) => ({ group: g.label, value }))),
    summaries,
  }
}
