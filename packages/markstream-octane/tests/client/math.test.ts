import { act, cleanup, render } from '@octanejs/testing-library'
import katex from 'katex'
import { afterEach, describe, expect, it } from 'vitest'
import { MathBlockNode } from '../../src/components/Math/MathBlockNode.tsrx'
import { MathInlineNode } from '../../src/components/Math/MathInlineNode.tsrx'
import * as katexWorkerClient from '../../src/workers/katexWorkerClient'

interface KaTeXRequest {
  id: string
  content: string
  displayMode: boolean
}

class FakeKaTeXWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null

  postMessage(data: KaTeXRequest) {
    queueMicrotask(() => {
      try {
        const html = katex.renderToString(data.content, {
          throwOnError: true,
          displayMode: data.displayMode,
          output: 'html',
          strict: 'ignore',
        })
        this.onmessage?.({
          data: {
            id: data.id,
            html,
            content: data.content,
            displayMode: data.displayMode,
          },
        } as MessageEvent)
      }
      catch (error) {
        this.onmessage?.({
          data: {
            id: data.id,
            error: error instanceof Error ? error.message : String(error),
            content: data.content,
            displayMode: data.displayMode,
          },
        } as MessageEvent)
      }
    })
  }

  terminate() {}
}

afterEach(() => {
  katexWorkerClient.clearKaTeXWorker()
  katexWorkerClient.clearKaTeXCache()
  cleanup()
})

describe('markstream-octane KaTeX worker integration', () => {
  it('renders inline formulas containing unicode unit glyphs', async () => {
    katexWorkerClient.setKaTeXWorker(new FakeKaTeXWorker() as unknown as Worker)
    const view = render(MathInlineNode, {
      props: {
        node: {
          type: 'math_inline',
          content: 'c=0.75\\times10^3\\ \\text{J/(kg·℃)}',
          raw: '$c=0.75\\times10^3\\ \\text{J/(kg·℃)}$',
          markup: '$',
          loading: false,
        },
      },
    })

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(view.container.innerHTML).toContain('class="katex"')
    expect(view.container.textContent).not.toContain('$c=0.75\\times10^3\\ \\text{J/(kg·℃)}$')
  })

  it('renders block formulas containing unicode unit glyphs', async () => {
    katexWorkerClient.setKaTeXWorker(new FakeKaTeXWorker() as unknown as Worker)
    const view = render(MathBlockNode, {
      props: {
        node: {
          type: 'math_block',
          content: 'Q_1=0.75\\times10^3\\ \\text{J/(kg·℃)}\\times1.1\\ \\text{kg}\\times40℃',
          raw: '$$Q_1=0.75\\times10^3\\ \\text{J/(kg·℃)}\\times1.1\\ \\text{kg}\\times40℃$$',
          loading: false,
        },
      },
    })

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(view.container.innerHTML).toContain('class="katex-display"')
    expect(view.container.textContent).not.toContain('$$Q_1=')
  })
})
