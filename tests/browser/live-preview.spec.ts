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
  await expect(page.locator('[data-preview] h1')).toHaveText('Markdown Preview')
})

test('renders the initial document before the first edit', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-preview]')).toContainText('A calm place to inspect and export Markdown.')
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

test('resizes the editor and preview panes by dragging the split handle', async ({ page }) => {
  await page.goto('/')

  const editorPane = page.locator('[data-pane="editor"]')
  const splitHandle = page.getByRole('separator', { name: 'Resize editor and preview panes' })
  const initialEditorBox = await editorPane.boundingBox()
  const handleBox = await splitHandle.boundingBox()

  expect(initialEditorBox).not.toBeNull()
  expect(handleBox).not.toBeNull()
  if (!initialEditorBox || !handleBox) return

  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox.x + 160, handleBox.y + handleBox.height / 2)
  await page.mouse.up()

  const resizedEditorBox = await editorPane.boundingBox()
  expect(resizedEditorBox).not.toBeNull()
  expect(resizedEditorBox!.width).toBeGreaterThan(initialEditorBox.width + 100)
})

test('resizes the split panes from the keyboard', async ({ page }) => {
  await page.goto('/')

  const splitHandle = page.getByRole('separator', { name: 'Resize editor and preview panes' })
  await splitHandle.focus()
  await splitHandle.press('ArrowRight')

  await expect(splitHandle).toHaveAttribute('aria-valuenow', '51')
})
