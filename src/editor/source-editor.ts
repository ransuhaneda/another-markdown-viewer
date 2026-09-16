import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import {
  collapseOnSelectionFacet,
  livePreviewPlugin,
  markdownStylePlugin,
  mouseSelectingField,
  setMouseSelecting,
} from 'codemirror-live-markdown'
import { convertPastedContent } from '../markdown/paste-markdown'

export interface SourceEditorOptions {
  parent: HTMLElement
  initialValue: string
  onChange: (value: string) => void
  onPaste?: (value: string) => void
  onSelectionChange?: (position: number) => void
}

export interface SourceEditorSnapshot {
  cursorPosition: number
  scrollTop: number
}

const livePreviewMode = new Compartment()

const livePreviewExtensions = [
  collapseOnSelectionFacet.of(true),
  mouseSelectingField,
  livePreviewPlugin,
  markdownStylePlugin,
]

export function createSourceEditor({ parent, initialValue, onChange, onSelectionChange }: SourceEditorOptions): EditorView {
  const state = EditorState.create({
    doc: initialValue,
    extensions: [
      markdown(),
      livePreviewMode.of(livePreviewExtensions),
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
        if (update.selectionSet && !update.docChanged) onSelectionChange?.(update.state.selection.main.head)
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
        '.ͼ1, .cm-header': { fontWeight: '650' },
        '.ͼ2': { fontWeight: '700' },
        '.ͼ3': { fontStyle: 'italic' },
        '.ͼ4': { textDecoration: 'line-through' },
        '.ͼ5': { padding: '0 var(--space-1)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-raised)' },
      }),
    ],
  })

  const view = new EditorView({ state, parent })
  view.contentDOM.addEventListener('mousedown', () => {
    view.dispatch({ effects: setMouseSelecting.of(true) })
  })
  const handleMouseUp = (): void => {
    window.requestAnimationFrame(() => view.dispatch({ effects: setMouseSelecting.of(false) }))
  }
  document.addEventListener('mouseup', handleMouseUp)
  const originalDestroy = view.destroy.bind(view)
  view.destroy = (): void => {
    document.removeEventListener('mouseup', handleMouseUp)
    originalDestroy()
  }
  return view
}

export function setSourceEditorLivePreview(editor: EditorView, enabled: boolean): void {
  editor.dispatch({ effects: livePreviewMode.reconfigure(enabled ? livePreviewExtensions : []) })
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
