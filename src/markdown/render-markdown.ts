import createDOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'
import { marked, Renderer } from 'marked'
import { sanitizeUrl } from './url-policy'

const markdownRenderer = new Renderer()
markdownRenderer.code = ({ text, lang }) => {
  const language = lang?.trim().toLowerCase()
  const languageClass = language && /^[a-z0-9_+-]+$/u.test(language) ? ` language-${language}` : ''
  const highlighted = language && hljs.getLanguage(language)
    ? hljs.highlight(text, { language }).value
    : hljs.highlightAuto(text).value
  return `<pre><code class="hljs${languageClass}">${highlighted}</code></pre>`
}

marked.use({ renderer: markdownRenderer })

const DOMPurify = createDOMPurify(window)
DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName !== 'href' && data.attrName !== 'src') return
  data.attrValue = sanitizeUrl(data.attrValue ?? '') ?? ''
})

export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { gfm: true, breaks: false, async: false })
  return DOMPurify.sanitize(addSourceRanges(html, source), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'base', 'form'],
    FORBID_ATTR: ['style'],
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ['data-source-start', 'data-source-end', 'target', 'rel', 'loading'],
  })
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
