import * as DOMPurifyModule from 'dompurify'
import { marked } from 'marked'
import { sanitizeUrl } from './url-policy'

const purifyExport = (DOMPurifyModule.default ?? DOMPurifyModule) as unknown
const DOMPurify = typeof purifyExport === 'function' && typeof window !== 'undefined'
  ? purifyExport(window) as { sanitize: (html: string, options: object) => string }
  : null

const allowedTags = [
  'a', 'blockquote', 'br', 'code', 'del', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'img', 'input', 'li', 'ol', 'p', 'pre', 'strong', 'table', 'tbody', 'td',
  'tfoot', 'th', 'thead', 'tr', 'ul',
]

const allowedAttributes = ['alt', 'checked', 'class', 'disabled', 'href', 'loading', 'rel', 'src', 'target', 'title', 'type']

function sanitizeHtml(html: string): string {
  if (DOMPurify) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload', 'onmouseover'],
      ADD_ATTR: ['target', 'rel', 'loading'],
    })
  }
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/giu, '').replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/giu, '')
}

function inertUnsafeDestinations(html: string): string {
  return html.replace(/\s(href|src)=(['"])(.*?)\2/giu, (_match, attribute: string, quote: string, value: string) => {
    const safeValue = sanitizeUrl(value)
    return safeValue ? ` ${attribute}=${quote}${safeValue}${quote}` : ` ${attribute}=${quote}${quote}`
  })
}

export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { gfm: true, breaks: false, async: false })
  return sanitizeHtml(inertUnsafeDestinations(addSourceRanges(html, source)))
}

function addSourceRanges(html: string, source: string): string {
  const ranges = marked.lexer(source)
    .filter((token) => isRangeToken(token.type))
    .map((token) => ({ raw: token.raw.replace(/\n+$/u, ''), start: 0, end: 0 }))

  let cursor = 0
  ranges.forEach((range) => {
    const start = source.indexOf(range.raw, cursor)
    if (start >= 0) {
      range.start = start
      range.end = start + range.raw.length
      cursor = range.end
    }
  })

  let rangeIndex = 0
  return html.replace(/<(h[1-6]|p|blockquote|pre|ul|ol|table)([ >])/giu, (_match, tag: string, suffix: string) => {
    const range = ranges[rangeIndex++]
    if (!range || range.end <= range.start) return `<${tag}${suffix}`
    return `<${tag} data-source-start="${range.start}" data-source-end="${range.end}"${suffix}`
  })
}

function isRangeToken(type: string): boolean {
  return ['blockquote', 'code', 'heading', 'html', 'list', 'paragraph', 'table'].includes(type)
}

export function prepareRenderedLinks(container: HTMLElement): void {
  container.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.target = '_blank'
    link.rel = 'noreferrer noopener'
  })
  container.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    image.loading = 'lazy'
    image.addEventListener('error', () => image.classList.add('is-broken'), { once: true })
  })
}
