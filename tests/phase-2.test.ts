import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../src/markdown/render-markdown'
import { clearRecovery, readRecovery, writeRecovery } from '../src/persistence/recovery'
import { clampCursorPosition, createDocumentState } from '../src/state/document-state'
import { sanitizeUrl } from '../src/markdown/url-policy'
import { convertPastedContent } from '../src/markdown/paste-markdown'

describe('phase 2 markdown flow', () => {
  it('renders GFM content and removes unsafe HTML', async () => {
    const html = await renderMarkdown('# Title\n\n- **bold**\n\n<script>alert(1)</script>')
    expect(html).toContain('>Title</h1>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('data-source-start')
    expect(html).not.toContain('data-source-end')
  })

  it('round-trips the latest recovery draft', () => {
    const storage = new Map<string, string>()
    const fakeStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value) },
      removeItem: (key: string) => { storage.delete(key) },
    } as Storage
    const state = createDocumentState('# Draft', { updatedAt: 1 })
    expect(writeRecovery(state, fakeStorage)).toBe(true)
    expect(readRecovery(fakeStorage)).toEqual(state)
    clearRecovery(fakeStorage)
    expect(readRecovery(fakeStorage)).toBeNull()
  })

  it('rejects malformed recovery data', () => {
    const fakeStorage = {
      getItem: () => JSON.stringify({ markdown: 42, mode: 'live-preview', updatedAt: 'now' }),
    } as unknown as Storage
    expect(readRecovery(fakeStorage)).toBeNull()
  })

  it('persists document layout and view positions', () => {
    const state = createDocumentState('# Draft', {
      layout: 'preview',
      cursorPosition: 4,
      editorScrollTop: 12,
      previewScrollTop: 24,
    })
    const storage = fakeStorageForState()
    expect(writeRecovery(state, storage)).toBe(true)
    expect(readRecovery(storage)).toEqual(state)
  })

  it('clamps cursor positions to the document bounds', () => {
    expect(clampCursorPosition(-4, 10)).toBe(0)
    expect(clampCursorPosition(20, 10)).toBe(10)
    expect(clampCursorPosition(4.8, 10)).toBe(4)
  })

  it('keeps safe URLs and rejects unsafe schemes', () => {
    expect(sanitizeUrl('https://example.com/docs')).toBe('https://example.com/docs')
    expect(sanitizeUrl('/local/path')).toBe('/local/path')
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull()
    expect(sanitizeUrl('data:text/html,alert(1)')).toBeNull()
  })

  it('converts common rich text HTML to Markdown', () => {
    expect(convertPastedContent('', '<h2>Title</h2><p><strong>Bold</strong> text</p>')).toBe('## Title\n\n**Bold** text')
    expect(convertPastedContent('**already Markdown**', '<strong>ignored</strong>')).toBe('**already Markdown**')
  })
})

function fakeStorageForState(): Storage {
  const storage = new Map<string, string>()
  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
    removeItem: (key: string) => { storage.delete(key) },
  } as unknown as Storage
}
