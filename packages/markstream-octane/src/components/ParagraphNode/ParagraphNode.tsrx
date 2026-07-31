import type { ParsedNode } from 'stream-markdown-parser'
import type { NodeComponentProps } from '../../types/node-component'
import * as Octane from 'octane'
import { getCustomNodeComponents } from '../../customComponents'
import { BLOCK_LEVEL_TYPES, renderNodeChildren } from '../../renderers/renderChildren.tsrx'
import { isParagraphBreakingCustomHtmlNode } from '../../utils/customHtmlTag'

function isWhitespaceTextNode(node: ParsedNode | null | undefined) {
  return node?.type === 'text' && String((node as any)?.content ?? '').trim() === ''
}

function getMeaningfulLinkChildren(node: ParsedNode | null | undefined) {
  if (node?.type !== 'link' || !Array.isArray((node as any)?.children))
    return []

  return ((node as any).children as ParsedNode[]).filter(child => !isWhitespaceTextNode(child))
}

function isImageOnlyLinkNode(node: ParsedNode | null | undefined) {
  const linkChildren = getMeaningfulLinkChildren(node)
  return linkChildren.length === 1 && linkChildren[0]?.type === 'image'
}

function renderParagraphInlineNodes(
  nodes: ParsedNode[],
  renderNode: NonNullable<NodeComponentProps<{ type: 'paragraph', children?: ParsedNode[] }>['renderNode']>,
  ctx: NonNullable<NodeComponentProps<{ type: 'paragraph', children?: ParsedNode[] }>['ctx']>,
  prefix: string,
) {
  const meaningfulChildren = nodes.filter(child => !isWhitespaceTextNode(child))
  const mediaOnly = meaningfulChildren.length > 0
    && meaningfulChildren.every(child => child.type === 'image' || isImageOnlyLinkNode(child))

  if (!mediaOnly || meaningfulChildren.length <= 1)
    return renderNodeChildren(nodes, ctx, prefix, renderNode)

  const normalizedNodes: ParsedNode[] = []
  for (let index = 0; index < nodes.length; index++) {
    const child = nodes[index]
    if (!isWhitespaceTextNode(child)) {
      normalizedNodes.push(child)
      continue
    }

    const hasPrevious = normalizedNodes.length > 0
    const hasNext = nodes.slice(index + 1).some(nextChild => !isWhitespaceTextNode(nextChild))
    if (!hasPrevious || !hasNext)
      continue

    normalizedNodes.push({
      ...(child as any),
      content: ' ',
      raw: ' ',
    })
  }

  return normalizedNodes.map((child, index) => (
    mediaOnly && isWhitespaceTextNode(child)
      ? String((child as any)?.content ?? '')
      : renderNode(child, `${prefix}-${index}`, ctx)
  ))
}

export function ParagraphNode(props: NodeComponentProps<{ type: 'paragraph', children?: ParsedNode[] }>) {
  const { node, ctx, renderNode, indexKey, children } = props
  if (!ctx || !renderNode) {
    return Octane.createElement('p', {
      dir: 'auto',
      className: 'paragraph-node',
    }, children)
  }

  const nodeChildren = node.children ?? []
  const customComponents = ctx.customComponents ?? getCustomNodeComponents(ctx.customId)
  const displayComponents = {
    ...customComponents,
    ...(ctx.htmlComponents ?? {}),
    ...(ctx.streamingComponents ?? {}),
  }
  const parts: Octane.OctaneNode[] = []
  const inlineBuffer: ParsedNode[] = []

  const flushInline = () => {
    if (!inlineBuffer.length)
      return
    const chunkIndex = parts.length
    parts.push(
      Octane.createElement('p', {
        key: `${String(indexKey ?? 'paragraph')}-inline-${chunkIndex}`,
        dir: 'auto',
        className: 'paragraph-node',
      }, renderParagraphInlineNodes(
        inlineBuffer.slice(),
        renderNode,
        ctx,
        `${String(indexKey ?? 'paragraph')}-${chunkIndex}`,
      )),
    )
    inlineBuffer.length = 0
  }

  nodeChildren.forEach((child, childIndex) => {
    const canUseHtmlDisplayMetadata = (ctx.htmlPolicy ?? 'safe') !== 'escape'
      || (child.type !== 'html_inline' && child.type !== 'html_block')
    if (BLOCK_LEVEL_TYPES.has(child.type) || (canUseHtmlDisplayMetadata && isParagraphBreakingCustomHtmlNode(child, displayComponents, ctx.customHtmlTags))) {
      flushInline()
      parts.push(renderNode(child, `${String(indexKey ?? 'paragraph')}-block-${childIndex}`, ctx))
    }
    else {
      inlineBuffer.push(child)
    }
  })
  flushInline()

  if (!parts.length) {
    return Octane.createElement('p', {
      dir: 'auto',
      className: 'paragraph-node',
    }, renderParagraphInlineNodes(nodeChildren, renderNode, ctx, String(indexKey ?? 'paragraph')))
  }

  return Octane.createElement(Octane.Fragment, {}, parts)
}

export default ParagraphNode
