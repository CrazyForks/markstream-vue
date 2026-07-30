import type { NodeComponentProps } from '../../types/node-component'
import * as Octane from 'octane'

export function HighlightNode(props: NodeComponentProps<{ type: 'highlight' }>) {
  return <mark className="highlight-node">{props.children}</mark>
}

export default HighlightNode
