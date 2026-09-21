import { connectHelpDialog } from '../components/help-dialog'
import { renderAppShell } from '../components/app-shell'
import { mountIcons } from '../components/icons'
import { connectSplitPane } from '../components/split-pane'
import {
  getWorkspaceElements,
  readSourceRange,
  setRecoveryWarning,
  setStatus,
  updateActivePreviewBlock,
  updateDocumentView,
  updateHistoryView,
  updateLayoutView,
  updateModeView,
} from '../components/workspace-view'
import { DEFAULT_MARKDOWN } from '../default-markdown'
import {
  createSourceEditor,
  getSourceEditorSnapshot,
  redoSourceEditor,
  restoreSourceEditorSnapshot,
  undoSourceEditor,
} from '../editor/source-editor'
import { openMarkdownFile, saveMarkdownFile } from '../files/markdown-files'
import { clearRecovery, readRecovery, writeRecovery } from '../persistence/recovery'
import { createDocumentState, type DocumentState, type ViewMode, type WorkspaceLayout } from '../state/document-state'

export function mountMarkdownApp(app: HTMLDivElement): void {
  app.innerHTML = renderAppShell()
  mountIcons(app)

  const recovered = readRecovery()
  let state: DocumentState = recovered
    ? createDocumentState(recovered.markdown, recovered)
    : createDocumentState(DEFAULT_MARKDOWN)
  let recoveryTimer: number | undefined
  let suppressRecovery = false
  const elements = getWorkspaceElements(app)

  const scheduleRecovery = (): void => {
    if (suppressRecovery) return
    window.clearTimeout(recoveryTimer)
    recoveryTimer = window.setTimeout(() => {
      state.updatedAt = Date.now()
      const saved = writeRecovery(state)
      setRecoveryWarning(app, !saved)
      setStatus(app, saved ? 'Draft saved locally' : 'Editing in memory', !saved)
    }, 500)
  }

  const editor = createSourceEditor({
    parent: elements.editorParent,
    initialValue: state.markdown,
    onChange: (markdown) => {
      state.markdown = markdown
      captureViewState()
      updateDocumentView(app, elements, state)
      updateHistoryView(elements, editor)
      scheduleRecovery()
    },
    onSelectionChange: (position) => {
      state.cursorPosition = position
      updateActivePreviewBlock(elements.preview, state.markdown, position)
    },
  })

  const captureViewState = (): void => {
    const snapshot = getSourceEditorSnapshot(editor)
    state.cursorPosition = snapshot.cursorPosition
    state.editorScrollTop = snapshot.scrollTop
    state.previewScrollTop = elements.preview.scrollTop
  }
  const applyMode = (mode: ViewMode): void => {
    state.mode = mode
    updateModeView(app, editor, mode)
    scheduleRecovery()
  }
  const applyLayout = (layout: WorkspaceLayout): void => {
    state.layout = layout
    updateLayoutView(app, elements, layout)
    scheduleRecovery()
  }
  const replaceDocument = (markdown: string): void => {
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: markdown } })
  }
  const clearDraft = (): void => {
    if (state.markdown.trim() && !window.confirm('Clear this draft?')) return
    window.clearTimeout(recoveryTimer)
    suppressRecovery = true
    state = createDocumentState('')
    replaceDocument('')
    clearRecovery()
    setRecoveryWarning(app, false)
    applyMode('live-preview')
    applyLayout('split')
    updateDocumentView(app, elements, state)
    suppressRecovery = false
    setStatus(app, 'Blank draft')
  }

  restoreSourceEditorSnapshot(editor, {
    cursorPosition: state.cursorPosition,
    scrollTop: state.editorScrollTop,
  })
  connectHelpDialog(elements.helpDialog, elements.helpTrigger)
  connectSplitPane(elements.workspace, elements.splitHandle, () => state.layout === 'split')
  connectWorkspaceEvents()
  updateModeView(app, editor, state.mode)
  updateLayoutView(app, elements, state.layout)
  updateHistoryView(elements, editor)
  updateDocumentView(app, elements, state)
  if (recovered) setStatus(app, 'Draft restored locally')

  function connectWorkspaceEvents(): void {
    elements.undoButton.addEventListener('click', () => { editor.focus(); undoSourceEditor(editor) })
    elements.redoButton.addEventListener('click', () => { editor.focus(); redoSourceEditor(editor) })
    app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => {
      if (isViewMode(button.dataset.mode)) applyMode(button.dataset.mode)
    }))
    app.querySelectorAll<HTMLButtonElement>('[data-layout]').forEach((button) => button.addEventListener('click', () => {
      if (isWorkspaceLayout(button.dataset.layout)) applyLayout(button.dataset.layout)
    }))
    elements.preview.addEventListener('click', (event) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      const range = readSourceRange(target.closest<HTMLElement>('[data-source-start]') ?? target)
      if (!range) return
      applyMode('live-preview')
      applyLayout('split')
      editor.focus()
      editor.dispatch({ selection: { anchor: range.start } })
    })
    elements.preview.addEventListener('scroll', () => {
      state.previewScrollTop = elements.preview.scrollTop
      scheduleRecovery()
    })
    app.querySelector<HTMLButtonElement>('[data-action="new"]')!.addEventListener('click', clearDraft)
    app.querySelector<HTMLButtonElement>('[data-action="clear"]')!.addEventListener('click', clearDraft)
    app.querySelector<HTMLButtonElement>('[data-action="open"]')!.addEventListener('click', openDocument)
    app.querySelector<HTMLButtonElement>('[data-action="save"]')!.addEventListener('click', saveDocument)
    app.querySelector<HTMLButtonElement>('[data-action="pdf"]')!.addEventListener('click', () => {
      setStatus(app, 'Preparing print preview…')
      window.setTimeout(() => window.print(), 0)
    })
  }

  async function openDocument(): Promise<void> {
    setStatus(app, 'Opening Markdown file…')
    try {
      const result = await openMarkdownFile()
      if (!result) return setStatus(app, 'Open cancelled')
      state = createDocumentState(result.markdown, { fileName: result.name ?? 'untitled.md', layout: state.layout })
      replaceDocument(result.markdown)
      updateDocumentView(app, elements, state)
      setStatus(app, `Opened ${result.name ?? 'Markdown file'}`)
    } catch {
      setStatus(app, 'Could not open file', true)
    }
  }

  async function saveDocument(): Promise<void> {
    setStatus(app, 'Saving Markdown…')
    try {
      await saveMarkdownFile(state.markdown, state.fileName)
      setStatus(app, 'Markdown saved')
    } catch {
      setStatus(app, 'Could not save Markdown', true)
    }
  }
}

function isViewMode(value: string | undefined): value is ViewMode {
  return value === 'live-preview' || value === 'source'
}

function isWorkspaceLayout(value: string | undefined): value is WorkspaceLayout {
  return value === 'editor' || value === 'split' || value === 'preview'
}