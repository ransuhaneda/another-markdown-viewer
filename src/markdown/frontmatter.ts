import { parse as parseYaml } from 'yaml'

export interface FrontmatterDocument {
  metadata: Record<string, unknown>
  markdown: string
  sourceOffset: number
}

export function parseFrontmatter(source: string): FrontmatterDocument | null {
  const openingLineEnd = source.indexOf('\n')
  if (openingLineEnd === -1) return null

  const openingLine = source.slice(0, openingLineEnd).replace(/\r$/u, '').replace(/^\uFEFF/u, '')
  if (openingLine !== '---') return null

  const yamlStart = openingLineEnd + 1
  let lineStart = yamlStart

  while (lineStart <= source.length) {
    const newline = source.indexOf('\n', lineStart)
    const lineEnd = newline === -1 ? source.length : newline
    const line = source.slice(lineStart, lineEnd).replace(/\r$/u, '')

    if (/^(?:---|\.\.\.)[ \t]*$/u.test(line)) {
      let metadata: unknown
      try {
        metadata = parseYaml(source.slice(yamlStart, lineStart))
      } catch {
        return null
      }

      if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null

      const sourceOffset = newline === -1 ? lineEnd : newline + 1
      return {
        metadata: metadata as Record<string, unknown>,
        markdown: source.slice(sourceOffset),
        sourceOffset,
      }
    }

    if (newline === -1) break
    lineStart = newline + 1
  }

  return null
}
