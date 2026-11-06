import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { GROUPS, STATS } from './catalog'

const item = 'block rounded-lg px-2.5 py-1 text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700'
const itemActive =
  'block rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-semibold text-indigo-700 shadow-[inset_3px_0_0_#4f46e5]'

/** Documentation frame: sticky top bar, sidebar with every statistic by section (with icons), and the page content. `run` is kept across pages. */
export function DocsLayout({ run, children }: { run?: number; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm">
          <Link to="/glossary" search={{ run }} className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid size-7 place-items-center rounded-lg bg-indigo-600 text-base text-white">📖</span>
            Documentação
          </Link>
          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg px-2.5 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
              onClick={() => history.back()}
            >
              ← Voltar
            </button>
            <Link to="/" className="rounded-lg px-2.5 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600">
              🏠 Início
            </Link>
          </span>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 lg:flex-row">
        <nav
          aria-label="Estatísticas"
          className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:w-64 lg:self-start lg:overflow-y-auto"
        >
          <Link to="/glossary" search={{ run }} className={item} activeProps={{ className: itemActive }} activeOptions={{ exact: true }}>
            📚 Visão geral
          </Link>
          {GROUPS.map((g) => (
            <div key={g.title} className="mt-3">
              <h2 className="mb-1 flex items-center gap-1.5 px-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="text-sm">{g.icon}</span>
                {g.title}
              </h2>
              <ul className="flex flex-wrap gap-1 lg:flex-col lg:gap-0.5">
                {g.keys.map((k) => (
                  <li key={k}>
                    <Link to="/glossary/$stat" params={{ stat: k }} search={{ run }} className={item} activeProps={{ className: itemActive }}>
                      {STATS[k].label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <main className="min-w-0 max-w-3xl flex-1">{children}</main>
      </div>
    </div>
  )
}
