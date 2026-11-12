import { computeDistribution, computeRange } from '../probability-distribution/domain'

const D2 = 1.128 // d2 constant for moving ranges of size 2 (individual values)

/**
 * Process capability against specification limits (LIE = lower, LSE = upper; either may be null).
 * Cp/Cpk use the short-term sigma from the moving range (data order matters); Pp/Ppk use the overall sample sd.
 */
export function computeCapability(values: number[], bins: number, lie: number | null, lse: number | null) {
  if (lie !== null && lse !== null && lie >= lse) throw new Error('O limite inferior deve ser menor que o superior')
  const d = computeDistribution(values, bins)
  const { n, min, max, mean, sd } = d.stats
  const sigmaWithin = values.slice(1).reduce((a, v, i) => a + Math.abs(v - values[i]), 0) / (n - 1) / D2

  const index = (s: number) => {
    const sides = [lse === null ? null : (lse - mean) / (3 * s), lie === null ? null : (mean - lie) / (3 * s)].filter((x) => x !== null)
    return { p: lie !== null && lse !== null ? (lse - lie) / (6 * s) : null, pk: sides.length ? Math.min(...sides) : null }
  }
  const within = index(sigmaWithin), overall = index(sd)

  const lower = lie === null ? null : computeRange(d, null, lie)
  const upper = lse === null ? null : computeRange(d, lse, null)
  const outExp = (lower?.probability ?? 0) + (upper?.probability ?? 0)
  const outObs = values.filter((v) => (lie !== null && v < lie) || (lse !== null && v > lse)).length / n

  const stats: Record<string, number> = { n, min, max, mean, sd, sigmaWithin }
  if (lie !== null || lse !== null) {
    if (within.p !== null) stats.cp = within.p
    stats.cpk = within.pk!
    if (overall.p !== null) stats.pp = overall.p
    stats.ppk = overall.pk!
    Object.assign(stats, { outObs, outExp, ppm: outExp * 1e6 })
  }
  return { d, stats, lower, upper }
}

/** Verdict for a Cpk/Ppk value (usual industry thresholds). */
export function verdict(cpk: number) {
  if (cpk >= 1.67) return { label: 'Excelente', color: 'bg-green-100 text-green-800' }
  if (cpk >= 1.33) return { label: 'Capaz', color: 'bg-green-100 text-green-800' }
  if (cpk >= 1) return { label: 'Marginal', color: 'bg-amber-100 text-amber-800' }
  return { label: 'Incapaz', color: 'bg-red-100 text-red-800' }
}
