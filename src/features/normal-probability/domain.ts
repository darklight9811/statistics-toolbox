import { normCdf } from '#/shared/normal'

/** Inverse standard normal CDF (Acklam's rational approximation, rel. error < 1.2e-9). */
export function invNorm(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239]
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572]
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416]
  const tail = (q: number) =>
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  if (p < 0.02425) return tail(Math.sqrt(-2 * Math.log(p)))
  if (p > 1 - 0.02425) return -tail(Math.sqrt(-2 * Math.log(1 - p)))
  const q = p - 0.5, r = q * q
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  )
}

/** Anderson-Darling normality test (mean and sd estimated); p-value by D'Agostino & Stephens. */
function andersonDarling(sorted: number[], mean: number, sd: number) {
  const n = sorted.length
  const F = sorted.map((v) => Math.min(1 - 1e-12, Math.max(1e-12, normCdf((v - mean) / sd))))
  let s = 0
  for (let i = 0; i < n; i++) s += (2 * i + 1) * (Math.log(F[i]) + Math.log(1 - F[n - 1 - i]))
  const a2 = -n - s / n
  const a = a2 * (1 + 0.75 / n + 2.25 / (n * n))
  const p =
    a >= 0.6 ? Math.exp(1.2937 - 5.709 * a + 0.0186 * a * a)
    : a >= 0.34 ? Math.exp(0.9177 - 4.279 * a - 1.38 * a * a)
    : a >= 0.2 ? 1 - Math.exp(-8.318 + 42.796 * a - 59.938 * a * a)
    : 1 - Math.exp(-13.436 + 101.14 * a - 223.73 * a * a)
  return { a2, p: Math.min(1, Math.max(0, p)) }
}

/** Two-sided 95% limits (alpha = 5%) around the fitted line: x_p ± 1.96 · sd · sqrt(1 + z²/2) / sqrt(n). */
const Z95 = 1.959964

export function computeNormalProbability(values: number[]) {
  const n = values.length
  if (n < 3) throw new Error('Insira pelo menos 3 números')
  const x = [...values].sort((a, b) => a - b)
  // Blom plotting positions
  const points = x.map((v, i) => ({ x: v, p: (i + 1 - 0.375) / (n + 0.25), z: invNorm((i + 1 - 0.375) / (n + 0.25)) }))
  const mean = x.reduce((a, b) => a + b, 0) / n
  const sd = Math.sqrt(x.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1))
  const zMean = points.reduce((a, p) => a + p.z, 0) / n
  const sxz = points.reduce((a, p) => a + (p.x - mean) * (p.z - zMean), 0)
  const szz = points.reduce((a, p) => a + (p.z - zMean) ** 2, 0)
  const sxx = x.reduce((a, b) => a + (b - mean) ** 2, 0)
  const r = sxx === 0 ? 0 : sxz / Math.sqrt(sxx * szz) // closer to 1 = closer to normal
  const zs = [points[0].z, points[n - 1].z]
  const half = (z: number) => (Z95 * sd * Math.sqrt(1 + (z * z) / 2)) / Math.sqrt(n)
  const grid = Array.from({ length: 41 }, (_, i) => zs[0] + ((zs[1] - zs[0]) * i) / 40)
  const lower = grid.map((z) => ({ x: mean + sd * z - half(z), z }))
  const upper = grid.map((z) => ({ x: mean + sd * z + half(z), z }))
  const ad = sd === 0 ? { a2: 0, p: 0 } : andersonDarling(x, mean, sd)
  const outside = points.filter((p) => Math.abs(p.x - (mean + sd * p.z)) > half(p.z)).length
  return {
    points,
    fit: zs.map((z) => ({ x: mean + sd * z, z })),
    lower,
    upper,
    stats: { n, mean, sd, r, ad: ad.a2, p: ad.p, outside },
  }
}
