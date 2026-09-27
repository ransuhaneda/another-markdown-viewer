import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { readRecovery } from '../src/persistence/recovery'
import { createDocumentState } from '../src/state/document-state'

describe('production editor modes', () => {
  it('starts in Source mode', () => {
    expect(createDocumentState('# Draft').mode).toBe('source')
  })

  it('restores a saved Live Preview draft in Source mode', () => {
    const saved = JSON.stringify({
      markdown: '# Recovered draft',
      mode: 'live-preview',
      layout: 'split',
      cursorPosition: 0,
      editorScrollTop: 0,
      previewScrollTop: 0,
      updatedAt: 1,
    })
    const storage = { getItem: () => saved } as unknown as Storage

    expect(readRecovery(storage)?.mode).toBe('source')
  })

  it('offers only the Source editor mode in the production toolbar', () => {
    const shell = readFileSync(new URL('../src/components/app-shell.ts', import.meta.url), 'utf8')
    const application = readFileSync(new URL('../src/app/markdown-app.ts', import.meta.url), 'utf8')

    expect(shell).toContain('data-mode="source"')
    expect(shell).not.toContain('data-mode="live-preview"')
    expect(application).toContain("state.mode = 'source'")
  })
})
