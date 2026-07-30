import type { NodeRendererProps } from '../../src/index'
import { cleanup, render } from '@octanejs/testing-library'
import { afterEach, describe, expect, it } from 'vitest'
import { NodeRenderer } from '../../src/index'

const baseProps = {
  batchRendering: false,
  deferNodesUntilVisible: false,
  maxLiveNodes: 0,
  viewportPriority: false,
} satisfies NodeRendererProps

afterEach(cleanup)

describe('markstream-octane streaming UI state', () => {
  it('does not show a cursor unless typewriter mode is enabled', () => {
    const view = render(NodeRenderer, {
      props: {
        ...baseProps,
        content: 'No cursor',
        final: false,
        smoothStreaming: false,
      },
    })

    expect(view.container.querySelector('.typewriter-cursor')).toBeNull()

    view.rerender({
      props: {
        ...baseProps,
        content: 'No cursor, now cursor',
        final: false,
        smoothStreaming: false,
        typewriter: true,
      },
    })

    expect(view.container.querySelector('.typewriter-cursor')).not.toBeNull()
  })

  it('removes the cursor immediately when the stream becomes final', () => {
    const view = render(NodeRenderer, {
      props: {
        ...baseProps,
        content: 'Streaming',
        final: false,
        smoothStreaming: false,
        typewriter: true,
      },
    })

    expect(view.container.querySelector('.typewriter-cursor')).not.toBeNull()

    view.rerender({
      props: {
        ...baseProps,
        content: 'Streaming done',
        final: true,
        smoothStreaming: false,
        typewriter: true,
      },
    })

    expect(view.container.querySelector('.typewriter-cursor')).toBeNull()
    expect(view.container.textContent).toContain('Streaming done')
  })

  it('keeps fade and typewriter as separate options', () => {
    const view = render(NodeRenderer, {
      props: {
        ...baseProps,
        content: 'Hello',
        fade: false,
        final: false,
        smoothStreaming: false,
        typewriter: true,
      },
    })

    expect(view.container.querySelector('.typewriter-cursor')).not.toBeNull()
    expect(view.container.querySelector('.text-node-stream-delta')).toBeNull()

    view.rerender({
      props: {
        ...baseProps,
        content: 'Hello world',
        fade: false,
        final: false,
        smoothStreaming: false,
        typewriter: true,
      },
    })

    expect(view.container.textContent).toContain('Hello world')
    expect(view.container.querySelector('.text-node-stream-delta')).toBeNull()
  })
})
