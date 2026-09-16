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
      FORBID_ATTR: ['style', ' onerror', 'onclick'],
      ADD_ATTR: ['target', 'rel', 'loading'],
    })
  }
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/giu, '').replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/giu, '')
}

function inertUnsafeDestinations(html: string): string {
  return html.replace(/\s(href|src)=(['"])(.*?)\2/giu, (match, attribute: string, quote: string, value: string) => {
    const safeValue = sanitizeUrl(value)
    return safeValue ? ` ${attribute}=${quote}${safeValue}${quote}` : ''
  })
}

export async function renderMarkdown(source: string): Promise<string> {
  const html = await marked.parse(source, { gfm: true, breaks: false })
  return sanitizeHtml(inertUnsafeDestinations(addSourceRanges(html, source)))
}

function addSourceRanges(html: string, source: string): string {
  const blocks = source.split('\n\n')
  let cursor = 0
  return html.replace(/<(h[1-6]|p|blockquote|pre|ul|ol|table)([ >])/giu, (match, tag: string, suffix: string) => {
    const block = blocks.find((candidate) => source.indexOf(candidate, cursor) >= cursor) ?? ''
    const start = source.indexOf(block, cursor)
    const end = start + block.length
    cursor = end
    return `<${tag} data-source-start="${Math.max(0, start)}" data-source-end="${Math.max(0, end)}"${suffix}`
  })
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
