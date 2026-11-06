import { z } from 'zod'
import { RunSchema, runsCollection, type Run } from './runs'

const BackupSchema = z.object({ app: z.literal('statistics-toolbox'), version: z.literal(1), entries: z.array(RunSchema) })

/** JSON text of a backup file holding every entry. */
export const serializeEntries = (entries: Run[]) =>
  JSON.stringify({ app: 'statistics-toolbox', version: 1, entries }, null, 2)

/** Restores entries from a backup file: same id replaces the entry, new ids are added. Throws on an invalid file. Returns how many were restored. */
export async function importEntries(file: File) {
  let json: unknown
  try {
    json = JSON.parse(await file.text())
  } catch {
    throw new Error('O arquivo não é um JSON válido.')
  }
  const parsed = BackupSchema.safeParse(json)
  if (!parsed.success) throw new Error('O arquivo não parece um backup desta ferramenta.')
  for (const e of parsed.data.entries) {
    if (runsCollection.has(e.id))
      runsCollection.update(e.id, (d) => {
        d.name = e.name
        d.data = e.data
        d.bins = e.bins
      })
    else runsCollection.insert(e)
  }
  return parsed.data.entries.length
}
