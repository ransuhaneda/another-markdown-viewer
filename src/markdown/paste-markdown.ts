export function convertPastedContent(plainText: string, htmlText?: string): string {
  if (plainText.trim()) return plainText
  if (!htmlText?.trim()) return ''

  if (typeof DOMParser === 'undefined') return convertHtmlWithoutDom(htmlText)
  const parsedDocument = new DOMParser().parseFromString(htmlText, 'text/html')
  return convertNode(parsedDocument.body).trim()
}

function convertNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (!(node instanceof HTMLElement)) return Array.from(node.childNodes).map(convertNode).join('')

  const content = Array.from(node.childNodes).map(convertNode).join('')
  switch (node.tagName.toLowerCase()) {
    case 'strong':
    case 'b': return `**${content.trim()}**`
    case 'em':
    case 'i': return `*${content.trim()}*`
    case 'code': return `\`${content}\``
    case 'h1': return `# ${content.trim()}\n\n`
    case 'h2': return `## ${content.trim()}\n\n`
    case 'h3': return `### ${content.trim()}\n\n`
    case 'blockquote': return content.trim().split('\n').map((line) => `> ${line}`).join('\n') + '\n\n'
    case 'li': return `- ${content.trim()}\n`
    case 'p':
    case 'div': return `${content.trim()}\n\n`
    case 'br': return '\n'
    case 'a': {
      const href = node.getAttribute('href')
      return href ? `[${content.trim()}](${href})` : content
    }
    default: return content
  }
}

function convertHtmlWithoutDom(html: string): string {
  return html
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, (_, content: string) => `## ${stripTags(content).trim()}\n\n`)
    .replace(/<strong[^>]*>(.*?)<\/strong>/gis, (_, content: string) => `**${stripTags(content).trim()}**`)
    .replace(/<p[^>]*>(.*?)<\/p>/gis, (_, content: string) => `${stripTags(content).trim()}\n\n`)
    .replace(/<[^>]+>/g, '')
    .trim()
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, '')
}
