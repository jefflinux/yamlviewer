import CodeMirror from '@uiw/react-codemirror'
import { yaml } from '@codemirror/lang-yaml'
import styles from './YamlEditor.module.css'

interface YamlEditorProps {
  content: string
  onChange: (value: string) => void
}

export function YamlEditor({ content, onChange }: YamlEditorProps) {
  return (
    <div className={styles.editor}>
      <CodeMirror
        value={content}
        onChange={onChange}
        extensions={[yaml()]}
        height="100%"
        theme="light"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          indentOnInput: true,
        }}
      />
    </div>
  )
}
