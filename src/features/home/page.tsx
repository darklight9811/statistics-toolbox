import { Link } from '@tanstack/react-router'

export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-800">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">🧰 Caixa de ferramentas de estatística</h1>
        <p className="mt-2 text-slate-500">Escolha uma ferramenta para começar.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            to="/histogram"
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="text-2xl">📊</div>
            <div className="mt-2 font-semibold">Histograma</div>
            <div className="text-sm text-slate-500">
              Distribuição de frequências e estatísticas descritivas.
            </div>
          </Link>
          <Link
            to="/normal-probability"
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="text-2xl">📉</div>
            <div className="mt-2 font-semibold">Gráfico probabilístico normal</div>
            <div className="text-sm text-slate-500">
              Verifique visualmente se os dados seguem uma distribuição normal.
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
