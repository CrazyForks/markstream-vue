import { useRef, useState } from 'octane'
import { NodeRenderer } from 'markstream-octane'

const STREAM_STEP = 22
const STREAM_DELAY_MS = 42

const DEMO_MARKDOWN = [
  '# Native Octane streaming',
  '',
  '> This page imports `NodeRenderer` from the built `markstream-octane` package.',
  '',
  'The renderer receives an **append-only token stream** and updates without a React root.',
  '',
  '## What this demo exercises',
  '',
  '- incomplete Markdown while tokens arrive',
  '- native Octane state and event handlers',
  '- tables, code, KaTeX, and Mermaid routing',
  '',
  '| Runtime | Renderer | Status |',
  '| --- | --- | --- |',
  '| Octane | markstream-octane | streaming |',
  '',
  'Inline math: $E = mc^2$ and a unicode unit $c=0.75\\times10^3\\ \\text{J/(kg·℃)}$.',
  '',
  '```ts',
  'const runtime = "octane"',
  'const mode = "streaming"',
  'console.log({ runtime, mode })',
  '```',
  '',
  '```mermaid',
  'flowchart LR',
  '  Tokens --> Parser',
  '  Parser --> Octane',
  '  Octane --> DOM',
  '```',
  '',
  'The stream is complete.',
].join('\n')

type TimerRef = {
  current: number | null
}

function clearStreamTimer(timerRef: TimerRef) {
  if (timerRef.current === null)
    return
  window.clearInterval(timerRef.current)
  timerRef.current = null
}

export function App() {
  const [offset, setOffset] = useState(0)
  const [running, setRunning] = useState(false)
  const [dark, setDark] = useState(true)
  const timerRef = useRef<number | null>(null)
  const complete = offset >= DEMO_MARKDOWN.length
  const content = DEMO_MARKDOWN.slice(0, offset)
  const progress = Math.round((offset / DEMO_MARKDOWN.length) * 100)

  const start = () => {
    if (timerRef.current !== null)
      return
    if (offset >= DEMO_MARKDOWN.length)
      setOffset(0)
    setRunning(true)
    timerRef.current = window.setInterval(() => {
      setOffset((current) => {
        const next = Math.min(DEMO_MARKDOWN.length, current + STREAM_STEP)
        if (next === DEMO_MARKDOWN.length) {
          clearStreamTimer(timerRef)
          setRunning(false)
        }
        return next
      })
    }, STREAM_DELAY_MS)
  }

  const pause = () => {
    clearStreamTimer(timerRef)
    setRunning(false)
  }

  const reset = () => {
    clearStreamTimer(timerRef)
    setRunning(false)
    setOffset(0)
  }

  const finish = () => {
    clearStreamTimer(timerRef)
    setRunning(false)
    setOffset(DEMO_MARKDOWN.length)
  }

  return (
    <main className={dark ? 'playground playground--dark' : 'playground'}>
      <section className="hero">
        <div>
          <p className="eyebrow">markstream-octane / native runtime</p>
          <h1>Streaming Markdown, without a React host</h1>
          <p className="lede">
            A package-consumer demo built with TSRX, Octane state, and the published package boundary.
          </p>
        </div>
        <button
          type="button"
          className="theme-button"
          onClick={() => setDark(value => !value)}
        >
          {dark ? 'Use light canvas' : 'Use dark canvas'}
        </button>
      </section>

      <section className="controls" aria-label="Stream controls">
        <div className="button-row">
          <button type="button" className="button button--primary" onClick={start} disabled={running}>
            {complete ? 'Replay stream' : running ? 'Streaming…' : 'Start stream'}
          </button>
          <button type="button" className="button" onClick={pause} disabled={!running}>Pause</button>
          <button type="button" className="button" onClick={finish} disabled={complete}>Finish now</button>
          <button type="button" className="button" onClick={reset} disabled={offset === 0}>Reset</button>
        </div>
        <div className="progress-copy">
          <span data-testid="stream-status">{complete ? 'Complete' : running ? 'Receiving tokens' : 'Paused'}</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track" aria-label={`Stream progress ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="renderer-shell" aria-label="Octane Markdown output">
        {offset === 0
          ? (
              <div className="empty-state">
                <span>O</span>
                <h2>Ready for tokens</h2>
                <p>Start the stream to mount the real markstream-octane renderer.</p>
              </div>
            )
          : (
              <NodeRenderer
                content={content}
                final={complete}
                isDark={dark}
                typewriter
                fade
                smoothStreaming={false}
                batchRendering={false}
                deferNodesUntilVisible={false}
                viewportPriority={false}
                renderCodeBlocksAsPre
              />
            )}
      </section>
    </main>
  )
}

export default App
