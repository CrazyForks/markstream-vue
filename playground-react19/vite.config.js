import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    port: 4174,
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['stream-diffs'],
  },
  // Only use alias in dev mode - for production build, use the built package
  resolve: mode === 'development'
    ? {
        alias: {
          'markstream-react': path.resolve(__dirname, '../packages/markstream-react/src'),
        },
      }
    : undefined,
  plugins: [
    react(),
  ],
}))
