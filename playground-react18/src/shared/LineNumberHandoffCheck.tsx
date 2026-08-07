import { NodeRenderer } from 'markstream-react'
import { useState } from 'react'

const markdown = [
  '# Pre → Highlight Line Number Handoff',
  '',
  '```ts',
  'export function chunk(input: string) {',
  '  const lines = input.split(/\\r?\\n/)',
  '  return lines.map((line, index) => ({ index, value: line.trim(), block: 1 }))',
  '}',
  '',
  'for (const item of chunk(\'alpha\\nbeta\\ngamma\')) {',
  '  console.log(item.index, item.value)',
  '}',
  '',
  'function done() {',
  '  return true',
  '}',
  'done()',
  '```',
].join('\n')

function getInitialDarkMode() {
  if (typeof window === 'undefined')
    return false
  return new URLSearchParams(window.location.search).get('theme') === 'dark'
}

const rendererProps = {
  content: markdown,
  final: true,
  fade: false,
  smoothStreaming: false,
  typewriter: false,
  codeBlockDarkTheme: 'vitesse-dark',
  codeBlockLightTheme: 'vitesse-light',
} as const

export function LineNumberHandoffCheck() {
  const [isDark, setIsDark] = useState(getInitialDarkMode)

  return (
    <div
      className={`handoff-check markstream-react${isDark ? ' dark' : ''}`}
      style={{
        minHeight: '100vh',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        color: isDark ? '#e2e8f0' : undefined,
        background: isDark ? '#0b1220' : '#f5f7fb',
      }}
    >
      <header>
        <h1>Pre → Highlight Line Number Handoff</h1>
        <button type="button" onClick={() => setIsDark(value => !value)}>
          Toggle dark
        </button>
      </header>

      <h2 style={{ marginTop: 20 }}>1) Highlight (default)</h2>
      <section data-handoff-case="enhanced" style={{ maxWidth: 860, marginBottom: 32 }}>
        <NodeRenderer {...rendererProps} isDark={isDark} />
      </section>

      <h2 style={{ marginTop: 20 }}>2) Pre fallback (render-code-blocks-as-pre)</h2>
      <section data-handoff-case="pre" style={{ maxWidth: 860, marginBottom: 32 }}>
        <NodeRenderer
          {...rendererProps}
          isDark={isDark}
          renderCodeBlocksAsPre
          codeBlockProps={{ showLineNumbers: true }}
        />
      </section>
    </div>
  )
}
