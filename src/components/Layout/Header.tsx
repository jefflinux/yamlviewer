import type { ViewMode } from '../../types'
import styles from './Header.module.css'

interface HeaderProps {
  filename: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onOpenFile: () => void
  onImportExcel: () => void
  onSaveFile: () => void
  onExportPdf: () => void
  onExportHtml: () => void
  onExportExcel: () => void
  error: string | null
}

export function Header({
  filename,
  viewMode,
  onViewModeChange,
  onOpenFile,
  onImportExcel,
  onSaveFile,
  onExportPdf,
  onExportHtml,
  onExportExcel,
  error,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.logo}>YAML Viewer</span>
        <span className={styles.version}>v{__APP_VERSION__}</span>
        <span className={styles.filename} title={filename}>
          {filename}
        </span>
        {error && <span className={styles.error} title={error}>Parse Error</span>}
      </div>

      <div className={styles.center}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'editor' ? styles.active : ''}`}
            onClick={() => onViewModeChange('editor')}
            title="Editor (Ctrl+1)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h12v12H2V2zm1 1v10h10V3H3zm1 1h8v1H4V4zm0 2h8v1H4V6zm0 2h5v1H4V8z" />
            </svg>
            Edit
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'split' ? styles.active : ''}`}
            onClick={() => onViewModeChange('split')}
            title="Split (Ctrl+2)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h12v12H2V2zm1 1v10h4.5V3H3zm5.5 0v10H13V3H8.5z" />
            </svg>
            Split
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'preview' ? styles.active : ''}`}
            onClick={() => onViewModeChange('preview')}
            title="Preview (Ctrl+3)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3h12v1H2V3zm0 3h8v1H2V6zm0 3h10v1H2V9zm0 3h6v1H2v-1z" />
            </svg>
            Tree
          </button>
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.btn} onClick={onOpenFile} title="Open YAML (Ctrl+O)">
          Open
        </button>
        <button className={`${styles.btn} ${styles.excelBtn}`} onClick={onImportExcel} title="Import Excel → YAML (.xlsx, .xls, .csv)">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2v12h12V5.5L10.5 2H2zm1 1h6v3.5h3.5V13H3V3zm7 .7L12.3 6H10V3.7zM5.3 7L7 9.5 5.3 12h1.4L8 10.3 9.3 12h1.4L9 9.5 10.7 7H9.3L8 8.7 6.7 7H5.3z" />
          </svg>
          Excel
        </button>
        <button className={styles.btn} onClick={onSaveFile} title="Save YAML">
          Save
        </button>
        <div className={styles.exportGroup}>
          <button className={styles.btn} onClick={onExportPdf} title="Export as PDF">
            PDF
          </button>
          <button className={styles.btn} onClick={onExportHtml} title="Export as HTML">
            HTML
          </button>
          <button className={`${styles.btn} ${styles.excelBtn}`} onClick={onExportExcel} title="Export YAML → Excel (.xlsx)">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zm-1 12H3V3h10v10zM5 5h2v2H5V5zm0 3h2v2H5V8zm3-3h3v2H8V5zm0 3h3v2H8V8zm-3 3h6v1H5v-1z" />
            </svg>
            Excel
          </button>
        </div>
      </div>
    </header>
  )
}
