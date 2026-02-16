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
}
