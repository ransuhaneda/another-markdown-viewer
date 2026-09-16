import './styles/tokens.css'
import './style.css'
import './styles/print.css'
import { createSourceEditor, getSourceEditorSnapshot, restoreSourceEditorSnapshot } from './editor/source-editor'
import { renderMarkdown, prepareRenderedLinks } from './markdown/render-markdown'
import { clearRecovery, readRecovery, writeRecovery } from './persistence/recovery'
import { createDocumentState, type DocumentState, type ViewMode, type WorkspaceLayout } from './state/document-state'
import { openMarkdownFile, saveMarkdownFile } from './files/markdown-files'

const welcomeMarkdown = `# Markdown Preview

A calm place to inspect and export Markdown.

- Paste Markdown into the source pane.
- Keep the raw document as your source of truth.
- Use Live Preview to inspect the rendered result.

> Phase 3 adds explicit document state, layouts, and complete recovery metadata.
`

const recovered = readRecovery()
let documentState: DocumentState = createDocumentState(welcomeMarkdown, recovered ?? undefined)
let recoveryTimer: number | undefined

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div class="app-shell">
    <header class="app-header"><div class="brand-lockup"><span class="brand-mark" aria-hidden="true">M</span><div><p class="eyebrow">Writing surface</p><h1>Markdown Preview</h1></div></div><nav class="header-actions" aria-label="Document actions"><button class="button button-secondary" data-action="new" type="button">New document</button><button class="button button-secondary" data-action="open" type="button">Open file</button><button class="button button-secondary" data-action="save" type="button">Save Markdown</button><button class="button button-primary" data-action="pdf" type="button">Download PDF</button></nav></header>
    <main class="workspace" aria-label="Markdown workspace"><section class="workspace-toolbar" aria-label="Workspace controls"><div class="toolbar-groups"><div class="segmented-control" role="group" aria-label="View mode"><button class="segment" data-mode="live-preview" type="button">Live Preview</button><button class="segment" data-mode="source" type="button">Source</button><button class="segment" data-mode="preview" type="button">Preview</button></div><div class="segmented-control layout-control" role="group" aria-label="Pane layout"><button class="segment" data-layout="editor" type="button">Editor</button><button class="segment" data-layout="split" type="button">Split</button><button class="segment" data-layout="preview" type="button">Preview</button></div></div><div class="toolbar-meta"><span class="status-dot" aria-hidden="true"></span><span data-status>Draft ready</span><span class="toolbar-divider" aria-hidden="true"></span><span data-count>0 words</span></div></section>
      <section class="document-region" data-layout="split" aria-label="Document panes"><article class="pane pane-editor" data-pane="editor" aria-label="Source editor"><div class="pane-header"><span class="pane-label">Source</span><span class="pane-hint">Markdown</span></div><div class="editor-container" data-editor></div></article><div class="split-handle" aria-hidden="true"><span></span></div><article class="pane pane-preview" data-pane="preview" aria-label="Rendered preview"><div class="pane-header"><span class="pane-label">Live Preview</span><span class="pane-hint">Rendered document</span></div><div class="preview-content" data-preview></div></article></section></main>
    <footer class="app-footer"><span data-recovery-note>Local recovery protects your latest draft.</span><button class="text-button" data-action="clear" type="button">Clear draft</button></footer>
  </div>`

const workspace = app.querySelector<HTMLElement>('.document-region')!
const status = app.querySelector<HTMLElement>('[data-status]')!
const recoveryNote = app.querySelector<HTMLElement>('[data-recovery-note]')!

function setStatus(message: string, failed = false): void {
  status.textContent = message
  status.classList.toggle('status-warning', failed)
  recoveryNote.textContent = failed ? 'Local recovery is unavailable. Your draft remains in memory.' : 'Local recovery protects your latest draft.'
}

function updateCount(): void {
  const words = documentState.markdown.trim() ? documentState.markdown.trim().split(/\s+/u).length : 0
  app.querySelector('[data-count]')!.textContent = `${words} ${words === 1 ? 'word' : 'words'}`
}

async function updatePreview(): Promise<void> {
  const preview = app.querySelector<HTMLElement>('[data-preview]')!
  preview.innerHTML = await renderMarkdown(documentState.markdown)
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
  app.querySelector<HTMLElement>('[data-pane="editor"]')!.classList.toggle('is-hidden', mode === 'preview')
  app.querySelector<HTMLElement>('[data-pane="preview"]')!.classList.toggle('is-hidden', mode === 'source')
  updateModeButtons()
  scheduleRecovery()
}

function applyLayout(layout: WorkspaceLayout): void {
  documentState.layout = layout
  updateLayoutButtons()
  scheduleRecovery()
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
  },
})

restoreSourceEditorSnapshot(editor, { cursorPosition: documentState.cursorPosition, scrollTop: documentState.editorScrollTop })
app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => applyMode(button.dataset.mode as ViewMode)))
app.querySelectorAll<HTMLButtonElement>('[data-layout]').forEach((button) => button.addEventListener('click', () => applyLayout(button.dataset.layout as WorkspaceLayout)))
app.querySelector<HTMLElement>('[data-preview]')!.addEventListener('scroll', () => { documentState.previewScrollTop = app.querySelector<HTMLElement>('[data-preview]')!.scrollTop; scheduleRecovery() })

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
if (recovered) setStatus('Draft restored locally')
void updatePreview()
