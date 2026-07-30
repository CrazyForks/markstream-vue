/**
 * @vitest-environment jsdom
 */

import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { flushAll } from './setup/flush-all'

let MarkdownRender: any

describe('issue 600 renderer regression', () => {
  beforeAll(async () => {
    MarkdownRender = (await import('../src/components/NodeRenderer')).default
  })

  it('renders all adjacent same-line html blocks with the trusted policy', async () => {
    const wrapper = mount(MarkdownRender, {
      props: {
        content: '<p>First paragraph</p><p><br></p><p>Second paragraph</p><p>Third paragraph</p>',
        final: true,
        htmlPolicy: 'trusted',
      },
    })
    await flushAll()

    const paragraphs = wrapper.findAll('.html-block-node p')
    expect(paragraphs).toHaveLength(4)
    expect(paragraphs.map(paragraph => paragraph.text())).toEqual([
      'First paragraph',
      '',
      'Second paragraph',
      'Third paragraph',
    ])
  })

  it('keeps the siblings when streaming content becomes final', async () => {
    const wrapper = mount(MarkdownRender, {
      props: {
        content: '<p>First paragraph</p><p><br>',
        final: false,
        htmlPolicy: 'trusted',
      },
    })
    await flushAll()

    await wrapper.setProps({
      content: '<p>First paragraph</p><p><br></p><p>Second paragraph</p><p>Third paragraph</p>',
      final: true,
    })
    await flushAll()

    expect(wrapper.findAll('.html-block-node p').map(paragraph => paragraph.text())).toEqual([
      'First paragraph',
      '',
      'Second paragraph',
      'Third paragraph',
    ])
  })
})
