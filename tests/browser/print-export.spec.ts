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
      metadataBlockPadding: getComputedStyle(metadataBlock).padding,
      metadataBlockBorderWidth: getComputedStyle(metadataBlock).borderWidth,
      metadataBlockBackground: getComputedStyle(metadataBlock).backgroundColor,
      metadataCodeBackground: getComputedStyle(metadataBlock.querySelector('code')!).backgroundColor,
      codeBlockBackground: getComputedStyle(codeBlock).backgroundColor,
      codeBackground: getComputedStyle(codeBlock.querySelector('code')!).backgroundColor,
      metadataCodeColor: getComputedStyle(metadataBlock.querySelector('code')!).color,
      tagRadius: getComputedStyle(tags).borderRadius,
      tagBackground: getComputedStyle(tags).backgroundColor,
      tagColor: getComputedStyle(tags).color,
      tagBorderColor: getComputedStyle(tags).borderColor,
    }
  })

  expect(inlineCode.color).toBe('rgb(140, 180, 255)')
  expect(inlineCode.background).toBe('rgb(32, 38, 44)')
  expect(inlineCode.fontFamily).toContain('ui-monospace')
  expect(mappingBlock.padding).toBe('0px')
  expect(mappingBlock.borderWidth).toBe('0px')
  expect(result.copyButtonDisplay).toBe('none')
  expect(result.codeWhiteSpace).toBe('pre-wrap')
  expect(result.metadataTableOverflow).toBe(false)
  expect(result.metadataBlockWhiteSpace).toBe('pre-wrap')
  expect(result.metadataBlockOverflow).toBe(false)
  expect(result.metadataBlockPadding).toBe('0px')
  expect(result.metadataBlockBorderWidth).toBe('0px')
  expect(result.metadataBlockBackground).toBe('rgba(0, 0, 0, 0)')
  expect(result.metadataCodeBackground).toBe('rgba(0, 0, 0, 0)')
  expect(result.codeBlockBackground).toBe('rgb(244, 246, 247)')
  expect(result.codeBackground).toBe('rgba(0, 0, 0, 0)')
  expect(result.metadataCodeColor).toBe('rgb(38, 50, 56)')
  expect(result.tagRadius).toBe('999px')
  expect(result.tagBackground).toBe('rgba(0, 0, 0, 0)')
  expect(result.tagColor).toBe('rgb(17, 20, 23)')
  expect(result.tagBorderColor).toBe('rgb(140, 180, 255)')
})

test('print stylesheet uses light-mode GFM alert colors', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('textbox').fill('> [!NOTE]\n> Useful information.')
  const alert = page.locator('.markdown-alert')
  await page.emulateMedia({ media: 'print' })

  await expect(alert).toHaveCSS('border-inline-start-color', 'rgb(9, 105, 218)')
  await expect(alert).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(alert.locator('.markdown-alert-title')).toHaveCSS('color', 'rgb(9, 105, 218)')
  await expect(alert.locator('.markdown-alert-icon')).toHaveAttribute('viewBox', '0 0 24 24')
})
