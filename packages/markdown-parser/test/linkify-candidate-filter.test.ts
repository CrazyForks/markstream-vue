import { describe, expect, it } from 'vitest'
import { getMarkdown, parseMarkdownToStructure } from '../src'

function flatten(nodes: any[]): any[] {
  const output: any[] = []
  for (const node of nodes ?? []) {
    output.push(node)
    if (Array.isArray(node?.children))
      output.push(...flatten(node.children))
    if (Array.isArray(node?.items))
      output.push(...flatten(node.items))
  }
  return output
}

function parse(input: string) {
  return parseMarkdownToStructure(input, getMarkdown('linkify-candidate-filter'), { final: true }) as any[]
}

function links(input: string) {
  return flatten(parse(input)).filter(node => node?.type === 'link')
}

describe('linkify candidate filter', () => {
  it('linkifies ordinary bare links', () => {
    const found = links('Visit example.com now.')

    expect(found).toHaveLength(1)
    expect(found[0].href).toBe('http://example.com')
    expect(found[0].text).toBe('example.com')
  })

  it('stops a bare link at a fullwidth closing parenthesis', () => {
    const input = '当前浏览器预览打开的是 **百度首页**（https://www.baidu.com/），搜索框里已有提示文字「林俊杰带女友现身纽约看台」。'
    const found = links(input)

    expect(found).toHaveLength(1)
    expect(found[0].href).toBe('https://www.baidu.com/')
    expect(found[0].text).toBe('https://www.baidu.com/')
    expect(flatten(parse(input)).filter(node => node?.type === 'text').map(node => node.content).join('')).toContain('），搜索框里已有提示文字「林俊杰带女友现身纽约看台」。')
  })

  it('preserves fullwidth closing parentheses that belong to a URL', () => {
    const expectedHref = 'https://example.com/a%EF%BC%89b'

    for (const input of [
      'https://example.com/a）b',
      'https://example.com/a%EF%BC%89b',
      '<https://example.com/a）b>',
      '（<https://example.com/a）b>）',
      '[label](https://example.com/a）b)',
    ]) {
      const found = links(input)

      expect(found).toHaveLength(1)
      expect(found[0].href).toBe(expectedHref)
    }
  })

  it('preserves balanced fullwidth parentheses inside a wrapped URL', () => {
    const input = '（https://example.com/a（x）b）after'
    const found = links(input)

    expect(found).toHaveLength(1)
    expect(found[0].href).toBe('https://example.com/a%EF%BC%88x%EF%BC%89b')
    expect(found[0].text).toBe('https://example.com/a（x）b')
    expect(flatten(parse(input)).filter(node => node?.type === 'text').map(node => node.content).join('')).toContain('）after')
  })

  it('matches the outer closing parenthesis before a percent-encoded suffix', () => {
    const found = links('（https://example.com/a（x）b）%20after')

    expect(found).toHaveLength(1)
    expect(found[0].href).toBe('https://example.com/a%EF%BC%88x%EF%BC%89b')
    expect(found[0].text).toBe('https://example.com/a（x）b')
  })

  it('handles multiple parenthesized bare links in one inline block', () => {
    const found = links(Array.from(
      { length: 32 },
      (_, index) => `（https://example.com/${index}）`,
    ).join(' '))

    expect(found).toHaveLength(32)
    expect(found.map(link => link.href)).toEqual(Array.from(
      { length: 32 },
      (_, index) => `https://example.com/${index}`,
    ))
  })

  it('stops a wrapped bare link when the paragraph also contains inline code', () => {
    const input = '`note`（https://www.baidu.com/）'
    const found = links(input)

    expect(found).toHaveLength(1)
    expect(found[0].href).toBe('https://www.baidu.com/')
    expect(found[0].text).toBe('https://www.baidu.com/')
  })

  it('ignores parentheses inside earlier links when finding the wrapper context', () => {
    const found = links('<https://one.test/a（b> and https://two.test/c）d')

    expect(found).toHaveLength(2)
    expect(found.map(link => link.href)).toEqual([
      'https://one.test/a%EF%BC%88b',
      'https://two.test/c%EF%BC%89d',
    ])
  })

  it('does not linkify bare links inside markdown link labels', () => {
    const found = links('[example.com](https://target.test)')

    expect(found).toHaveLength(1)
    expect(found[0].href).toBe('https://target.test')
    expect(found[0].text).toBe('example.com')
  })

  it('does not linkify bare links inside html anchors', () => {
    const found = links('<a href="https://target.test">example.com</a>')

    expect(found).toHaveLength(1)
    expect(found[0].href).toBe('https://target.test')
    expect(found[0].text).toBe('example.com')
  })

  it('still linkifies bare links after html anchors in the same inline token', () => {
    const found = links('<a href="https://target.test">example.com</a> and example.org')

    expect(found.map(link => link.href)).toEqual([
      'https://target.test',
      'http://example.org',
    ])
  })

  it('leaves paragraphs without bare links as text', () => {
    const nodes = parse('This is plain text without autolinks.')
    const found = flatten(nodes)

    expect(found.filter(node => node?.type === 'link')).toHaveLength(0)
    expect(found.filter(node => node?.type === 'text').map(node => node.content).join('')).toBe('This is plain text without autolinks.')
  })
})
