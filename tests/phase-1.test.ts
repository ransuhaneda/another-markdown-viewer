import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { DEFAULT_MARKDOWN } from '../src/default-markdown'

const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

describe('phase 1 application shell', () => {
  it('exposes the product flow and semantic workspace regions', () => {
    expect(source).toContain('Markdown Preview')
    expect(source).toContain('aria-label="Source editor"')
    expect(source).toContain('aria-label="Rendered preview"')
    expect(source).toContain('aria-label="Workspace controls"')
  })

  it('supports single-pane layouts and narrow-screen behavior', () => {
    expect(styles).toContain("data-layout='editor'")
    expect(styles).toContain("data-layout='preview'")
    expect(styles).toContain('@media (max-width: 760px)')
  })

  it('uses the GFM showcase as the first-load document', () => {
    expect(source).toContain('createDocumentState(DEFAULT_MARKDOWN, recovered ?? undefined)')
    expect(DEFAULT_MARKDOWN).toContain('# Common Markdown + GitHub-Flavored Markdown')
    expect(DEFAULT_MARKDOWN).toContain('```javascript')
    expect(DEFAULT_MARKDOWN).toContain('| :--- | :---: | ---: |')
    expect(DEFAULT_MARKDOWN).toContain('> [!NOTE]')
    expect(DEFAULT_MARKDOWN).toContain('\\*Not italic\\*')
  })
})
