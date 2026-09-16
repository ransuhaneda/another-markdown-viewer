import './styles/tokens.css'
import './style.css'

const welcomeMarkdown = `# Markdown Preview

A calm place to inspect and export Markdown.

- Paste Markdown into the source pane.
- Keep the raw document as your source of truth.
- Use Live Preview to inspect the rendered result.

> Phase 1 establishes the product shell. Editing, recovery, rendering, and export follow in later phases.
`

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-shell">
    <header class="app-header">
      <div class="brand-lockup">
        <span class="brand-mark" aria-hidden="true">M</span>
        <div>
          <p class="eyebrow">Writing surface</p>
          <h1>Markdown Preview</h1>
        </div>
      </div>
      <nav class="header-actions" aria-label="Document actions">
        <button class="button button-secondary" type="button">New document</button>
        <button class="button button-secondary" type="button">Open file</button>
        <button class="button button-primary" type="button">Download PDF</button>
      </nav>
    </header>

    <main class="workspace" aria-label="Markdown workspace">
      <section class="workspace-toolbar" aria-label="Workspace controls">
        <div class="toolbar-groups">
        <div class="segmented-control" role="group" aria-label="View mode">
          <button class="segment is-active" type="button" aria-pressed="true" data-mode="live-preview">Live Preview</button>
          <button class="segment" type="button" aria-pressed="false" data-mode="source">Source</button>
          <button class="segment" type="button" aria-pressed="false" data-mode="preview">Preview</button>
        </div>
        <div class="segmented-control layout-control" role="group" aria-label="Pane layout">
          <button class="segment" type="button" aria-pressed="false" data-layout="editor">Editor</button>
          <button class="segment is-active" type="button" aria-pressed="true" data-layout="split">Split</button>
          <button class="segment" type="button" aria-pressed="false" data-layout="preview">Preview</button>
        </div>
        </div>
        <div class="toolbar-meta">
          <span class="status-dot" aria-hidden="true"></span>
          <span>Draft ready</span>
          <span class="toolbar-divider" aria-hidden="true"></span>
          <span>0 words</span>
        </div>
      </section>

      <section class="document-region" aria-label="Document panes">
        <article class="pane pane-editor" aria-label="Source editor">
          <div class="pane-header">
            <span class="pane-label">Source</span>
            <span class="pane-hint">Markdown</span>
          </div>
          <div class="editor-placeholder" role="textbox" aria-label="Markdown source editor" tabindex="0">
            <pre>${welcomeMarkdown}</pre>
            <span class="cursor-line" aria-hidden="true"></span>
          </div>
        </article>
        <div class="split-handle" aria-hidden="true"><span></span></div>
        <article class="pane pane-preview" aria-label="Rendered preview">
          <div class="pane-header">
            <span class="pane-label">Live Preview</span>
            <span class="pane-hint">Rendered document</span>
          </div>
          <div class="preview-placeholder">
            <p class="preview-kicker">Preview canvas</p>
            <h2>Your document will appear here.</h2>
            <p>Paste Markdown into the source pane to inspect a polished, readable rendering. The preview will stay close to your source without changing it.</p>
          </div>
        </article>
      </section>
    </main>

    <footer class="app-footer">
      <span>Local recovery will protect your latest draft.</span>
      <button class="text-button" type="button">Keyboard shortcuts</button>
    </footer>
  </div>
`

const workspace = document.querySelector<HTMLElement>('.document-region')!
const modeButtons = document.querySelectorAll<HTMLButtonElement>('[data-mode]')
const layoutButtons = document.querySelectorAll<HTMLButtonElement>('[data-layout]')

function setPressed(buttons: NodeListOf<HTMLButtonElement>, active: HTMLButtonElement) {
  buttons.forEach((button) => {
    const isActive = button === active
    button.classList.toggle('is-active', isActive)
    button.setAttribute('aria-pressed', String(isActive))
  })
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => setPressed(modeButtons, button))
})

layoutButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setPressed(layoutButtons, button)
    workspace.dataset.layout = button.dataset.layout
  })
})
