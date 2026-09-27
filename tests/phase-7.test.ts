/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../src/markdown/render-markdown'

describe('phase 7 rendered view', () => {
  it('adds source ranges to rendered blocks for source navigation', async () => {
    const html = await renderMarkdown('# Heading\n\nParagraph')
    expect(html).toContain('data-source-start="0"')
    expect(html).toContain('data-source-end="9"')
  })

})
