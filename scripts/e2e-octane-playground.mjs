#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const playgroundDir = path.join(repoRoot, 'playground-octane')
const playgroundDist = path.join(playgroundDir, 'dist', 'index.html')
const host = '127.0.0.1'

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port })
    socket.on('connect', () => {
      socket.end()
      resolve(true)
    })
    socket.on('error', () => {
      socket.destroy()
      resolve(false)
    })
  })
}

async function findFreePort(start = 4176, end = 4210) {
  for (let port = start; port <= end; port += 1) {
    if (!await isPortOpen(port))
      return port
  }
  throw new Error(`No free port found in ${start}-${end}`)
}

async function waitForPort(port, timeoutMs = 60000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (await isPortOpen(port))
      return
    await new Promise(resolve => setTimeout(resolve, 150))
  }
  throw new Error(`Timed out waiting for ${host}:${port}`)
}

function resolveChromeLaunchOptions() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return {
        executablePath: candidate,
        headless: true,
      }
    }
  }

  return {
    channel: 'chrome',
    headless: true,
  }
}

function startPreviewServer(port) {
  const logs = []
  const child = spawn(
    'pnpm',
    ['-C', playgroundDir, 'exec', 'vite', 'preview', '--host', host, '--port', String(port), '--strictPort'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        CI: '1',
      },
    },
  )

  child.stdout.on('data', chunk => logs.push(String(chunk)))
  child.stderr.on('data', chunk => logs.push(String(chunk)))

  return {
    child,
    getLogs: () => logs.join(''),
  }
}

function stopServer(child) {
  if (!child || child.killed)
    return
  try {
    child.kill('SIGTERM')
  }
  catch {}
}

async function main() {
  if (!existsSync(playgroundDist))
    throw new Error('Octane playground is not built. Run `pnpm play:octane:build` first.')

  const port = await findFreePort()
  const server = startPreviewServer(port)
  let browser

  try {
    await waitForPort(port)
    browser = await chromium.launch(resolveChromeLaunchOptions())
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const errors = []

    page.on('pageerror', error => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error')
        errors.push(message.text())
    })

    await page.goto(`http://${host}:${port}/`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Ready for tokens' }).waitFor()

    await page.getByRole('button', { name: 'Start stream' }).click()
    await page.getByTestId('stream-status').filter({ hasText: 'Receiving tokens' }).waitFor()
    await page.locator('.markstream-octane h1').waitFor()

    await page.getByRole('button', { name: 'Pause' }).click()
    await page.getByTestId('stream-status').filter({ hasText: 'Paused' }).waitFor()
    const renderer = page.locator('.renderer-shell > .markstream-octane')
    const pausedText = await renderer.textContent()
    await page.waitForTimeout(150)
    if (await renderer.textContent() !== pausedText)
      throw new Error('Markdown output continued changing after the stream was paused')

    await page.getByRole('button', { name: 'Finish now' }).click()
    await page.getByTestId('stream-status').filter({ hasText: 'Complete' }).waitFor()
    await page.locator('.markstream-octane strong').filter({ hasText: 'append-only token stream' }).waitFor()
    await page.locator('.markstream-octane table').waitFor()
    await page.locator('.markstream-octane pre').first().waitFor()
    await page.locator('.markstream-octane .katex').first().waitFor({ timeout: 15000 })

    const darkCanvas = await page.locator('main.playground--dark').count()
    if (darkCanvas !== 1)
      throw new Error('Octane playground did not start in dark mode')
    await page.getByRole('button', { name: 'Use light canvas' }).click()
    if (await page.locator('main.playground--dark').count())
      throw new Error('Octane playground theme state did not update')

    if (errors.length)
      throw new Error(`Browser errors:\n${errors.join('\n')}`)

    console.log('[e2e-octane-playground] Production playground smoke passed')
  }
  catch (error) {
    const logs = server.getLogs()
    if (logs)
      console.error(logs)
    throw error
  }
  finally {
    await browser?.close()
    stopServer(server.child)
  }
}

await main()
