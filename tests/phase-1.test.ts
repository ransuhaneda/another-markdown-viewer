import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

describe('phase 1 application shell', () => {
  it('exposes the product flow and semantic workspace regions', () => {
    expect(source).toContain('Markdown Preview')
    expect(source).toContain('aria-label="Source editor"')
    expect(source).toContain('aria-label="Rendered preview"')
    expect(source).toContain('aria-label="Editor controls"')
  })

  it('supports single-pane layouts and narrow-screen behavior', () => {
    expect(styles).toContain("data-layout='editor'")
    expect(styles).toContain("data-layout='preview'")
    expect(styles).toContain('@media (max-width: 760px)')
  })
})
