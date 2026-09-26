import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { DEFAULT_MARKDOWN } from '../src/default-markdown'

const shell = readFileSync(new URL('../src/components/app-shell.ts', import.meta.url), 'utf8')
const application = readFileSync(new URL('../src/app/markdown-app.ts', import.meta.url), 'utf8')
const workspaceStyles = readFileSync(new URL('../src/styles/workspace.css', import.meta.url), 'utf8')
const responsiveStyles = readFileSync(new URL('../src/styles/responsive.css', import.meta.url), 'utf8')

describe('phase 1 application shell', () => {
  it('exposes the product flow and semantic workspace regions', () => {
    expect(shell).toContain('Another Markdown Viewer')
    expect(shell).toContain('aria-label="Markdown editor"')
    expect(shell).toContain('aria-label="Rendered view"')
    expect(shell).toContain('aria-label="Workspace controls"')
  })

  it('supports single-pane layouts and narrow-screen behavior', () => {
    expect(workspaceStyles).toContain("data-layout='editor'")
    expect(workspaceStyles).toContain("data-layout='preview'")
    expect(responsiveStyles).toContain('@media (max-width: 760px)')
  })

  it('uses the product welcome document as the first-load default', () => {
    expect(application).toContain('createDocumentState(DEFAULT_MARKDOWN)')
    expect(application).toContain('createDocumentState(recovered.markdown, recovered)')
    expect(DEFAULT_MARKDOWN).toContain('title: Another Markdown Viewer')
    expect(DEFAULT_MARKDOWN).toContain('# Another Markdown Viewer')
    expect(DEFAULT_MARKDOWN).toContain('```typescript')
    expect(DEFAULT_MARKDOWN).toContain('| :--- | :---: |')
    expect(DEFAULT_MARKDOWN).toContain('> [!NOTE]')
    expect(DEFAULT_MARKDOWN).toContain('\\*This text keeps its asterisks.\\*')
    expect(DEFAULT_MARKDOWN).toContain('![Another Markdown Viewer workspace](/images/another-markdown-viewer-workspace.svg)')
    expect(DEFAULT_MARKDOWN).not.toContain('Lorem ipsum')
  })
})
