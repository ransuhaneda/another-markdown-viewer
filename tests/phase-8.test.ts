import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('phase 8 interface polish', () => {
  it('defines the focused help dialog and keyboard behavior', () => {
    const shell = readFileSync(new URL('../src/components/app-shell.ts', import.meta.url), 'utf8')
    const helpDialog = readFileSync(new URL('../src/components/help-dialog.ts', import.meta.url), 'utf8')
    expect(shell).toContain('<dialog class="help-dialog"')
    expect(helpDialog).toContain('dialog.showModal()')
    expect(helpDialog).toContain("event.key === 'Escape'")
    expect(helpDialog).toContain('trapFocus')
  })

  it('keeps help styling token-based and reduced-motion safe', () => {
    const helpStyles = readFileSync(new URL('../src/styles/help.css', import.meta.url), 'utf8')
    const responsiveStyles = readFileSync(new URL('../src/styles/responsive.css', import.meta.url), 'utf8')
    expect(helpStyles).toContain('.help-dialog')
    expect(responsiveStyles).toContain('prefers-reduced-motion: reduce')
    expect(helpStyles).toContain('var(--color-surface)')
  })
})
