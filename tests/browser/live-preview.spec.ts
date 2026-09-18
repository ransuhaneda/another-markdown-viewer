import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear()
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value): void {
      if (key !== 'markdown-preview:recovery') originalSetItem.call(this, key, value)
    }
  })
})

test('opens with an editable CodeMirror Live Preview editor', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByRole('textbox')
  await expect(editor).toBeVisible()
  await expect(editor).toBeEditable()
  await page.getByRole('button', { name: 'Live', exact: true }).click()
  await expect(page.locator('[data-editor-label]')).toHaveText('Live')
  await expect(page.locator('[data-preview] h1').first()).toHaveText('Common Markdown + GitHub-Flavored Markdown')
})

test('styles formatted Live content while preserving syntax access', async ({ page }) => {
  await page.goto('/')

  const editor = page.getByRole('textbox')
  await page.getByRole('button', { name: 'Live', exact: true }).click()
  await editor.fill('# Heading\n\nA **bold** line\n\nA *italic* line\n\nUse `npm` here\n\n[Link](https://example.com)\n\n## Second heading')

  await expect(page.locator('.cm-header-1')).toHaveCSS('font-size', '36px')
  await expect(page.locator('.cm-header-1')).toHaveCSS('line-height', '41.4px')
  await expect(page.locator('.cm-header-1')).toHaveCSS('font-weight', '650')
  await expect(page.locator('.preview-content h1').first()).toHaveCSS('font-size', '36px')
  await expect(page.locator('.preview-content h1').first()).toHaveCSS('line-height', '41.4px')
  await expect(page.locator('.preview-content h1').first()).toHaveCSS('font-weight', '650')
  await expect(page.locator('.cm-content')).toHaveCSS('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
  await expect(page.locator('.preview-content')).toHaveCSS('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
  await expect(page.locator('.cm-content')).toHaveCSS('line-height', '25.6px')
  await expect(page.locator('.preview-content')).toHaveCSS('line-height', '25.6px')
  await expect(page.locator('.cm-emphasis')).toHaveCSS('font-style', 'italic')
  await expect(page.locator('.cm-code')).toHaveCSS('background-color', 'rgb(32, 38, 44)')
  await expect(page.locator('.cm-link')).toHaveCSS('color', 'rgb(140, 180, 255)')

  await page.locator('.cm-line').nth(2).click({ position: { x: 400, y: 8 } })
  await expect(page.locator('.cm-strong')).toHaveCSS('font-weight', '700')

  await page.locator('.cm-line').last().click({ position: { x: 2, y: 8 } })
  await expect(page.locator('.cm-active-line .cm-formatting-inline')).toHaveCount(0)
})

test('places the Live Preview caret on the clicked line after scrolling', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Live', exact: true }).click()

  const imageHeading = page.locator('.cm-line').filter({ hasText: '## Image' }).first()
  for (let scrollTop = 0; await imageHeading.count() === 0 && scrollTop < 6000; scrollTop += 200) {
    await page.evaluate((top) => window.scrollTo(0, top), scrollTop)
  }
  await imageHeading.scrollIntoViewIfNeeded()
  const headingBox = await imageHeading.boundingBox()

  expect(headingBox).not.toBeNull()
  if (!headingBox) return

  await page.mouse.click(headingBox.x + headingBox.width - 40, headingBox.y + headingBox.height / 2)

  await expect(page.locator('.cm-line.cm-activeLine')).toContainText('Image')
})

test('keeps the rendered view visible when Source is active in split view', async ({ page }) => {
  await page.goto('/')

  const liveButton = page.getByRole('button', { name: 'Live', exact: true })
  const sourceButton = page.getByRole('button', { name: 'Source', exact: true })
  const splitButton = page.getByRole('button', { name: 'Split view' })

  await sourceButton.click()

  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
  await expect(page.getByRole('article', { name: 'Rendered view' })).toBeVisible()
  await expect(page.locator('[data-preview] h1').first()).toHaveText('Common Markdown + GitHub-Flavored Markdown')
  await expect(sourceButton).toHaveAttribute('aria-pressed', 'true')
  await expect(liveButton).toHaveAttribute('aria-pressed', 'false')
  await expect(splitButton).toHaveAttribute('aria-pressed', 'true')
})

test('renders the initial document before the first edit', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-preview]')).toContainText('Bold and italic text')
  await expect(page.locator('[data-preview] table')).toHaveCount(3)
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
  const splitHandle = page.getByRole('separator', { name: 'Resize editor and rendered view panes' })
  const initialEditorBox = await editorPane.boundingBox()
  const handleBox = await splitHandle.boundingBox()

  expect(initialEditorBox).not.toBeNull()
  expect(handleBox).not.toBeNull()
  if (!initialEditorBox || !handleBox) return

  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox.x - 160, handleBox.y + handleBox.height / 2)
  await page.mouse.up()

  const resizedEditorBox = await editorPane.boundingBox()
  expect(resizedEditorBox).not.toBeNull()
  expect(resizedEditorBox!.width).toBeGreaterThan(initialEditorBox.width + 100)
})

test('resizes the split panes from the keyboard', async ({ page }) => {
  await page.goto('/')

  const splitHandle = page.getByRole('separator', { name: 'Resize editor and rendered view panes' })
  await splitHandle.focus()
  await splitHandle.press('ArrowRight')

  await expect(splitHandle).toHaveAttribute('aria-valuenow', '51')
})
