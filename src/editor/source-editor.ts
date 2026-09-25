import { Compartment, EditorState, type Extension, type Range } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate, highlightActiveLine, keymap } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { history, historyKeymap, redo, redoDepth, undo, undoDepth } from '@codemirror/commands'
import {
  collapseOnSelectionFacet,
  livePreviewPlugin,
  markdownStylePlugin,
} from 'codemirror-live-markdown'
import { convertPastedContent } from '../markdown/paste-markdown'

export interface SourceEditorOptions {
  parent: HTMLElement
  initialValue: string
  onChange: (value: string) => void
  onSelectionChange?: (position: number) => void
}

export interface SourceEditorSnapshot {
  cursorPosition: number
  scrollTop: number
}

const livePreviewMode = new Compartment()

const collapseHeadingSeparator = ViewPlugin.fromClass(class {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = headingSeparatorDecorations(view)
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      this.decorations = headingSeparatorDecorations(update.view)
    }
  }
}, { decorations: (value) => value.decorations })

const livePreviewExtensions = [
  collapseOnSelectionFacet.of(true),
  livePreviewPlugin,
  markdownStylePlugin,
  collapseHeadingSeparator,
]

function headingSeparatorDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = []
  const selection = view.state.selection

  syntaxTree(view.state).iterate({
    from: view.viewport.from,
    to: view.viewport.to,
    enter: (node) => {
      if (node.name !== 'HeaderMark') return
      const line = view.state.doc.lineAt(node.from)
      const isActive = selection.ranges.some((range) => range.from <= line.to && range.to >= line.from)
      if (isActive) return

      const separator = view.state.doc.sliceString(node.to, line.to).match(/^[\t ]+/u)?.[0]
      if (separator) decorations.push(Decoration.replace({}).range(node.to, node.to + separator.length))
    },
  })

  return Decoration.set(decorations)
}

function configureLivePreview(editor: EditorView, enabled: boolean): void {
  editor.dom.classList.toggle('cm-live-preview', enabled)
  editor.dom.classList.toggle('cm-source', !enabled)
  editor.dispatch({ effects: livePreviewMode.reconfigure(enabled ? livePreviewExtensions : []) })
}

function createEditorTheme(): Extension {
  return EditorView.theme({
    '&': { height: '100%', backgroundColor: 'transparent', color: 'var(--color-ink)' },
    '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-body)' },
    '.cm-content': { minHeight: '100%', padding: 'var(--space-6)', caretColor: 'var(--color-caret)', fontFamily: 'var(--font-body)', fontSize: 'var(--document-body-size)', lineHeight: 'var(--document-body-leading)' },
    '.cm-gutters': { display: 'none' },
    '.cm-line': { padding: '0' },
    '.cm-focused': { outline: 'none' },
    '&.cm-focused .cm-cursor': { borderLeft: '2px solid var(--color-caret)' },
    '.cm-selectionBackground, ::selection': { backgroundColor: 'var(--color-accent-soft)' },
    '.cm-active-line': { backgroundColor: 'var(--color-accent-soft)' },
    '.cm-formatting-inline': { display: 'inline-flex', maxWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap', verticalAlign: 'baseline', opacity: '0', color: 'var(--color-ink-muted)', fontSize: '0.85em', pointerEvents: 'none' },
    '.cm-formatting-inline-visible': { maxWidth: '4ch', margin: '0 1px', opacity: '1', pointerEvents: 'auto' },
    '.cm-formatting-inline-visible.cm-emphasis, .cm-formatting-inline-visible.cm-strong': { maxWidth: '4ch', opacity: '1', pointerEvents: 'auto' },
    '.cm-formatting-block': { display: 'inline', fontSize: '0', lineHeight: 'inherit', opacity: '0', color: 'var(--color-ink-muted)' },
    '.cm-formatting-block-visible': { fontSize: '1em', opacity: '0.6' },
    '.cm-header-1': { display: 'inline', fontSize: 'var(--document-heading-1-size)', fontWeight: 'var(--document-heading-weight)', lineHeight: '1.15', letterSpacing: '-0.02em' },
    '.cm-header-2': { display: 'inline', fontSize: 'var(--document-heading-2-size)', fontWeight: 'var(--document-heading-weight)', lineHeight: '1.15', letterSpacing: '-0.015em' },
    '.cm-header-3': { display: 'inline', fontSize: 'var(--document-heading-3-size)', fontWeight: 'var(--document-heading-weight)', lineHeight: '1.15' },
    '.cm-header-4': { display: 'inline', fontSize: 'var(--document-heading-4-size)', fontWeight: 'var(--document-heading-weight)', lineHeight: '1.15' },
    '.cm-header-5': { display: 'inline', fontSize: 'var(--document-heading-5-size)', fontWeight: 'var(--document-heading-weight)', lineHeight: '1.15' },
    '.cm-header-6': { display: 'inline', fontSize: 'var(--document-heading-6-size)', fontWeight: 'var(--document-heading-weight)', lineHeight: '1.15' },
    '.cm-strong': { fontWeight: '700' },
    '.cm-emphasis': { fontStyle: 'italic' },
    '.cm-strikethrough': { textDecoration: 'line-through' },
    '.cm-code': { padding: '0 var(--space-1)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-raised)', fontFamily: 'var(--font-mono)' },
    '.cm-link': { color: 'var(--color-accent)', textDecoration: 'underline', textDecorationThickness: '0.08em', textUnderlineOffset: '0.15em' },
    '.ͼ1, .cm-header': { fontWeight: '650' },
    '.ͼ2': { fontWeight: '700' },
    '.ͼ3': { fontStyle: 'italic' },
    '.ͼ4': { textDecoration: 'line-through' },
    '.ͼ5': { padding: '0 var(--space-1)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-raised)' },
  })
}

export function createSourceEditor({ parent, initialValue, onChange, onSelectionChange }: SourceEditorOptions): EditorView {
  const state = EditorState.create({
    doc: initialValue,
    extensions: [
      markdown(),
      history(),
      keymap.of(historyKeymap),
      highlightActiveLine(),
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
        if (update.selectionSet || update.docChanged) onSelectionChange?.(update.state.selection.main.head)
      }),
      createEditorTheme(),
    ],
  })

  const view = new EditorView({ state, parent })
  parent.classList.add('editor-container--ready')
  return view
}

export function setSourceEditorLivePreview(editor: EditorView, enabled: boolean): void {
  configureLivePreview(editor, enabled)
}

export function undoSourceEditor(editor: EditorView): void {
  undo(editor)
}

export function redoSourceEditor(editor: EditorView): void {
  redo(editor)
}

export function canUndoSourceEditor(editor: EditorView): boolean {
  return undoDepth(editor.state) > 0
}

export function canRedoSourceEditor(editor: EditorView): boolean {
  return redoDepth(editor.state) > 0
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
