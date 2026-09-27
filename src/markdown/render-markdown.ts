import createDOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'
import { marked, Renderer, type Tokens } from 'marked'
import { stringify as stringifyYaml } from 'yaml'
import { mountIcons } from '../components/icons'
import { parseFrontmatter } from './frontmatter'
import { sanitizeUrl } from './url-policy'

const markdownRenderer = new Renderer()
markdownRenderer.code = ({ text, lang }) => {
  const language = lang?.trim().toLowerCase()
  const languageClass = language && /^[a-z0-9_+-]+$/u.test(language) ? ` language-${language}` : ''
  const highlighted = language && hljs.getLanguage(language)
    ? hljs.highlight(text, { language }).value
    : hljs.highlightAuto(text).value
  const label = language && /^[a-z0-9_+-]+$/u.test(language) ? escapeHtml(language) : 'Code'
  return `<pre class="markdown-code-block"><div class="markdown-code-header"><span class="markdown-code-language">${label}</span><button class="markdown-code-copy" type="button" aria-label="Copy code" data-copy-code>Copy</button></div><code class="hljs${languageClass}">${highlighted}</code></pre>`
}
markdownRenderer.blockquote = ({ tokens }: Tokens.Blockquote) => {
  const alertType = getAlertType(tokens)
  if (!alertType) return `<blockquote>\n${marked.Parser.parse(tokens)}\n</blockquote>\n`

  const iconName = getAlertIconName(alertType)
  if (!iconName) return `<blockquote>\n${marked.Parser.parse(tokens)}\n</blockquote>\n`
  return `<blockquote class="markdown-alert markdown-alert-${alertType.toLowerCase()}">\n<p class="markdown-alert-title"><i class="markdown-alert-icon" data-lucide="${iconName}"></i>${alertType}</p>\n${marked.Parser.parse(tokens)}\n</blockquote>\n`
}

function getAlertIconName(alertType: string): string | undefined {
  return {
    NOTE: 'info',
    TIP: 'lightbulb',
    IMPORTANT: 'circle-alert',
    WARNING: 'triangle-alert',
    CAUTION: 'octagon-alert',
  }[alertType]
}

marked.use({ renderer: markdownRenderer })

const DOMPurify = createDOMPurify(window)
DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName !== 'href' && data.attrName !== 'src') return
  data.attrValue = sanitizeUrl(data.attrValue ?? '') ?? ''
})

export function renderMarkdown(source: string): string {
  const frontmatter = parseFrontmatter(source)
  const markdown = frontmatter?.markdown ?? source
  const html = marked.parse(markdown, { gfm: true, breaks: false, async: false })
  const metadataHtml = frontmatter ? renderFrontmatter(frontmatter.metadata) : ''
  const sanitizedHtml = DOMPurify.sanitize(`${metadataHtml}${html}`, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'base', 'form'],
    FORBID_ATTR: ['style'],
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ['class', 'target', 'rel', 'loading', 'data-copy-code', 'aria-label', 'data-lucide'],
  })
  const container = document.createElement('div')
  container.innerHTML = sanitizedHtml
  mountIcons(container)
  return container.innerHTML
}

function getAlertType(tokens: Parameters<typeof marked.Parser.parse>[0]): string | undefined {
  const firstToken = tokens[0]
  if (firstToken?.type !== 'paragraph') return undefined
  const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s|$)/iu.exec(firstToken.text)
  if (!match) return undefined

  const title = match[1]?.toUpperCase()
  if (!title) return undefined
  const remaining = firstToken.text.slice(match[0].length).trimStart()
  const remainingTokens = remaining ? marked.lexer(remaining) : []
  tokens.splice(0, 1, ...(remainingTokens.length > 0 ? remainingTokens : [{ type: 'space', raw: '' }]))
  return title
}


function renderFrontmatter(metadata: Record<string, unknown>): string {
  const rows = Object.entries(metadata).map(([key, value]) => {
    const renderedValue = key === 'tags'
      ? (Array.isArray(value) ? value : [value])
        .map((tag) => `<span class="markdown-frontmatter-tag">${escapeHtml(formatMetadataValue(tag))}</span>`)
        .join(' ')
      : isMetadataMapping(value)
        ? `<pre class="markdown-frontmatter-block"><code>${escapeHtml(stringifyYaml(value, { collectionStyle: 'block', indent: 2, lineWidth: 0 }).trimEnd())}</code></pre>`
      : escapeHtml(formatMetadataValue(value))
    return `<tr><th scope="row">${escapeHtml(key)}</th><td>${renderedValue}</td></tr>`
  }).join('')

  return `<table class="markdown-frontmatter" aria-label="Document metadata"><tbody>${rows}</tbody></table>`
}

function isMetadataMapping(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function formatMetadataValue(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return value.map(formatMetadataValue).join(', ')
  if (typeof value === 'object') return JSON.stringify(value) ?? String(value)
  return String(value)
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/gu, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

export function prepareRenderedLinks(container: HTMLElement): void {
  mountIcons(container)
  container.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.target = '_blank'
    link.rel = 'noreferrer noopener'
  })
  container.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    image.loading = 'lazy'
    image.addEventListener('error', () => image.classList.add('is-broken'), { once: true })
  })
}
