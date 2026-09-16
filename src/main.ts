import './styles/tokens.css'
import './style.css'
import { createSourceEditor } from './editor/source-editor'
import { renderMarkdown, prepareRenderedLinks } from './markdown/render-markdown'
import { clearRecovery, readRecovery, writeRecovery, type RecoveryState } from './persistence/recovery'

const welcomeMarkdown = `# Markdown Preview

A calm place to inspect and export Markdown.

- Paste Markdown into the source pane.
- Keep the raw document as your source of truth.
- Use Live Preview to inspect the rendered result.

> Phase 2 adds a real source editor, GFM preview, and local draft recovery.
`

type ViewMode = RecoveryState['mode']
const recovered = readRecovery()
let mode: ViewMode = recovered?.mode ?? 'live-preview'
let markdownSource = recovered?.markdown ?? welcomeMarkdown
let recoveryTimer: number | undefined

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div class="app-shell">
    <header class="app-header"><div class="brand-lockup"><span class="brand-mark" aria-hidden="true">M</span><div><p class="eyebrow">Writing surface</p><h1>Markdown Preview</h1></div></div><nav class="header-actions" aria-label="Document actions"><button class="button button-secondary" data-action="new" type="button">New document</button><button class="button button-secondary" data-action="open" type="button">Open file</button><button class="button button-primary" data-action="pdf" type="button">Download PDF</button></nav></header>
    <main class="workspace" aria-label="Markdown workspace"><section class="workspace-toolbar" aria-label="Editor controls"><div class="segmented-control" role="group" aria-label="View mode"><button class="segment" data-mode="live-preview" type="button">Live Preview</button><button class="segment" data-mode="source" type="button">Source</button><button class="segment" data-mode="preview" type="button">Preview</button></div><div class="toolbar-meta"><span class="status-dot" aria-hidden="true"></span><span data-status>Draft ready</span><span class="toolbar-divider" aria-hidden="true"></span><span data-count>0 words</span></div></section>
      <section class="document-region" aria-label="Document panes"><article class="pane pane-editor" data-pane="editor" aria-label="Source editor"><div class="pane-header"><span class="pane-label">Source</span><span class="pane-hint">Markdown</span></div><div class="editor-container" data-editor></div></article><div class="split-handle" aria-hidden="true"><span></span></div><article class="pane pane-preview" data-pane="preview" aria-label="Rendered preview"><div class="pane-header"><span class="pane-label">Live Preview</span><span class="pane-hint">Rendered document</span></div><div class="preview-content" data-preview></div></article></section></main>
    <footer class="app-footer"><span>Local recovery protects your latest draft.</span><button class="text-button" data-action="clear" type="button">Clear draft</button></footer>
  </div>`

const editor = createSourceEditor({ parent: app.querySelector<HTMLElement>('[data-editor]')!, initialValue: markdownSource, onChange: (value) => { markdownSource = value; updateCount(); scheduleRecovery(); void updatePreview() } })
function updateCount(): void { const words = markdownSource.trim() ? markdownSource.trim().split(/\s+/u).length : 0; app.querySelector('[data-count]')!.textContent = `${words} ${words === 1 ? 'word' : 'words'}` }
async function updatePreview(): Promise<void> { const preview = app.querySelector<HTMLElement>('[data-preview]')!; preview.innerHTML = await renderMarkdown(markdownSource); prepareRenderedLinks(preview) }
function updateMode(): void { app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => { const active = button.dataset.mode === mode; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)) }); app.querySelector<HTMLElement>('[data-pane="editor"]')!.classList.toggle('is-hidden', mode === 'preview'); app.querySelector<HTMLElement>('[data-pane="preview"]')!.classList.toggle('is-hidden', mode === 'source'); scheduleRecovery() }
function scheduleRecovery(): void { window.clearTimeout(recoveryTimer); recoveryTimer = window.setTimeout(() => { const saved = writeRecovery({ markdown: markdownSource, mode, updatedAt: Date.now() }); app.querySelector('[data-status]')!.textContent = saved ? 'Draft recovered locally' : 'Recovery unavailable' }, 500) }
app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => { mode = button.dataset.mode as ViewMode; updateMode() }))
function clearDraft(): void { editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: '' } }); clearRecovery(); app.querySelector('[data-status]')!.textContent = 'Blank draft' }
app.querySelector<HTMLButtonElement>('[data-action="new"]')!.addEventListener('click', clearDraft)
app.querySelector<HTMLButtonElement>('[data-action="clear"]')!.addEventListener('click', clearDraft)
app.querySelector<HTMLButtonElement>('[data-action="open"]')!.addEventListener('click', () => { app.querySelector('[data-status]')!.textContent = 'File opening arrives in Phase 5' })
app.querySelector<HTMLButtonElement>('[data-action="pdf"]')!.addEventListener('click', () => window.print())
updateCount(); updateMode(); void updatePreview()
