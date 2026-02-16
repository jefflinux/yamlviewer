import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import type { ViewMode } from '../../types'
import styles from './SplitPane.module.css'

interface SplitPaneProps {
  viewMode: ViewMode
  editor: React.ReactNode
  preview: React.ReactNode
}

export function SplitPane({ viewMode, editor, preview }: SplitPaneProps) {
  if (viewMode === 'editor') {
    return <div className={styles.pane}>{editor}</div>
  }

  if (viewMode === 'preview') {
    return <div className={styles.pane}>{preview}</div>
  }

  return (
    <Allotment className={styles.split}>
      <Allotment.Pane minSize={200}>
        <div className={styles.pane}>{editor}</div>
      </Allotment.Pane>
      <Allotment.Pane minSize={200}>
        <div className={styles.pane}>{preview}</div>
      </Allotment.Pane>
    </Allotment>
  )
}
