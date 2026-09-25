import { expect, test } from '@playwright/test'

test('print layout wraps metadata and code without copy controls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.goto('/')
  const source = [
    '---',
    `description: ${'very-long-unbroken-description-'.repeat(20)}`,
    'tags: [markdown, live-preview, gfm]',
    'design:',
    '  colors:',
    '    primary: "#8CB4FF"',
    '    surface: "#20262C"',
    '---',
    '',
    '```typescript',
    `const longLine = '${'long-code-value-'.repeat(14)}'`,
    '```',
  ].join('\n')
  await page.getByRole('textbox').fill(source)
  await expect(page.locator('.markdown-frontmatter-block')).toBeVisible()

  await page.emulateMedia({ media: 'print' })

  const result = await page.locator('.preview-content').evaluate((preview) => {
    const codeBlock = preview.querySelector<HTMLElement>('.markdown-code-block')!
    const metadataTable = preview.querySelector<HTMLElement>('.markdown-frontmatter')!
    const metadataBlock = preview.querySelector<HTMLElement>('.markdown-frontmatter-block')!
    const tags = preview.querySelector<HTMLElement>('.markdown-frontmatter-tag')!
    return {
      copyButtonDisplay: getComputedStyle(codeBlock.querySelector('.markdown-code-copy')!).display,
      codeWhiteSpace: getComputedStyle(codeBlock.querySelector('code')!).whiteSpace,
      metadataTableOverflow: metadataTable.scrollWidth > metadataTable.clientWidth,
      metadataBlockWhiteSpace: getComputedStyle(metadataBlock).whiteSpace,
      metadataBlockOverflow: metadataBlock.scrollWidth > metadataBlock.clientWidth,
      codeBlockBackground: getComputedStyle(codeBlock).backgroundColor,
      codeBackground: getComputedStyle(codeBlock.querySelector('code')!).backgroundColor,
      metadataCodeColor: getComputedStyle(metadataBlock.querySelector('code')!).color,
      tagRadius: getComputedStyle(tags).borderRadius,
      tagBackground: getComputedStyle(tags).backgroundColor,
    }
  })

  expect(result.copyButtonDisplay).toBe('none')
  expect(result.codeWhiteSpace).toBe('pre-wrap')
  expect(result.metadataTableOverflow).toBe(false)
  expect(result.metadataBlockWhiteSpace).toBe('pre-wrap')
  expect(result.metadataBlockOverflow).toBe(false)
  expect(result.codeBlockBackground).toBe('rgb(244, 246, 247)')
  expect(result.codeBackground).toBe('rgba(0, 0, 0, 0)')
  expect(result.metadataCodeColor).toBe('rgb(38, 50, 56)')
  expect(result.tagRadius).toBe('999px')
  expect(result.tagBackground).toBe('rgb(36, 53, 79)')
})
