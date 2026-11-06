import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { barY, defineChart, lineY } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { parseNumbers } from '../dataset-input/parse'
import { ExportableChart } from '../dataset-input/exportable-chart'
import { useEntryValue } from '../dataset-input/runs'
import { ToolLayout, card } from '../dataset-input/tool-layout'
import { StatsCard } from '../stats-card/stats-card'
import { statRows } from '../stats-card/catalog'
import { computeHistogram } from './domain'

const route = getRouteApi('/histogram')

const fmt = (x: number) => +x.toFixed(4)

export function HistogramPage() {
  const { run, sel } = route.useSearch()
  const { data, bins, name } = useEntryValue(run)
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
      selected={sel}
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
            <ExportableChart
              stats={statRows(result.data.stats)}
              title={name} fallbackName="histograma" definition={chart} height={300} ariaLabel="Histograma" />
          </section>
          <StatsCard stats={result.data.stats} run={run} />
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
