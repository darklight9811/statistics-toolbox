import { computeBoxPlot } from '../box-plot/domain'
import { computeHistogram } from '../histogram/domain'
import { computeNormalProbability } from '../normal-probability/domain'
import { computeCapability } from '../process-capability/domain'

const f = (x: number) => String(+x.toFixed(4))
/** Values as a LaTeX list: all of them, or the first and last few with an ellipsis. */
const terms = (a: number[], sep: string, fn: (v: number) => string = f) =>
  a.length <= 6 ? a.map(fn).join(sep) : `${a.slice(0, 3).map(fn).join(sep)}${sep}\\dots${sep}${fn(a[a.length - 1])}`

/** Every statistic of the app for one dataset, in the shape the worked examples need. */
export function computeAllStats(values: number[], bins: number, lie?: number, lse?: number) {
  if (values.length < 2) return null
  const h = computeHistogram(values, bins).stats
  const box = computeBoxPlot([{ label: '', values }]).summaries[0]
  const np = values.length >= 3 ? computeNormalProbability(values) : null
  const s = [...values].sort((a, b) => a - b)
  // capability needs limits: without any, the example uses x̄ ± 4s so it always has something to show
  const given = lie !== undefined || lse !== undefined
  const spec = given ? { lie: lie ?? null, lse: lse ?? null } : { lie: +(h.mean - 4 * h.sd).toFixed(2), lse: +(h.mean + 4 * h.sd).toFixed(2) }
  let cap: ReturnType<typeof computeCapability> | null = null
  try {
    cap = computeCapability(values, bins, spec.lie, spec.lse)
  } catch {
    // sd = 0 or inverted limits: capability examples are simply unavailable
  }
  return { ...h, variance: h.sd ** 2, iqr: box.iqr, outliers: box.outliers, np, s, manualBins: bins > 0, cap, spec, specGiven: given, values }
}

type All = NonNullable<ReturnType<typeof computeAllStats>>

/** Worked example of how `key` is obtained from the data: one LaTeX formula per line, numbers substituted and simplified. */
export function statExample(key: string, a: All): string | null {
  const { n, s, mean, sd, q1, q3, iqr } = a
  const sum = s.reduce((x, y) => x + y, 0)
  const dev = (p: number) => terms(s, '+', (v) => `(${f(v)}-${f(mean)})^${p}`)
  const sorted = `\\text{dados ordenados: } ${terms(s, ',\\ ')}`
  const quartile = (name: string, p: number, q: number) => {
    const h = 1 + (n - 1) * p, k = Math.floor(h), fr = h - k
    return [
      sorted,
      `h = 1 + ${p}\\,(n-1) = 1 + ${p}\\cdot ${n - 1} = ${f(h)}`,
      fr === 0
        ? `${name} = x_{(${k})} = ${f(q)}`
        : `${name} = x_{(${k})} + ${f(fr)}\\,\\left(x_{(${k + 1})} - x_{(${k})}\\right) = ${f(s[k - 1])} + ${f(fr)}\\,(${f(s[k])} - ${f(s[k - 1])}) = ${f(q)}`,
    ].join('\n')
  }
  switch (key) {
    case 'n':
      return `${sorted}\nn = ${n}`
    case 'min':
      return `${sorted}\nx_{\\min} = x_{(1)} = ${f(a.min)}`
    case 'max':
      return `${sorted}\nx_{\\max} = x_{(n)} = x_{(${n})} = ${f(a.max)}`
    case 'mean':
      return `\\bar{x} = \\frac{${terms(s, '+')}}{${n}} = \\frac{${f(sum)}}{${n}} = ${f(mean)}`
    case 'median':
      return quartile('\\tilde{x}', 0.5, a.median)
    case 'q1':
      return quartile('Q_1', 0.25, q1)
    case 'q3':
      return quartile('Q_3', 0.75, q3)
    case 'iqr':
      return `\\mathrm{IQR} = Q_3 - Q_1 = ${f(q3)} - ${f(q1)} = ${f(iqr)}`
    case 'outliers': {
      const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr
      const out = s.filter((v) => v < lo || v > hi)
      return [
        `Q_1 - 1.5\\,\\mathrm{IQR} = ${f(q1)} - 1.5\\cdot ${f(iqr)} = ${f(lo)}`,
        `Q_3 + 1.5\\,\\mathrm{IQR} = ${f(q3)} + 1.5\\cdot ${f(iqr)} = ${f(hi)}`,
        `\\text{fora de } [${f(lo)};\\ ${f(hi)}]\\text{: } ${out.length ? terms(out, ',\\ ') : '\\text{nenhum}'} \\Rightarrow ${out.length} \\text{ atípico(s)}`,
      ].join('\n')
    }
    case 'variance':
    case 'sd': {
      const ss = s.reduce((x, y) => x + (y - mean) ** 2, 0)
      return [
        `\\bar{x} = ${f(mean)}`,
        `\\sum (x_i-\\bar{x})^2 = ${dev(2)} = ${f(ss)}`,
        `s^2 = \\frac{${f(ss)}}{${n}-1} = ${f(a.variance)}`,
        ...(key === 'sd' ? [`s = \\sqrt{${f(a.variance)}} = ${f(sd)}`] : []),
      ].join('\n')
    }
    case 'skew':
      return `\\bar{x} = ${f(mean)},\\quad s = ${f(sd)}\ng_1 = \\frac{1}{n}\\sum\\left(\\frac{x_i-\\bar{x}}{s}\\right)^3 = \\frac{${f(a.skew * n)}}{${n}} = ${f(a.skew)}`
    case 'kurt':
      return `\\bar{x} = ${f(mean)},\\quad s = ${f(sd)}\ng_2 = \\frac{1}{n}\\sum\\left(\\frac{x_i-\\bar{x}}{s}\\right)^4 - 3 = \\frac{${f((a.kurt + 3) * n)}}{${n}} - 3 = ${f(a.kurt)}`
    case 'binWidth':
      return `h = \\frac{x_{\\max}-x_{\\min}}{k} = \\frac{${f(a.max)}-${f(a.min)}}{${a.bins}} = ${f(a.binWidth)}`
    case 'bins':
      return a.manualBins
        ? `k = ${a.bins}\\quad\\text{(definido por você; com 0 usa-se Sturges)}`
        : `k = \\lceil \\log_2 ${n} + 1 \\rceil = \\lceil ${f(Math.log2(n) + 1)} \\rceil = ${a.bins}`
    case 'r':
    case 'ad':
    case 'p':
    case 'outside': {
      const np = a.np
      if (!np) return '\\text{Este gráfico precisa de pelo menos 3 valores.}'
      const st = np.stats, p0 = np.points[0]
      if (key === 'r')
        return `p_1 = \\frac{1-0.375}{${n}+0.25} = ${f(p0.p)},\\quad z_1 = \\Phi^{-1}(p_1) = ${f(p0.z)}\nr = \\operatorname{corr}(x_i, z_i) = ${f(st.r)}`
      if (key === 'ad')
        return `\\bar{x} = ${f(mean)},\\quad s = ${f(sd)}\nA^2 = -${n} - \\frac{1}{${n}}\\sum (2i-1)\\left[\\ln F(x_{(i)}) + \\ln\\left(1-F(x_{(${n}+1-i)})\\right)\\right] = ${f(st.ad)}`
      if (key === 'p') {
        const adj = st.ad * (1 + 0.75 / n + 2.25 / (n * n))
        return [
          `A^{*2} = ${f(st.ad)}\\left(1+\\frac{0.75}{${n}}+\\frac{2.25}{${n}^2}\\right) = ${f(adj)}`,
          `p = ${st.p < 0.001 ? '< 0.001' : f(st.p)}`,
          st.p < 0.05 ? '\\text{p < 0,05: há evidência contra a normalidade.}' : '\\text{p ≥ 0,05: não há evidência contra a normalidade.}',
        ].join('\n')
      }
      return `\\text{limite}_i = \\bar{x} + s\\,z_i \\pm 1.96\\cdot ${f(sd)}\\cdot\\frac{\\sqrt{1+z_i^2/2}}{\\sqrt{${n}}}\n\\text{pontos fora: } ${st.outside} \\text{ de } ${n}`
    }
    case 'spec':
    case 'sigmaWithin':
    case 'cp':
    case 'cpk':
    case 'pp':
    case 'ppk':
    case 'outObs':
    case 'outExp':
    case 'ppm':
      return capabilityExample(key, a)
  }
  return null
}

function capabilityExample(key: string, a: All): string {
  const { cap, spec, n, mean, sd, values } = a
  if (!cap) return '\\text{Sem variação nos dados ou limites invertidos: não é possível calcular.}'
  const { lie, lse } = spec
  const st = cap.stats
  const lim = `LIE = ${lie === null ? '\\text{—}' : f(lie)},\\quad LSE = ${lse === null ? '\\text{—}' : f(lse)}`
  const note = a.specGiven ? [] : ['\\text{(limites de exemplo: } \\bar{x} \\pm 4s \\text{)}']
  const w = st.sigmaWithin
  // C_pk-style ratio for one side, with numbers filled in
  const side = (name: string, num: string, val: number, den: string) => `${name} = \\frac{${num}}{3\\cdot ${den}} = ${f(val)}`
  const indexLines = (pre: 'C' | 'P', sigma: number, sym: string) => {
    const lines: string[] = []
    if (lie !== null && lse !== null) lines.push(`${pre}_p = \\frac{LSE-LIE}{6\\,${sym}} = \\frac{${f(lse)}-${f(lie)}}{6\\cdot ${f(sigma)}} = ${f((lse - lie) / (6 * sigma))}`)
    if (lse !== null) lines.push(side(`${pre}_{pu}`, `${f(lse)}-${f(mean)}`, (lse - mean) / (3 * sigma), f(sigma)))
    if (lie !== null) lines.push(side(`${pre}_{pl}`, `${f(mean)}-${f(lie)}`, (mean - lie) / (3 * sigma), f(sigma)))
    return lines
  }
  switch (key) {
    case 'spec': {
      const out = values.filter((v) => (lie !== null && v < lie) || (lse !== null && v > lse))
      return [...note, lim, `\\text{valores fora: } ${out.length ? terms(out, ',\\ ') : '\\text{nenhum}'}`].join('\n')
    }
    case 'sigmaWithin': {
      const mr = values.slice(1).map((v, i) => Math.abs(v - values[i]))
      return [
        'MR_i = |x_i - x_{i-1}|',
        `\\overline{MR} = \\frac{${terms(mr, '+')}}{${n - 1}} = ${f(mr.reduce((x, y) => x + y, 0) / (n - 1))}`,
        `\\hat{\\sigma}_w = \\frac{${f(mr.reduce((x, y) => x + y, 0) / (n - 1))}}{1.128} = ${f(w)}`,
      ].join('\n')
    }
    case 'cp':
      return lie !== null && lse !== null ? [...note, lim, indexLines('C', w, '\\hat{\\sigma}_w')[0]].join('\n') : '\\text{O Cp exige os dois limites (LIE e LSE).}'
    case 'cpk':
      return [...note, lim, `\\hat{\\sigma}_w = ${f(w)}`, ...indexLines('C', w, '\\hat{\\sigma}_w').slice(lie !== null && lse !== null ? 1 : 0), `C_{pk} = \\min(\\dots) = ${f(st.cpk)}`].join('\n')
    case 'pp':
      return lie !== null && lse !== null ? [...note, lim, indexLines('P', sd, 's')[0]].join('\n') : '\\text{O Pp exige os dois limites (LIE e LSE).}'
    case 'ppk':
      return [...note, lim, `s = ${f(sd)}`, ...indexLines('P', sd, 's').slice(lie !== null && lse !== null ? 1 : 0), `P_{pk} = \\min(\\dots) = ${f(st.ppk)}`].join('\n')
    case 'outObs': {
      const k = Math.round(st.outObs * n)
      return [...note, lim, `\\frac{${k}}{${n}} = ${f(st.outObs)} = ${f(st.outObs * 100)}\\%`].join('\n')
    }
    case 'outExp': {
      const zs = [lie === null ? null : (lie - mean) / sd, lse === null ? null : (lse - mean) / sd]
      return [
        ...note,
        lim,
        `\\bar{x} = ${f(mean)},\\quad s = ${f(sd)}`,
        `P = ${zs[0] === null ? '' : `\\Phi(${f(zs[0])})`}${zs[0] !== null && zs[1] !== null ? ' + ' : ''}${zs[1] === null ? '' : `\\left(1-\\Phi(${f(zs[1])})\\right)`} = ${f(st.outExp)} = ${f(st.outExp * 100)}\\%`,
      ].join('\n')
    }
    default: // ppm
      return [...note, lim, `\\mathrm{PPM} = 10^6 \\times ${f(st.outExp)} = ${Math.round(st.ppm)}`].join('\n')
  }
}

/** Small random dataset for examples when no entry is open. */
export const randomValues = () => Array.from({ length: 10 }, () => 1 + Math.floor(Math.random() * 30))
