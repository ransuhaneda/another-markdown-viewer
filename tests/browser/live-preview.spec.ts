import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
})

test('opens with an editable CodeMirror Live Preview editor', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByRole('textbox')
  await expect(editor).toBeVisible()
  await expect(editor).toBeEditable()
  await expect(page.locator('[data-editor-label]')).toHaveText('Live Preview')
})

test('uses accessible standard-size icons and a visible caret', async ({ page }) => {
  await page.goto('/')

  const download = page.getByRole('button', { name: 'Download PDF' })
  await expect(download).toBeVisible()
  await expect(download.locator('svg')).toHaveAttribute('width', '16')
  await expect(download.locator('svg')).toHaveAttribute('height', '16')
  await expect(download).toHaveCSS('width', '40px')
  await expect(download).toHaveCSS('height', '40px')

  const editor = page.getByRole('textbox')
  await editor.click()
  await expect(editor).toHaveCSS('caret-color', 'rgb(255, 255, 255)')
  await expect(editor).toBeFocused()
})

test('prints only the rendered document content', async ({ page }) => {
  await page.goto('/')
  await page.emulateMedia({ media: 'print' })

  await expect(page.locator('.preview-content')).toBeVisible()
  await expect(page.locator('.pane-preview > .pane-header')).toBeHidden()
})
