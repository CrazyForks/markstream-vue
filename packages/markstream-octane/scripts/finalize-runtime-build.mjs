import { copyFile, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve('dist')
const client = path.join(dist, 'client')
const clientCss = path.join(client, 'index.css')
const marker = '// octane-no-slot: compiler-assigned hook slots are already present.\n'

async function filesUnder(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    files.push(...(entry.isDirectory() ? await filesUnder(file) : [file]))
  }
  return files
}

try {
  await copyFile(clientCss, path.join(dist, 'index.css'))
  await rm(clientCss)
}
catch (error) {
  if (error.code !== 'ENOENT')
    throw error
}

await rm(path.join(client, 'styles.js'), { force: true })

for (const environment of ['client', 'server']) {
  for (const file of await filesUnder(path.join(dist, environment))) {
    if (!file.endsWith('.js') || file.includes(`${path.sep}workers${path.sep}`))
      continue

    const source = await readFile(file, 'utf8')
    if (!source.startsWith(marker))
      await writeFile(file, `${marker}${source}`)
  }
}

console.log('Finalized Octane runtime entries, stylesheet, and precompiled markers.')
