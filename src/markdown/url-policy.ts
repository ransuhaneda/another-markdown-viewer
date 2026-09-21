const BASE_ORIGIN = 'https://markdown-preview.invalid'
const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:'])

export function sanitizeUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed || /[\u0000-\u001F\u007F]/u.test(trimmed)) return null

  try {
    const parsed = new URL(trimmed, BASE_ORIGIN)
    if (SAFE_SCHEMES.has(parsed.protocol)) return trimmed
    if (parsed.origin === BASE_ORIGIN && !/^[a-z][a-z\d+.-]*:/iu.test(trimmed)) return trimmed
    return null
  } catch {
    return null
  }
}
