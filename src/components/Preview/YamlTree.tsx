import { useState, forwardRef } from 'react'
import type { TreeNodeData } from '../../types'
import { TreeNode } from './TreeNode'
import styles from './YamlTree.module.css'

interface YamlTreeProps {
  tree: TreeNodeData[]
  error: string | null
  expanded: Set<string>
  onToggle: (path: string) => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onExpandToLevel: (level: number) => void
}

export const YamlTree = forwardRef<HTMLDivElement, YamlTreeProps>(
  ({ tree, error, expanded, onToggle, onExpandAll, onCollapseAll, onExpandToLevel }, ref) => {
    const [search, setSearch] = useState('')

    return (
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button className={styles.toolBtn} onClick={onExpandAll} title="Expand All">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1l7 7-7 7V9H1V7h7V1z" />
              </svg>
              Expand
            </button>
            <button className={styles.toolBtn} onClick={onCollapseAll} title="Collapse All">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15L1 8l7-7v6h7v2H8v6z" />
              </svg>
              Collapse
            </button>
            <span className={styles.divider} />
            <span className={styles.levelLabel}>Level:</span>
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                className={styles.levelBtn}
                onClick={() => onExpandToLevel(level)}
                title={`Expand to level ${level}`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className={styles.toolbarRight}>
            <div className={styles.searchBox}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className={styles.searchIcon}>
                <path d="M11.5 7a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-.82 4.74a6 6 0 111.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search keys/values..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.searchClear} onClick={() => setSearch('')}>
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.treeContent} ref={ref}>
          {error ? (
            <div className={styles.errorPanel}>
              <div className={styles.errorTitle}>YAML Parse Error</div>
              <pre className={styles.errorMessage}>{error}</pre>
            </div>
          ) : (
            <div className={styles.tree}>
              {tree.map((node, i) => {
                const path = node.key
                return (
                  <TreeNode
                    key={path}
                    node={node}
                    path={path}
                    expanded={expanded}
                    onToggle={onToggle}
                    isLast={i === tree.length - 1}
                    depth={0}
                    search={search}
                    guides={[]}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
)

YamlTree.displayName = 'YamlTree'
