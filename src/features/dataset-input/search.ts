import { z } from 'zod'

export const searchSchema = z.object({
  // the data itself lives in localStorage (runs.ts); the URL only points at entries
  sel: z.array(z.number()).default([]), // entries ticked for multi-entry tools (box plot)
  run: z.number().optional(), // id of the recent entry being edited
})
