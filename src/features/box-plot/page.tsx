import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLiveQuery } from '@tanstack/react-db'
import { useMemo } from 'react'
import { boxY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { ExportableChart } from '../dataset-input/exportable-chart'
import { parseNumbers } from '../dataset-input/parse'
import { runsCollection, useEntryValue } from '../dataset-input/runs'
import { ToolLayout, card } from '../dataset-input/tool-layout'
import { StatHint } from '../stats-card/stat-hint'
import { computeBoxPlot, type Group } from './domain'

const route = getRouteApi('/box-plot')

const fmt = (x: number) => +x.toFixed(4)

export function BoxPlotPage() {
  const { run, sel } = route.useSearch()
  const { data, bins, name } = useEntryValue(run)
  const navigate = useNavigate({ from: route.id })
  const { data: runs } = useLiveQuery((q) => q.from({ r: runsCollection }))

  // ticked entries become boxes; with none ticked, the data in the form is plotted alone
  const groups: Group[] = useMemo(() => {
    const picked = sel.flatMap((id) => runs.find((r) => r.id === id) ?? [])
    if (picked.length) return picked.map((r, i) => ({ label: r.name || `Entrada ${i + 1}`, values: parseNumbers(r.data) }))
    return data.trim() ? [{ label: name || 'Dados', values: parseNumbers(data) }] : []
  }, [sel, runs, data, name])

  const result = useQuery({
    queryKey: ['box-plot', groups],
    queryFn: () => computeBoxPlot(groups),
    enabled: groups.length > 0,
    retry: false,
  })

  const chart = useMemo(
    () =>
      result.data &&
      defineChart({
        marks: [boxY(result.data.rows, { x: 'group', y: 'value', fill: '#c7d2fe', stroke: '#4f46e5', strokeWidth: 1.5 })],
        scales: {
          x: { scale: () => scaleBand().padding(0.4), axis: { label: 'Entrada' } },
          y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Valor' } },
        },
        tooltip,
      }),
    [result.data],
  )

  // one export row per box: n, Q1, mediana, Q3
  const stats = (result.data?.summaries ?? []).flatMap((s) =>
    [['n', s.n], ['Q1', s.q1], ['mediana', s.median], ['Q3', s.q3]].map(([k, v]) => [`${s.label} · ${k}`, String(fmt(v as number))] as const),
  )

  return (
    <ToolLayout
      title="📦 Box-plot"
      value={{ data, bins, name }}
      runId={run}
      selected={sel}
      onToggle={(id) =>
        navigate({ search: (prev) => ({ ...prev, sel: prev.sel.includes(id) ? prev.sel.filter((s) => s !== id) : [...prev.sel, id] }) })
      }
      submitLabel="Gerar box-plot"
      // saving or opening an entry also ticks it, so it shows up as a box
      onSubmit={(search) =>
        navigate({ search: { ...search, sel: search.run === undefined || search.sel.includes(search.run) ? search.sel : [...search.sel, search.run] } })
      }
    >
      {result.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error.message}
        </p>
      )}
      {!result.data && !result.isError && (
        <div className={`${card} py-12 text-center text-slate-500`}>
          <div className="mb-2 text-4xl">📦</div>
          Insira os dados ou marque entradas em "Entradas" para compará-las.
        </div>
      )}
      {result.data && chart && (
        <>
          <section className={card}>
            <ExportableChart
              stats={stats}
              title={sel.length > 1 ? '' : name}
              fallbackName="box-plot"
              definition={chart}
              height={360}
              ariaLabel="Box-plot"
            />
            <p className="mt-1 text-xs text-slate-500">
              Caixa: Q1 a Q3 com a mediana; hastes: até 1,5 × IQR; pontos: valores atípicos.
            </p>
          </section>
          <section className={`${card} overflow-x-auto p-0`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-1.5">Entrada</th>
                  {[['n', 'n'], ['min', 'Mín'], ['q1', 'Q1'], ['median', 'Mediana'], ['q3', 'Q3'], ['max', 'Máx'], ['iqr', 'IQR'], ['mean', 'Média'], ['outliers', 'Atípicos']].map(([k, h]) => (
                    <th key={k} className="px-3 py-1.5"><StatHint k={k} run={run ?? sel[0]}>{h}</StatHint></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {result.data.summaries.map((s) => (
                  <tr key={s.label} className="hover:bg-indigo-50/50">
                    <td className="px-3 py-1 font-sans">{s.label}</td>
                    {[s.n, s.min, s.q1, s.median, s.q3, s.max, s.iqr, s.mean, s.outliers].map((v, i) => (
                      <td key={i} className="px-3 py-1">{fmt(v)}</td>
                    ))}
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
