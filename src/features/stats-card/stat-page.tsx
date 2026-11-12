import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { parseNumbers } from '../dataset-input/parse'
import { useEntryValue } from '../dataset-input/runs'
import { GROUPS, STATS } from './catalog'
import { DocsLayout } from './docs-layout'
import { computeAllStats, randomValues, statExample } from './examples'
import { Tex } from './tex'

const h2 = 'mb-2 mt-8 border-b border-slate-200 pb-1 text-lg font-semibold'
const ORDER = GROUPS.flatMap((g) => g.keys)

const Crumb = ({ run, children }: { run?: number; children?: string }) => (
  <nav aria-label="Trilha" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
    <Link to="/glossary" search={{ run }} className="hover:text-indigo-600">Documentação</Link>
    {children && <><span>›</span><span>{children}</span></>}
  </nav>
)

/** Documentation index: every statistic, grouped by section. */
export function GlossaryIndexPage({ run }: { run?: number }) {
  return (
    <DocsLayout run={run}>
      <Crumb run={run} />
      <h1 className="text-3xl font-bold tracking-tight">Documentação das estatísticas</h1>
      <p className="mt-2 text-slate-600">
        Para cada estatística: o que é, para que serve, como se calcula e um exemplo passo a passo com os dados da entrada
        aberta. Nos gráficos, clique no nome de uma estatística para chegar aqui já com o exemplo dos seus dados.
      </p>
      {GROUPS.map((g) => (
        <section key={g.title}>
          <h2 className={h2}>{g.icon} {g.title}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {g.keys.map((k) => (
              <li key={k}>
                <Link
                  to="/glossary/$stat"
                  params={{ stat: k }}
                  search={{ run }}
                  className="block h-full rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="font-semibold text-indigo-700">{STATS[k].label}</div>
                  <div className="mt-0.5 text-slate-600">{STATS[k].what}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </DocsLayout>
  )
}

/** One documentation page per statistic, with a worked example from the open entry's data. */
export function StatPage({ stat, run, lie, lse }: { stat: string; run?: number; lie?: number; lse?: number }) {
  const meta = STATS[stat]
  const { data, bins, name } = useEntryValue(run)

  // no entry open: example with random numbers (generated after mount to keep SSR and client equal)
  const hasData = data.trim() !== ''
  const [random, setRandom] = useState<number[] | null>(null)
  useEffect(() => setRandom(randomValues()), [])
  const example = useMemo(() => {
    const values = hasData ? parseNumbers(data) : random
    if (!values) return null
    try {
      const all = computeAllStats(values, hasData ? bins : 0, lie, lse)
      return all && statExample(stat, all)
    } catch {
      return null
    }
  }, [stat, data, bins, hasData, random, lie, lse])

  if (!meta)
    return (
      <DocsLayout run={run}>
        <Crumb run={run}>Não encontrada</Crumb>
        <h1 className="text-2xl font-bold">Estatística não encontrada</h1>
        <Link to="/glossary" search={{ run }} className="mt-2 inline-block text-indigo-600 hover:underline">
          Ver todas as estatísticas
        </Link>
      </DocsLayout>
    )

  const group = GROUPS.find((g) => g.keys.includes(stat))!
  const i = ORDER.indexOf(stat)
  const prev = ORDER[i - 1], next = ORDER[i + 1]
  const related = group.keys.filter((k) => k !== stat)
  const navLink = (k: string, dir: 'prev' | 'next') => (
    <Link
      to="/glossary/$stat"
      params={{ stat: k }}
      search={{ run }}
      className={`flex-1 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition hover:border-indigo-300 ${dir === 'next' ? 'text-right' : ''}`}
    >
      <div className="text-xs text-slate-500">{dir === 'prev' ? '← Anterior' : 'Próxima →'}</div>
      <div className="font-semibold text-indigo-700">{STATS[k].label}</div>
    </Link>
  )

  return (
    <DocsLayout run={run}>
      <Crumb run={run}>{`${group.icon} ${group.title}`}</Crumb>
      <h1 className="text-3xl font-bold tracking-tight">{meta.label}</h1>
      <p className="mt-2 text-lg text-slate-600">{meta.what}</p>

      <h2 className={h2}>Para que serve</h2>
      <p>{meta.use}</p>

      <h2 className={h2}>Como calcular</h2>
      <p className="mb-1 text-slate-600">{meta.help.split('\n')[0]}</p>
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Tex tex={meta.formula} />
      </div>

      <h2 className={h2}>
        {hasData ? `Exemplo com os seus dados${name ? ` (${name})` : ''}` : 'Exemplo com dados aleatórios'}
      </h2>
      {!hasData && (
        <p className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          Nenhuma entrada aberta: usando números sorteados. Para ver com os seus, gere uma entrada e clique na estatística
          no gráfico.
          <button
            type="button"
            className="rounded-lg bg-white px-2.5 py-1 text-indigo-700 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300"
            onClick={() => setRandom(randomValues())}
          >
            🎲 Gerar outros
          </button>
        </p>
      )}
      {example && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 px-3 py-2 shadow-sm">
          {example.split('\n').map((line, k) => <Tex key={k} tex={line} />)}
        </div>
      )}

      {related.length > 0 && (
        <>
          <h2 className={h2}>Veja também</h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {related.map((k) => (
              <li key={k}>
                <Link
                  to="/glossary/$stat"
                  params={{ stat: k }}
                  search={{ run }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-indigo-700 hover:border-indigo-300"
                >
                  {STATS[k].label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-10 flex gap-3">
        {prev ? navLink(prev, 'prev') : <span className="flex-1" />}
        {next ? navLink(next, 'next') : <span className="flex-1" />}
      </div>
    </DocsLayout>
  )
}
