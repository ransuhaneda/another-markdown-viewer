import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('phase 8 interface polish', () => {
  it('defines the focused help dialog and keyboard behavior', () => {
    const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
    expect(source).toContain('<dialog class="help-dialog"')
    expect(source).toContain('helpDialog.showModal()')
    expect(source).toContain("event.key === 'Escape'")
    expect(source).toContain('trapHelpFocus')
  })

  it('keeps help styling token-based and reduced-motion safe', () => {
    const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')
    expect(styles).toContain('.help-dialog')
    expect(styles).toContain('prefers-reduced-motion: reduce')
    expect(styles).toContain('var(--color-surface)')
  })
})
