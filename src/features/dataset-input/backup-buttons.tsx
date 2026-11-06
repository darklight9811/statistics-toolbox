import { useRef } from 'react'
import { importEntries, serializeEntries } from './backup'
import { download } from './exportable-chart'
import type { Run } from './runs'

const btn =
  'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'

/** Export all entries to a JSON file / restore them from one, to move them between computers. */
export function BackupButtons({ runs }: { runs: Run[] }) {
  const input = useRef<HTMLInputElement>(null)

  const exportFile = () => {
    const url = URL.createObjectURL(new Blob([serializeEntries(runs)], { type: 'application/json' }))
    download(url, `entradas-${new Date().toISOString().slice(0, 10)}.json`)
    URL.revokeObjectURL(url)
  }

  const importFile = async (file?: File) => {
    if (!file) return
    try {
      const n = await importEntries(file)
      alert(`${n} ${n === 1 ? 'entrada importada' : 'entradas importadas'}.`)
    } catch (e) {
      alert((e as Error).message)
    }
    if (input.current) input.current.value = '' // allows picking the same file again
  }

  return (
    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
      <button type="button" className={btn} disabled={!runs.length} onClick={exportFile}>
        ⬇️ Exportar
      </button>
      <button type="button" className={btn} onClick={() => input.current?.click()}>
        ⬆️ Importar
      </button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => importFile(e.target.files?.[0])}
      />
    </div>
  )
}
