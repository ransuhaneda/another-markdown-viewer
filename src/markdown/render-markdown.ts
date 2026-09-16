import * as DOMPurifyModule from 'dompurify'
import { marked } from 'marked'

const purifyExport = (DOMPurifyModule.default ?? DOMPurifyModule) as unknown
const DOMPurify = typeof purifyExport === 'function' && typeof window !== 'undefined'
  ? purifyExport(window) as { sanitize: (html: string, options: object) => string }
  : null

const allowedTags = [
  'a', 'blockquote', 'br', 'code', 'del', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'img', 'li', 'ol', 'p', 'pre', 'strong', 'table', 'tbody', 'td',
  'tfoot', 'th', 'thead', 'tr', 'ul',
]

const allowedAttributes = ['alt', 'class', 'href', 'loading', 'rel', 'src', 'target', 'title']

function sanitizeHtml(html: string): string {
  if (DOMPurify) return DOMPurify.sanitize(html, { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttributes, FORBID_ATTR: ['style'], ADD_ATTR: ['target', 'rel', 'loading'] })
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/giu, '')
}

export async function renderMarkdown(source: string): Promise<string> {
  const html = await marked.parse(source, { gfm: true, breaks: false })
  return sanitizeHtml(html)
}

export function prepareRenderedLinks(container: HTMLElement): void {
  container.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.target = '_blank'
    link.rel = 'noreferrer noopener'
  })
  container.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    image.loading = 'lazy'
  })
}
