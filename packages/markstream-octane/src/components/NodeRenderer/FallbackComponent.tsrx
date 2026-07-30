import type { NodeComponentProps } from '../../types/node-component'
import * as Octane from 'octane'

export function FallbackComponent(props: NodeComponentProps<{ type: string }>) {
  const { node } = props
  return (
    <div className="unknown-node text-sm text-gray-500 italic">
      Unsupported node type:
      {' '}
      {String((node as any)?.type)}
    </div>
  )
}

export default FallbackComponent
