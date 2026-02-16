import type { TreeNodeData } from '../../types'
import styles from './TreeNode.module.css'

interface TreeNodeProps {
  node: TreeNodeData
  path: string
  expanded: Set<string>
  onToggle: (path: string) => void
  isLast: boolean
  depth: number
  search: string
}

function matchesSearch(node: TreeNodeData, search: string): boolean {
  if (!search) return true
  const lower = search.toLowerCase()
  if (node.key.toLowerCase().includes(lower)) return true
  if (node.value !== null && node.value !== undefined && !node.children) {
    if (String(node.value).toLowerCase().includes(lower)) return true
  }
  if (node.children) {
    return node.children.some((child) => matchesSearch(child, search))
  }
  return false
}

function ValueDisplay({ value, type }: { value: unknown; type: TreeNodeData['type'] }) {
  if (type === 'null') return <span className={styles.null}>null</span>
  if (type === 'boolean') return <span className={styles.boolean}>{String(value)}</span>
  if (type === 'number') return <span className={styles.number}>{String(value)}</span>
  if (type === 'string') {
    const str = String(value)
    if (str.length > 120) {
      return <span className={styles.string} title={str}>"{str.slice(0, 120)}..."</span>
    }
    return <span className={styles.string}>"{str}"</span>
  }
  return null
}

export function TreeNode({ node, path, expanded, onToggle, isLast, depth, search }: TreeNodeProps) {
  const hasChildren = !!node.children && node.children.length > 0
  const isExpanded = expanded.has(path)
  const isContainer = node.type === 'object' || node.type === 'array'

  if (search && !matchesSearch(node, search)) {
    return null
  }

  const connector = isLast ? '\u2514\u2500' : '\u251C\u2500'

  return (
    <div className={styles.nodeWrapper}>
      <div
        className={`${styles.node} ${hasChildren ? styles.clickable : ''}`}
        onClick={hasChildren ? () => onToggle(path) : undefined}
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        <span className={styles.connector}>{depth > 0 ? connector : ''}</span>

        {hasChildren ? (
          <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4.5 2L8.5 6L4.5 10z" />
            </svg>
          </span>
        ) : (
          <span className={styles.leafDot} />
        )}

        {isContainer ? (
          <span className={styles.folderIcon}>
            {node.type === 'array' ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 3h12v1H2V3zm0 3h12v1H2V6zm0 3h12v1H2V9zm0 3h12v1H2v-1z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7H1.75z" />
              </svg>
            )}
          </span>
        ) : null}

        <span className={styles.key}>
          {node.arrayIndex !== undefined ? (
            <span className={styles.arrayIndex}>[{node.arrayIndex}]</span>
          ) : (
            node.key
          )}
        </span>

        {!hasChildren && (
          <>
            <span className={styles.separator}>:</span>
            <ValueDisplay value={node.value} type={node.type} />
          </>
        )}

        {hasChildren && node.childCount !== undefined && (
          <span className={styles.badge}>
            {node.type === 'array' ? `[${node.children!.length}]` : `{${node.childCount}}`}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className={styles.children}>
          {node.children!.map((child, i) => {
            const childPath = path ? `${path}.${child.key}` : child.key
            return (
              <TreeNode
                key={childPath}
                node={child}
                path={childPath}
                expanded={expanded}
                onToggle={onToggle}
                isLast={i === node.children!.length - 1}
                depth={depth + 1}
                search={search}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
