import { describe, expect, it } from 'vitest'
import { getMarkdown, parseMarkdownToStructure } from '../src'

describe('issue 598: strong text at the start of an unordered list item', () => {
  it.each([true, false])('parses the strong label when final=%s', (final) => {
    const markdown = '- **H01M（电池）**1,560件，重点布局固态电池复合正极膜、复合负极界面层等下一代电池材料技术，直击电池循环寿命与安全痛点。'
    const nodes = parseMarkdownToStructure(markdown, getMarkdown(`issue-598-${final}`), { final }) as any[]
    const paragraph = nodes[0].items[0].children[0]

    expect(paragraph.children[0]).toMatchObject({
      type: 'strong',
      raw: '**H01M（电池）**',
      children: [
        {
          type: 'text',
          content: 'H01M（电池）',
        },
      ],
    })
    expect(paragraph.children[1]).toMatchObject({
      type: 'text',
      content: '1,560件，重点布局固态电池复合正极膜、复合负极界面层等下一代电池材料技术，直击电池循环寿命与安全痛点。',
    })
  })
})
