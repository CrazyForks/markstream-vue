import type { ComponentBody } from 'octane'
import type { NodeComponentProps, NodeRendererProps } from '../../src/index'
import { cleanup, fireEvent, render } from '@octanejs/testing-library'
import { createElement } from 'octane'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearGlobalCustomComponents,
  LinkNode,
  NodeRenderer,
  removeCustomComponents,
  setCustomComponents,
} from '../../src/index'

const stableRendererProps = {
  batchRendering: false,
  deferNodesUntilVisible: false,
  maxLiveNodes: 0,
  smoothStreaming: false,
  viewportPriority: false,
} satisfies NodeRendererProps

afterEach(() => {
  cleanup()
  clearGlobalCustomComponents()
  document.body.innerHTML = ''
})

describe('markstream-octane client renderer', () => {
  it('renders the representative Markdown surface with Octane DOM nodes', () => {
    const markdown = [
      '# Octane renderer',
      '',
      'A **strong** paragraph with [a link](https://example.com).',
      '',
      '- first',
      '- second',
      '',
      '| Name | Value |',
      '| --- | --- |',
      '| Runtime | Octane |',
    ].join('\n')

    const { container } = render(NodeRenderer, {
      props: {
        ...stableRendererProps,
        content: markdown,
        final: true,
      },
    })

    expect(container.querySelector('h1')?.textContent).toBe('Octane renderer')
    expect(container.querySelector('strong')?.textContent).toBe('strong')
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com')
    expect(Array.from(container.querySelectorAll('li')).map(node => node.textContent)).toEqual(['first', 'second'])
    expect(container.querySelector('table')?.textContent).toContain('Runtime')
    expect(container.querySelector('.markstream-octane')).not.toBeNull()
  })

  it('forwards non-diff line numbers to pre-only code blocks', () => {
    const markdown = [
      '```ts',
      'const one = 1',
      'const two = 2',
      '```',
    ].join('\n')
    const { container } = render(NodeRenderer, {
      props: {
        ...stableRendererProps,
        content: markdown,
        final: true,
        renderCodeBlocksAsPre: true,
        codeBlockProps: { showLineNumbers: true },
      },
    })

    const pre = container.querySelector('pre[data-markstream-line-numbers="1"]')
    expect(pre).not.toBeNull()
    expect(pre?.querySelector('.markstream-pre__line-numbers-text')?.textContent).toBe('1\n2')
  })

  it('updates the same mounted renderer as streamed content grows', () => {
    const view = render(NodeRenderer, {
      props: {
        ...stableRendererProps,
        content: 'Hello',
        final: false,
      },
    })
    const root = view.container.querySelector('.markstream-octane')

    view.rerender({
      props: {
        ...stableRendererProps,
        content: 'Hello **Octane**',
        final: false,
      },
    })

    expect(view.container.querySelector('.markstream-octane')).toBe(root)
    expect(view.container.querySelector('strong')?.textContent).toBe('Octane')
    expect(view.container.textContent).toContain('Hello Octane')

    view.rerender({
      props: {
        ...stableRendererProps,
        content: 'Hello **Octane**',
        final: true,
      },
    })

    expect(view.container.querySelector('.typewriter-cursor')).toBeNull()
  })

  it('keeps image-only links inline without synthetic text wrappers', () => {
    const markdown = [
      '[![NPM](https://img.shields.io/npm/v/markstream-vue)](https://www.npmjs.com/package/markstream-vue)',
      '[![Docs](https://img.shields.io/badge/docs-中文-blue)](README.zh-CN.md)',
    ].join('\n')
    const { container } = render(NodeRenderer, {
      props: {
        ...stableRendererProps,
        content: markdown,
        final: true,
      },
    })
    const paragraph = container.querySelector('p.paragraph-node')

    expect(paragraph).not.toBeNull()
    expect(Array.from(paragraph!.children).map(child => child.tagName)).toEqual(['A', 'A'])
    expect(paragraph!.querySelectorAll('.text-node')).toHaveLength(0)
    expect(paragraph!.querySelectorAll('img')).toHaveLength(2)
    expect(paragraph!.querySelectorAll('a')[1]?.getAttribute('href')).toBe('README.zh-CN.md')
  })

  it('uses native DOM events at the renderer boundary', () => {
    const onClick = vi.fn()
    const { container } = render(NodeRenderer, {
      props: {
        ...stableRendererProps,
        content: '[safe](https://example.com)',
        final: true,
        onClick,
      },
    })
    const link = container.querySelector('a.link-node')

    expect(link).not.toBeNull()
    fireEvent.click(link!)
    expect(onClick).toHaveBeenCalledOnce()
    expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent)
  })

  it('strips unsafe destinations when LinkNode receives a parsed unsafe URL', () => {
    const { container } = render(LinkNode, {
      props: {
        node: {
          type: 'link',
          href: 'javascript:alert(1)',
          title: null,
          text: 'Unsafe',
          children: [],
          loading: false,
        },
        indexKey: 'octane-unsafe-link',
        ctx: {
          typewriter: false,
          codeBlockProps: {},
          mermaidProps: {},
          d2Props: {},
          infographicProps: {},
          showTooltips: true,
          codeBlockStream: true,
          renderCodeBlocksAsPre: false,
          events: {},
        },
      },
    })

    const link = container.querySelector('a.link-node')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBeNull()
  })

  it('supports scoped and local custom component bindings', () => {
    interface InsightNode {
      type: 'insight'
      raw: string
      tag: 'insight'
      label: string
    }
    const GlobalInsight: ComponentBody<NodeComponentProps<InsightNode>> = ({ node }) =>
      createElement('aside', { className: 'global-insight', children: node.label })
    const LocalInsight: ComponentBody<NodeComponentProps<InsightNode>> = ({ node }) =>
      createElement('aside', { className: 'local-insight', children: node.label })
    const scope = 'octane-custom-component-test'

    setCustomComponents(scope, { insight: GlobalInsight })
    try {
      const nodes: InsightNode[] = [{
        type: 'insight',
        raw: '<insight>Bound through Octane</insight>',
        tag: 'insight',
        label: 'Bound through Octane',
      }]
      const globalView = render(NodeRenderer, {
        props: {
          ...stableRendererProps,
          customId: scope,
          nodes,
        },
      })

      expect(globalView.container.querySelector('.global-insight')?.textContent).toBe('Bound through Octane')

      globalView.rerender({
        props: {
          ...stableRendererProps,
          customId: scope,
          nodes,
          streamingComponents: { insight: LocalInsight },
        },
      })

      expect(globalView.container.querySelector('.local-insight')?.textContent).toBe('Bound through Octane')
      expect(globalView.container.querySelector('.global-insight')).toBeNull()
    }
    finally {
      removeCustomComponents(scope)
    }
  })
})
