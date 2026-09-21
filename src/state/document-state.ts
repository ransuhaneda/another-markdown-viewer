export type ViewMode = 'live-preview' | 'source'
export type WorkspaceLayout = 'editor' | 'split' | 'preview'

export interface DocumentState {
  markdown: string
  fileName: string
  mode: ViewMode
  layout: WorkspaceLayout
  cursorPosition: number
  editorScrollTop: number
  previewScrollTop: number
  updatedAt: number
}

export const DEFAULT_LAYOUT: WorkspaceLayout = 'split'

export function createDocumentState(markdown: string, recovered?: Partial<DocumentState>): DocumentState {
  return {
    markdown,
    fileName: recovered?.fileName ?? 'untitled.md',
    mode: recovered?.mode ?? 'source',
    layout: recovered?.layout ?? DEFAULT_LAYOUT,
    cursorPosition: recovered?.cursorPosition ?? 0,
    editorScrollTop: recovered?.editorScrollTop ?? 0,
    previewScrollTop: recovered?.previewScrollTop ?? 0,
    updatedAt: recovered?.updatedAt ?? Date.now(),
  }
}

export function clampCursorPosition(position: number, documentLength: number): number {
  return Math.max(0, Math.min(Math.floor(position), documentLength))
}
