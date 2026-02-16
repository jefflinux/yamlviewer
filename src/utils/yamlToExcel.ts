import * as XLSX from 'xlsx'

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey))
    } else if (Array.isArray(value)) {
      // Convert arrays to comma-separated string for cell display
      result[fullKey] = value.map((v) => (v === null ? '' : String(v))).join(', ')
    } else {
      result[fullKey] = value
    }
  }
  return result
}

function toRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        return flattenObject(item as Record<string, unknown>)
      }
      return { value: item }
    })
  }
  if (data !== null && typeof data === 'object') {
    return [flattenObject(data as Record<string, unknown>)]
  }
  return [{ value: data }]
}

function isSheetCandidate(data: unknown): data is Record<string, unknown> {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return false
  const values = Object.values(data as Record<string, unknown>)
  // At least one value should be an array or object to warrant multiple sheets
  return values.some((v) => Array.isArray(v) || (v !== null && typeof v === 'object'))
}

export function yamlToExcel(parsed: unknown, filename: string) {
  const workbook = XLSX.utils.book_new()

  if (isSheetCandidate(parsed)) {
    const data = parsed as Record<string, unknown>
    for (const [key, value] of Object.entries(data)) {
      const rows = toRows(value)
      if (rows.length === 0) {
        // Empty sheet with just a placeholder
        const ws = XLSX.utils.aoa_to_sheet([[key], ['(empty)']])
        XLSX.utils.book_append_sheet(workbook, ws, sanitizeSheetName(key))
      } else {
        const ws = XLSX.utils.json_to_sheet(rows)
        autoFitColumns(ws, rows)
        XLSX.utils.book_append_sheet(workbook, ws, sanitizeSheetName(key))
      }
    }
  } else {
    const rows = toRows(parsed)
    const ws = XLSX.utils.json_to_sheet(rows)
    autoFitColumns(ws, rows)
    XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1')
  }

  const outFilename = filename.replace(/\.(ya?ml|json|txt)$/i, '') + '.xlsx'
  XLSX.writeFile(workbook, outFilename)
}

function sanitizeSheetName(name: string): string {
  // Excel sheet name max 31 chars, no special chars: \ / ? * [ ]
  return name.replace(/[\\/?*[\]]/g, '_').slice(0, 31)
}

function autoFitColumns(ws: XLSX.WorkSheet, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return
  const keys = Object.keys(rows[0])
  const colWidths = keys.map((key) => {
    const maxDataLen = rows.reduce((max, row) => {
      const val = row[key]
      const len = val === null || val === undefined ? 4 : String(val).length
      return Math.max(max, len)
    }, key.length)
    return { wch: Math.min(maxDataLen + 2, 50) }
  })
  ws['!cols'] = colWidths
}
