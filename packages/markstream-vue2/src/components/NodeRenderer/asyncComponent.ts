import { defineAsyncComponent, h } from 'vue-demi'
import { getKatex } from '../MathInlineNode/katex'
import PreCodeNode from '../PreCodeNode'
import TextNode from '../TextNode'
import CodeBlockNodeLoading from './CodeBlockNodeLoading.vue'

export { default as CodeBlockNodeLoading } from './CodeBlockNodeLoading.vue'

export const CodeBlockNodeAsync = defineAsyncComponent({
  loader: async () => {
    try {
      const mod = await import('../../components/CodeBlockNode')
      return (mod as any).default ?? mod
    }
    catch (error) {
      console.warn(
        '[markstream-vue2] Failed to load the enhanced CodeBlockNode chunk; falling back to preformatted code rendering. Enhanced code blocks require the optional "stream-diffs" peer (or "stream-monaco" as a fallback).',
        error,
      )
      return PreCodeNode
    }
  },
  loadingComponent: CodeBlockNodeLoading,
  delay: 0,
})

function createMathFallbackNode(wrapper: (content: string) => string) {
  return (props: any) => {
    return h(TextNode, {
      ...props,
      node: {
        ...props.node,
        content: props.node.raw ?? wrapper(String(props.node.content ?? '')),
      },
    })
  }
}

export async function MathInlineNodeAsync() {
  // In test environment prefer the simple text fallback to avoid
  // race conditions with workers/KaTeX rendering.
  const isTestEnv = typeof globalThis !== 'undefined'
    // eslint-disable-next-line node/prefer-global/process
    && typeof (globalThis as any).process !== 'undefined'
    // eslint-disable-next-line node/prefer-global/process
    && (globalThis as any).process?.env?.NODE_ENV === 'test'
  if (isTestEnv) {
    // test fallback should be deterministic and minimal
    return createMathFallbackNode(content => `$${content}$`)
  }

  try {
    const katex = await getKatex()
    if (katex) {
      const mod = await import('../../components/MathInlineNode')
      return (mod as any).default ?? mod
    }
  }
  catch (e) {
    console.warn(
      '[markstream-vue2] Optional peer dependencies for MathInlineNode are missing. Falling back to text rendering. To enable full math rendering features, please install "katex".',
      e,
    )
  }
  return createMathFallbackNode(content => `$${content}$`)
}

export async function MathBlockNodeAsync() {
  try {
    const katex = await getKatex()
    if (katex) {
      const mod = await import('../../components/MathBlockNode')
      return (mod as any).default ?? mod
    }
  }
  catch (e) {
    console.warn(
      '[markstream-vue2] Optional peer dependencies for MathBlockNode are missing. Falling back to text rendering. To enable full math rendering features, please install "katex".',
      e,
    )
  }
  return createMathFallbackNode(content => `$$${content}$$`)
}
