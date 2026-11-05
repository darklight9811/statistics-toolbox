import { Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useLiveQuery } from '@tanstack/react-db'
import type { ReactNode } from 'react'
import { runsCollection } from './runs'

export const card = 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm'
const input =
  'w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

type Value = { data: string; bins: number }
type Search = Value & { run?: number }

/** Shared page frame for every tool: header, data form and recent entries (shared across tools). */
export function ToolLayout({
  title,
  value,
  runId,
  showBins = false,
  submitLabel,
  onSubmit,
  children,
}: {
  title: string
  value: Value
  runId?: number
  showBins?: boolean
  submitLabel: string
  onSubmit: (search: Search) => void
  children: ReactNode
}) {
  const { data: runs } = useLiveQuery((q) => q.from({ r: runsCollection }))

  const form = useForm({
    defaultValues: value,
    onSubmit: ({ value }) => {
      // editing an open entry updates it; otherwise a new entry is created
      let id = runId
      if (id !== undefined && runsCollection.has(id)) {
        runsCollection.update(id, (draft) => {
          draft.data = value.data
          draft.bins = value.bins
        })
      } else {
        id = Date.now()
        runsCollection.insert({ id, ...value })
      }
      onSubmit({ ...value, run: id })
    },
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4 px-4 py-2">
          <Link to="/" className="text-sm text-slate-500 hover:text-indigo-600">
            ← Ferramentas
          </Link>
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
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
              {showBins && (
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
              )}
              <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]">
                {submitLabel}
              </button>
            </form>
            {runs.length > 0 && (
              <>
                <div className="mb-1 mt-3 flex items-center justify-between text-xs">
                  <h3 className="font-semibold uppercase tracking-wide text-slate-500">Recentes</h3>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-indigo-600"
                      onClick={() => {
                        form.reset({ data: '', bins: 0 })
                        onSubmit({ data: '', bins: 0, run: undefined })
                      }}
                    >
                      + Novo
                    </button>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-red-600"
                      onClick={() => runsCollection.delete(runs.map((r) => r.id))}
                    >
                      Limpar
                    </button>
                  </span>
                </div>
                <ul className="flex flex-col gap-1">
                  {[...runs].reverse().slice(0, 5).map((r) => (
                    <li key={r.id} className="flex gap-1">
                      <button
                        className={`min-w-0 flex-1 truncate rounded-lg border px-2 py-1 text-left font-mono text-xs transition hover:border-indigo-300 hover:bg-indigo-50 ${
                          r.id === runId ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'
                        }`}
                        onClick={() => {
                          form.reset({ data: r.data, bins: r.bins })
                          onSubmit({ data: r.data, bins: r.bins, run: r.id })
                        }}
                      >
                        {r.data.replace(/\s+/g, ' ')}
                      </button>
                      <button
                        type="button"
                        aria-label="Remover"
                        className="rounded-lg border border-slate-200 px-2 text-xs text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        onClick={() => runsCollection.delete(r.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-3">{children}</main>
      </div>
    </div>
  )
}
