function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inlineMarkdownToHtml(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

export function markdownToEditableHtml(markdown: string) {
  const lines = markdown.split('\n')
  const output: string[] = []
  let listType: 'ul' | 'ol' | null = null

  function closeList() {
    if (!listType) return
    output.push(`</${listType}>`)
    listType = null
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      closeList()
      output.push('<p><br></p>')
      continue
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed)
    if (heading) {
      closeList()
      output.push(`<h${heading[1].length}>${inlineMarkdownToHtml(heading[2])}</h${heading[1].length}>`)
      continue
    }

    const unordered = /^[-*]\s+(.+)$/.exec(trimmed)
    if (unordered) {
      if (listType !== 'ul') {
        closeList()
        output.push('<ul>')
        listType = 'ul'
      }
      output.push(`<li>${inlineMarkdownToHtml(unordered[1])}</li>`)
      continue
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(trimmed)
    if (ordered) {
      if (listType !== 'ol') {
        closeList()
        output.push('<ol>')
        listType = 'ol'
      }
      output.push(`<li>${inlineMarkdownToHtml(ordered[1])}</li>`)
      continue
    }

    const quote = /^>\s+(.+)$/.exec(trimmed)
    if (quote) {
      closeList()
      output.push(`<blockquote>${inlineMarkdownToHtml(quote[1])}</blockquote>`)
      continue
    }

    closeList()
    output.push(`<p>${inlineMarkdownToHtml(line)}</p>`)
  }

  closeList()
  return output.join('')
}

function inlineNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (!(node instanceof HTMLElement)) return ''

  const content = Array.from(node.childNodes).map(inlineNodeToMarkdown).join('')
  const tag = node.tagName.toLowerCase()
  if (tag === 'strong' || tag === 'b') return `**${content}**`
  if (tag === 'em' || tag === 'i') return `*${content}*`
  if (tag === 'code') return `\`${content}\``
  if (tag === 'a') return `[${content}](${node.getAttribute('href') || ''})`
  if (tag === 'br') return '\n'
  return content
}

export function editableHtmlToMarkdown(root: HTMLElement) {
  const blocks = Array.from(root.children)
  if (blocks.length === 0) return root.textContent ?? ''

  return blocks
    .map((block) => {
      const tag = block.tagName.toLowerCase()
      const content = Array.from(block.childNodes).map(inlineNodeToMarkdown).join('').trim()
      if (!content) return ''
      if (tag === 'h1') return `# ${content}`
      if (tag === 'h2') return `## ${content}`
      if (tag === 'h3') return `### ${content}`
      if (tag === 'blockquote') return `> ${content}`
      if (tag === 'ul') {
        return Array.from(block.children)
          .map((item) => `- ${Array.from(item.childNodes).map(inlineNodeToMarkdown).join('').trim()}`)
          .join('\n')
      }
      if (tag === 'ol') {
        return Array.from(block.children)
          .map((item, index) => `${index + 1}. ${Array.from(item.childNodes).map(inlineNodeToMarkdown).join('').trim()}`)
          .join('\n')
      }
      return content
    })
    .join('\n\n')
}
