export function convertPastedContent(plainText: string, htmlText?: string): string {
  if (plainText.trim() && (!htmlText?.trim() || looksLikeMarkdown(plainText))) return plainText
  if (!htmlText?.trim()) return plainText

  if (typeof DOMParser === 'undefined') return convertHtmlWithoutDom(htmlText)
  const parsedDocument = new DOMParser().parseFromString(htmlText, 'text/html')
  return convertNode(parsedDocument.body).trim()
}

function looksLikeMarkdown(value: string): boolean {
  return /(?:^|\n)\s{0,3}(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```)|(?:\*\*|__|~~|`)|\[[^\]]+\]\([^)]*\)/u.test(value)
}

function convertNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (!(node instanceof HTMLElement)) return Array.from(node.childNodes).map(convertNode).join('')

  const tag = node.tagName.toLowerCase()
  const content = Array.from(node.childNodes).map(convertNode).join('')
  switch (tag) {
    case 'strong':
    case 'b': return `**${cleanInline(content)}**`
    case 'em':
    case 'i': return `*${cleanInline(content)}*`
    case 'del':
    case 's':
    case 'strike': return `~~${cleanInline(content)}~~`
    case 'code': return node.parentElement?.tagName.toLowerCase() === 'pre' ? content : `\`${content}\``
    case 'pre': return `${'```'}\n${node.textContent?.replace(/\n+$/u, '') ?? ''}\n${'```'}\n`
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const depth = Number(tag.slice(1))
      return `${'#'.repeat(depth)} ${cleanInline(content)}\n\n`
    }
    case 'blockquote': return `${content.trim().split(/\n+/u).map((line) => `> ${line}`).join('\n')}\n\n`
    case 'ol':
    case 'ul': return convertList(node, tag === 'ol')
    case 'li': return cleanInline(content)
    case 'p':
    case 'div':
    case 'section':
    case 'article': return `${content.trim()}\n\n`
    case 'br': return '\n'
    case 'hr': return '\n\n---\n\n'
    case 'a': {
      const href = node.getAttribute('href')
      return href ? `[${cleanInline(content)}](${href})` : content
    }
    case 'img': {
      const src = node.getAttribute('src')
      const alt = node.getAttribute('alt') ?? ''
      return src ? `![${alt}](${src})` : alt
    }
    case 'table': return convertTable(node)
    default: return content
  }
}

function convertList(list: HTMLElement, ordered: boolean): string {
  const items = Array.from(list.children).filter((child): child is HTMLElement => child.tagName.toLowerCase() === 'li')
  const lines = items.map((item, index) => {
    const nestedLists = Array.from(item.children).filter((child) => ['ol', 'ul'].includes(child.tagName.toLowerCase())) as HTMLElement[]
    const directNodes = Array.from(item.childNodes).filter((child) => !(child instanceof HTMLElement && ['ol', 'ul'].includes(child.tagName.toLowerCase())))
    const body = cleanInline(directNodes.map(convertNode).join(''))
    const marker = ordered ? `${index + 1}.` : '-'
    const nested = nestedLists.map((nestedList) => indent(convertList(nestedList, nestedList.tagName.toLowerCase() === 'ol'))).join('')
    return `${marker} ${body}${nested ? `\n${nested}` : ''}`
  })
  return `${lines.join('\n')}\n\n`
}

function convertTable(table: HTMLElement): string {
  const rows = Array.from(table.querySelectorAll('tr')).map((row) => Array.from(row.children).map((cell) => cleanInline(cell.textContent ?? '')))
  if (!rows.length) return ''
  const header = rows[0]
  if (!header) return ''
  const separator = header.map(() => '---')
  return `| ${header.join(' | ')} |\n| ${separator.join(' | ')} |\n${rows.slice(1).map((row) => `| ${row.join(' | ')} |`).join('\n')}\n\n`
}

function indent(value: string): string {
  return value.trimEnd().split('\n').map((line) => `  ${line}`).join('\n')
}

function cleanInline(value: string): string {
  return value.replace(/[ \t]*\n[ \t]*/gu, ' ').replace(/[ \t]{2,}/gu, ' ').trim()
}

function convertHtmlWithoutDom(html: string): string {
  let value = html
    .replace(/<br\s*\/?>/giu, '\n')
    .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gis, (_, depth: string, content: string) => `${'#'.repeat(Number(depth))} ${stripTags(content).trim()}\n\n`)
    .replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gis, (_, _tag: string, content: string) => `**${stripTags(content).trim()}**`)
    .replace(/<(em|i)[^>]*>(.*?)<\/\1>/gis, (_, _tag: string, content: string) => `*${stripTags(content).trim()}*`)
    .replace(/<(del|s|strike)[^>]*>(.*?)<\/\1>/gis, (_, _tag: string, content: string) => `~~${stripTags(content).trim()}~~`)
    .replace(/<pre[^>]*>\s*(?:<code[^>]*>)?(.*?)(?:<\/code>)?\s*<\/pre>/gis, (_, content: string) => `\n${'```'}\n${stripTags(content).trim()}\n${'```'}\n`)
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (_, content: string) => `\n${convertFallbackList(content, true)}`)
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_, content: string) => `\n${convertFallbackList(content, false)}`)
    .replace(/<p[^>]*>(.*?)<\/p>/gis, (_, content: string) => `${stripTags(content).trim()}\n\n`)
    .replace(/<li[^>]*>(.*?)<\/li>/gis, (_, content: string) => `- ${stripTags(content).trim()}\n`)
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]*\n[ \t]*/gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
  return value.trim()
}

function convertFallbackList(content: string, ordered: boolean): string {
  let index = 0
  return content.replace(/<li[^>]*>(.*?)<\/li>/gis, (_, item: string) => {
    index += 1
    const marker = ordered ? `${index}.` : '-'
    return `${marker} ${stripTags(item).trim()}\n`
  }) + '\n'
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, '')
}
