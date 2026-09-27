/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../src/markdown/render-markdown'

describe('phase 7 rendered view', () => {
  it('renders headings and paragraphs as separate document blocks', async () => {
    const html = await renderMarkdown('# Heading\n\nParagraph')
    expect(html).toContain('<h1>Heading</h1>')
    expect(html).toContain('<p>Paragraph</p>')
  })

})
