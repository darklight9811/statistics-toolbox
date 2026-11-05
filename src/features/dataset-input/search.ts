import { z } from 'zod'

export const searchSchema = z.object({
  data: z.string().default(''),
  bins: z.number().int().min(0).max(100).default(0), // 0 = auto (Sturges)
  run: z.number().optional(), // id of the recent entry being edited
})
