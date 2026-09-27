export function renderAppShell(): string {
  return `
    <div class="app-shell">
      <header class="app-header">
        <div class="brand-lockup"><span class="brand-mark" aria-hidden="true">A</span><h1>Another Markdown Viewer</h1></div>
        ${renderWorkspaceToolbar()}
        <nav class="header-toolbar" aria-label="Document actions">
          <button class="icon-button" data-action="new" type="button" aria-label="New document" title="New document"><i data-lucide="file-plus"></i></button>
          <button class="icon-button" data-action="open" type="button" aria-label="Open file" title="Open file"><i data-lucide="folder-open"></i></button>
          <button class="icon-button" data-action="save" type="button" aria-label="Save Markdown" title="Save Markdown (Ctrl/Cmd+S)"><i data-lucide="save"></i></button>
          <span class="action-divider" aria-hidden="true"></span>
          <button class="icon-button icon-button--primary" data-action="pdf" type="button" aria-label="Download PDF" title="Download PDF"><i data-lucide="file-down"></i></button>
          <button class="icon-button" data-action="focus-mode" type="button" aria-label="Enter Focus mode" aria-pressed="false" title="Enter Focus mode (Ctrl/Cmd+Shift+F)"><i data-lucide="maximize-2"></i></button>
        </nav>
      </header>
      <main class="workspace" aria-label="Markdown workspace">
        ${renderDocumentRegion()}
      </main>
      ${renderFooter()}
      ${renderHelpDialog()}
      <button class="icon-button focus-mode-unfocus" data-action="focus-mode-unfocus" type="button" aria-label="Exit Focus mode" aria-pressed="true" title="Exit Focus mode"><i data-lucide="minimize-2"></i></button>
    </div>`
}

function renderWorkspaceToolbar(): string {
  return `
    <section class="workspace-toolbar" aria-label="Workspace controls">
      <div class="toolbar-groups">
        <div class="segmented-control" role="group" aria-label="Editor history">
          <button class="segment" data-action="undo" type="button" aria-label="Undo" title="Undo (Ctrl/Cmd+Z)" disabled><i data-lucide="undo-2"></i></button>
          <button class="segment" data-action="redo" type="button" aria-label="Redo" title="Redo (Ctrl/Cmd+Shift+Z)" disabled><i data-lucide="redo-2"></i></button>
        </div>
        <div class="segmented-control layout-control" role="group" aria-label="Pane layout">
          <button class="segment" data-layout="editor" type="button" aria-label="Editor only" title="Editor only"><i data-lucide="panel-left"></i></button>
          <button class="segment" data-layout="split" type="button" aria-label="Split view" title="Split view"><i data-lucide="columns-2"></i></button>
          <button class="segment" data-layout="preview" type="button" aria-label="Rendered view only" title="Rendered view only"><i data-lucide="panel-right"></i></button>
        </div>
        <span class="action-divider" aria-hidden="true"></span>
        <div class="segmented-control sync-scroll-control" role="group" aria-label="Scroll behavior">
          <button class="toggle-control" data-action="sync-scroll" type="button" aria-label="Toggle synchronized scrolling" aria-pressed="true" title="Toggle synchronized scrolling"><i data-lucide="arrow-down-up"></i></button>
        </div>
      </div>
    </section>`
}

function renderDocumentRegion(): string {
  return `
    <section class="document-region" data-layout="split" aria-label="Document panes">
      <article class="pane pane-editor" data-pane="editor" aria-label="Markdown editor">
        <div class="pane-header"><span class="pane-label" data-editor-label>Source</span></div>
        <div class="editor-container" data-editor></div>
      </article>
      <div class="split-handle" role="separator" aria-label="Resize editor and rendered view panes" aria-orientation="vertical" aria-valuemin="20" aria-valuemax="80" aria-valuenow="50" tabindex="0"><span aria-hidden="true"></span></div>
      <article class="pane pane-preview" data-pane="preview" aria-label="Rendered view">
        <div class="pane-header"><span class="pane-label">Rendered View</span></div>
        <div class="preview-content" data-preview tabindex="-1"></div>
      </article>
    </section>`
}

function renderFooter(): string {
  return `
    <footer class="app-footer">
      <div class="toolbar-meta"><span class="status-dot" aria-hidden="true"></span><span data-status>Draft ready</span><span class="toolbar-divider" aria-hidden="true"></span><span data-count>0 words · 0 characters</span><span class="recovery-warning" data-recovery-warning hidden role="status">Local recovery unavailable</span></div>
      <div class="footer-actions">
        <button class="icon-button icon-button--quiet" data-action="help" type="button" aria-label="Markdown help" title="Markdown help" aria-haspopup="dialog" aria-controls="help-dialog"><i data-lucide="circle-help"></i></button>
        <button class="icon-button icon-button--quiet" data-action="clear" type="button" aria-label="Clear draft" title="Clear draft"><i data-lucide="trash"></i></button>
      </div>
    </footer>`
}

function renderHelpDialog(): string {
  return `
    <dialog class="help-dialog" id="help-dialog" aria-labelledby="help-title">
      <form method="dialog" class="help-dialog__surface">
        <button class="help-dialog__close icon-button icon-button--quiet" value="cancel" aria-label="Close help" title="Close help (Escape)"><i data-lucide="x"></i></button>
        <h2 id="help-title">Markdown help</h2>
        <section><h3>Syntax reference</h3><dl><dt><code># Heading</code></dt><dd>Creates a heading.</dd><dt><code>**bold**</code></dt><dd>Creates bold text.</dd><dt><code>[label](url)</code></dt><dd>Creates a link.</dd><dt><code>- item</code></dt><dd>Creates a list.</dd><dt><code>&#96;&#96;&#96;code &#96;&#96;&#96;</code></dt><dd>Creates a code block.</dd></dl></section>
        <section><h3>Keyboard shortcuts</h3><dl><dt><kbd>Ctrl/Cmd+B</kbd></dt><dd>Toggle bold on the selection.</dd><dt><kbd>Ctrl/Cmd+I</kbd></dt><dd>Toggle italic on the selection.</dd><dt><kbd>Alt+Shift+S</kbd></dt><dd>Toggle strikethrough on the selection.</dd><dt><kbd>Ctrl/Cmd+K</kbd></dt><dd>Insert a link around the selection.</dd><dt><kbd>Ctrl+Shift+K</kbd> / <kbd>Cmd+Option+C</kbd></dt><dd>Wrap the selection in a code block.</dd><dt><kbd>Ctrl/Cmd+S</kbd></dt><dd>Saves the Markdown file.</dd><dt><kbd>Ctrl/Cmd+Shift+F</kbd></dt><dd>Enters Focus mode.</dd><dt><kbd>Escape</kbd></dt><dd>Closes this dialog or exits Focus mode.</dd><dt><kbd>Ctrl/Cmd+Z</kbd></dt><dd>Undo.</dd><dt><kbd>Ctrl/Cmd+Shift+Z</kbd></dt><dd>Redo.</dd></dl></section>
      </form>
    </dialog>`
}