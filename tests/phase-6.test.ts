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

  it('keeps syntax highlighting in the rendered print content', () => {
    const renderer = readFileSync(new URL('../src/markdown/render-markdown.ts', import.meta.url), 'utf8')
    const preview = readFileSync(new URL('../src/styles/preview.css', import.meta.url), 'utf8')
    const print = readFileSync(new URL('../src/styles/print.css', import.meta.url), 'utf8')
    expect(renderer).toContain('highlight.js/lib/common')
    expect(renderer).toContain('class="hljs')
    expect(preview).toContain('.hljs-keyword')
    expect(print).toContain('.preview-content .hljs-keyword')
  })

  it('styles keyboard keys dark in Preview and light in print output', () => {
    const preview = readFileSync(new URL('../src/styles/preview.css', import.meta.url), 'utf8')
    const print = readFileSync(new URL('../src/styles/print.css', import.meta.url), 'utf8')

    expect(preview).toMatch(/\.preview-content kbd\s*\{[^}]*background:\s*var\(--color-raised\)/u)
    expect(preview).toMatch(/\.preview-content kbd\s*\{[^}]*color:\s*var\(--color-ink\)/u)
    expect(print).toMatch(/\.preview-content kbd\s*\{[^}]*background:\s*#f4f6f7/u)
    expect(print).toMatch(/\.preview-content kbd\s*\{[^}]*color:\s*#111417/u)
  })
})
