import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ProcessCapabilityPage } from '#/features/process-capability/page'
import { searchSchema } from '#/features/dataset-input/search'

export const Route = createFileRoute('/process-capability')({
  // lie/lse = specification limits (small numbers, not data)
  validateSearch: searchSchema.extend({ lie: z.number().optional(), lse: z.number().optional() }),
  component: ProcessCapabilityPage,
})
