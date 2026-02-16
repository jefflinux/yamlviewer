import type { TreeNodeData } from '../types'

function getType(value: unknown): TreeNodeData['type'] {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'string'
}

function countDescendants(value: unknown): number {
  if (value === null || value === undefined || typeof value !== 'object') return 0
  if (Array.isArray(value)) {
    return value.reduce<number>((sum, item) => sum + 1 + countDescendants(item), 0)
  }
  const entries = Object.entries(value as Record<string, unknown>)
  return entries.reduce<number>((sum, [, v]) => sum + 1 + countDescendants(v), 0)
}

function buildNode(key: string, value: unknown, arrayIndex?: number): TreeNodeData {
  const type = getType(value)
  const node: TreeNodeData = { key, value, type, arrayIndex }

  if (type === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
    node.children = entries.map(([k, v]) => buildNode(k, v))
    node.childCount = countDescendants(value)
  } else if (type === 'array') {
    const arr = value as unknown[]
    node.children = arr.map((item, i) => buildNode(String(i), item, i))
    node.childCount = countDescendants(value)
  }

  return node
}

export function parseYamlToTree(parsed: unknown): TreeNodeData[] {
  if (parsed === null || parsed === undefined) {
    return [{ key: '(empty)', value: null, type: 'null' }]
  }

  if (typeof parsed !== 'object') {
    return [{ key: '(root)', value: parsed, type: getType(parsed) }]
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item, i) => buildNode(String(i), item, i))
  }

  return Object.entries(parsed as Record<string, unknown>).map(([k, v]) => buildNode(k, v))
}
