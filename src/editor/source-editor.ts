import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'

export interface SourceEditorOptions {
  parent: HTMLElement
  initialValue: string
  onChange: (value: string) => void
}

export function createSourceEditor({ parent, initialValue, onChange }: SourceEditorOptions): EditorView {
  const state = EditorState.create({
    doc: initialValue,
    extensions: [
      markdown(),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange(update.state.doc.toString())
      }),
      EditorView.theme({
        '&': { height: '100%', backgroundColor: 'transparent' },
        '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-mono)' },
        '.cm-content': { minHeight: '100%', padding: 'var(--space-5)' },
        '.cm-gutters': { display: 'none' },
        '.cm-line': { padding: '0' },
        '.cm-focused': { outline: 'none' },
        '.cm-cursor': { borderLeftColor: 'var(--color-accent)' },
        '.cm-selectionBackground, ::selection': { backgroundColor: 'var(--color-accent-soft)' },
      }),
    ],
  })

  return new EditorView({ state, parent })
}
