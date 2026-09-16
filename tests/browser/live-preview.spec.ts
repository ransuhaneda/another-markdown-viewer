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
