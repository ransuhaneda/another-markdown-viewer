import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear()
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

  const headingText = page.locator('.cm-header-1').filter({ hasText: 'Heading' }).last()
  await expect(headingText).toHaveCSS('font-size', '36px')
  await expect(headingText).toHaveCSS('line-height', '41.4px')
  await expect(headingText).toHaveCSS('font-weight', '650')
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
  const headingStart = await headingText.evaluate((element) => element.getBoundingClientRect().left)
  const paragraphStart = await page.locator('.cm-line').nth(2).evaluate((element) => {
    const text = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.startsWith('A '))
    if (!text) throw new Error('Missing paragraph text')
    const range = document.createRange()
    range.setStart(text, 0)
    range.setEnd(text, 1)
    return range.getBoundingClientRect().left
  })
  expect(headingStart).toBeCloseTo(paragraphStart, 1)

  await expect(page.locator('.cm-strong')).toHaveCSS('font-weight', '700')

  await page.locator('.cm-line').last().click({ position: { x: 2, y: 8 } })
  await expect(page.locator('.cm-active-line .cm-formatting-inline')).toHaveCount(0)
})

test('places the Live Preview caret on the clicked line after scrolling', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Live', exact: true }).click()

  const imageHeading = page.locator('.cm-line').filter({ hasText: /^##\s*Image$/u }).first()
  const editorScroller = page.locator('.cm-scroller')
  for (let scrollTop = 0; await imageHeading.count() === 0 && scrollTop < 6000; scrollTop += 200) {
    await editorScroller.evaluate((element, top) => { element.scrollTop = top }, scrollTop)
  }
  await imageHeading.scrollIntoViewIfNeeded()
  const headingBox = await imageHeading.boundingBox()

  expect(headingBox).not.toBeNull()
  if (!headingBox) return

  await page.mouse.click(headingBox.x + headingBox.width - 40, headingBox.y + headingBox.height / 2)

  await expect(page.locator('.cm-line.cm-activeLine')).toContainText('Image')
})

test('keeps long documents inside independently scrolling panes', async ({ page }) => {
  await page.goto('/')

  const editor = page.getByRole('textbox')
  const longDocument = Array.from({ length: 180 }, (_, index) => `## Section ${index + 1}\n\nParagraph ${index + 1}.`).join('\n\n')
  await editor.fill(longDocument)

  const editorScroller = page.locator('.cm-scroller')
  const preview = page.locator('[data-preview]')
  const initialPreviewScrollTop = await preview.evaluate((element) => element.scrollTop)

  await editorScroller.evaluate((element) => { element.scrollTop = 1200 })

  expect(await editorScroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  expect(await preview.evaluate((element) => element.scrollTop)).toBe(initialPreviewScrollTop)
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(await page.evaluate(() => document.documentElement.clientHeight))
  await expect(editorScroller).toHaveCSS('scrollbar-color', 'rgb(140, 180, 255) rgba(0, 0, 0, 0)')
  await expect(preview).toHaveCSS('scrollbar-color', 'rgb(140, 180, 255) rgba(0, 0, 0, 0)')

  const previewPaneWidth = await page.locator('[data-pane="preview"]').evaluate((element) => element.clientWidth)
  expect(await preview.evaluate((element) => element.offsetWidth)).toBe(previewPaneWidth)
  expect(await editorScroller.evaluate((element) => getComputedStyle(element, '::-webkit-scrollbar-button').display)).toBe('none')
  expect(await preview.evaluate((element) => getComputedStyle(element, '::-webkit-scrollbar-button').display)).toBe('none')
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

test('keeps mobile editor and preview layouts usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.locator('[data-pane="preview"]')).toBeHidden()
  await page.locator('[data-layout="preview"]').click()
  await expect(page.locator('[data-pane="editor"]')).toBeHidden()
  await expect(page.locator('[data-pane="preview"]')).toBeVisible()
  await expect(page.locator('[data-count]')).toContainText('characters')
})

test('restores a recovered draft and its view state', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('markdown-preview:recovery', JSON.stringify({
      markdown: '# Recovered',
      fileName: 'notes.md',
      mode: 'live-preview',
      layout: 'preview',
      cursorPosition: 4,
      editorScrollTop: 0,
      previewScrollTop: 0,
      updatedAt: 1,
    }))
  })
  await page.goto('/')

  await expect(page.locator('[data-status]')).toHaveText('Draft restored locally')
  await expect(page.locator('[data-preview] h1')).toHaveText('Recovered')
  await expect(page.locator('button[data-layout="preview"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-mode="live-preview"]')).toHaveAttribute('aria-pressed', 'true')
})

test('keeps the recovery warning visible when storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value): void {
      if (key === 'markdown-preview:recovery') throw new DOMException('Quota exceeded', 'QuotaExceededError')
      originalSetItem.call(this, key, value)
    }
  })
  await page.goto('/')
  await page.getByRole('textbox').fill('# Unsaved')

  await expect(page.locator('[data-status]')).toHaveText('Editing in memory')
  await expect(page.locator('[data-recovery-warning]')).toBeVisible()
  await page.getByRole('button', { name: 'Live', exact: true }).click()
  await expect(page.locator('[data-recovery-warning]')).toBeVisible()
})

test('opens and closes help while restoring focus', async ({ page }) => {
  await page.goto('/')
  const help = page.getByRole('button', { name: 'Markdown help' })
  await help.click()
  await expect(page.getByRole('dialog', { name: 'Markdown help' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(help).toBeFocused()
})

test('renders unsafe destinations as inert content', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('textbox').fill('[unsafe](javascript:alert(1))\n\n![alt](javascript:alert(1))\n\n<div onclick="alert(1)">Visible</div>')
  await expect(page.locator('[data-preview] a')).toHaveCount(1)
  await expect(page.locator('[data-preview] a')).toHaveAttribute('href', '')
  await expect(page.locator('[data-preview] img')).toHaveCount(1)
  await expect(page.locator('[data-preview] img')).toHaveAttribute('alt', 'alt')
  await expect(page.locator('[data-preview] [onclick]')).toHaveCount(0)
  await expect(page.locator('[data-preview]')).toContainText('Visible')
})

test('converts rich HTML paste into Markdown', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByRole('textbox')
  await editor.click()
  await page.evaluate(() => {
    const clipboard = new DataTransfer()
    clipboard.setData('text/plain', 'One Two')
    clipboard.setData('text/html', '<h2>Title</h2><p><strong>Bold</strong> text</p>')
    document.querySelector('.cm-content')?.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: clipboard }))
  })
  await expect(editor).toContainText('## Title')
  await expect(editor).toContainText('**Bold** text')
})

test('confirms before clearing a non-empty draft', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('textbox').fill('# Keep this')
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: 'Clear draft' }).click()
  await expect(page.getByRole('textbox')).toContainText('# Keep this')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Clear draft' }).click()
  await expect(page.locator('[data-count]')).toHaveText('0 words · 0 characters')
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
  expect(resizedEditorBox!.width).toBeLessThan(initialEditorBox.width - 100)
})

test('resizes the split panes from the keyboard', async ({ page }) => {
  await page.goto('/')

  const splitHandle = page.getByRole('separator', { name: 'Resize editor and rendered view panes' })
  await splitHandle.focus()
  await splitHandle.press('ArrowRight')

  await expect(splitHandle).toHaveAttribute('aria-valuenow', '51')
})
