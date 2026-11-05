import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { redact } from '@tanstack/redact/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact(), redact()],
})

export default config
