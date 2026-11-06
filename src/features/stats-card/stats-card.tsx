import { formatStat } from './catalog'
import { StatHint } from './stat-hint'

/** Compact grid of statistics, each label with a "how to calculate" tooltip and a link to its page. Keys come from `catalog.ts`. */
export function StatsCard({ stats, run }: { stats: Record<string, number>; run?: number }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm sm:grid-cols-3 xl:grid-cols-4">
      {Object.entries(stats).map(([k, v]) => (
        <div key={k} className="flex justify-between gap-2 border-b border-slate-100 py-0.5">
          <dt className="truncate text-slate-500">
            <StatHint k={k} run={run} />
          </dt>
          <dd className="font-mono font-semibold text-indigo-700">{formatStat(k, v)}</dd>
        </div>
      ))}
    </dl>
  )
}
