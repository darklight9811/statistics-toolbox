import { defineConfig } from 'vitest/config'

// separate from vite.config.ts so tests don't load the Start/Nitro plugins
export default defineConfig({
  resolve: { alias: { '#': new URL('./src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') } },
  test: { include: ['src/**/*.test.ts'] },
})
