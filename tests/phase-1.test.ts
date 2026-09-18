import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { DEFAULT_MARKDOWN } from '../src/default-markdown'

const shell = readFileSync(new URL('../src/components/app-shell.ts', import.meta.url), 'utf8')
const application = readFileSync(new URL('../src/app/markdown-app.ts', import.meta.url), 'utf8')
const workspaceStyles = readFileSync(new URL('../src/styles/workspace.css', import.meta.url), 'utf8')
const responsiveStyles = readFileSync(new URL('../src/styles/responsive.css', import.meta.url), 'utf8')

describe('phase 1 application shell', () => {
  it('exposes the product flow and semantic workspace regions', () => {
    expect(shell).toContain('Markdown Preview')
    expect(shell).toContain('aria-label="Markdown editor"')
    expect(shell).toContain('aria-label="Rendered view"')
    expect(shell).toContain('aria-label="Workspace controls"')
  })

  it('supports single-pane layouts and narrow-screen behavior', () => {
    expect(workspaceStyles).toContain("data-layout='editor'")
    expect(workspaceStyles).toContain("data-layout='preview'")
    expect(responsiveStyles).toContain('@media (max-width: 760px)')
  })

  it('uses the GFM showcase as the first-load document', () => {
    expect(application).toContain('createDocumentState(DEFAULT_MARKDOWN, recovered ?? undefined)')
    expect(DEFAULT_MARKDOWN).toContain('# Common Markdown + GitHub-Flavored Markdown')
    expect(DEFAULT_MARKDOWN).toContain('```javascript')
    expect(DEFAULT_MARKDOWN).toContain('| :--- | :---: | ---: |')
    expect(DEFAULT_MARKDOWN).toContain('> [!NOTE]')
    expect(DEFAULT_MARKDOWN).toContain('\\*Not italic\\*')
  })
})
