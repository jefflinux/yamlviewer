import { useState, useEffect, useCallback } from 'react'
import type { ViewMode } from './types'
import { useYaml } from './hooks/useYaml'
import { useFileHandler } from './hooks/useFileHandler'
import { useExport } from './hooks/useExport'
import { useTreeState } from './hooks/useTreeState'
import { Header } from './components/Layout/Header'
import { SplitPane } from './components/Layout/SplitPane'
import { YamlEditor } from './components/Editor/YamlEditor'
import { YamlTree } from './components/Preview/YamlTree'

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const { content, setContent, filename, setFilename, error, tree } = useYaml()
  const { openFile, saveFile } = useFileHandler({ setContent, setFilename })
  const { previewRef, handleExportPdf, handleExportHtml } = useExport(filename)
  const { expanded, toggle, expandAll, collapseAll, expandToLevel } = useTreeState(tree)

  const handleSave = useCallback(() => {
    saveFile(content, filename)
  }, [content, filename, saveFile])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return

      switch (e.key) {
        case 'o':
          e.preventDefault()
          openFile()
          break
        case 's':
          e.preventDefault()
          handleSave()
          break
        case '1':
          e.preventDefault()
          setViewMode('editor')
          break
        case '2':
          e.preventDefault()
          setViewMode('split')
          break
        case '3':
          e.preventDefault()
          setViewMode('preview')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openFile, handleSave])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        filename={filename}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenFile={openFile}
        onSaveFile={handleSave}
        onExportPdf={handleExportPdf}
        onExportHtml={handleExportHtml}
        error={error}
      />
      <SplitPane
        viewMode={viewMode}
        editor={<YamlEditor content={content} onChange={setContent} />}
        preview={
          <YamlTree
            ref={previewRef}
            tree={tree}
            error={error}
            expanded={expanded}
            onToggle={toggle}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onExpandToLevel={expandToLevel}
          />
        }
      />
    </div>
  )
}
