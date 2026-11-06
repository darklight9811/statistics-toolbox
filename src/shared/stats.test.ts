import { describe, expect, it } from 'vitest'
import { computeBoxPlot } from '#/features/box-plot/domain'
import { computeDistribution, computeRange } from '#/features/probability-distribution/domain'
import { computeNormalProbability, invNorm } from '#/features/normal-probability/domain'
import { computeHistogram } from '#/features/histogram/domain'
import { normCdf } from './normal'

describe('normal helpers', () => {
  it('normCdf matches known values', () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 6)
    expect(normCdf(1.96)).toBeCloseTo(0.975, 3)
  })
  it('invNorm inverts normCdf', () => {
    for (const p of [0.01, 0.25, 0.5, 0.9]) expect(normCdf(invNorm(p))).toBeCloseTo(p, 5)
  })
})

describe('box plot', () => {
  it('computes quartiles and outliers', () => {
    const { summaries } = computeBoxPlot([{ label: 'a', values: [1, 2, 3, 4, 5, 100] }])
    expect(summaries[0]).toMatchObject({ n: 6, median: 3.5, q1: 2.25, q3: 4.75, outliers: 1 })
  })
  it('suffixes repeated labels', () => {
    const g = { label: 'x', values: [1, 2] }
    expect(computeBoxPlot([g, g]).summaries.map((s) => s.label)).toEqual(['x', 'x (2)'])
  })
})

describe('probability distribution', () => {
  const d = computeDistribution([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  it('P within ±1σ is about 68%', () => {
    const { mean, sd } = d.stats
    expect(computeRange(d, mean - sd, mean + sd).probability).toBeCloseTo(0.6827, 3)
  })
  it('has the same stats as the histogram', () => {
    const v = [1, 2, 2, 3, 3, 3, 4, 4, 5]
    expect(computeDistribution(v).stats).toMatchObject(computeHistogram(v).stats)
  })
  it('rejects inverted bounds', () => {
    expect(() => computeRange(d, 5, 1)).toThrow()
  })
})

describe('histogram and normal probability', () => {
  it('counts add up to n', () => {
    const h = computeHistogram([1, 2, 2, 3, 3, 3, 4, 4, 5])
    expect(h.bins.reduce((a, b) => a + b.count, 0)).toBe(9)
  })
  it('needs at least 3 numbers', () => {
    expect(() => computeNormalProbability([1, 2])).toThrow()
  })
})
