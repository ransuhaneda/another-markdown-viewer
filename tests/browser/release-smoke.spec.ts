import { expect, test } from '@playwright/test'

test('production release exposes Source and keeps rendered Preview current', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
  await page.goto('/')
  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
  await expect(page.locator('[data-mode]')).toHaveCount(0)
  await expect(page.locator('.workspace-toolbar')).not.toContainText('Source Markdown')

  const editor = page.getByRole('textbox')
  await editor.fill('# Release check\n\nRendered **bold** text.')
  await expect(page.locator('[data-preview] h1')).toHaveText('Release check')
  await expect(page.locator('[data-preview] strong')).toHaveText('bold')
})

test('old Live Preview recovery data opens in Source mode', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('markdown-preview:recovery', JSON.stringify({
      markdown: '# Recovered release draft',
      fileName: 'recovered.md',
      mode: 'live-preview',
      layout: 'split',
      syncScroll: false,
      cursorPosition: 0,
      editorScrollTop: 0,
      previewScrollTop: 0,
      updatedAt: Date.now(),
    }))
  })
  await page.goto('/')
  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
  await expect(page.locator('[data-mode="live-preview"]')).toHaveCount(0)
  await expect(page.locator('[data-preview] h1')).toHaveText('Recovered release draft')
})
