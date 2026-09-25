/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../src/markdown/render-markdown'
import { parseFrontmatter } from '../src/markdown/frontmatter'
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
  })

  it('renders GFM table alignment and preserves nested list structure', () => {
    const html = renderMarkdown('| Left | Center | Right |\n| :--- | :----: | ----: |\n| Text | Text | 100 |\n\n1. First item\n   - Sub-item\n2. Second item')
    expect(html).toContain('<th align="left">Left</th>')
    expect(html).toContain('<th align="center">Center</th>')
    expect(html).toContain('<th align="right">Right</th>')
    expect(html).toMatch(/<ol(?:\s[^>]*)?>[\s\S]*<li>First item<ul>[\s\S]*<\/ul>[\s\S]*<\/li>[\s\S]*<\/ol>/u)
  })

  it('parses YAML frontmatter and keeps its body and original source offset', () => {
    const source = '---\ntitle: Welcome\ntags: [markdown, notes]\n---\n\n# Content'
    expect(parseFrontmatter(source)).toEqual({
      metadata: { title: 'Welcome', tags: ['markdown', 'notes'] },
      markdown: '\n# Content',
      sourceOffset: source.indexOf('\n\n# Content') + 1,
    })
  })

  it('renders frontmatter metadata without changing the rendered Markdown body', () => {
    const source = '---\ntitle: Welcome\ntags:\n  - markdown\n  - notes\n---\n# Content'
    const html = renderMarkdown(source)
    expect(html).toContain('<table class="markdown-frontmatter"')
    expect(html).toContain('<th scope="row">title</th><td>Welcome</td>')
    expect(html).toContain('<span class="markdown-frontmatter-tag">markdown</span> <span class="markdown-frontmatter-tag">notes</span>')
    expect(html).toContain('>Content</h1>')
    expect(html).toContain(`data-source-start="${source.indexOf('# Content')}"`)
    expect(html).not.toContain('---')
  })

  it('renders nested frontmatter mappings as wrapped block YAML', () => {
    const html = renderMarkdown('---\ncolors:\n  primary: "#8CB4FF"\n  surface:\n    raised: "#20262C"\n---\nBody')

    expect(html).toContain('<pre class="markdown-frontmatter-block"><code>primary: "#8CB4FF"\nsurface:\n  raised: "#20262C"</code></pre>')
    expect(html).not.toContain('{"primary"')
  })

  it('escapes frontmatter values and leaves invalid or unterminated frontmatter visible', () => {
    const html = renderMarkdown('---\ntitle: "<img src=x onerror=alert(1)>"\n---\nBody')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).not.toContain('<img src=x')
    expect(renderMarkdown('---\ntitle: [broken\n---\nBody')).toContain('title: [broken')
    expect(renderMarkdown('---\ntitle: Open\nBody')).toContain('title: Open')
  })

  it('does not treat a later horizontal rule as frontmatter', () => {
    expect(parseFrontmatter('# Heading\n\n---\n')).toBeNull()
    expect(parseFrontmatter('---\nnot: [valid\n---\n')).toBeNull()
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

  it('migrates the removed rendered-preview mode without losing the draft', () => {
    const state = createDocumentState('# Draft', { updatedAt: 1 })
    const storage = fakeStorageForState()
    storage.setItem('markdown-preview:recovery', JSON.stringify({ ...state, mode: 'preview' }))

    expect(readRecovery(storage)).toEqual({ ...state, mode: 'live-preview' })
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

  it('preserves safe HTML structure while removing executable content', async () => {
    const html = await renderMarkdown('<section data-note="kept"><mark>Readable</mark><style>bad</style><img src="javascript:alert(1)" onerror="alert(1)"></section>')
    expect(html).toContain('<section')
    expect(html).toContain('<mark>Readable</mark>')
    expect(html).not.toContain('<style>')
    expect(html).not.toContain('onerror')
    expect(html).toContain('src=""')
  })

  it('keeps safe URLs and rejects unsafe schemes', () => {
    expect(sanitizeUrl('https://example.com/docs')).toBe('https://example.com/docs')
    expect(sanitizeUrl('/local/path')).toBe('/local/path')
    expect(sanitizeUrl('relative/path')).toBe('relative/path')
    expect(sanitizeUrl('#section')).toBe('#section')
    expect(sanitizeUrl('mailto:hello@example.com')).toBe('mailto:hello@example.com')
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull()
    expect(sanitizeUrl('java\u0000script:alert(1)')).toBeNull()
    expect(sanitizeUrl('data:text/html,alert(1)')).toBeNull()
  })

  it('converts common rich text HTML to Markdown', () => {
    expect(convertPastedContent('', '<h2>Title</h2><p><strong>Bold</strong> text</p>')).toBe('## Title\n\n**Bold** text')
    expect(convertPastedContent('', '<ol><li>One</li><li><em>Two</em></li></ol><pre><code>const x = 1</code></pre>')).toBe('1. One\n2. *Two*\n\n```\nconst x = 1\n```')
    expect(convertPastedContent('**already Markdown**', '<strong>ignored</strong>')).toBe('**already Markdown**')
  })

  it('maps repeated Markdown blocks in source order', () => {
    const source = 'Same\n\nSame'
    const html = renderMarkdown(source)
    expect(html).toContain('data-source-start="0" data-source-end="4"')
    expect(html).toContain('data-source-start="6" data-source-end="10"')
  })

  it('keeps source ranges aligned after nested block content', () => {
    const source = '## Blockquote\n\n> This is a blockquote.\n\n## Mixed List\n\n1. First item\n- Sub-item\n\n## Task List — GFM\n\n- [x] Completed'
    const html = renderMarkdown(source)
    const ranges = [...html.matchAll(/data-source-start="(\d+)" data-source-end="(\d+)"/gu)]
      .map((match) => [Number(match[1]), Number(match[2])] as const)

    expect(ranges).toEqual([
      [0, 13],
      [15, 38],
      [40, 53],
      [55, 68],
      [69, 79],
      [81, 99],
      [101, 116],
    ])
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
