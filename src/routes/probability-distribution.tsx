import { createFileRoute } from '@tanstack/react-router'
import { ProbabilityDistributionPage } from '#/features/probability-distribution/page'
import { searchSchema } from '#/features/dataset-input/search'

export const Route = createFileRoute('/probability-distribution')({
  validateSearch: searchSchema,
  component: ProbabilityDistributionPage,
})
