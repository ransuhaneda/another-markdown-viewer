import { describe, expect, it } from 'vitest'
import { createDocumentState } from '../src/state/document-state'

describe('phase 5 file handling', () => {
  it('keeps imported Markdown as the canonical document source', () => {
    const imported = '# Imported\n\nPreserve  spacing.'
    const state = createDocumentState(imported, { layout: 'split' })
    expect(state.markdown).toBe(imported)
  })

  it('keeps file operations separate from recovery state', () => {
    const state = createDocumentState('# Draft')
    expect(state.markdown).toBe('# Draft')
    expect(Object.keys(state)).toContain('markdown')
  })
})
