import type { NodeComponentProps } from '../../types/node-component'
import * as Octane from 'octane'

export function StrongNode(props: NodeComponentProps<{ type: 'strong' }>) {
  return <strong className="strong-node">{props.children}</strong>
}

export default StrongNode
