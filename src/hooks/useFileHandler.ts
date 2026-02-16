import { useCallback, useEffect } from 'react'

interface UseFileHandlerOptions {
  setContent: (content: string) => void
  setFilename: (name: string) => void
}

export function useFileHandler({ setContent, setFilename }: UseFileHandlerOptions) {
  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
        setFilename(file.name)
      }
      reader.readAsText(file)
    },
    [setContent, setFilename]
  )

  const openFile = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.yaml,.yml,.json,.txt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleFile(file)
    }
    input.click()
  }, [handleFile])

  const saveFile = useCallback(
    (content: string, filename: string) => {
      const blob = new Blob([content], { type: 'text/yaml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    []
  )

  useEffect(() => {
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer?.files[0]
      if (file) handleFile(file)
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) handleFile(file)
        }
      }
    }

    document.addEventListener('drop', handleDrop)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('drop', handleDrop)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('paste', handlePaste)
    }
  }, [handleFile])

  return { openFile, saveFile }
}
