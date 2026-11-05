import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { useLiveQuery } from '@tanstack/react-db'
import { useMemo } from 'react'
import { Chart } from '@tanstack/charts/react'
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { computeHistogram, parseNumbers } from './domain'
import { runsCollection } from './runs'

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
  binWidth: 'largura da classe',
  bins: 'nº de classes',
}

const fmt = (x: number) => +x.toFixed(4)

const card = 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm'
const input =
  'w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

export function HistogramPage() {
  const { data, bins } = route.useSearch()
  const navigate = useNavigate({ from: route.id })
  const { data: runs } = useLiveQuery((q) => q.from({ r: runsCollection }))

  const form = useForm({
    defaultValues: { data, bins },
    onSubmit: ({ value }) => {
      runsCollection.insert({ id: Date.now(), ...value })
      navigate({ search: value })
    },
  })

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
        marks: [barY(result.data.bins, { x: 'label', y: 'count' })],
        scales: {
          x: { scale: () => scaleBand().padding(0), axis: { label: 'Valor' } },
          y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Contagem' } },
        },
        tooltip,
      }),
    [result.data],
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4 px-4 py-2">
          <Link to="/" className="text-sm text-slate-500 hover:text-indigo-600">
            ← Ferramentas
          </Link>
          <h1 className="text-lg font-bold tracking-tight">📊 Histograma</h1>
        </div>
      </header>

      <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-3 lg:w-80">
          <div className={card}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dados
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
              className="flex flex-col gap-2"
            >
              <form.Field name="data">
                {(f) => (
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Números
                    <span className="text-xs font-normal text-slate-500">
                      Separados por espaço, ponto e vírgula ou quebra de linha (vírgula = decimal)
                    </span>
                    <textarea
                      className={`${input} h-40 resize-y font-mono`}
                      placeholder="1,5 2 2,5 3 3 3,5"
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                    />
                  </label>
                )}
              </form.Field>
              <form.Field name="bins">
                {(f) => (
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Classes
                    <span className="text-xs font-normal text-slate-500">
                      0 = automático (Sturges)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={input}
                      value={f.state.value}
                      onChange={(e) =>
                        f.handleChange(Math.max(0, Math.min(100, Math.trunc(+e.target.value) || 0)))
                      }
                    />
                  </label>
                )}
              </form.Field>
              <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]">
                Gerar histograma
              </button>
            </form>
            {runs.length > 0 && (
              <>
                <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recentes
                </h3>
                <ul className="flex flex-col gap-1">
                  {[...runs].reverse().slice(0, 5).map((r) => (
                    <li key={r.id}>
                      <button
                        className="w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-left font-mono text-xs transition hover:border-indigo-300 hover:bg-indigo-50"
                        onClick={() => {
                          form.reset({ data: r.data, bins: r.bins })
                          navigate({ search: { data: r.data, bins: r.bins } })
                        }}
                      >
                        {r.data.replace(/\s+/g, ' ')}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-3">
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
        </main>
      </div>
    </div>
  )
}
