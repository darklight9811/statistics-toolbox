import { z } from 'zod'

export const searchSchema = z.object({
  data: z.string().default(''),
  bins: z.number().int().min(0).max(100).default(0), // 0 = auto (Sturges)
  name: z.string().default(''), // title of the open recent entry
  sel: z.array(z.number()).default([]), // entries ticked for multi-entry tools (box plot)
  run: z.number().optional(), // id of the recent entry being edited
})
