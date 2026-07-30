import type { NodeComponentProps } from '../../types/node-component'
import * as Octane from 'octane'

export function InsertNode(props: NodeComponentProps<{ type: 'insert' }>) {
  return <ins className="insert-node">{props.children}</ins>
}

export default InsertNode
