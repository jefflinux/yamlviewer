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
  /** Tracks which ancestor levels need a vertical guide line */
  guides: boolean[]
}

/* ── Search matching ── */

function matchesSearch(node: TreeNodeData, search: string): boolean {
  if (!search) return true
  const lower = search.toLowerCase()
  if (node.key.toLowerCase().includes(lower)) return true
  if (node.label?.toLowerCase().includes(lower)) return true

  // leaf object fields
  if (node.fields) {
    for (const v of Object.values(node.fields)) {
      if (v !== null && v !== undefined && String(v).toLowerCase().includes(lower)) return true
    }
  }

  // scalar value
  if (node.value !== null && node.value !== undefined && !node.children && !node.fields) {
    if (String(node.value).toLowerCase().includes(lower)) return true
  }

  // recurse children
  if (node.children) {
    return node.children.some((child) => matchesSearch(child, search))
  }
  return false
}

/* ── Format a scalar for inline display ── */

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return 'null'
  if (Array.isArray(v)) return v.map((x) => String(x)).join(', ')
  return String(v)
}

function valueClass(v: unknown): string {
  if (v === null || v === undefined) return styles.valNull
  if (typeof v === 'boolean') return styles.valBool
  if (typeof v === 'number') return styles.valNum
  return styles.valStr
}

/* ── Guide lines column ── */

function GuideLines({ guides }: { guides: boolean[] }) {
  return (
    <>
      {guides.map((show, i) => (
        <span key={i} className={`${styles.guide} ${show ? styles.guideVisible : ''}`} />
      ))}
    </>
  )
}

/* ── Connector character ── */

function Connector({ isLast, depth }: { isLast: boolean; depth: number }) {
  if (depth === 0) return null
  return (
    <span className={styles.connector}>
      {isLast ? '\u2514\u2500' : '\u251C\u2500'}
    </span>
  )
}

/* ── Main component ── */

export function TreeNode({ node, path, expanded, onToggle, isLast, depth, search, guides }: TreeNodeProps) {
  if (search && !matchesSearch(node, search)) return null

  const hasChildren = !!node.children && node.children.length > 0
  const isExpanded = expanded.has(path)

  /* ─── Leaf object: single inline row with | separators ─── */
  if (node.isLeaf && node.fields) {
    const entries = Object.entries(node.fields)
    const label = node.label || node.key
    const otherFields = entries.filter(([, v]) => String(v) !== label)

    return (
      <div className={styles.row}>
        <GuideLines guides={guides} />
        <Connector isLast={isLast} depth={depth} />
        <span className={styles.leafLabel}>{label}</span>
        {otherFields.map(([k, v]) => (
          <span key={k} className={styles.fieldGroup}>
            <span className={styles.pipe}>|</span>
            <span className={valueClass(v)} title={k}>
              {formatValue(v)}
            </span>
          </span>
        ))}
      </div>
    )
  }

  /* ─── Simple scalar value ─── */
  if (!hasChildren && !node.isLeaf) {
    return (
      <div className={styles.row}>
        <GuideLines guides={guides} />
        <Connector isLast={isLast} depth={depth} />
        <span className={styles.scalarKey}>{node.key}</span>
        <span className={styles.colon}>:</span>
        <span className={valueClass(node.value)}>{formatValue(node.value)}</span>
      </div>
    )
  }

  /* ─── Container (object / array) with children ─── */
  const displayName = node.label || node.key
  const childGuides = [...guides, !isLast]

  return (
    <div className={styles.nodeWrapper}>
      <div
        className={`${styles.row} ${styles.clickable}`}
        onClick={() => onToggle(path)}
      >
        <GuideLines guides={guides} />
        <Connector isLast={isLast} depth={depth} />
        <span className={styles.folder}>
          {isExpanded ? '\uD83D\uDCC2' : '\uD83D\uDCC1'}
        </span>
        <span className={styles.containerName}>{displayName}</span>
        {node.childCount !== undefined && node.childCount > 0 && (
          <span className={styles.badge}>[{node.childCount} items]</span>
        )}
        {!isExpanded && (
          <span className={styles.expandHint}>
            <span className={styles.expandArrow}>&#9654;</span> 點擊展開...
          </span>
        )}
      </div>

      {isExpanded && hasChildren && (
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
                guides={childGuides}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
