import { describe, expect, it } from 'vitest'
import { findActiveBlock, isCursorInBlock } from '../src/markdown/live-preview'
import { renderMarkdown } from '../src/markdown/render-markdown'

describe('phase 7 live preview', () => {
  it('finds the active Markdown block from the cursor', () => {
    const source = '# Heading\n\nA paragraph with **emphasis**.'
    const block = findActiveBlock(source, source.indexOf('emphasis'))
    expect(block.type).toBe('emphasis')
    expect(isCursorInBlock(block, source.indexOf('emphasis'))).toBe(true)
  })

  it('adds source ranges to rendered blocks for focus mapping', async () => {
    const html = await renderMarkdown('# Heading\n\nParagraph')
    expect(html).toContain('data-source-start="0"')
    expect(html).toContain('data-source-end="9"')
  })

})
