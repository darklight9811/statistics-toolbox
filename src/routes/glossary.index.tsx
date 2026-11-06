import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { GlossaryIndexPage } from '#/features/stats-card/stat-page'

export const Route = createFileRoute('/glossary/')({
  validateSearch: z.object({ run: z.number().optional() }),
  component: () => <GlossaryIndexPage run={Route.useSearch().run} />,
})
