/**
 * Minimal, dependency-free Portable Text -> Markdown serializer.
 *
 * Covers the block features used in this project's content (see
 * components/Resources/RichText.tsx): normal / h3 / blockquote blocks, bullet
 * and numbered lists, and strong / em / link marks. Used to render Sanity block
 * content (methodology, blog body) as clean Markdown for the LLM-facing
 * `llms.txt` / `llms-full.txt` endpoints.
 */

interface Span {
  _type: 'span'
  text?: string
  marks?: string[]
}

interface MarkDef {
  _key: string
  _type: string
  href?: string
}

interface Block {
  _type: string
  style?: string
  listItem?: 'bullet' | 'number'
  level?: number
  children?: Span[]
  markDefs?: MarkDef[]
}

function renderSpans(children: Span[] = [], markDefs: MarkDef[] = []): string {
  return children
    .map((span) => {
      let text = span.text ?? ''
      if (!text) return ''
      for (const mark of span.marks ?? []) {
        if (mark === 'strong') {
          text = `**${text}**`
        } else if (mark === 'em') {
          text = `_${text}_`
        } else {
          const def = markDefs.find((d) => d._key === mark)
          if (def?._type === 'link' && def.href) {
            text = `[${text}](${def.href})`
          }
        }
      }
      return text
    })
    .join('')
}

export function portableTextToMarkdown(blocks: unknown): string {
  if (!Array.isArray(blocks)) return ''

  const lines: string[] = []
  let numberCounter = 0

  for (const raw of blocks as Block[]) {
    if (!raw || raw._type !== 'block') continue
    const text = renderSpans(raw.children, raw.markDefs).trim()
    if (!text) continue

    if (raw.listItem === 'bullet') {
      lines.push(`- ${text}`)
      numberCounter = 0
      continue
    }
    if (raw.listItem === 'number') {
      numberCounter += 1
      lines.push(`${numberCounter}. ${text}`)
      continue
    }
    numberCounter = 0

    switch (raw.style) {
      case 'h3':
        lines.push(`### ${text}`)
        break
      case 'blockquote':
        lines.push(`> ${text}`)
        break
      default:
        lines.push(text)
    }
  }

  // Join with blank lines so paragraphs/headings separate; keep consecutive list
  // items tight (they already render fine with single newlines in Markdown).
  return lines.join('\n\n')
}
