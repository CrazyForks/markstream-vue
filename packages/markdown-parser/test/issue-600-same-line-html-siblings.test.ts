import { describe, expect, it } from 'vitest'
import { getMarkdown, parseMarkdownToStructure } from '../src'

const issue600Html = '<p>First paragraph</p><p><br></p><p>Second paragraph</p><p>Third paragraph</p>'

function rawContent(nodes: any[]) {
  return nodes.map(node => String(node.raw ?? '')).join('')
}

describe('issue 600 same-line html sibling regression', () => {
  it.each([true, false])('preserves every adjacent paragraph when final is %s', (final) => {
    const nodes = parseMarkdownToStructure(issue600Html, getMarkdown(`issue-600-${final}`), {
      final,
    }) as any[]

    expect(rawContent(nodes)).toBe(issue600Html)
    expect(rawContent(nodes)).toContain('<p><br></p>')
    expect(rawContent(nodes)).toContain('<p>Third paragraph</p>')
  })

  it.each([
    '<div><p>Nested paragraph</p></div><section>Section sibling</section>',
    '<p data-example="<section>">Quoted attribute</p><p>Sibling</p>',
    '<script>const example = "<p>not a sibling</p>"</script><p>Actual sibling</p>',
    '<p>Before void</p><br><p>After void</p>',
    '<p>Before comment</p><!-- sibling comment --><p>After comment</p>',
    '<p>Paragraph</p>same-line text',
  ])('does not discard a same-line tail from %s', (html) => {
    const nodes = parseMarkdownToStructure(html, getMarkdown(`issue-600-edge-${html}`), {
      final: true,
    }) as any[]

    expect(rawContent(nodes)).toBe(html)
  })

  it('preserves every streaming prefix and the final transition', () => {
    const md = getMarkdown('issue-600-stream')
    const firstClose = issue600Html.indexOf('</p>') + '</p>'.length

    for (let end = firstClose; end <= issue600Html.length; end++) {
      const prefix = issue600Html.slice(0, end)
      const nodes = parseMarkdownToStructure(prefix, md, { final: false }) as any[]

      expect(rawContent(nodes), `stream prefix ending at ${end}`).toBe(prefix)
    }

    const finalNodes = parseMarkdownToStructure(issue600Html, md, { final: true }) as any[]
    expect(rawContent(finalNodes)).toBe(issue600Html)
    expect(finalNodes.every(node => node.loading === false)).toBe(true)
  })

  it('maps the preserved fragment to its complete source line', () => {
    const nodes = parseMarkdownToStructure(issue600Html, getMarkdown('issue-600-source-map'), {
      final: true,
      includeSourceMap: true,
    }) as any[]

    expect(nodes).toHaveLength(1)
    expect(nodes[0]?.sourceMap).toEqual({ startLine: 0, endLine: 1 })
  })
})
