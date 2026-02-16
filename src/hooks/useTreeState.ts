import { useState, useCallback } from 'react'
import type { TreeNodeData } from '../types'

function collectPaths(nodes: TreeNodeData[], prefix = ''): string[] {
  const paths: string[] = []
  for (const node of nodes) {
    const path = prefix ? `${prefix}.${node.key}` : node.key
    if (node.children) {
      paths.push(path)
      paths.push(...collectPaths(node.children, path))
    }
  }
  return paths
}

function collectPathsByLevel(
  nodes: TreeNodeData[],
  targetLevel: number,
  prefix = '',
  currentLevel = 0
): string[] {
  const paths: string[] = []
  for (const node of nodes) {
    const path = prefix ? `${prefix}.${node.key}` : node.key
    if (node.children) {
      if (currentLevel < targetLevel) {
        paths.push(path)
      }
      paths.push(...collectPathsByLevel(node.children, targetLevel, path, currentLevel + 1))
    }
  }
  return paths
}

export function useTreeState(tree: TreeNodeData[]) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = collectPathsByLevel(tree, 1)
    return new Set(initial)
  })

  const toggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpanded(new Set(collectPaths(tree)))
  }, [tree])

  const collapseAll = useCallback(() => {
    setExpanded(new Set())
  }, [])

  const expandToLevel = useCallback(
    (level: number) => {
      setExpanded(new Set(collectPathsByLevel(tree, level)))
    },
    [tree]
  )

  return { expanded, toggle, expandAll, collapseAll, expandToLevel }
}
