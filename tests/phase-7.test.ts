/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../src/markdown/render-markdown'

describe('phase 7 rendered view', () => {
  it('adds source ranges to rendered blocks for source navigation', async () => {
    const html = await renderMarkdown('# Heading\n\nParagraph')
    expect(html).toContain('<h1 data-source-start="0" data-source-end="9">Heading</h1>')
    expect(html).toContain('<p data-source-start="11" data-source-end="20">Paragraph</p>')
  })

})
