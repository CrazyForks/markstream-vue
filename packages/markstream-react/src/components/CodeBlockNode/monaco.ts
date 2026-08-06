import { preload } from '../NodeRenderer/preloadMonaco'

let mod: any = null
let importAttempted = false

export async function getUseMonaco() {
  if (mod)
    return mod
  if (importAttempted)
    return null

  // Prefer `stream-diffs`: it is a smaller runtime without the heavy
  // `monaco-editor` dependency. Consumers who still install `stream-monaco`
  // keep working through the fallback below.
  try {
    const diffs = await import('stream-diffs')
    if (diffs?.useMonaco) {
      mod = diffs
      await preload(mod)
      return mod
    }
  }
  catch {
    // stream-diffs is not installed; fall through to stream-monaco.
  }

  try {
    const monaco = await import('stream-monaco')
    if (monaco?.useMonaco) {
      mod = monaco
      await preload(mod)
      return mod
    }
  }
  catch {
    // stream-monaco is not installed either.
  }

  importAttempted = true
  return null
}
