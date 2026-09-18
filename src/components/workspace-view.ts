import type { EditorView } from '@codemirror/view'
import { canRedoSourceEditor, canUndoSourceEditor, setSourceEditorLivePreview } from '../editor/source-editor'
import { findActiveBlock } from '../markdown/live-preview'
import { prepareRenderedLinks, renderMarkdown } from '../markdown/render-markdown'
import type { DocumentState, ViewMode, WorkspaceLayout } from '../state/document-state'

export interface WorkspaceElements {
  editorParent: HTMLElement
  helpDialog: HTMLDialogElement
  helpTrigger: HTMLButtonElement
  preview: HTMLElement
  redoButton: HTMLButtonElement
  splitHandle: HTMLElement
  undoButton: HTMLButtonElement
  workspace: HTMLElement
}

export function getWorkspaceElements(app: HTMLElement): WorkspaceElements {
  return {
    editorParent: requiredElement(app, '[data-editor]'),
    helpDialog: requiredElement(app, '#help-dialog'),
    helpTrigger: requiredElement(app, '[data-action="help"]'),
    preview: requiredElement(app, '[data-preview]'),
    redoButton: requiredElement(app, '[data-action="redo"]'),
    splitHandle: requiredElement(app, '.split-handle'),
    undoButton: requiredElement(app, '[data-action="undo"]'),
    workspace: requiredElement(app, '.document-region'),
  }
}

export function updateDocumentView(app: HTMLElement, elements: WorkspaceElements, state: DocumentState): void {
  elements.preview.innerHTML = renderMarkdown(state.markdown)
  prepareRenderedLinks(elements.preview)
  elements.preview.scrollTop = state.previewScrollTop
  const words = state.markdown.trim() ? state.markdown.trim().split(/\s+/u).length : 0
  requiredElement<HTMLElement>(app, '[data-count]').textContent = `${words} ${words === 1 ? 'word' : 'words'}`
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