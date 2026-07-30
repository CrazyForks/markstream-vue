import type { NodeComponentProps } from '../../types/node-component'
import * as Octane from 'octane'

export function EmphasisNode(props: NodeComponentProps<{ type: 'emphasis' }>) {
  return <em className="emphasis-node">{props.children}</em>
}

export default EmphasisNode
