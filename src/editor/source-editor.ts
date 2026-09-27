import { EditorSelection, EditorState, type Extension } from '@codemirror/state'
import { EditorView, highlightActiveLine, keymap, lineNumbers } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { history, historyKeymap, redo, redoDepth, undo, undoDepth } from '@codemirror/commands'
import { convertPastedContent } from '../markdown/paste-markdown'

export interface SourceEditorOptions {
  parent: HTMLElement
  initialValue: string
  onChange: (value: string) => void
}

export interface SourceEditorSnapshot {
  cursorPosition: number
  scrollTop: number
}

function toggleMarkdownMarkers(open: string, close: string) {
  return (view: EditorView): boolean => {
    const transaction = view.state.changeByRange((range) => {
      const selected = view.state.sliceDoc(range.from, range.to)
      const hasSelection = range.from !== range.to
      const openBefore = range.from >= open.length
        && view.state.sliceDoc(range.from - open.length, range.from) === open
      const closeAfter = view.state.sliceDoc(range.to, range.to + close.length) === close
      if (openBefore && closeAfter) {
        return {
          changes: [
            { from: range.from - open.length, to: range.from, insert: '' },
            { from: range.to, to: range.to + close.length, insert: '' },
          ],
          range: hasSelection
            ? EditorSelection.range(range.from - open.length, range.to - open.length)
            : EditorSelection.cursor(range.from - open.length),
        }
      }

      return {
        changes: { from: range.from, to: range.to, insert: `${open}${selected}${close}` },
        range: hasSelection
          ? EditorSelection.range(range.from + open.length, range.from + open.length + selected.length)
          : EditorSelection.cursor(range.from + open.length),
      }
    })
    view.dispatch(transaction)
    return true
  }
}

function createMarkdownLink(view: EditorView): boolean {
  const transaction = view.state.changeByRange((range) => {
    const selected = view.state.sliceDoc(range.from, range.to)
    const label = selected || 'link text'
    const insert = `[${label}](url)`
    const urlStart = range.from + label.length + 3

    return {
      changes: { from: range.from, to: range.to, insert },
      range: selected
        ? EditorSelection.range(urlStart, urlStart + 3)
        : EditorSelection.range(range.from + 1, range.from + 1 + label.length),
    }
  })
  view.dispatch(transaction)
  return true
}

function createMarkdownCodeBlock(view: EditorView): boolean {
  const transaction = view.state.changeByRange((range) => {
    const selected = view.state.sliceDoc(range.from, range.to)
    const line = view.state.doc.lineAt(range.from)
    const longestBacktickRun = Math.max(0, ...Array.from(selected.matchAll(/`+/gu), (match) => match[0].length))
    const fence = String.fromCharCode(96).repeat(Math.max(3, longestBacktickRun + 1))
    const hasContent = selected.length > 0
    const leadingNewline = range.from === line.from || !hasContent ? '' : '\n'
    const trailingNewline = range.to < view.state.doc.length
      && view.state.sliceDoc(range.to, range.to + 1) !== '\n'
      ? '\n'
      : ''
    const opening = `${leadingNewline}${fence}\n`
    const closing = `\n${fence}${trailingNewline}`
    const insert = `${opening}${selected}${closing}`
    const contentStart = range.from + opening.length

    return {
      changes: { from: range.from, to: range.to, insert },
      range: hasContent
        ? EditorSelection.range(contentStart, contentStart + selected.length)
        : EditorSelection.cursor(contentStart),
    }
  })
  view.dispatch(transaction)
  return true
}

const markdownFormattingKeymap = [
  { key: 'Mod-b', run: toggleMarkdownMarkers('**', '**'), preventDefault: true },
  { key: 'Mod-i', run: toggleMarkdownMarkers('*', '*'), preventDefault: true },
  { key: 'Alt-Shift-s', run: toggleMarkdownMarkers('~~', '~~'), preventDefault: true },
  { key: 'Mod-k', run: createMarkdownLink, preventDefault: true },
  { key: 'Ctrl-Shift-k', mac: 'Mod-Alt-c', run: createMarkdownCodeBlock, preventDefault: true },
]

function createEditorTheme(): Extension {
  return EditorView.theme({
    '&': { height: '100%', backgroundColor: 'transparent', color: 'var(--color-ink)' },
    '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-body)' },
    '.cm-content': { minHeight: '100%', padding: 'var(--space-6)', caretColor: 'var(--color-caret)', fontFamily: 'var(--font-body)', fontSize: 'var(--document-body-size)', lineHeight: 'var(--document-body-leading)' },
    '.cm-gutters': { backgroundColor: 'transparent', borderRight: '1px solid var(--color-rule)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875em' },
    '.cm-lineNumbers .cm-gutterElement': { minWidth: '2ch', padding: '0 var(--space-3)' },
    '.cm-line': { padding: '0' },
    '.cm-focused': { outline: 'none' },
    '&.cm-focused .cm-cursor': { borderLeft: '2px solid var(--color-caret)' },
    '.cm-selectionBackground, ::selection': { backgroundColor: 'var(--color-accent-soft)' },
    '.cm-active-line': { backgroundColor: 'var(--color-accent-soft)' },
  })
}

export function createSourceEditor({ parent, initialValue, onChange }: SourceEditorOptions): EditorView {
  const state = EditorState.create({
    doc: initialValue,
    extensions: [
      markdown(),
      history(),
      keymap.of(markdownFormattingKeymap),
      keymap.of(historyKeymap),
      highlightActiveLine(),
      lineNumbers(),
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
      createEditorTheme(),
    ],
  })

  const view = new EditorView({ state, parent })
  parent.classList.add('editor-container--ready')
  return view
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
