import { describe, expect, it } from 'vitest'
import { getMarkdown, parseMarkdownToStructure } from '../src'

function paragraphText(markdown: string, options: { final?: boolean, streamParse?: boolean } = {}) {
  const md = getMarkdown(`trailing-marker-${Math.random()}`)
  const nodes = parseMarkdownToStructure(markdown, md, {
    final: options.final ?? true,
    streamParse: options.streamParse ?? false,
  })
  const first = nodes[0] as { type?: string, children?: Array<{ content?: string, raw?: string }>, raw?: string } | undefined
  if (first?.type === 'paragraph') {
    return (first.children ?? []).map(child => child.content ?? child.raw ?? '').join('|')
  }
  return first?.raw ?? ''
}

describe('trailing mid-state marker stripping', () => {
  it('preserves real trailing characters in final parses', () => {
    expect(paragraphText('plain text(')).toBe('plain text(')
    expect(paragraphText('value *')).toBe('value *')
    expect(paragraphText('2 * 3 *')).toBe('2 * 3 *')
    expect(paragraphText('trail\\')).toBe('trail\\')
    expect(paragraphText('a\nb\\')).toBe('a\nb\\')
    expect(paragraphText('hello (')).toBe('hello (')
    expect(paragraphText('**bold** text *')).toBe('**bold**| text *')
  })

  it('still strips streaming mid-state markers in non-final parses', () => {
    // In streaming mode the trailing marker is a mid-state artifact and is
    // dropped so the UI does not flash a dangling `(` / `*`.
    const md = getMarkdown(`trailing-marker-stream-${Math.random()}`)
    const nodes = parseMarkdownToStructure('plain text(', md, {
      final: false,
      streamParse: true,
    })
    const first = nodes[0] as { type?: string, children?: Array<{ content?: string }> } | undefined
    const text = first?.type === 'paragraph'
      ? (first.children ?? []).map(child => child.content ?? '').join('|')
      : ''
    expect(text).toBe('plain text')
  })
})
