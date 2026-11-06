import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { defineChart, dot, lineY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { parseNumbers } from '../dataset-input/parse'
import { ExportableChart } from '../dataset-input/exportable-chart'
import { useEntryValue } from '../dataset-input/runs'
import { ToolLayout, card } from '../dataset-input/tool-layout'
import { computeNormalProbability, invNorm } from './domain'

const route = getRouteApi('/normal-probability')

const PERCENTS = [1, 5, 10, 25, 50, 75, 90, 95, 99]
const TICKS = PERCENTS.map((p) => invNorm(p / 100))
const percentOf = (z: number) => `${PERCENTS[TICKS.findIndex((t) => Math.abs(t - z) < 1e-9)]}%`

const LABELS: Record<string, string> = {
  n: 'n',
  min: 'm�nimo',
  max: 'm�ximo',
  median: 'mediana',
  q1: 'Q1',
  q3: 'Q3',
  skew: 'assimetria',
  kurt: 'curtose',
  mean: 'média',
  sd: 'desvio padrão',
  r: 'correlação (r)',
  ad: 'A² (Anderson-Darling)',
  p: 'p-valor',
  outside: 'fora dos limites 95%',
}
const fmt = (x: number) => +x.toFixed(4)
const show = (k: string, v: number) => (k === 'p' ? (v < 0.001 ? '< 0.001' : v.toFixed(3)) : String(fmt(v)))

export function NormalProbabilityPage() {
  const { run, sel } = route.useSearch()
  const { data, bins, name } = useEntryValue(run)
  const navigate = useNavigate({ from: route.id })

  const result = useQuery({
    queryKey: ['normal-probability', data],
    queryFn: () => computeNormalProbability(parseNumbers(data)),
    enabled: data.trim() !== '',
    retry: false,
  })

  const chart = useMemo(
    () =>
      result.data &&
      defineChart({
        marks: [
          lineY(result.data.lower, { x: 'x', y: 'z', stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5 4' }),
          lineY(result.data.upper, { x: 'x', y: 'z', stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5 4' }),
          lineY(result.data.fit, { x: 'x', y: 'z', stroke: '#dc2626', strokeWidth: 2 }),
          dot(result.data.points, { x: 'x', y: 'z', fill: '#4f46e5', r: 3.5 }),
        ],
        scales: {
          x: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Valor' } },
          y: {
            scale: scaleLinear,
            grid: true,
            axis: { label: 'Probabilidade acumulada', ticks: { values: TICKS, format: percentOf } },
          },
        },
        tooltip,
      }),
    [result.data],
  )

  return (
    <ToolLayout
      title="📉 Gráfico probabilístico normal"
      value={{ data, bins, name }}
      runId={run}
      selected={sel}
      submitLabel="Gerar gráfico"
      onSubmit={(search) => navigate({ search })}
    >
      {result.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error.message}
        </p>
      )}
      {!result.data && !result.isError && (
        <div className={`${card} py-12 text-center text-slate-500`}>
          <div className="mb-2 text-4xl">📉</div>
          Insira os dados e clique em "Gerar gráfico".
        </div>
      )}
      {result.data && chart && (
        <>
          <section className={card}>
            <ExportableChart
              stats={Object.entries(result.data.stats).map(([k, v]) => [LABELS[k] ?? k, show(k, v)] as const)}
              title={name} fallbackName="grafico-probabilistico-normal" definition={chart} height={360} ariaLabel="Gráfico probabilístico normal" />
            <p className="mt-1 text-xs text-slate-500">
              Quanto mais os pontos seguirem a reta vermelha e ficarem dentro das linhas tracejadas (limites de 95%, α = 5%), mais os dados se aproximam de uma distribuição normal.
            </p>
          </section>
          <dl className="grid grid-cols-2 gap-x-4 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm sm:grid-cols-4">
            {Object.entries(result.data.stats).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-slate-100 py-0.5">
                <dt className="truncate text-slate-500">{LABELS[k] ?? k}</dt>
                <dd className="font-mono font-semibold text-indigo-700">{show(k, v)}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </ToolLayout>
  )
}
