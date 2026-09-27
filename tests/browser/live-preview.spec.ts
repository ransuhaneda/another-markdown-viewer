import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear()
  })
})

test('shows only Source editing and the Rendered View', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('[data-mode]')).toHaveCount(0)
  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
  await expect(page.locator('[data-pane="preview"] .pane-label')).toHaveText('Rendered View')

  const editor = page.getByRole('textbox')
  await editor.fill('# Source **stays raw**')
  await expect(editor).toContainText('# Source **stays raw**')
  await expect(page.locator('[data-preview] h1')).toHaveText('Source stays raw')
})

test('Focus mode hides chrome and exits with Escape while restoring focus', async ({ page }) => {
  await page.goto('/')
  const entry = page.locator('nav [data-action="focus-mode"]')
  await entry.click()

  await expect(page.locator('.app-shell')).toHaveAttribute('data-focus-mode', '')
  await expect(page.locator('.app-header')).toBeHidden()
  await expect(page.locator('.workspace-toolbar')).toBeHidden()
  await expect(page.locator('.pane-header').first()).toBeHidden()
  await expect(page.locator('.app-footer')).toBeHidden()
  await expect(entry).toHaveAttribute('aria-label', 'Exit Focus mode')
  await expect(entry).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-pane="editor"]')).toBeVisible()
  await expect(page.locator('[data-pane="preview"]')).toBeVisible()
  await expect(page.getByRole('textbox')).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(page.locator('.app-shell')).not.toHaveAttribute('data-focus-mode', '')
  await expect(page.locator('.app-header')).toBeVisible()
  await expect(entry).toBeFocused()
})

test('keyboard shortcuts enter Focus mode and appear in help and relevant tooltips', async ({ page }) => {
  await page.goto('/')
  const focusButton = page.locator('nav [data-action="focus-mode"]')
  const saveButton = page.locator('[data-action="save"]')

  await expect(focusButton).toHaveAttribute('title', 'Enter Focus mode (Ctrl/Cmd+Shift+F)')
  await expect(saveButton).toHaveAttribute('title', 'Save Markdown (Ctrl/Cmd+S)')
  await expect(page.locator('[data-action="undo"]')).toHaveAttribute('title', 'Undo (Ctrl/Cmd+Z)')
  await expect(page.locator('[data-action="redo"]')).toHaveAttribute('title', 'Redo (Ctrl/Cmd+Shift+Z)')
  await page.keyboard.press('Control+Shift+F')
  await expect(page.locator('.app-shell')).toHaveAttribute('data-focus-mode', '')
  await expect(focusButton).toHaveAttribute('title', 'Exit Focus mode (Escape)')
  await expect(page.locator('[data-action="focus-mode-unfocus"]')).toHaveAttribute('title', 'Exit Focus mode (Escape)')

  await page.keyboard.press('Escape')
  await page.locator('[data-action="help"]').click()
  const shortcuts = page.locator('#help-dialog section').filter({ has: page.getByRole('heading', { name: 'Keyboard shortcuts' }) })
  await expect(shortcuts).toContainText('Ctrl/Cmd+S')
  await expect(shortcuts).toContainText('Ctrl/Cmd+Shift+F')
  await expect(shortcuts).toContainText('Escape')
  await expect(shortcuts).toContainText('Ctrl/Cmd+Z')
  await expect(shortcuts).toContainText('Ctrl/Cmd+Shift+Z')
  await expect(shortcuts).toContainText('Ctrl/Cmd+B')
  await expect(shortcuts).toContainText('Ctrl/Cmd+I')
  await expect(shortcuts).toContainText('Alt+Shift+S')
  await expect(shortcuts).toContainText('Ctrl/Cmd+K')
  await expect(shortcuts).toContainText('Ctrl+Shift+K')
  await expect(shortcuts).toContainText('Cmd+Option+C')
})

test('Markdown formatting shortcuts edit selected source text', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByRole('textbox')
  const formatSelection = async (source: string, shortcut: string): Promise<void> => {
    await editor.fill(source)
    await editor.press('Control+Home')
    await editor.press('Shift+End')
    await page.keyboard.press(shortcut)
  }

  await formatSelection('bold text', 'Control+B')
  await expect(page.locator('[data-preview] strong')).toHaveText('bold text')
  await formatSelection('italic text', 'Control+I')
  await expect(page.locator('[data-preview] em')).toHaveText('italic text')
  await formatSelection('strike text', 'Alt+Shift+S')
  await expect(page.locator('[data-preview] del')).toHaveText('strike text')
  await formatSelection('linked text', 'Control+K')
  await expect(page.locator('[data-preview] a')).toHaveAttribute('href', 'url')
  await editor.fill('one\ntwo')
  await editor.press('Control+Home')
  await editor.press('Shift+ArrowDown')
  await editor.press('Shift+End')
  await page.keyboard.press('Control+Shift+K')
  await expect(page.locator('[data-preview] pre code')).toContainText('one')
  await expect(page.locator('[data-preview] pre code')).toContainText('two')

  await editor.fill('**toggle bold**')
  await editor.press('Control+Home')
  await editor.press('ArrowRight')
  await editor.press('ArrowRight')
  await editor.press('Shift+End')
  await editor.press('Shift+ArrowLeft')
  await editor.press('Shift+ArrowLeft')
  await page.keyboard.press('Control+B')
  await expect(editor).toContainText('toggle bold')
  await expect(editor).not.toContainText('**toggle bold**')

  await editor.fill('one\ntwo')
  await editor.press('Control+Home')
  await editor.press('Shift+ArrowDown')
  await editor.press('Shift+End')
  await page.keyboard.press('Control+Shift+K')
  await expect(page.locator('[data-preview] pre code')).toContainText('one')
  await expect(page.locator('[data-preview] pre code')).toContainText('two')

})

test('shows logical line numbers in the source editor', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByRole('textbox')
  const lineNumbers = page.locator('.cm-lineNumbers .cm-gutterElement:visible')

  await editor.fill('first\n\nthird')
  await expect(lineNumbers).toHaveText(['1', '2', '3'])

  await editor.press('Control+End')
  await editor.press('Enter')
  await expect(lineNumbers).toHaveText(['1', '2', '3', '4'])

  await expect(lineNumbers).toHaveText(['1', '2', '3', '4'])
})

test('Focus mode keeps controls operable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.locator('[data-layout="preview"]').click()
  await page.locator('nav [data-action="focus-mode"]').click()

  const exit = page.locator('[data-action="focus-mode-unfocus"]')
  await expect(exit).toBeVisible()
  await expect(page.locator('[data-pane="preview"]')).toBeVisible()
  const exitBox = await exit.boundingBox()
  expect(exitBox).not.toBeNull()
  await expect(page.locator('.app-header')).toBeHidden()
  await expect(exit).toHaveAttribute('aria-pressed', 'true')
  await exit.click()
  await expect(page.locator('.app-header')).toBeVisible()
  expect(exitBox!.x + exitBox!.width).toBeLessThanOrEqual(390)
  await expect(exit).toBeHidden()
})

test('Focus mode preserves Source editing and editor-only layout through a full cycle', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByRole('textbox')
  await editor.fill('# Preserve this source')
  await page.locator('button[data-layout="editor"]').click()
  const textBefore = await editor.textContent()
  await editor.press('End')
  const selectionBefore = await page.locator('.cm-content').evaluate(() => document.getSelection()?.toString() ?? '')

  await page.getByRole('button', { name: 'Enter Focus mode' }).click()
  await expect(page.locator('button[data-layout="editor"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
  await expect(page.locator('[data-pane="editor"]')).toBeVisible()
  await expect(page.locator('[data-pane="preview"]')).toBeHidden()
  expect(await editor.textContent()).toBe(textBefore)
  expect(await page.locator('.cm-content').evaluate(() => document.getSelection()?.toString() ?? '')).toBe(selectionBefore)
  await page.keyboard.press('Escape')
  await expect(page.locator('button[data-layout="editor"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
})

test('Focus mode accepts explicit exit and does not write recovery state', async ({ page }) => {
  await page.goto('/')
  await page.locator('nav [data-action="focus-mode"]').click()
  const unfocus = page.locator('[data-action="focus-mode-unfocus"]')
  await expect(unfocus).toBeVisible()
  await unfocus.click()

  await expect(page.locator('.app-header')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enter Focus mode' })).toBeFocused()
  expect(await page.evaluate(() => localStorage.getItem('markdown-preview:recovery'))).toBeNull()
})

test('Escape closes Help without exiting Focus mode', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Enter Focus mode' }).click()
  await page.locator('#help-dialog').evaluate((dialog: HTMLDialogElement) => dialog.showModal())

  await page.keyboard.press('Escape')
  await expect(page.locator('#help-dialog')).not.toBeVisible()
  await expect(page.locator('.app-shell')).toHaveAttribute('data-focus-mode', '')
})

test('opens with an editable Source editor and a rendered document', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Another Markdown Viewer')
  await expect(page.locator('.brand-lockup h1')).toHaveText('Another Markdown Viewer')
  const editor = page.getByRole('textbox')
  await expect(editor).toBeVisible()
  await expect(editor).toBeEditable()
  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
  await expect(page.locator('[data-preview] h1').first()).toHaveText('Another Markdown Viewer')
  await expect(page.locator('[data-preview] .markdown-frontmatter')).toBeVisible()
  await expect(page.locator('[data-preview] img').first()).toHaveAttribute('src', '/images/another-markdown-viewer-workspace.svg')
  await expect(page.locator('[data-preview] img').nth(1)).toHaveAttribute('src', '/images/another-markdown-viewer-preview.svg')
})

test('renders YAML frontmatter above the Markdown body without changing the source', async ({ page }) => {
  await page.goto('/')
  const source = '---\ntitle: Another Markdown Viewer\ndescription: Browser Markdown editor with live preview and PDF export\nauthor: ransuhaneda\ntags: [markdown, typescript, vite]\n---\n\n# Rendered body'
  const editor = page.getByRole('textbox')
  await editor.fill(source)

  const metadata = page.locator('[data-preview] .markdown-frontmatter')
  await expect(metadata).toBeVisible()
  await expect(metadata.locator('tbody tr')).toHaveCount(4)
  await expect(metadata.locator('tr').nth(0).locator('th')).toHaveText('title')
  await expect(metadata.locator('tr').nth(0).locator('td')).toHaveText('Another Markdown Viewer')
  await expect(metadata.locator('tr').nth(1).locator('td')).toHaveText('Browser Markdown editor with live preview and PDF export')
  await expect(metadata.locator('tr').nth(1).locator('td span')).toHaveCount(0)
  const tags = metadata.locator('.markdown-frontmatter-tag')
  await expect(tags).toHaveText(['markdown', 'typescript', 'vite'])
  await expect(tags.first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(tags.first()).toHaveCSS('color', 'rgb(241, 244, 245)')
  await expect(tags.first()).toHaveCSS('border-top-color', 'rgb(140, 180, 255)')
  await expect(metadata.locator('tr').nth(1).locator('td')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(metadata.locator('tr').nth(1).locator('th')).toHaveCSS('text-align', 'end')
  await expect(page.locator('[data-preview] h1')).toHaveText('Rendered body')
  await expect(editor.locator('.cm-line')).toHaveText(source.split('\n'))
})

test('places the source caret on the clicked rendered block after scrolling', async ({ page }) => {
  await page.goto('/')

  const imageHeading = page.locator('.cm-line').filter({ hasText: /^###\s*Links and images$/u }).first()
  const editorScroller = page.locator('.cm-scroller')
  for (let scrollTop = 0; await imageHeading.count() === 0 && scrollTop < 6000; scrollTop += 200) {
    await editorScroller.evaluate((element, top) => { element.scrollTop = top }, scrollTop)
  }
  await imageHeading.scrollIntoViewIfNeeded()
  const headingBox = await imageHeading.boundingBox()

  expect(headingBox).not.toBeNull()
  if (!headingBox) return

  await page.mouse.click(headingBox.x + headingBox.width - 40, headingBox.y + headingBox.height / 2)

  await expect(page.locator('.cm-line.cm-activeLine')).toContainText('Links and images')
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

test('disables synchronized scrolling outside split view', async ({ page }) => {
  await page.goto('/')

  const editor = page.getByRole('textbox')
  const longDocument = Array.from({ length: 180 }, (_, index) => `## Section ${index + 1}\n\nParagraph ${index + 1}.`).join('\n\n')
  await editor.fill(longDocument)

  const editorScroller = page.locator('.cm-scroller')
  const preview = page.locator('[data-preview]')
  const syncButton = page.locator('[data-action="sync-scroll"]')
  await syncButton.click()
  await page.locator('[data-layout="editor"]').click()

  await expect(syncButton).toBeDisabled()
  await expect(syncButton).toHaveAttribute('aria-pressed', 'false')
  await editorScroller.evaluate((element) => { element.scrollTop = 1200 })

  expect(await editorScroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  expect(await preview.evaluate((element) => element.scrollTop)).toBe(0)

  await page.locator('[data-layout="preview"]').click()
  await expect(syncButton).toBeDisabled()
  const editorScrollTop = await editorScroller.evaluate((element) => element.scrollTop)
  await preview.evaluate((element) => { element.scrollTop = 1200 })
  expect(await preview.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  expect(await editorScroller.evaluate((element) => element.scrollTop)).toBe(editorScrollTop)

  await page.locator('[data-layout="split"]').click()
  await expect(syncButton).toBeEnabled()
  await editorScroller.evaluate((element) => { element.scrollTop = 1600 })
  await expect.poll(() => preview.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
})

test('keeps the rendered view visible beside Source Markdown in split view', async ({ page }) => {
  await page.goto('/')

  const splitButton = page.getByRole('button', { name: 'Split view' })

  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
  await expect(page.getByRole('article', { name: 'Rendered view' })).toBeVisible()
  await expect(page.locator('[data-preview] h1').first()).toHaveText('Another Markdown Viewer')
  await expect(page.locator('[data-mode]')).toHaveCount(0)
  await expect(splitButton).toHaveAttribute('aria-pressed', 'true')
})

test('opens the source editor when a rendered block is clicked', async ({ page }) => {
  await page.goto('/')

  await page.locator('[data-preview] h1').first().click()

  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
  await expect(page.locator('.cm-focused')).toBeVisible()
  await expect(page.locator('.cm-activeLine')).toContainText('Another Markdown Viewer')
})

test('renders the initial document before the first edit', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-preview]')).toContainText('Bold and italic text')
  await expect(page.locator('[data-preview] .markdown-frontmatter')).toBeVisible()
  await expect(page.locator('[data-preview] img')).toHaveCount(3)
  await expect(page.locator('[data-preview] img').nth(0)).toHaveAttribute('src', '/images/another-markdown-viewer-workspace.svg')
  await expect(page.locator('[data-preview] img').nth(1)).toHaveAttribute('src', '/images/another-markdown-viewer-preview.svg')
  await expect(page.locator('[data-preview] img').nth(2)).toHaveAttribute('src', '/images/another-markdown-viewer-workspace.svg')
  await expect(page.locator('[data-preview] table')).toHaveCount(3)
  for (const image of await page.locator('[data-preview] img').all()) {
    await image.scrollIntoViewIfNeeded()
    expect(await image.evaluate(async (element: HTMLImageElement) => {
      await element.decode()
      return element.naturalWidth > 0 && element.naturalHeight > 0
    })).toBe(true)
  }
})

test('uses the full available width for rendered content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.getByRole('textbox').fill('# Wide preview\n\nThis paragraph should use the available preview width.')
  await page.locator('[data-layout="preview"]').click()

  const paragraph = page.locator('[data-preview] p')
  const widths = await paragraph.evaluate((element) => {
    const preview = element.parentElement!
    const style = getComputedStyle(preview)
    return {
      previewWidth: preview.getBoundingClientRect().width,
      contentWidth: preview.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      paragraphWidth: element.getBoundingClientRect().width,
      maxWidth: getComputedStyle(element).maxWidth,
    }
  })

  expect(widths.previewWidth).toBeGreaterThan(800)
  expect(widths.paragraphWidth).toBeCloseTo(widths.contentWidth, 0)
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
      mode: 'source',
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
  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
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
  await expect(page.locator('[data-editor-label]')).toHaveText('Source')
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

test('renders GitHub alerts in preview and print styles', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('textbox').fill('> [!NOTE]\n> Useful information.\n\n> [!TIP]\n> Helpful advice.\n\n> [!IMPORTANT]\n> Important information.\n\n> [!WARNING]\n> Take care.\n\n> [!CAUTION]\n> Potential consequences.\n')

  const note = page.locator('[data-preview] .markdown-alert-note')
  const warning = page.locator('[data-preview] .markdown-alert-warning')
  await expect(note.locator('.markdown-alert-title')).toContainText('NOTE')
  await expect(warning.locator('.markdown-alert-title')).toContainText('WARNING')
  await expect(note.locator('.markdown-alert-icon')).toHaveAttribute('viewBox', '0 0 24 24')
  await expect(note).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(note.locator('.markdown-alert-title')).toHaveCSS('color', 'rgb(68, 147, 248)')
  await expect(note).not.toContainText('[!NOTE]')

  const darkColors: Record<string, string> = {
    note: 'rgb(68, 147, 248)',
    tip: 'rgb(63, 185, 80)',
    important: 'rgb(163, 113, 247)',
    warning: 'rgb(210, 153, 34)',
    caution: 'rgb(248, 81, 73)',
  }
  for (const [type, color] of Object.entries(darkColors)) {
    const alert = page.locator(`[data-preview] .markdown-alert-${type}`)
    await expect(alert).toHaveCSS('border-inline-start-color', color)
    await expect(alert).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(alert.locator('.markdown-alert-title')).toHaveCSS('color', color)
  }

  await page.emulateMedia({ media: 'print' })
  await expect(warning).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  const lightColors: Record<string, string> = {
    note: 'rgb(9, 105, 218)',
    tip: 'rgb(26, 127, 55)',
    important: 'rgb(130, 80, 223)',
    warning: 'rgb(154, 103, 0)',
    caution: 'rgb(207, 34, 46)',
  }
  for (const [type, color] of Object.entries(lightColors)) {
    const alert = page.locator(`[data-preview] .markdown-alert-${type}`)
    await expect(alert).toHaveCSS('border-inline-start-color', color)
    await expect(alert.locator('.markdown-alert-title')).toHaveCSS('color', color)
  }
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
  await expect(download).toHaveCSS('width', '27px')
  await expect(download).toHaveCSS('height', '27px')

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
