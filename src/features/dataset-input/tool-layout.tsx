import { Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useLiveQuery } from '@tanstack/react-db'
import { useEffect, useState, type ReactNode } from 'react'
import { runsCollection } from './runs'

export const card = 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm'
const input =
  'w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

type Value = { data: string; bins: number; name: string }
type Search = Value & { run?: number; sel: number[] }

const actionBtn = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm transition active:scale-[0.97]'
const newBtn = `${actionBtn} bg-indigo-600 text-white hover:bg-indigo-700`
const clearBtn = `${actionBtn} bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-600 hover:text-white hover:ring-red-600`

const icon = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const PlusIcon = () => (
  <svg {...icon} aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const TrashIcon = () => (
  <svg {...icon} aria-hidden="true">
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
  </svg>
)

const TOOLS = [
  { to: '/histogram', icon: '📊', label: 'Histograma' },
  { to: '/normal-probability', icon: '📉', label: 'Gráfico probabilístico normal' },
  { to: '/box-plot', icon: '📦', label: 'Box-plot' },
] as const

/** Shared page frame for every tool: header, data form and recent entries (shared across tools). */
export function ToolLayout({
  title,
  value,
  runId,
  selected = [],
  onToggle,
  showBins = false,
  submitLabel,
  onSubmit,
  children,
}: {
  title: string
  value: Value
  runId?: number
  /** ids ticked in the recent list; kept in the URL so they survive tool switches */
  selected?: number[]
  /** when given, recent entries get a checkbox (multi-entry tools) */
  onToggle?: (id: number) => void
  showBins?: boolean
  submitLabel: string
  onSubmit: (search: Search) => void
  children: ReactNode
}) {
  const { data: runs } = useLiveQuery((q) => q.from({ r: runsCollection }))
  const [drawer, setDrawer] = useState(false)
  useEffect(() => {
    if (!drawer) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [drawer])

  const form = useForm({
    defaultValues: value,
    onSubmit: ({ value }) => {
      // editing an open entry updates it; otherwise a new entry is created
      let id = runId
      if (id !== undefined && runsCollection.has(id)) {
        runsCollection.update(id, (draft) => {
          draft.name = value.name
          draft.data = value.data
          draft.bins = value.bins
        })
      } else {
        id = Date.now()
        runsCollection.insert({ id, ...value })
      }
      onSubmit({ ...value, run: id, sel: selected })
    },
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-4 py-2">
          <button
            type="button"
            aria-label="Abrir menu"
            className="rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-100"
            onClick={() => setDrawer(true)}
          >
            ☰
          </button>
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${drawer ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setDrawer(false)}
      />
      <nav
        aria-hidden={!drawer}
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white p-3 shadow-xl transition-transform ${drawer ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gráficos</h2>
          <button type="button" aria-label="Fechar menu" className="text-slate-400 hover:text-slate-700" onClick={() => setDrawer(false)}>
            ×
          </button>
        </div>
        <ul className="flex flex-col gap-1 text-sm">
          {TOOLS.map((t) => (
            <li key={t.to}>
              {/* keeps the open entry (data, bins, name, run) while switching tools */}
              <Link
                to={t.to}
                search={{ data: value.data, bins: value.bins, name: value.name, run: runId, sel: selected }}
                tabIndex={drawer ? 0 : -1}
                onClick={() => setDrawer(false)}
                className="block rounded-lg px-2 py-1.5 hover:bg-indigo-50"
                activeProps={{ className: 'block rounded-lg bg-indigo-100 px-2 py-1.5 font-semibold text-indigo-700' }}
              >
                {t.icon} {t.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/"
          tabIndex={drawer ? 0 : -1}
          onClick={() => setDrawer(false)}
          className="mt-3 block px-2 text-xs text-slate-500 hover:text-indigo-600"
        >
          ← Início
        </Link>
      </nav>

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
              <form.Field name="name">
                {(f) => (
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Título
                    <input
                      className={input}
                      placeholder="Sem título"
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                    />
                  </label>
                )}
              </form.Field>
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
                <div className="mb-3 mt-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Entradas <span className="font-normal normal-case">({runs.length})</span>
                  </h3>
                  <span className="flex gap-1.5">
                    <button
                      type="button"
                      className={newBtn}
                      onClick={() => {
                        form.reset({ data: '', bins: 0, name: '' })
                        onSubmit({ data: '', bins: 0, name: '', run: undefined, sel: selected })
                      }}
                    >
                      <PlusIcon /> Novo
                    </button>
                    <button
                      type="button"
                      className={clearBtn}
                      onClick={() => confirm('Remover todas as entradas?') && runsCollection.delete(runs.map((r) => r.id))}
                    >
                      <TrashIcon /> Limpar
                    </button>
                  </span>
                </div>
                <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
                  {[...runs].reverse().map((r) => (
                    <li key={r.id} className="flex items-stretch gap-1">
                      {onToggle && (
                        <input
                          type="checkbox"
                          aria-label="Selecionar entrada"
                          className="size-4 shrink-0 self-center accent-indigo-600"
                          checked={selected.includes(r.id)}
                          onChange={() => onToggle(r.id)}
                        />
                      )}
                      <button
                        className={`min-w-0 flex-1 truncate rounded-lg border px-2 py-1 text-left font-mono text-xs transition hover:border-indigo-300 hover:bg-indigo-50 ${
                          r.id === runId ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'
                        }`}
                        onClick={() => {
                          form.reset({ data: r.data, bins: r.bins, name: r.name ?? '' })
                          onSubmit({ data: r.data, bins: r.bins, name: r.name ?? '', run: r.id, sel: selected })
                        }}
                      >
                        {r.name || r.data.replace(/\s+/g, ' ')}
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
