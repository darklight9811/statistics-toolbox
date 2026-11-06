import { Link } from '@tanstack/react-router'
import { TOOLS } from '../dataset-input/tools'
import { GROUPS, STATS } from '../stats-card/catalog'

const SECTIONS = [
  { id: 'ferramentas', label: 'Ferramentas' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'sobre', label: 'O que é' },
  { id: 'documentacao', label: 'Documentação' },
  { id: 'codigo-aberto', label: 'Código aberto' },
]

const STEPS = [
  { icon: '📋', title: 'Cole seus números', text: 'Separados por espaço, ponto e vírgula ou quebra de linha. A vírgula vale como decimal.' },
  { icon: '⚡', title: 'Gere o gráfico', text: 'Cada geração vira uma entrada salva no seu navegador, compartilhada entre todas as ferramentas.' },
  { icon: '🔍', title: 'Explore e exporte', text: 'Passe o mouse nas estatísticas para ver como se calculam e exporte o gráfico em PNG ou PDF.' },
]

const cardCls = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
const h2 = 'text-xl font-bold tracking-tight'

export function HomePage() {
  return (
    <div className="min-h-screen scroll-smooth bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-2 text-sm">
          <span className="font-bold">🧰 Estatística</span>
          <span className="ml-auto flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="hover:text-indigo-600">{s.label}</a>
            ))}
          </span>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16">
        <section className="py-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">🧰 Caixa de ferramentas de estatística</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-500">
            Cole seus números e veja o gráfico e as estatísticas que os descrevem.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/histogram" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
              Começar com o histograma
            </Link>
            <Link to="/glossary" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300">
              📖 Ver a documentação
            </Link>
          </div>
        </section>

        <section id="ferramentas" className="scroll-mt-16 py-6">
          <h2 className={h2}>🛠️ Ferramentas</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className={`${cardCls} transition hover:border-indigo-300 hover:shadow-md`}>
                <div className="text-2xl">{t.icon}</div>
                <div className="mt-2 font-semibold">{t.label}</div>
                <div className="text-sm text-slate-500">{t.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-16 py-6">
          <h2 className={h2}>🚀 Como funciona</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className={cardCls}>
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{i + 1}</span>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <div className="mt-2 font-semibold">{s.title}</div>
                <div className="text-sm text-slate-500">{s.text}</div>
              </li>
            ))}
          </ol>
        </section>

        <section id="sobre" className="scroll-mt-16 py-6">
          <h2 className={h2}>💡 O que é e para que serve</h2>
          <p className="mt-2 text-slate-600">
            Esta caixa de ferramentas ajuda a entender um conjunto de números, sem precisar de planilhas ou programas. Serve
            para estudar a forma dos dados, comparar grupos, verificar se seguem uma distribuição normal e calcular
            probabilidades. Os dados ficam salvos apenas no seu navegador.
          </p>
        </section>

        <section id="documentacao" className="scroll-mt-16 py-6">
          <div className="flex items-end justify-between gap-3">
            <h2 className={h2}>📖 Documentação</h2>
            <Link to="/glossary" className="text-sm text-indigo-600 hover:underline">Ver tudo →</Link>
          </div>
          <p className="mt-2 text-slate-600">
            O significado de cada estatística, para que serve, como se calcula e um exemplo com os seus dados. Nas
            ferramentas, passe o mouse sobre o nome de uma estatística para ver o cálculo e clique para abrir o exemplo.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GROUPS.map((g) => (
              <div key={g.title} className={cardCls}>
                <div className="font-semibold">{g.icon} {g.title}</div>
                <ul className="mt-2 flex flex-wrap gap-1.5 text-sm">
                  {g.keys.map((k) => (
                    <li key={k}>
                      <Link
                        to="/glossary/$stat"
                        params={{ stat: k }}
                        className="rounded-full border border-slate-200 px-2.5 py-0.5 text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        {STATS[k].label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="codigo-aberto" className="scroll-mt-16 py-6">
          <h2 className={h2}>🤝 Código aberto</h2>
          <p className="mt-2 text-slate-600">
            O projeto é público, sob licença MIT. Sugestões de ferramentas, correções estatísticas e melhorias de tradução são
            bem-vindas.
          </p>
          <a
            href="https://github.com/darklight9811/statistics-toolbox"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            ⭐ Ver no GitHub
          </a>
        </section>
      </main>
    </div>
  )
}
