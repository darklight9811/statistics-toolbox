import { computeCapability } from '#/features/process-capability/domain'
import { STATS } from '#/features/stats-card/catalog'
import { computeAllStats, statExample } from '#/features/stats-card/examples'
import katex from 'katex'
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
  it('shares the histogram stats', () => {
    const v = [1, 2, 2, 3, 3, 3, 4, 4, 5]
    const { n, min, max, mean, median, q1, q3, sd, skew, kurt } = computeHistogram(v).stats
    expect(computeNormalProbability(v).stats).toMatchObject({ n, min, max, mean, median, q1, q3, sd, skew, kurt })
  })
  it('needs at least 3 numbers', () => {
    expect(() => computeNormalProbability([1, 2])).toThrow()
  })
})

describe('stat examples', () => {
  const v = [1, 2, 2, 3, 3, 3, 4, 4, 5]
  const all = computeAllStats(v, 0)!
  it('every catalog stat has an example ending in its computed value', () => {
    for (const k of Object.keys(STATS)) expect(statExample(k, all), k).toBeTruthy()
    expect(statExample('mean', all)).toContain(`= ${+all.mean.toFixed(4)}`)
    expect(statExample('q1', all)).toContain(`${+all.q1.toFixed(4)}`)
  })
  it('formulas and examples are valid LaTeX', () => {
    for (const [k, m] of Object.entries(STATS)) {
      expect(() => katex.renderToString(m.formula, { throwOnError: true }), k).not.toThrow()
      for (const line of statExample(k, all)!.split('\n')) expect(() => katex.renderToString(line, { throwOnError: true }), `${k}: ${line}`).not.toThrow()
    }
  })
})

describe('entries backup', () => {
  it('imports a backup file, replacing by id and adding new ones', async () => {
    const { importEntries, serializeEntries } = await import('#/features/dataset-input/backup')
    const { runsCollection } = await import('#/features/dataset-input/runs')
    const file = (text: string) => ({ text: async () => text }) as File
    const n = await importEntries(file(serializeEntries([{ id: 1, name: 'a', data: '1 2 3', bins: 0 }, { id: 2, data: '4 5', bins: 3 }])))
    expect(n).toBe(2)
    await importEntries(file(serializeEntries([{ id: 1, name: 'b', data: '9', bins: 0 }])))
    expect(runsCollection.get(1)?.name).toBe('b')
    expect(runsCollection.has(2)).toBe(true)
    await expect(importEntries(file('{"x":1}'))).rejects.toThrow()
    await expect(importEntries(file('nope'))).rejects.toThrow()
  })
})

describe('process capability', () => {
  const v = [9, 10, 11, 10, 9, 11, 10, 12, 8, 10]
  it('Pp = width / 6s and Ppk equals Pp when centred', () => {
    const { d, stats } = computeCapability(v, 0, d0(v) - 3, d0(v) + 3)
    expect(stats.pp).toBeCloseTo(6 / (6 * d.stats.sd), 6)
    expect(stats.ppk).toBeCloseTo(stats.pp, 6)
  })
  it('one-sided limit gives Cpk but no Cp; expected out of spec is the normal tail', () => {
    const { stats, d } = computeCapability(v, 0, null, 12)
    expect(stats.cp).toBeUndefined()
    expect(stats.cpk).toBeCloseTo((12 - d.stats.mean) / (3 * stats.sigmaWithin), 6)
    expect(stats.outObs).toBe(0)
    expect(stats.outExp).toBeGreaterThan(0)
  })
  it('counts observed values outside the limits and rejects inverted limits', () => {
    expect(computeCapability(v, 0, 9, 11).stats.outObs).toBeCloseTo(0.2, 6) // 8 and 12 out; 9 and 11 are in
    expect(() => computeCapability(v, 0, 12, 9)).toThrow()
  })
})
function d0(v: number[]) {
  return v.reduce((a, b) => a + b, 0) / v.length
}
