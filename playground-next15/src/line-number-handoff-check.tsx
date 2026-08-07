'use client'

import { NodeRenderer } from 'markstream-react/next'
import { useEffect, useState } from 'react'

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

export function LineNumberHandoffCheck({ initialDark }: { initialDark: boolean }) {
  const [isDark, setIsDark] = useState(initialDark)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  return (
    <main
      className={`handoff-check markstream-react${isDark ? ' dark' : ''}`}
      data-hydrated={hydrated ? 'true' : 'false'}
    >
      <header>
        <h1>Pre → Highlight Line Number Handoff</h1>
        <button type="button" onClick={() => setIsDark(value => !value)}>
          Toggle dark
        </button>
      </header>

      <div className="handoff-grid">
        <section className="handoff-col" data-handoff-case="enhanced">
          <h2>1) Highlight (default)</h2>
          <NodeRenderer content={markdown} final isDark={isDark} />
        </section>

        <section className="handoff-col" data-handoff-case="pre">
          <h2>2) Pre fallback (render-code-blocks-as-pre)</h2>
          <NodeRenderer
            content={markdown}
            final
            isDark={isDark}
            renderCodeBlocksAsPre
            codeBlockProps={{ showLineNumbers: true }}
          />
        </section>
      </div>
    </main>
  )
}
