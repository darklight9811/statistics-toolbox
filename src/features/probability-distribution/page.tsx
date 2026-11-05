import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { areaY, defineChart, lineY, rect, ruleX } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { ExportableChart } from '../dataset-input/exportable-chart'
import { parseNumbers } from '../dataset-input/parse'
import { useEntryValue } from '../dataset-input/runs'
import { ToolLayout, card } from '../dataset-input/tool-layout'
import { computeDistribution, computeRange } from './domain'

const route = getRouteApi('/probability-distribution')

const LABELS: Record<string, string> = {
  n: 'n',
  mean: 'média (μ)',
  sd: 'desvio padrão (σ)',
  variance: 'variância',
  min: 'mínimo',
  max: 'máximo',
}

const fmt = (x: number) => +x.toFixed(4)
const pct = (x: number) => `${(x * 100).toFixed(2)}%`
const bound = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')))
const field =
  'w-28 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

export function ProbabilityDistributionPage() {
  const { run, sel } = route.useSearch()
  const { data, bins, name } = useEntryValue(run)
  const navigate = useNavigate({ from: route.id })

  const result = useQuery({
    queryKey: ['probability-distribution', data, bins],
    queryFn: () => computeDistribution(parseNumbers(data), bins),
    enabled: data.trim() !== '',
    retry: false,
  })

  // probability range, typed live (no Generate needed); empty field = unbounded
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [a, b] = [bound(from), bound(to)]
  const range = useMemo(() => {
    if (!result.data || (a === null && b === null)) return null
    if ((a !== null && !Number.isFinite(a)) || (b !== null && !Number.isFinite(b))) return new Error('Use apenas números nos limites')
    try {
      return computeRange(result.data, a, b)
    } catch (e) {
      return e as Error
    }
  }, [result.data, a, b])
  const region = range && !(range instanceof Error) ? range.region : []

  const chart = useMemo(
    () =>
      result.data &&
      defineChart({
        marks: [
          rect(result.data.bars, { x1: 'x1', x2: 'x2', y1: 'base', y2: 'density', fill: '#a5b4fc', fillOpacity: 0.55, stroke: '#4f46e5', strokeWidth: 1 }),
          areaY(result.data.curve, { x: 'x', y: 'density', y1: 0, fill: '#dc2626', fillOpacity: 0.12 }),
          areaY(region, { x: 'x', y: 'density', y1: 0, fill: '#16a34a', fillOpacity: 0.45 }),
          lineY(result.data.curve, { x: 'x', y: 'density', stroke: '#dc2626', strokeWidth: 2.5 }),
          ruleX(result.data.rules.filter((r) => r.kind === 'sd'), { x: 'x', stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5 4' }),
          ruleX(result.data.rules.filter((r) => r.kind === 'mean'), { x: 'x', stroke: '#16a34a', strokeWidth: 2 }),
        ],
        scales: {
          x: { scale: scaleLinear, nice: true, axis: { label: 'Valor' } },
          y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Densidade de probabilidade' } },
        },
        tooltip,
      }),
    [result.data, region],
  )

  const stats = Object.entries(result.data?.stats ?? {}).map(([k, v]) => [LABELS[k] ?? k, String(fmt(v))] as const)

  return (
    <ToolLayout
      title="🔔 Distribuição de probabilidade"
      value={{ data, bins, name }}
      runId={run}
      selected={sel}
      showBins
      submitLabel="Gerar distribuição"
      onSubmit={(search) => navigate({ search })}
    >
      {result.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error.message}
        </p>
      )}
      {!result.data && !result.isError && (
        <div className={`${card} py-12 text-center text-slate-500`}>
          <div className="mb-2 text-4xl">🔔</div>
          Insira os dados e clique em "Gerar distribuição".
        </div>
      )}
      {result.data && chart && (
        <>
          <section className={card}>
            <ExportableChart
              stats={stats}
              title={name}
              fallbackName="distribuicao-de-probabilidade"
              definition={chart}
              height={360}
              ariaLabel="Distribuição de probabilidade"
            />
            <p className="mt-1 text-xs text-slate-500">
              Barras: densidade observada (área total = 1). Curva vermelha: distribuição normal ajustada (μ, σ). Linha verde: média; tracejadas: μ ± 1σ e μ ± 2σ.
            </p>
          </section>
          <section className={card}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Probabilidade em um intervalo
            </h2>
            <div className="flex flex-wrap items-end gap-3 text-sm">
              <label className="flex flex-col gap-1 font-medium">
                De
                <input className={field} inputMode="decimal" placeholder="−∞" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 font-medium">
                Até
                <input className={field} inputMode="decimal" placeholder="+∞" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              {range && !(range instanceof Error) && (
                <dl className="flex flex-wrap gap-x-5 gap-y-1">
                  <div>
                    <dt className="text-xs text-slate-500">P({a ?? '−∞'} &lt; X &lt; {b ?? '+∞'}) normal</dt>
                    <dd className="font-mono text-lg font-semibold text-green-700">{pct(range.probability)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Observado nos dados</dt>
                    <dd className="font-mono text-lg font-semibold text-indigo-700">{pct(range.observed)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Escore z</dt>
                    <dd className="font-mono text-lg font-semibold text-slate-700">
                      {range.z.map((v) => (v === null ? '—' : fmt(v))).join(' ; ')}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
            {range instanceof Error && <p className="mt-2 text-sm text-red-600">{range.message}</p>}
            {!range && <p className="mt-2 text-xs text-slate-500">Preencha um ou ambos os limites; a área aparece em verde no gráfico.</p>}
          </section>
          <dl className="grid grid-cols-2 gap-x-4 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm sm:grid-cols-3 xl:grid-cols-6">
            {stats.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2 border-b border-slate-100 py-0.5">
                <dt className="truncate text-slate-500">{label}</dt>
                <dd className="font-mono font-semibold text-indigo-700">{value}</dd>
              </div>
            ))}
          </dl>
          <section className={`${card} overflow-x-auto p-0`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-1.5">Intervalo</th>
                  <th className="px-3 py-1.5">De</th>
                  <th className="px-3 py-1.5">Até</th>
                  <th className="px-3 py-1.5">Observado</th>
                  <th className="px-3 py-1.5">Esperado (normal)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {result.data.coverage.map((c) => (
                  <tr key={c.label} className="hover:bg-indigo-50/50">
                    <td className="px-3 py-1 font-sans">{c.label}</td>
                    <td className="px-3 py-1">{fmt(c.from)}</td>
                    <td className="px-3 py-1">{fmt(c.to)}</td>
                    <td className="px-3 py-1">{pct(c.observed)}</td>
                    <td className="px-3 py-1">{pct(c.expected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </ToolLayout>
  )
}
