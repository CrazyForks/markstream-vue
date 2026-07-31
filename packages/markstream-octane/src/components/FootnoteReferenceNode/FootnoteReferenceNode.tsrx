import type { NodeComponentProps } from '../../types/node-component'
import type { OctaneSpanAttributes } from '../../types/octane'
import * as Octane from 'octane'
import { useCallback, useMemo } from 'octane'

export function FootnoteReferenceNode(props: NodeComponentProps<{ type: 'footnote_reference', id: string }>) {
  const { node } = props
  const href = useMemo(() => `#fnref--${node.id}`, [node.id])
  const linkAttrs = useMemo(() => ({ href }) as OctaneSpanAttributes & { href: string }, [href])
  const handleScroll = useCallback((event: MouseEvent) => {
    event.preventDefault()
    if (typeof document === 'undefined')
      return
    const target = document.querySelector(href)
    if (target)
      target.scrollIntoView({ behavior: 'smooth' })
  }, [href])

  return (
    <sup id={`fnref-${node.id}`} className="footnote-reference" onClick={handleScroll}>
      <span {...linkAttrs} title={`查看脚注 ${node.id}`} className="footnote-link cursor-pointer">
        [
        {node.id}
        ]
      </span>
    </sup>
  )
}

export default FootnoteReferenceNode
