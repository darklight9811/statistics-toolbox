import katex from 'katex'
import 'katex/dist/katex.min.css'

/** Renders a LaTeX formula (our own strings, never user input) as a centered block. */
export function Tex({ tex }: { tex: string }) {
  return (
    <div
      className="overflow-x-auto py-1 text-center"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false }) }}
    />
  )
}
