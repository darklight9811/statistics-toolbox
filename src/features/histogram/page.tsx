import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Chart } from '@tanstack/charts/react'
import { barY, defineChart, lineY } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { parseNumbers } from '../dataset-input/parse'
import { ToolLayout, card } from '../dataset-input/tool-layout'
import { computeHistogram } from './domain'

const route = getRouteApi('/histogram')

const LABELS: Record<string, string> = {
  n: 'n',
  min: 'mínimo',
  max: 'máximo',
  mean: 'média',
  median: 'mediana',
  q1: 'Q1',
  q3: 'Q3',
  sd: 'desvio padrão',
  skew: 'assimetria',
  kurt: 'curtose',
  binWidth: 'largura da classe',
  bins: 'nº de classes',
}

const fmt = (x: number) => +x.toFixed(4)

export function HistogramPage() {
  const { data, bins, name, run } = route.useSearch()
  const navigate = useNavigate({ from: route.id })

  const result = useQuery({
    queryKey: ['histogram', data, bins],
    queryFn: () => computeHistogram(parseNumbers(data), bins),
    enabled: data.trim() !== '',
    retry: false,
  })

  const chart = useMemo(
    () =>
      result.data &&
      defineChart({
        marks: [
          barY(result.data.bins, { x: 'label', y: 'count' }),
          lineY(result.data.bins, { x: 'label', y: 'normal', stroke: '#dc2626', strokeWidth: 2, points: true }),
        ],
        scales: {
          x: { scale: () => scaleBand().padding(0), axis: { label: 'Valor' } },
          y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Contagem' } },
        },
        tooltip,
      }),
    [result.data],
  )

  return (
    <ToolLayout
      title="📊 Histograma"
      value={{ data, bins, name }}
      runId={run}
      showBins
      submitLabel="Gerar histograma"
      onSubmit={(search) => navigate({ search })}
    >
      {result.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error.message}
        </p>
      )}
      {!result.data && !result.isError && (
        <div className={`${card} py-12 text-center text-slate-500`}>
          <div className="mb-2 text-4xl">📈</div>
          Insira os dados e clique em "Gerar histograma".
        </div>
      )}
      {result.data && chart && (
        <>
          <section className={card}>
            <Chart definition={chart} height={300} ariaLabel="Histograma" />
          </section>
          <dl className="grid grid-cols-2 gap-x-4 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm sm:grid-cols-3 xl:grid-cols-4">
            {Object.entries(result.data.stats).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-slate-100 py-0.5">
                <dt className="truncate text-slate-500">{LABELS[k] ?? k}</dt>
                <dd className="font-mono font-semibold text-indigo-700">{fmt(v)}</dd>
              </div>
            ))}
          </dl>
          <section className={`${card} overflow-x-auto p-0`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-1.5">Classe</th>
                  <th className="px-3 py-1.5">Contagem</th>
                  <th className="px-3 py-1.5">Freq. relativa</th>
                  <th className="px-3 py-1.5">Densidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {result.data.bins.map((b) => (
                  <tr key={b.label} className="hover:bg-indigo-50/50">
                    <td className="px-3 py-1">{b.label}</td>
                    <td className="px-3 py-1">{b.count}</td>
                    <td className="px-3 py-1">{fmt(b.freq)}</td>
                    <td className="px-3 py-1">{fmt(b.density)}</td>
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
