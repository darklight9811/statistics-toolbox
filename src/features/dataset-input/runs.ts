import { createCollection, localStorageCollectionOptions, useLiveQuery } from '@tanstack/react-db'
import { z } from 'zod'

export const RunSchema = z.object({ id: z.number(), name: z.string().optional(), data: z.string(), bins: z.number() })
export type Run = z.infer<typeof RunSchema>

export const runsCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: 'histogram-runs',
    getKey: (r: Run) => r.id,
    schema: RunSchema,
  }),
)

/** Data of the entry open in the URL (`run`); empty when none. Keeps big datasets out of the URL. */
export function useEntryValue(run?: number) {
  const { data: runs } = useLiveQuery((q) => q.from({ r: runsCollection }))
  const r = runs.find((x) => x.id === run)
  return { data: r?.data ?? '', bins: r?.bins ?? 0, name: r?.name ?? '' }
}
