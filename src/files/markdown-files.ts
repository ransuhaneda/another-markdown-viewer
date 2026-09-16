import { fileOpen, fileSave } from 'browser-fs-access'

export interface FileOperationResult {
  markdown: string
  name?: string
}

export async function openMarkdownFile(): Promise<FileOperationResult | null> {
  try {
    const file = await fileOpen({ mimeTypes: ['text/markdown', 'text/plain'], extensions: ['.md', '.markdown'] })
    return { markdown: await file.text(), name: file.name }
  } catch (error) {
    if (isAbortError(error)) return null
    throw error
  }
}

export async function saveMarkdownFile(markdown: string, name = 'untitled.md'): Promise<void> {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  await fileSave(blob, { fileName: name.endsWith('.md') ? name : `${name}.md`, description: 'Markdown document', extensions: ['.md', '.markdown'], mimeTypes: ['text/markdown'] })
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
