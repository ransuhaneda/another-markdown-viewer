import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear()
    Object.defineProperty(window, 'showOpenFilePicker', {
      configurable: true,
      value: async () => [],
    })
    Object.defineProperty(window, 'showSaveFilePicker', {
      configurable: true,
      value: async () => ({
        createWritable: async () => new WritableStream<Uint8Array>({
          write: (chunk) => {
            (window as Window & { savedMarkdown?: string }).savedMarkdown = new TextDecoder().decode(chunk)
          },
        }),
      }),
    })
  })
})

test('saves the current Markdown with Ctrl+S', async ({ page }) => {
  await page.goto('/')
  const source = '# Shortcut save test'
  await page.getByRole('textbox').fill(source)
  await page.keyboard.press('Control+S')

  await expect(page.locator('[data-status]')).toHaveText('Markdown saved')
  expect(await page.evaluate(() => (window as Window & { savedMarkdown?: string }).savedMarkdown)).toBe(source)
})
