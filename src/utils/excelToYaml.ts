import * as XLSX from 'xlsx'
import yaml from 'js-yaml'

/* ── Types ── */

interface SheetLayout {
  headerRows: number
  hierColumns: number[]
  categoryCol: number | null
  dataColumns: { col: number; name: string }[]
}

type TreeObj = Record<string, unknown>

/* ── Detect hierarchical layout from header rows ── */

const LEVEL_RE = /^[一二三四五六七八九十]+級$|^Level\s*\d+$/i
const SKIP_HEADERS = new Set(['', '功能模組', 'Function Module'])

function detectLayout(raw: unknown[][]): SheetLayout | null {
  // Find the row containing level names (一級, 二級, ...)
  let levelRow = -1
  for (let r = 0; r < Math.min(6, raw.length); r++) {
    const row = raw[r]
    if (!row) continue
    if (row.some((v) => LEVEL_RE.test(String(v ?? '').trim()))) {
      levelRow = r
      break
    }
  }

  if (levelRow < 0) return null

  const headerRows = levelRow + 1

  // Collect hierarchy columns
  const hierColumns: number[] = []
  const levelRowData = raw[levelRow] || []
  for (let c = 0; c < levelRowData.length; c++) {
    if (LEVEL_RE.test(String(levelRowData[c] ?? '').trim())) {
      hierColumns.push(c)
    }
  }

  if (hierColumns.length === 0) return null

  // Detect 類別 column (usually just before hierarchy columns)
  let categoryCol: number | null = null
  for (let r = 0; r < headerRows; r++) {
    const row = raw[r]
    if (!row) continue
    for (let c = 0; c < hierColumns[0]; c++) {
      const v = String(row[c] ?? '').trim()
      if (v === '類別' || v === 'Category') {
        categoryCol = c
      }
    }
  }

  // Collect data columns (non-hierarchy, non-category, with a real header)
  const hierSet = new Set(hierColumns)
  const dataColumns: { col: number; name: string }[] = []
  for (let c = 0; c < (raw[0]?.length ?? 0); c++) {
    if (hierSet.has(c) || c === categoryCol) continue

    // Find first non-empty header across header rows
    let name = ''
    for (let r = 0; r < headerRows; r++) {
      const v = String(raw[r]?.[c] ?? '').trim()
      if (v && !SKIP_HEADERS.has(v)) {
        name = v
        break
      }
    }

    if (!name) continue

    // Verify this column actually has data below the headers
    let hasData = false
    for (let r = headerRows; r < Math.min(headerRows + 30, raw.length); r++) {
      const v = String(raw[r]?.[c] ?? '').trim()
      if (v) { hasData = true; break }
    }

    if (hasData) {
      dataColumns.push({ col: c, name })
    }
  }

  return { headerRows, hierColumns, categoryCol, dataColumns }
}

/* ── Build hierarchical tree from rows ── */

function buildTree(raw: unknown[][], layout: SheetLayout): TreeObj {
  const { headerRows, hierColumns, categoryCol, dataColumns } = layout
  const tree: TreeObj = {}

  // Stack tracks current node name at each hierarchy level
  const stack: string[] = []
  let currentCategory = ''

  for (let r = headerRows; r < raw.length; r++) {
    const row = raw[r]
    if (!row) continue

    // Update category if present
    if (categoryCol !== null) {
      const catVal = String(row[categoryCol] ?? '').trim()
      if (catVal) currentCategory = catVal
    }

    // Find values at each hierarchy level, track deepest
    let deepestLevel = -1
    for (let i = 0; i < hierColumns.length; i++) {
      const v = String(row[hierColumns[i]] ?? '').trim()
      if (v) {
        stack[i] = v
        deepestLevel = i
      }
    }

    if (deepestLevel < 0) continue // skip empty rows

    // Truncate stack below deepest level
    stack.length = deepestLevel + 1

    // Full path: [category, level1, level2, ...]
    const fullPath = currentCategory ? [currentCategory, ...stack] : [...stack]
    if (fullPath.length === 0) continue

    // Collect non-null metadata
    const meta: TreeObj = {}
    for (const { col, name } of dataColumns) {
      const v = String(row[col] ?? '').trim()
      if (v) meta[name] = v
    }

    // Navigate / create path in tree
    let current: TreeObj = tree
    for (let i = 0; i < fullPath.length - 1; i++) {
      const key = fullPath[i]
      if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key] as TreeObj
    }

    const nodeName = fullPath[fullPath.length - 1]

    if (Object.keys(meta).length > 0) {
      if (nodeName in current && typeof current[nodeName] === 'object' && current[nodeName] !== null) {
        // Already exists as container — merge metadata
        Object.assign(current[nodeName] as TreeObj, meta)
      } else {
        current[nodeName] = meta
      }
    } else {
      if (!(nodeName in current)) {
        current[nodeName] = {}
      }
    }
  }

  return tree
}

/* ── Flat fallback (no hierarchy detected) ── */

function flatSheetToObjects(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null })
  return raw.map((row) => {
    const obj: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      const v = value === null || value === undefined || String(value).trim() === '' ? null : value
      if (v !== null) obj[key] = v
    }
    return obj
  }).filter((obj) => Object.keys(obj).length > 0)
}

/* ── Public API ── */

export function excelBufferToYaml(buffer: ArrayBuffer, filename: string): string {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetNames = workbook.SheetNames
  const result: TreeObj = {}

  for (const name of sheetNames) {
    const ws = workbook.Sheets[name]
    const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null })
    const layout = detectLayout(raw)

    if (layout) {
      // Hierarchical sheet
      result[name] = buildTree(raw, layout)
    } else {
      // Flat sheet
      result[name] = flatSheetToObjects(ws)
    }
  }

  const header = `# Generated from: ${filename}\n# Sheets: ${sheetNames.join(', ')}\n\n`
  return header + yaml.dump(result, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  })
}
