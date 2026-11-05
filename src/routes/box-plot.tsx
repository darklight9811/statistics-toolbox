import { createFileRoute } from '@tanstack/react-router'
import { BoxPlotPage } from '#/features/box-plot/page'
import { searchSchema } from '#/features/dataset-input/search'

export const Route = createFileRoute('/box-plot')({
  validateSearch: searchSchema,
  component: BoxPlotPage,
})
