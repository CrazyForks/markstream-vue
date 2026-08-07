import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownCodeBlockNode } from '../packages/markstream-react/src/components/MarkdownCodeBlockNode/MarkdownCodeBlockNode'
import {
  getLanguageIcon,
  normalizeLanguageIdentifier,
  preloadExtendedLanguageIcons,
} from '../packages/markstream-react/src/utils/languageIcon'

describe('markstream-react Vue 3 code header parity', () => {
  it('uses the Vue 3 Material language icons by default', async () => {
    expect(normalizeLanguageIdentifier('ts:example.ts')).toBe('typescript')
    expect(getLanguageIcon('ts')).toContain('fill="#0288d1"')
    expect(getLanguageIcon('ts')).toContain('viewBox="0 0 16 16"')
    expect(getLanguageIcon('javascript')).toContain('fill="#ffca28"')
    expect(getLanguageIcon('unknown-language')).toContain('fill="#ff7043"')

    await preloadExtendedLanguageIcons()
    expect(getLanguageIcon('svelte')).toContain('fill="#ff5722"')
  })

  it('uses the shared semantic header structure in MarkdownCodeBlockNode', () => {
    const html = renderToStaticMarkup(React.createElement(MarkdownCodeBlockNode, {
      loading: false,
      stream: false,
      node: {
        type: 'code_block',
        language: 'ts',
        code: 'const answer = 42',
        raw: 'const answer = 42',
      },
    }))

    expect(html).toContain('class="code-block-header"')
    expect(html).toContain('class="code-header-main"')
    expect(html).toContain('class="code-header-copy"')
    expect(html).toContain('class="code-header-title"')
    expect(html).toContain('class="code-header-actions"')
    expect(html).toContain('class="action-icon"')
    expect(html).not.toContain('px-4 py-2.5')
    expect(html).not.toContain('space-x-2')
    expect(html).not.toContain('font-mono')
  })
})
