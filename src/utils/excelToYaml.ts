import * as XLSX from 'xlsx'
import yaml from 'js-yaml'

function inferType(value: unknown): unknown {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number' || typeof value === 'boolean') return value

  const str = String(value).trim()

  // boolean
  if (/^(true|yes)$/i.test(str)) return true
  if (/^(false|no)$/i.test(str)) return false

  // null
  if (/^(null|~|none)$/i.test(str)) return null

  // number
  if (/^-?\d+$/.test(str)) return parseInt(str, 10)
  if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str)

  // array-like (comma separated in a cell)
  if (str.includes(',') && !str.includes('\n')) {
    const parts = str.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length > 1) {
      return parts.map((p) => inferType(p))
    }
  }

  return str
}

function sheetToObjects(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null })
  return raw.map((row) => {
    const obj: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      obj[key] = inferType(value)
    }
    return obj
  })
}

export function excelBufferToYaml(buffer: ArrayBuffer, filename: string): string {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetNames = workbook.SheetNames

  let data: unknown

  if (sheetNames.length === 1) {
    // Single sheet → array of objects
    const sheet = workbook.Sheets[sheetNames[0]]
    const objects = sheetToObjects(sheet)
    data = { [sheetNames[0]]: objects }
  } else {
    // Multiple sheets → keyed by sheet name
    const result: Record<string, unknown> = {}
    for (const name of sheetNames) {
      const sheet = workbook.Sheets[name]
      result[name] = sheetToObjects(sheet)
    }
    data = result
  }

  const header = `# Generated from: ${filename}\n# Sheets: ${sheetNames.join(', ')}\n\n`
  return header + yaml.dump(data, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  })
}
