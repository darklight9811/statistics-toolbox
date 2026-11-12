import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { StatPage } from '#/features/stats-card/stat-page'

export const Route = createFileRoute('/glossary/$stat')({
  // `run` = id of the entry (stored in localStorage) used for the worked example; never the data itself
  validateSearch: z.object({ run: z.number().optional(), lie: z.number().optional(), lse: z.number().optional() }),
  component: () => {
    const { stat } = Route.useParams()
    const { run, lie, lse } = Route.useSearch()
    return <StatPage stat={stat} run={run} lie={lie} lse={lse} />
  },
})
