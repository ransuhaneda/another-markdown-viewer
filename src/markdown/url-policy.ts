const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:'])

export function sanitizeUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed, 'https://markdown-preview.invalid')
    if (parsed.origin === 'https://markdown-preview.invalid' && !trimmed.startsWith('/')) return null
    return SAFE_SCHEMES.has(parsed.protocol) || parsed.origin === 'https://markdown-preview.invalid' ? trimmed : null
  } catch {
    return null
  }
}
