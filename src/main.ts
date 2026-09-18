import './styles/tokens.css'
import './style.css'
import './styles/print.css'
import { DEFAULT_MARKDOWN } from './default-markdown'
import { canRedoSourceEditor, canUndoSourceEditor, createSourceEditor, getSourceEditorSnapshot, redoSourceEditor, restoreSourceEditorSnapshot, setSourceEditorLivePreview, undoSourceEditor } from './editor/source-editor'
import { renderMarkdown, prepareRenderedLinks } from './markdown/render-markdown'
import { clearRecovery, readRecovery, writeRecovery } from './persistence/recovery'
import { createDocumentState, type DocumentState, type ViewMode, type WorkspaceLayout } from './state/document-state'
import { openMarkdownFile, saveMarkdownFile } from './files/markdown-files'
import { findActiveBlock } from './markdown/live-preview'
import {
  CircleHelp,
  Code,
  Columns2,
  Eye,
  FileDown,
  FilePlus,
  FolderOpen,
  PanelLeft,
  PanelRight,
  Save,
  Trash,
  Undo2,
  Redo2,
  X,
  type IconNode,
} from 'lucide'

const welcomeMarkdown = `# Markdown Preview

A calm place to inspect and export Markdown.

- Paste Markdown into the source pane.
- Keep the raw document as your source of truth.
- Use Live Preview to inspect the rendered result.

> Phase 3 adds explicit document state, layouts, and complete recovery metadata.
`

const recovered = readRecovery()
let documentState: DocumentState = createDocumentState(DEFAULT_MARKDOWN, recovered ?? undefined)
let recoveryTimer: number | undefined

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div class="app-shell">
    <header class="app-header">
      <div class="brand-lockup"><span class="brand-mark" aria-hidden="true">M</span><h1>Markdown Preview</h1></div>
      <nav class="header-actions" aria-label="Document actions">
        <button class="icon-button" data-action="new" type="button" aria-label="New document" title="New document"><i data-lucide="file-plus"></i></button>
        <button class="icon-button" data-action="open" type="button" aria-label="Open file" title="Open file"><i data-lucide="folder-open"></i></button>
        <button class="icon-button" data-action="save" type="button" aria-label="Save Markdown" title="Save Markdown"><i data-lucide="save"></i></button>
        <span class="action-divider" aria-hidden="true"></span>
        <button class="icon-button icon-button--primary" data-action="pdf" type="button" aria-label="Download PDF" title="Download PDF"><i data-lucide="file-down"></i></button>
      </nav>
    </header>
    <main class="workspace" aria-label="Markdown workspace"><section class="workspace-toolbar" aria-label="Workspace controls"><div class="toolbar-groups"><div class="segmented-control" role="group" aria-label="Editor history"><button class="segment" data-action="undo" type="button" aria-label="Undo" title="Undo (Ctrl/Cmd+Z)" disabled><i data-lucide="undo-2"></i></button><button class="segment" data-action="redo" type="button" aria-label="Redo" title="Redo (Ctrl/Cmd+Shift+Z)" disabled><i data-lucide="redo-2"></i></button></div><div class="segmented-control" role="group" aria-label="Editor mode"><button class="segment" data-mode="live-preview" type="button" aria-label="Live Preview" title="Live Preview"><i data-lucide="eye"></i></button><button class="segment" data-mode="source" type="button" aria-label="Source" title="Source"><i data-lucide="code"></i></button></div><div class="segmented-control layout-control" role="group" aria-label="Pane layout"><button class="segment" data-layout="editor" type="button" aria-label="Editor only" title="Editor only"><i data-lucide="panel-left"></i></button><button class="segment" data-layout="split" type="button" aria-label="Split view" title="Split view"><i data-lucide="columns-2"></i></button><button class="segment" data-layout="preview" type="button" aria-label="Preview only" title="Preview only"><i data-lucide="panel-right"></i></button></div></div></section>
      <section class="document-region" data-layout="split" aria-label="Document panes"><article class="pane pane-editor" data-pane="editor" aria-label="Source editor"><div class="pane-header"><span class="pane-label" data-editor-label>Live Preview</span></div><div class="editor-container" data-editor></div></article><div class="split-handle" role="separator" aria-label="Resize editor and preview panes" aria-orientation="vertical" aria-valuemin="20" aria-valuemax="80" aria-valuenow="50" tabindex="0"><span aria-hidden="true"></span></div><article class="pane pane-preview" data-pane="preview" aria-label="Rendered preview"><div class="pane-header"><span class="pane-label">Rendered Preview</span></div><div class="preview-content" data-preview></div></article></section></main>
    <footer class="app-footer"><div class="toolbar-meta"><span class="status-dot" aria-hidden="true"></span><span data-status>Draft ready</span><span class="toolbar-divider" aria-hidden="true"></span><span data-count>0 words</span></div><div class="footer-actions"><button class="icon-button icon-button--quiet" data-action="help" type="button" aria-label="Markdown help" title="Markdown help" aria-haspopup="dialog" aria-controls="help-dialog"><i data-lucide="circle-help"></i></button><button class="icon-button icon-button--quiet" data-action="clear" type="button" aria-label="Clear draft" title="Clear draft"><i data-lucide="trash"></i></button></div></footer>
    <dialog class="help-dialog" id="help-dialog" aria-labelledby="help-title"><form method="dialog" class="help-dialog__surface"><button class="help-dialog__close icon-button icon-button--quiet" value="cancel" aria-label="Close help" title="Close help"><i data-lucide="x"></i></button><h2 id="help-title">Markdown help</h2><section><h3>Syntax reference</h3><dl><dt><code># Heading</code></dt><dd>Creates a heading.</dd><dt><code>**bold**</code></dt><dd>Creates bold text.</dd><dt><code>[label](url)</code></dt><dd>Creates a link.</dd><dt><code>- item</code></dt><dd>Creates a list.</dd><dt><code>fenced code</code></dt><dd>Creates a code block.</dd></dl></section><section><h3>Keyboard shortcuts</h3><p><kbd>Escape</kbd> closes this help dialog. Use standard text-editing shortcuts in the editor.</p></section></form></dialog>
  </div>`

const icons: Record<string, IconNode> = {
  'circle-help': CircleHelp,
  code: Code,
  'columns-2': Columns2,
  eye: Eye,
  'file-down': FileDown,
  'file-plus': FilePlus,
  'folder-open': FolderOpen,
  'panel-left': PanelLeft,
  'panel-right': PanelRight,
  save: Save,
  trash: Trash,
  'undo-2': Undo2,
  'redo-2': Redo2,
  x: X,
}

function renderIcon(placeholder: HTMLElement, icon: IconNode): void {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const attributes = {
    xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round',
    'stroke-linejoin': 'round', 'aria-hidden': 'true',
  }
  Object.entries(attributes).forEach(([name, value]) => svg.setAttribute(name, value))
  icon.forEach(([tag, iconAttributes]) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
    Object.entries(iconAttributes).forEach(([name, value]) => {
      if (value !== undefined) element.setAttribute(name, String(value))
    })
    svg.append(element)
  })
  placeholder.replaceWith(svg)
}

app.querySelectorAll<HTMLElement>('[data-lucide]').forEach((placeholder) => {
  const icon = icons[placeholder.dataset.lucide ?? '']
  if (icon) renderIcon(placeholder, icon)
})

const workspace = app.querySelector<HTMLElement>('.document-region')!
const splitHandle = app.querySelector<HTMLElement>('.split-handle')!
const status = app.querySelector<HTMLElement>('[data-status]')!
const recoveryNote = app.querySelector<HTMLElement>('[data-recovery-note]')!
const helpDialog = app.querySelector<HTMLDialogElement>('#help-dialog')!
const helpTrigger = app.querySelector<HTMLButtonElement>('[data-action="help"]')!
const undoButton = app.querySelector<HTMLButtonElement>('[data-action="undo"]')!
const redoButton = app.querySelector<HTMLButtonElement>('[data-action="redo"]')!

const MIN_PANE_WIDTH = 240

function resizePanes(clientX: number): void {
  const workspaceBounds = workspace.getBoundingClientRect()
  const availableWidth = workspaceBounds.width - splitHandle.offsetWidth
  const minimumWidth = Math.min(MIN_PANE_WIDTH, availableWidth * 0.4)
  const editorWidth = Math.min(
    Math.max(clientX - workspaceBounds.left, minimumWidth),
    availableWidth - minimumWidth,
  )
  const editorPercent = Math.round((editorWidth / availableWidth) * 100)

  workspace.style.setProperty('--editor-pane-width', `${editorWidth}px`)
  splitHandle.setAttribute('aria-valuenow', String(editorPercent))
}

splitHandle.addEventListener('pointerdown', (event) => {
  if (documentState.layout !== 'split') return
  event.preventDefault()
  splitHandle.setPointerCapture(event.pointerId)
  splitHandle.classList.add('is-dragging')
  document.body.classList.add('is-resizing-panes')
  resizePanes(event.clientX)
})
splitHandle.addEventListener('pointermove', (event) => {
  if (splitHandle.hasPointerCapture(event.pointerId)) resizePanes(event.clientX)
})
splitHandle.addEventListener('pointerup', (event) => {
  if (splitHandle.hasPointerCapture(event.pointerId)) splitHandle.releasePointerCapture(event.pointerId)
  splitHandle.classList.remove('is-dragging')
  document.body.classList.remove('is-resizing-panes')
})
splitHandle.addEventListener('keydown', (event) => {
  if (documentState.layout !== 'split' || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  event.preventDefault()
  const direction = event.key === 'ArrowLeft' ? -1 : 1
  resizePanes(splitHandle.getBoundingClientRect().left + direction * (event.shiftKey ? 50 : 10))
})

helpTrigger.addEventListener('click', () => helpDialog.showModal())
helpDialog.addEventListener('close', () => helpTrigger.focus())
helpDialog.addEventListener('click', (event) => {
  if (event.target === helpDialog) helpDialog.close()
})
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && helpDialog.open) helpDialog.close()
})

function trapHelpFocus(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || !helpDialog.open) return
  const focusable = helpDialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
helpDialog.addEventListener('keydown', trapHelpFocus)

function setStatus(message: string, failed = false): void {
  status.textContent = message
  status.classList.toggle('status-warning', failed)
  recoveryNote.textContent = failed ? 'Local recovery is unavailable. Your draft remains in memory.' : 'Local recovery protects your latest draft.'
}

function updateCount(): void {
  const words = documentState.markdown.trim() ? documentState.markdown.trim().split(/\s+/u).length : 0
  app.querySelector<HTMLElement>('[data-count]')!.textContent = `${words} ${words === 1 ? 'word' : 'words'}`
}

function updateHistoryButtons(): void {
  undoButton.disabled = !canUndoSourceEditor(editor)
  redoButton.disabled = !canRedoSourceEditor(editor)
}

function isViewMode(value: string | undefined): value is ViewMode {
  return value === 'live-preview' || value === 'source' || value === 'preview'
}

function isWorkspaceLayout(value: string | undefined): value is WorkspaceLayout {
  return value === 'editor' || value === 'split' || value === 'preview'
}

function readSourceRange(element: HTMLElement): { start: number; end: number } | null {
  const start = Number(element.dataset.sourceStart)
  const end = Number(element.dataset.sourceEnd)
  return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : null
}

function focusRenderedBlock(element: HTMLElement): void {
  const range = readSourceRange(element)
  if (!range) return
  applyMode('live-preview')
  applyLayout('split')
  editor.focus()
  editor.dispatch({ selection: { anchor: range.start } })
}

function updatePreview(): void {
  const preview = app.querySelector<HTMLElement>('[data-preview]')!
  preview.innerHTML = renderMarkdown(documentState.markdown)
  prepareRenderedLinks(preview)
  preview.scrollTop = documentState.previewScrollTop
}

function updateModeButtons(): void {
  app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
    const active = button.dataset.mode === documentState.mode
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
  })
}

function updateLayoutButtons(): void {
  workspace.dataset.layout = documentState.layout
  app.querySelectorAll<HTMLButtonElement>('[data-layout]').forEach((button) => {
    const active = button.dataset.layout === documentState.layout
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
  })
}

function scheduleRecovery(): void {
  window.clearTimeout(recoveryTimer)
  recoveryTimer = window.setTimeout(() => {
    documentState.updatedAt = Date.now()
    const saved = writeRecovery(documentState)
    setStatus(saved ? 'Draft recovered locally' : 'Recovery unavailable', !saved)
  }, 500)
}

function captureViewState(): void {
  const editorSnapshot = getSourceEditorSnapshot(editor)
  documentState.cursorPosition = editorSnapshot.cursorPosition
  documentState.editorScrollTop = editorSnapshot.scrollTop
  documentState.previewScrollTop = app.querySelector<HTMLElement>('[data-preview]')!.scrollTop
}

function applyMode(mode: ViewMode): void {
  documentState.mode = mode
  if (mode !== 'preview' && documentState.layout === 'preview') documentState.layout = 'split'
  app.querySelector<HTMLElement>('[data-pane="editor"]')!.classList.toggle('is-hidden', mode === 'preview')
  app.querySelector<HTMLElement>('[data-pane="preview"]')!.classList.toggle('is-hidden', mode === 'source')
  setSourceEditorLivePreview(editor, mode === 'live-preview')
  app.querySelector<HTMLElement>('[data-editor-label]')!.textContent = mode === 'live-preview' ? 'Live Preview' : 'Source'
  app.querySelector<HTMLElement>('[data-editor-hint]')!.textContent = mode === 'live-preview' ? 'Click and type to edit' : 'Raw Markdown'
  updateModeButtons()
  scheduleRecovery()
}

function applyLayout(layout: WorkspaceLayout): void {
  documentState.layout = layout
  updateLayoutButtons()
  scheduleRecovery()
}

function updateLivePreviewFocus(cursorPosition: number): void {
  const preview = app.querySelector<HTMLElement>('[data-preview]')!
  const block = findActiveBlock(documentState.markdown, cursorPosition)
  preview.querySelectorAll<HTMLElement>('[data-source-start]').forEach((element) => {
    const range = readSourceRange(element)
    element.classList.toggle('is-active-source-block', range !== null && range.start <= block.range.end && range.end >= block.range.start)
  })
}

const editor = createSourceEditor({
  parent: app.querySelector<HTMLElement>('[data-editor]')!,
  initialValue: documentState.markdown,
  onChange: (value) => {
    documentState.markdown = value
    captureViewState()
    updateCount()
    scheduleRecovery()
    void updatePreview()
    updateHistoryButtons()
  },
  onSelectionChange: (position) => {
    documentState.cursorPosition = position
    updateLivePreviewFocus(position)
  },
})

restoreSourceEditorSnapshot(editor, { cursorPosition: documentState.cursorPosition, scrollTop: documentState.editorScrollTop })
undoButton.addEventListener('click', () => { editor.focus(); undoSourceEditor(editor) })
redoButton.addEventListener('click', () => { editor.focus(); redoSourceEditor(editor) })
setSourceEditorLivePreview(editor, documentState.mode === 'live-preview')
app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => {
  if (isViewMode(button.dataset.mode)) {
    applyMode(button.dataset.mode)
    updateLayoutButtons()
  }
}))
app.querySelectorAll<HTMLButtonElement>('[data-layout]').forEach((button) => button.addEventListener('click', () => {
  if (isWorkspaceLayout(button.dataset.layout)) applyLayout(button.dataset.layout)
}))
const preview = app.querySelector<HTMLElement>('[data-preview]')!
preview.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  const block = target.closest<HTMLElement>('[data-source-start]')
  if (block) focusRenderedBlock(block)
})
preview.addEventListener('scroll', () => { documentState.previewScrollTop = preview.scrollTop; scheduleRecovery() })

function clearDraft(): void {
  editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: '' } })
  documentState = createDocumentState('')
  clearRecovery()
  updateCount()
  applyMode('live-preview')
  applyLayout('split')
  void updatePreview()
  setStatus('Blank draft')
}

app.querySelector<HTMLButtonElement>('[data-action="new"]')!.addEventListener('click', clearDraft)
app.querySelector<HTMLButtonElement>('[data-action="clear"]')!.addEventListener('click', clearDraft)
app.querySelector<HTMLButtonElement>('[data-action="open"]')!.addEventListener('click', () => {
  setStatus('Opening Markdown file…')
  void openMarkdownFile().then((result) => {
    if (!result) return setStatus('Open cancelled')
    documentState = createDocumentState(result.markdown, { layout: documentState.layout })
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: result.markdown } })
    updateCount()
    void updatePreview()
    setStatus(`Opened ${result.name ?? 'Markdown file'}`)
  }).catch(() => setStatus('Could not open file', true))
})
app.querySelector<HTMLButtonElement>('[data-action="save"]')!.addEventListener('click', () => {
  setStatus('Saving Markdown…')
  void saveMarkdownFile(documentState.markdown).then(() => setStatus('Markdown saved')).catch(() => setStatus('Could not save Markdown', true))
})
app.querySelector<HTMLButtonElement>('[data-action="pdf"]')!.addEventListener('click', () => {
  setStatus('Preparing print preview…')
  window.setTimeout(() => window.print(), 0)
})
updateCount()
updateModeButtons()
updateLayoutButtons()
updateHistoryButtons()
if (recovered) setStatus('Draft restored locally')
void updatePreview()
