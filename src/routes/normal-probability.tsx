import { createFileRoute } from '@tanstack/react-router'
import { NormalProbabilityPage } from '#/features/normal-probability/page'
import { searchSchema } from '#/features/dataset-input/search'

export const Route = createFileRoute('/normal-probability')({
  validateSearch: searchSchema,
  component: NormalProbabilityPage,
})
