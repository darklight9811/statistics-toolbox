import { createFileRoute } from '@tanstack/react-router'
import { HistogramPage } from '#/features/histogram/page'
import { searchSchema } from '#/features/histogram/search'

export const Route = createFileRoute('/histogram')({
  validateSearch: searchSchema,
  component: HistogramPage,
})
