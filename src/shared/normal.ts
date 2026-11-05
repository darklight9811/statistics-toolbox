/** Standard normal CDF; erfc by Numerical Recipes (relative error < 1.2e-7, also in the tails). */
export function normCdf(z: number): number {
  const x = Math.abs(z) / Math.SQRT2
  const t = 1 / (1 + 0.5 * x)
  const erfc =
    t *
    Math.exp(
      -x * x - 1.26551223 +
        t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    )
  return z >= 0 ? 1 - 0.5 * erfc : 0.5 * erfc
}
