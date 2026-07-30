import type * as Octane from 'octane'
import type { RenderContext, RenderNodeFn } from '../types'

export interface NodeComponentProps<TNode = unknown> {
  node: TNode
  ctx?: RenderContext
  renderNode?: RenderNodeFn
  indexKey?: string | number | bigint
  customId?: string
  isDark?: boolean
  typewriter?: boolean
  /** Enable/disable fade animations. Default: true */
  fade?: boolean
  children?: Octane.OctaneNode
}
