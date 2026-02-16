export type ViewMode = 'editor' | 'split' | 'preview'

export interface FileInfo {
  name: string
  content: string
}

export interface TreeNodeData {
  key: string
  value: unknown
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  children?: TreeNodeData[]
  childCount?: number
  arrayIndex?: number
  /** Display label — uses "name"/"provider"/"title"/"label" field if present */
  label?: string
  /** True when this node is an object/array-item whose values are all scalars */
  isLeaf?: boolean
  /** Flat key→value pairs for inline display of leaf objects */
  fields?: Record<string, unknown>
}
