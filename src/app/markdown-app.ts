import { connectHelpDialog } from '../components/help-dialog'
import { renderAppShell } from '../components/app-shell'
import { mountIcons } from '../components/icons'
import { connectSplitPane } from '../components/split-pane'
import {
  getWorkspaceElements,
  setRecoveryWarning,
  setStatus,
  updateDocumentView,
  updateFocusModeView,
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
import { createDocumentState, type DocumentState, type WorkspaceLayout } from '../state/document-state'

export function mountMarkdownApp(app: HTMLDivElement): void {
  app.innerHTML = renderAppShell()
  mountIcons(app)

  const recovered = readRecovery()
  let state: DocumentState = recovered
    ? createDocumentState(recovered.markdown, recovered)
    : createDocumentState(DEFAULT_MARKDOWN)
  let recoveryTimer: number | undefined
  let suppressRecovery = false
  let syncingScroll = false
  let focusMode = false
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
      setScrollRatio(editor.scrollDOM, elements.preview)
      updateHistoryView(elements, editor)
      scheduleRecovery()
    },
    onSelectionChange: (position) => {
      state.cursorPosition = position
    },
  })

  const captureViewState = (): void => {
    const snapshot = getSourceEditorSnapshot(editor)
    state.cursorPosition = snapshot.cursorPosition
    state.editorScrollTop = snapshot.scrollTop
    state.previewScrollTop = elements.preview.scrollTop
  }
  const setScrollRatio = (source: HTMLElement, target: HTMLElement): void => {
    if (!state.syncScroll || state.layout !== 'split' || syncingScroll) return
    const sourceRange = source.scrollHeight - source.clientHeight
    const targetRange = target.scrollHeight - target.clientHeight
    if (sourceRange <= 0 || targetRange <= 0) return
    syncingScroll = true
    target.scrollTop = (source.scrollTop / sourceRange) * targetRange
    syncingScroll = false
  }
  const updateSyncScrollButton = (): void => {
    const available = state.layout === 'split'
    elements.syncScrollButton.setAttribute('aria-pressed', String(available && state.syncScroll))
    elements.syncScrollButton.setAttribute('title', available
      ? state.syncScroll ? 'Turn synchronized scrolling off' : 'Turn synchronized scrolling on'
      : 'Synchronized scrolling is available only in split view')
    elements.syncScrollButton.disabled = !available
  }
  const applyMode = (): void => {
    state.mode = 'source'
    updateModeView(app, state.mode)
    scheduleRecovery()
  }
  const applyLayout = (layout: WorkspaceLayout): void => {
    state.layout = layout
    updateLayoutView(app, elements, layout)
    updateSyncScrollButton()
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
    applyMode()
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
  updateModeView(app, state.mode)
  updateLayoutView(app, elements, state.layout)
  updateHistoryView(elements, editor)
  updateDocumentView(app, elements, state)
  updateSyncScrollButton()
  if (recovered) setStatus(app, 'Draft restored locally')

  function connectWorkspaceEvents(): void {
    const toggleFocusMode = (): void => {
      if (focusMode) exitFocusMode()
      else enterFocusMode()
    }
    elements.enterFocusModeButton.addEventListener('click', toggleFocusMode)
    elements.focusModeUnfocusButton.addEventListener('click', exitFocusMode)
    window.addEventListener('keydown', handleGlobalShortcuts)
    elements.undoButton.addEventListener('click', () => { editor.focus(); undoSourceEditor(editor) })
    elements.redoButton.addEventListener('click', () => { editor.focus(); redoSourceEditor(editor) })
    app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', applyMode))
    app.querySelectorAll<HTMLButtonElement>('[data-layout]').forEach((button) => button.addEventListener('click', () => {
      if (isWorkspaceLayout(button.dataset.layout)) applyLayout(button.dataset.layout)
    }))
    elements.preview.addEventListener('click', (event) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      const copyButton = target.closest<HTMLButtonElement>('[data-copy-code]')
      if (copyButton) {
        const code = copyButton.closest('.markdown-code-block')?.querySelector('code')?.textContent ?? ''
        void navigator.clipboard.writeText(code).then(() => {
          copyButton.textContent = 'Copied'
          window.setTimeout(() => { copyButton.textContent = 'Copy' }, 1500)
        }).catch(() => {
          copyButton.textContent = 'Copy failed'
          window.setTimeout(() => { copyButton.textContent = 'Copy' }, 1500)
        })
        return
      }
    })
    elements.preview.addEventListener('scroll', () => {
      setScrollRatio(elements.preview, editor.scrollDOM)
      state.previewScrollTop = elements.preview.scrollTop
      scheduleRecovery()
    })
    editor.scrollDOM.addEventListener('scroll', () => {
      setScrollRatio(editor.scrollDOM, elements.preview)
      state.editorScrollTop = editor.scrollDOM.scrollTop
      scheduleRecovery()
    })
    elements.syncScrollButton.addEventListener('click', () => {
      state.syncScroll = !state.syncScroll
      updateSyncScrollButton()
      if (state.syncScroll) setScrollRatio(editor.scrollDOM, elements.preview)
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

  function enterFocusMode(): void {
    if (focusMode) return
    focusMode = true
    updateFocusModeView(elements, true)
    if (state.layout === 'preview') elements.preview.focus()
    else editor.focus()
  }

  function exitFocusMode(): void {
    if (!focusMode) return
    focusMode = false
    updateFocusModeView(elements, false)
    elements.enterFocusModeButton.focus()
  }

  function handleGlobalShortcuts(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.altKey || elements.helpDialog.open || event.composedPath().includes(elements.helpDialog)) return

    if (isPrimaryShortcut(event, 's')) {
      event.preventDefault()
      void saveDocument()
      return
    }

    if (isPrimaryShortcut(event, 'f', true)) {
      event.preventDefault()
      if (!focusMode) {
        enterFocusMode()
      }
      return
    }

    if (event.key === 'Escape' && focusMode) exitFocusMode()
  }

  async function openDocument(): Promise<void> {
    setStatus(app, 'Opening Markdown file…')
    try {
      const result = await openMarkdownFile()
      if (!result) return setStatus(app, 'Open cancelled')
      state = createDocumentState(result.markdown, { fileName: result.name, layout: state.layout })
      replaceDocument(result.markdown)
      updateDocumentView(app, elements, state)
      setStatus(app, `Opened ${result.name}`)
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

function isPrimaryShortcut(event: KeyboardEvent, key: string, shift = false): boolean {
  const isMac = navigator.platform.toLowerCase().includes('mac')
  const primaryModifier = isMac ? event.metaKey : event.ctrlKey
  return primaryModifier && !event.altKey && event.shiftKey === shift && event.key.toLowerCase() === key
}

function isWorkspaceLayout(value: string | undefined): value is WorkspaceLayout {
  return value === 'editor' || value === 'split' || value === 'preview'
}