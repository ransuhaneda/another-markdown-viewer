import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('phase 6 PDF export', () => {
  it('defines a document-only print stylesheet', () => {
    const styles = readFileSync(new URL('../src/styles/print.css', import.meta.url), 'utf8')
    expect(styles).toContain('@media print')
    expect(styles).toContain('.app-header')
    expect(styles).toContain('.pane-preview > .pane-header')
    expect(styles).toContain('.preview-content')
    expect(styles).toContain('break-inside: avoid')
  })

  it('keeps the PDF action on the browser print flow', () => {
    const shell = readFileSync(new URL('../src/components/app-shell.ts', import.meta.url), 'utf8')
    const application = readFileSync(new URL('../src/app/markdown-app.ts', import.meta.url), 'utf8')
    expect(shell).toContain("data-action=\"pdf\"")
    expect(application).toContain('window.print()')
  })
})
