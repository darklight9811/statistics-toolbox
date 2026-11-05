import { createCollection, localStorageCollectionOptions } from '@tanstack/react-db'
import { z } from 'zod'

const RunSchema = z.object({ id: z.number(), name: z.string().optional(), data: z.string(), bins: z.number() })
export type Run = z.infer<typeof RunSchema>

export const runsCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: 'histogram-runs',
    getKey: (r: Run) => r.id,
    schema: RunSchema,
  }),
)
