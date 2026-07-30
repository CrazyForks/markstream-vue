import type { ParsedNode } from 'stream-markdown-parser'
import type { NodeComponentProps } from '../../types/node-component'
import * as Octane from 'octane'
import { useMemo, useState } from 'octane'
import { renderNodeChildren } from '../../renderers/renderChildren.tsrx'

const ICON_MAP: Record<string, string> = {
  note: 'ℹ️',
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
  danger: '❗',
  error: '⛔',
  caution: '⚠️',
}

export function AdmonitionNode(props: NodeComponentProps<{
  type: 'admonition'
  kind?: string
  title?: string
  children?: ParsedNode[]
  collapsible?: boolean
  open?: boolean
}>) {
  const { node, ctx, renderNode, indexKey, isDark } = props
  const kind = String(node.kind || 'note')
  const displayTitle = useMemo(() => {
    if (node.title && String(node.title).trim().length)
      return String(node.title)
    return kind.charAt(0).toUpperCase() + kind.slice(1)
  }, [kind, node.title])

  const [collapsed, setCollapsed] = useState(() => node.collapsible ? !(node.open ?? true) : false)
  const headerId = useMemo(() => `admonition-${Math.random().toString(36).slice(2, 9)}`, [])

  return (
    <div className={`admonition admonition-${kind}${isDark ? ' is-dark' : ''}`} data-index-key={indexKey}>
      <div id={headerId} className="admonition-header">
        {ICON_MAP[kind] && <span className="admonition-icon">{ICON_MAP[kind]}</span>}
        <span className="admonition-title">{displayTitle}</span>
        {node.collapsible && (
          <button
            type="button"
            className="admonition-toggle"
            aria-expanded={!collapsed}
            aria-controls={`${headerId}-content`}
            title={collapsed ? 'Expand' : 'Collapse'}
            onClick={() => setCollapsed(v => !v)}
          >
            <span>{collapsed ? '▶' : '▼'}</span>
          </button>
        )}
      </div>
      {!collapsed && (
        <div id={`${headerId}-content`} className="admonition-content" aria-labelledby={headerId}>
          {ctx && renderNode ? renderNodeChildren(node.children, ctx, String(indexKey ?? headerId), renderNode) : null}
        </div>
      )}
    </div>
  )
}

export default AdmonitionNode
