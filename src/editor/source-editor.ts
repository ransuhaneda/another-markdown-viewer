import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { convertPastedContent } from '../markdown/paste-markdown'

export interface SourceEditorOptions {
  parent: HTMLElement
  initialValue: string
  onChange: (value: string) => void
  onPaste?: (value: string) => void
}

export interface SourceEditorSnapshot {
  cursorPosition: number
  scrollTop: number
}

export function createSourceEditor({ parent, initialValue, onChange }: SourceEditorOptions): EditorView {
  const state = EditorState.create({
    doc: initialValue,
    extensions: [
      markdown(),
      EditorView.lineWrapping,
      EditorView.domEventHandlers({
        paste: (event, view) => {
          const clipboard = event.clipboardData
          if (!clipboard) return false
          const converted = convertPastedContent(clipboard.getData('text/plain'), clipboard.getData('text/html'))
          if (!converted) return false
          event.preventDefault()
          view.dispatch(view.state.replaceSelection(converted))
          return true
        },
      }),
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

export function getSourceEditorSnapshot(editor: EditorView): SourceEditorSnapshot {
  return {
    cursorPosition: editor.state.selection.main.head,
    scrollTop: editor.scrollDOM.scrollTop,
  }
}

export function restoreSourceEditorSnapshot(editor: EditorView, snapshot: SourceEditorSnapshot): void {
  const position = Math.max(0, Math.min(snapshot.cursorPosition, editor.state.doc.length))
  editor.dispatch({ selection: { anchor: position } })
  editor.scrollDOM.scrollTop = Math.max(0, snapshot.scrollTop)
}
