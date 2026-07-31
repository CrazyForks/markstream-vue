import type { PluginOption } from 'vite'
import path from 'node:path'
import { octane } from 'octane/compiler/vite'
import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm'

export default defineConfig({
  base: './',
  plugins: [
    octane(),
    monacoEditorPlugin({
      languageWorkers: [
        'editorWorkerService',
        'typescript',
        'css',
        'html',
        'json',
      ],
      customDistPath(_root, buildOutDir) {
        return path.resolve(buildOutDir, 'monacoeditorwork')
      },
    }) as unknown as PluginOption,
  ],
  resolve: {
    extensions: ['.tsrx', '.ts', '.mjs', '.js', '.json'],
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 4176,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['stream-monaco'],
  },
})
