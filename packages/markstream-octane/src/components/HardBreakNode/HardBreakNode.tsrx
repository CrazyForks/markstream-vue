import type { NodeComponentProps } from '../../types/node-component'
import * as Octane from 'octane'

export function HardBreakNode(_props: NodeComponentProps<{ type: 'hardbreak' }>) {
  return <br className="hard-break" />
}

export default HardBreakNode
