import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Verifies the dual-runtime loader contract shared by all framework packages:
 * `stream-diffs` is preferred (smaller, no monaco-editor), `stream-monaco`
 * is the fallback, and a null result lets callers degrade to <pre> rendering.
 */

interface LoaderModule {
  useMonaco?: (options?: unknown) => unknown
  preloadMonacoWorkers?: () => Promise<unknown>
  getOrCreateHighlighter?: (...args: unknown[]) => Promise<unknown>
  default?: LoaderModule
}

const LOADERS = [
  ['react', '../../packages/markstream-react/src/components/CodeBlockNode/monaco.ts'],
  ['svelte', '../../packages/markstream-svelte/src/optional/monaco.ts'],
  ['angular', '../../packages/markstream-angular/src/optional/monaco.ts'],
  ['vue2', '../../packages/markstream-vue2/src/components/CodeBlockNode/monaco.ts'],
] as const

function runtimeModule(useMonacoResult: Record<string, string>) {
  const runtime = {
    useMonaco: () => useMonacoResult,
    preloadMonacoWorkers: async () => {},
    getOrCreateHighlighter: async () => ({ codeToTokens: () => ({}) }),
  }
  // Loaders normalize through `mod.default ?? mod`, so expose both shapes.
  return {
    ...runtime,
    default: runtime,
  }
}

async function getLoader(loaderPath: string) {
  vi.resetModules()
  const { getUseMonaco } = await import(loaderPath) as {
    getUseMonaco: () => Promise<LoaderModule | null>
  }
  return getUseMonaco
}

afterEach(() => {
  vi.resetModules()
})

describe('dual-runtime monaco loader (stream-diffs preferred)', () => {
  it.each(LOADERS)('%s loader picks stream-diffs when both runtimes are available', async (_name, loaderPath) => {
    vi.doMock('stream-diffs', () => runtimeModule({ runtime: 'stream-diffs' }))
    vi.doMock('stream-monaco', () => runtimeModule({ runtime: 'stream-monaco' }))
    vi.doMock('stream-monaco/legacy', () => runtimeModule({ runtime: 'stream-monaco' }))

    const getUseMonaco = await getLoader(loaderPath)
    const mod = await getUseMonaco()
    expect(mod).not.toBeNull()
    expect(mod?.useMonaco?.()).toEqual({ runtime: 'stream-diffs' })
  })

  it.each(LOADERS)('%s loader falls back to stream-monaco when stream-diffs is absent', async (_name, loaderPath) => {
    vi.doMock('stream-diffs', () => {
      throw new Error('stream-diffs not installed')
    })
    vi.doMock('stream-monaco', () => runtimeModule({ runtime: 'stream-monaco' }))
    vi.doMock('stream-monaco/legacy', () => runtimeModule({ runtime: 'stream-monaco' }))

    const getUseMonaco = await getLoader(loaderPath)
    const mod = await getUseMonaco()
    expect(mod).not.toBeNull()
    expect(mod?.useMonaco?.()).toEqual({ runtime: 'stream-monaco' })
  })

  it.each(LOADERS)('%s loader returns null when neither runtime is installed', async (_name, loaderPath) => {
    vi.doMock('stream-diffs', () => {
      throw new Error('stream-diffs not installed')
    })
    vi.doMock('stream-monaco', () => {
      throw new Error('stream-monaco not installed')
    })
    vi.doMock('stream-monaco/legacy', () => {
      throw new Error('stream-monaco not installed')
    })

    const getUseMonaco = await getLoader(loaderPath)
    const mod = await getUseMonaco()
    expect(mod).toBeNull()
  })
})
