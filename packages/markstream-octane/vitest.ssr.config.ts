import { resolve } from 'node:path'
import { octane } from 'octane/compiler/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [octane({ ssr: true })],
  resolve: {
    alias: [
      {
        find: /^octane$/,
        replacement: resolve(import.meta.dirname, 'node_modules/octane/dist/server/index.js'),
      },
      {
        find: /^stream-markdown-parser$/,
        replacement: resolve(import.meta.dirname, '../markdown-parser/src/index.ts'),
      },
      {
        find: /^markstream-core$/,
        replacement: resolve(import.meta.dirname, '../markstream-core/src/index.ts'),
      },
    ],
    extensions: ['.tsrx', '.ts', '.mjs', '.js', '.json'],
  },
  test: {
    environment: 'node',
    include: ['tests/ssr/**/*.test.ts'],
    restoreMocks: true,
    testTimeout: 10_000,
  },
})
