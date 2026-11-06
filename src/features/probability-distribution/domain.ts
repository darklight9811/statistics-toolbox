import { normCdf } from '#/shared/normal'

const SQRT_2PI = Math.sqrt(2 * Math.PI)
const pdf = (x: number, mean: number, sd: number) => Math.exp(-(((x - mean) / sd) ** 2) / 2) / (sd * SQRT_2PI)

/** Share of a normal distribution within ±k standard deviations (the 68-95-99.7 rule). */
const EXPECTED = [0.6827, 0.9545, 0.9973]

export function computeDistribution(values: number[], bins?: number) {
  const n = values.length
  if (n < 2) throw new Error('Insira pelo menos 2 números')
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)
  const sd = Math.sqrt(variance)
  if (sd === 0) throw new Error('Todos os valores são iguais: desvio padrão zero')
  const s = [...values].sort((a, b) => a - b)
  const min = s[0], max = s[n - 1]
  const q = (p: number) => {
    const i = (n - 1) * p, lo = Math.floor(i)
    return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo)
  }
  const skew = s.reduce((a, b) => a + ((b - mean) / sd) ** 3, 0) / n
  const kurt = s.reduce((a, b) => a + ((b - mean) / sd) ** 4, 0) / n - 3 // excess kurtosis

  // empirical density: bars whose total area is 1, comparable with the curve
  const k = bins || Math.ceil(Math.log2(n) + 1) // Sturges' rule
  const width = (max - min) / k
  const counts = new Array<number>(k).fill(0)
  for (const v of values) counts[Math.min(k - 1, Math.floor((v - min) / width))]++
  const bars = counts.map((c, i) => ({ x1: min + i * width, x2: min + (i + 1) * width, density: c / n / width, base: 0 }))

  // fitted normal density curve
  const lo = Math.min(min, mean - 3.5 * sd), hi = Math.max(max, mean + 3.5 * sd)
  const curve = Array.from({ length: 121 }, (_, i) => {
    const x = lo + ((hi - lo) * i) / 120
    return { x, density: pdf(x, mean, sd) }
  })

  const rules = [
    { x: mean, kind: 'mean' },
    ...[1, 2].flatMap((m) => [{ x: mean - m * sd, kind: 'sd' }, { x: mean + m * sd, kind: 'sd' }]),
  ]

  const coverage = [1, 2, 3].map((m, i) => ({
    label: `μ ± ${m}σ`,
    from: mean - m * sd,
    to: mean + m * sd,
    observed: values.filter((v) => Math.abs(v - mean) <= m * sd).length / n,
    expected: EXPECTED[i],
  }))

  return { bars, curve, rules, coverage, values, stats: { n, min, max, mean, median: q(0.5), q1: q(0.25), q3: q(0.75), sd, variance, skew, kurt, binWidth: width, bins: k } }
}

/** P(a < X < b) under the fitted normal and in the data; an empty bound means unbounded. */
export function computeRange(d: ReturnType<typeof computeDistribution>, a: number | null, b: number | null) {
  const { mean, sd, n } = d.stats
  const lo = a ?? -Infinity, hi = b ?? Infinity
  if (lo > hi) throw new Error('O limite inferior deve ser menor ou igual ao superior')
  const z = (x: number) => (x - mean) / sd
  const from = Math.max(lo, d.curve[0].x), to = Math.min(hi, d.curve[d.curve.length - 1].x)
  return {
    z: [a === null ? null : z(lo), b === null ? null : z(hi)] as const,
    probability: normCdf(z(hi)) - normCdf(z(lo)),
    observed: d.values.filter((v) => v >= lo && v <= hi).length / n,
    // shaded area under the curve between the bounds
    region: from < to ? Array.from({ length: 81 }, (_, i) => { const x = from + ((to - from) * i) / 80; return { x, density: pdf(x, mean, sd) } }) : [],
  }
}
