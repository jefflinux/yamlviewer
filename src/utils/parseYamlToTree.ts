import type { TreeNodeData } from '../types'

const LABEL_KEYS = ['name', 'provider', 'title', 'label', 'id', 'key']

function getType(value: unknown): TreeNodeData['type'] {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'string'
}

function isScalar(value: unknown): boolean {
  if (value === null || value === undefined) return true
  const t = typeof value
  return t === 'string' || t === 'number' || t === 'boolean'
}

/** Check if an object has only scalar values (no nested objects/arrays) */
function isLeafObject(value: unknown): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value as Record<string, unknown>).every(
    (v) => isScalar(v) || (Array.isArray(v) && v.every(isScalar))
  )
}

function countItems(value: unknown): number {
  if (value === null || value === undefined || typeof value !== 'object') return 0
  if (Array.isArray(value)) {
    return value.reduce<number>((sum, item) => sum + 1 + countItems(item), 0)
  }
  const entries = Object.entries(value as Record<string, unknown>)
  return entries.reduce<number>((sum, [, v]) => sum + 1 + countItems(v), 0)
}

function findLabel(obj: Record<string, unknown>): string | undefined {
  for (const k of LABEL_KEYS) {
    if (k in obj && isScalar(obj[k])) return String(obj[k])
  }
  return undefined
}

function buildNode(key: string, value: unknown, arrayIndex?: number): TreeNodeData {
  const type = getType(value)
  const node: TreeNodeData = { key, value, type, arrayIndex }

  if (type === 'object' && value !== null) {
    const obj = value as Record<string, unknown>

    if (isLeafObject(obj)) {
      // Leaf object: render inline with | separators
      node.isLeaf = true
      node.label = findLabel(obj)
      node.fields = {}
      for (const [k, v] of Object.entries(obj)) {
        node.fields[k] = v
      }
    } else {
      // Container object: has nested structures
      const label = findLabel(obj)
      if (label) node.label = label
      const entries = Object.entries(obj)
      node.children = entries.map(([k, v]) => buildNode(k, v))
      node.childCount = countItems(value)
    }
  } else if (type === 'array') {
    const arr = value as unknown[]
    node.children = arr.map((item, i) => buildNode(String(i), item, i))
    node.childCount = countItems(value)
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
