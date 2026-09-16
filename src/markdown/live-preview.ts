export interface MarkdownRange {
  start: number
  end: number
}

export interface LivePreviewBlock {
  range: MarkdownRange
  type: 'heading' | 'emphasis' | 'code' | 'link' | 'image' | 'block'
}

const BLOCK_PATTERNS: Array<[LivePreviewBlock['type'], RegExp]> = [
  ['heading', /^#{1,6}\s+/u],
  ['code', /^```/u],
  ['image', /!?\[[^\]]*\]\([^)]*\)/u],
  ['link', /\[[^\]]+\]\([^)]*\)/u],
  ['emphasis', /(?:\*\*|__|\*|_)[^\n]+(?:\*\*|__|\*|_)/u],
]

export function findActiveBlock(source: string, cursor: number): LivePreviewBlock {
  const safeCursor = Math.max(0, Math.min(cursor, source.length))
  const lineStart = source.lastIndexOf('\n', safeCursor - 1) + 1
  const newline = source.indexOf('\n', safeCursor)
  const lineEnd = newline === -1 ? source.length : newline
  const line = source.slice(lineStart, lineEnd)

  for (const [type, pattern] of BLOCK_PATTERNS) {
    if (pattern.test(line)) return { type, range: { start: lineStart, end: lineEnd } }
  }
  return { type: 'block', range: { start: lineStart, end: lineEnd } }
}

export function isCursorInBlock(block: LivePreviewBlock, cursor: number): boolean {
  return cursor >= block.range.start && cursor <= block.range.end
}
