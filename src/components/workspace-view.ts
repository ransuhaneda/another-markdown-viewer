import type { EditorView } from '@codemirror/view'
import { Maximize2, Minimize2 } from 'lucide'
import { canRedoSourceEditor, canUndoSourceEditor, setSourceEditorLivePreview } from '../editor/source-editor'
import { findActiveBlock } from '../markdown/live-preview'
import { prepareRenderedLinks, renderMarkdown } from '../markdown/render-markdown'
import type { DocumentState, ViewMode, WorkspaceLayout } from '../state/document-state'

export interface WorkspaceElements {
  appShell: HTMLElement
  editorParent: HTMLElement
  enterFocusModeButton: HTMLButtonElement
  focusModeUnfocusButton: HTMLButtonElement
  helpDialog: HTMLDialogElement
  helpTrigger: HTMLButtonElement
  preview: HTMLElement
  redoButton: HTMLButtonElement
  splitHandle: HTMLElement
  syncScrollButton: HTMLButtonElement
  undoButton: HTMLButtonElement
  workspace: HTMLElement
}

export function getWorkspaceElements(app: HTMLElement): WorkspaceElements {
  return {
    appShell: requiredElement(app, '.app-shell'),
    editorParent: requiredElement(app, '[data-editor]'),
    enterFocusModeButton: requiredElement(app, '[data-action="focus-mode"]'),
    focusModeUnfocusButton: requiredElement(app, '[data-action="focus-mode-unfocus"]'),
    helpDialog: requiredElement(app, '#help-dialog'),
    helpTrigger: requiredElement(app, '[data-action="help"]'),
    preview: requiredElement(app, '[data-preview]'),
    redoButton: requiredElement(app, '[data-action="redo"]'),
    splitHandle: requiredElement(app, '.split-handle'),
    syncScrollButton: requiredElement(app, '[data-action="sync-scroll"]'),
    undoButton: requiredElement(app, '[data-action="undo"]'),
    workspace: requiredElement(app, '.document-region'),
  }
}

export function updateFocusModeView(elements: WorkspaceElements, active: boolean): void {
  elements.appShell.toggleAttribute('data-focus-mode', active)
  elements.enterFocusModeButton.setAttribute('aria-pressed', String(active))
  elements.enterFocusModeButton.setAttribute('aria-label', active ? 'Exit Focus mode' : 'Enter Focus mode')
  elements.enterFocusModeButton.setAttribute('title', active ? 'Exit Focus mode (Escape)' : 'Enter Focus mode (Ctrl/Cmd+Shift+F)')
  const previousIcon = elements.enterFocusModeButton.querySelector('svg')
  if (previousIcon) previousIcon.replaceWith(createFocusModeIcon(active))
  elements.enterFocusModeButton.classList.toggle('is-active', active)
  elements.focusModeUnfocusButton.setAttribute('aria-label', 'Exit Focus mode')
  elements.focusModeUnfocusButton.setAttribute('title', 'Exit Focus mode (Escape)')
  elements.focusModeUnfocusButton.setAttribute('aria-pressed', String(active))
  const floatingIcon = elements.focusModeUnfocusButton.querySelector('svg')
  if (floatingIcon) floatingIcon.replaceWith(createFocusModeIcon(true))
  elements.focusModeUnfocusButton.classList.toggle('is-active', active)
}

function createFocusModeIcon(active: boolean): SVGSVGElement {
  const icon = active ? Minimize2 : Maximize2
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  for (const [name, value] of Object.entries({
    xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round',
    'stroke-linejoin': 'round', 'aria-hidden': 'true',
  })) svg.setAttribute(name, value)
  icon.forEach(([tag, attributes]) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
    Object.entries(attributes).forEach(([name, value]) => {
      if (value !== undefined) element.setAttribute(name, String(value))
    })
    svg.append(element)
  })
  return svg
}

export function updateDocumentView(app: HTMLElement, elements: WorkspaceElements, state: DocumentState): void {
  elements.preview.innerHTML = renderMarkdown(state.markdown)
  prepareRenderedLinks(elements.preview)
  elements.preview.scrollTop = state.previewScrollTop
  const words = state.markdown.trim() ? state.markdown.trim().split(/\s+/u).length : 0
  const characters = state.markdown.length
  requiredElement<HTMLElement>(app, '[data-count]').textContent = `${words} ${words === 1 ? 'word' : 'words'} · ${characters} ${characters === 1 ? 'character' : 'characters'}`
}

export function updateModeView(app: HTMLElement, editor: EditorView, mode: ViewMode): void {
  setSourceEditorLivePreview(editor, mode === 'live-preview')
  requiredElement<HTMLElement>(app, '[data-editor-label]').textContent = mode === 'live-preview' ? 'Live' : 'Source'
  updatePressedButtons(app, '[data-mode]', mode)
}

export function updateLayoutView(app: HTMLElement, elements: WorkspaceElements, layout: WorkspaceLayout): void {
  elements.workspace.dataset.layout = layout
  updatePressedButtons(app, '[data-layout]', layout)
}

export function updateHistoryView(elements: WorkspaceElements, editor: EditorView): void {
  elements.undoButton.disabled = !canUndoSourceEditor(editor)
  elements.redoButton.disabled = !canRedoSourceEditor(editor)
}

export function updateActivePreviewBlock(preview: HTMLElement, markdown: string, cursorPosition: number): void {
  const block = findActiveBlock(markdown, cursorPosition)
  preview.querySelectorAll<HTMLElement>('[data-source-start]').forEach((element) => {
    const range = readSourceRange(element)
    element.classList.toggle('is-active-source-block', range !== null && range.start <= block.range.end && range.end >= block.range.start)
  })
}

export function readSourceRange(element: HTMLElement): { start: number; end: number } | null {
  const start = Number(element.dataset.sourceStart)
  const end = Number(element.dataset.sourceEnd)
  return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : null
}

export function setStatus(app: HTMLElement, message: string, failed = false): void {
  const status = requiredElement<HTMLElement>(app, '[data-status]')
  status.textContent = message
  status.classList.toggle('status-warning', failed)
}

export function setRecoveryWarning(app: HTMLElement, unavailable: boolean): void {
  const warning = requiredElement<HTMLElement>(app, '[data-recovery-warning]')
  warning.hidden = !unavailable
}

function updatePressedButtons(app: HTMLElement, selector: string, value: string): void {
  app.querySelectorAll<HTMLButtonElement>(selector).forEach((button) => {
    const active = button.dataset.mode === value || button.dataset.layout === value
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
  })
}

function requiredElement<T extends Element>(container: ParentNode, selector: string): T {
  const element = container.querySelector<T>(selector)
  if (!element) throw new Error(`Missing required application element: ${selector}`)
  return element
}