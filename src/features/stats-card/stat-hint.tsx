import { Link } from '@tanstack/react-router'
import { useState, type ReactNode, type SyntheticEvent } from 'react'
import { STATS } from './catalog'

const W = 272 // tooltip width in px, used to keep it inside the viewport

/**
 * A statistic's label: hover/focus shows how to calculate it, click opens its glossary page
 * with a worked example for entry `run`. Tooltip is `fixed` so table/overflow parents never clip it.
 */
export function StatHint({ k, run, children }: { k: string; run?: number; children?: ReactNode }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const meta = STATS[k]
  if (!meta) return <>{children}</>
  const show = (e: SyntheticEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setPos({ x: Math.max(8, Math.min(r.left, window.innerWidth - W - 8)), y: r.top })
  }
  return (
    <Link
      to="/glossary/$stat"
      params={{ stat: k }}
      search={{ run }}
      className="cursor-pointer underline decoration-slate-300 decoration-dotted underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      onMouseEnter={show}
      onFocus={show}
      onMouseLeave={() => setPos(null)}
      onBlur={() => setPos(null)}
    >
      {children ?? meta.label}
      {pos && (
        <span
          role="tooltip"
          style={{ left: pos.x, top: pos.y - 6, width: W }}
          className="pointer-events-none fixed z-50 -translate-y-full whitespace-pre-line rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-normal normal-case leading-snug tracking-normal text-white no-underline shadow-xl"
        >
          <strong className="mb-0.5 block text-indigo-200">{meta.label}</strong>
          {meta.help}
          <span className="mt-1 block text-indigo-300">Clique para ver um exemplo com os seus dados</span>
        </span>
      )}
    </Link>
  )
}
