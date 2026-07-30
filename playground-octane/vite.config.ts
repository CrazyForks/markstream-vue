import { octane } from 'octane/compiler/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [octane()],
  resolve: {
    extensions: ['.tsrx', '.ts', '.mjs', '.js', '.json'],
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 4176,
    strictPort: true,
  },
  worker: {
    format: 'es',
  },
})
