import { resolve } from 'node:path'
import { octane } from 'octane/compiler/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [octane()],
  resolve: {
    alias: [
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
    environment: 'jsdom',
    include: ['tests/client/**/*.test.ts', 'tests/contracts/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
    testTimeout: 10_000,
  },
})
