import { useRef, useCallback } from 'react'
import { exportToPdf } from '../utils/exportToPdf'
import { exportToHtml } from '../utils/exportToHtml'

export function useExport(filename: string) {
  const previewRef = useRef<HTMLDivElement>(null)

  const handleExportPdf = useCallback(async () => {
    if (!previewRef.current) return
    await exportToPdf(previewRef.current, filename)
  }, [filename])

  const handleExportHtml = useCallback(() => {
    if (!previewRef.current) return
    exportToHtml(previewRef.current, filename)
  }, [filename])

  return { previewRef, handleExportPdf, handleExportHtml }
}
