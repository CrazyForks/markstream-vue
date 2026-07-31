import type { NodeComponentProps } from '../../types/node-component'
import * as Octane from 'octane'

export function SuperscriptNode(props: NodeComponentProps<{ type: 'superscript' }>) {
  return <sup className="superscript-node">{props.children}</sup>
}

export default SuperscriptNode
