import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../src/markdown/render-markdown'
import { clearRecovery, readRecovery, writeRecovery } from '../src/persistence/recovery'

describe('phase 2 markdown flow', () => {
  it('renders GFM content and removes unsafe HTML', async () => {
    const html = await renderMarkdown('# Title\n\n- **bold**\n\n<script>alert(1)</script>')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).not.toContain('<script>')
  })

  it('round-trips the latest recovery draft', () => {
    const storage = new Map<string, string>()
    const fakeStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value) },
      removeItem: (key: string) => { storage.delete(key) },
    } as Storage
    const state = { markdown: '# Draft', mode: 'live-preview' as const, updatedAt: 1 }
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
})
