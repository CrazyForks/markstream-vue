import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const packageRoot = resolve(import.meta.dirname, '..')
const distRoot = join(packageRoot, 'dist')
const expected = [
  'dist/client/index.js',
  'dist/server/index.js',
  'dist/index.d.ts',
  'dist/server.d.ts',
  'dist/index.css',
  'dist/index.px.css',
  'dist/index.tailwind.css',
  'dist/tailwind.js',
  'dist/tailwind.cjs',
  'dist/tailwind.d.ts',
  'dist/client/workers/katexRenderer.worker.js',
  'dist/client/workers/mermaidParser.worker.js',
]

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(file) : [file]
  })
}

const missing = expected.filter(file => !existsSync(join(packageRoot, file)))
if (missing.length)
  throw new Error(`markstream-octane build omitted:\n${missing.map(file => `  ${file}`).join('\n')}`)

for (const file of filesUnder(distRoot)) {
  const packagePath = relative(packageRoot, file)
  if (/\.(?:ts|tsx|tsrx)$/.test(file) && !file.endsWith('.d.ts'))
    throw new Error(`Raw TypeScript leaked into the package: ${packagePath}`)

  if (!file.endsWith('.js'))
    continue

  const source = readFileSync(file, 'utf8')
  if (/(?:from\s*|import\s*\()['"](?:react|react-dom)(?:\/[^'"]*)?['"]/.test(source))
    throw new Error(`React runtime import leaked into ${packagePath}`)
  if (/(?:from\s*|import\s*\()['"][^'"]+\.tsrx['"]/.test(source))
    throw new Error(`TSRX runtime import leaked into ${packagePath}`)
  if (
    (packagePath.startsWith('dist/client/') || packagePath.startsWith('dist/server/'))
    && !packagePath.includes('/workers/')
    && !source.startsWith('// octane-no-slot:')
  ) {
    throw new Error(`Precompiled marker is missing from ${packagePath}`)
  }
  if (packagePath.startsWith('dist/server/') && /from\s*['"]octane['"]/.test(source))
    throw new Error(`Server output retained a client Octane runtime import: ${packagePath}`)
}

for (const environment of ['client', 'server']) {
  const entry = readFileSync(join(distRoot, environment, 'index.js'), 'utf8')
  if (!/\bNodeRenderer\b/.test(entry) || !/\bexport\s*\{/.test(entry))
    throw new Error(`${environment} entry does not expose the public renderer API`)
}

console.log('markstream-octane dist contains precompiled client/server entries, declarations, styles, and workers.')
