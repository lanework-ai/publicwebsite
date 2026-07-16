/**
 * Builders that turn Sanity content docs into clean, self-contained Markdown for
 * the LLM-facing endpoints (`/llms-full.txt` and per-page `…/llms.txt`). Only
 * already-public preview content is included; the gated PDF asset is never
 * referenced. Reuses portableTextToMarkdown for block fields (methodology, body).
 */
import { portableTextToMarkdown } from './portable-text-to-markdown'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rapidrelay.ai'

interface Voice {
  quote: string
  name: string
  title?: string
  org?: string
  profileUrl?: string
  orgUrl?: string
  source?: string
}

interface Stat {
  value: string
  label: string
  source?: string
  sourceUrl?: string
}

interface Faq {
  question: string
  answer: string
}

function fmtDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function authorName(author?: { name?: string } | string | null): string | undefined {
  if (!author) return undefined
  return typeof author === 'string' ? author : author.name
}

function renderFindings(findings?: string[]): string[] {
  if (!findings?.length) return []
  return ['## Key findings', '', ...findings.map((f) => `- ${f}`), '']
}

function renderStats(stats?: Stat[]): string[] {
  if (!stats?.length) return []
  const lines = ['## By the numbers', '']
  for (const s of stats) {
    const src = s.source ? ` (Source: ${s.source}${s.sourceUrl ? ` — ${s.sourceUrl}` : ''})` : ''
    lines.push(`- **${s.value}** — ${s.label}${src}`)
  }
  lines.push('')
  return lines
}

function renderFaqs(faqs?: Faq[]): string[] {
  if (!faqs?.length) return []
  const lines = ['## FAQs', '']
  for (const f of faqs) {
    lines.push(`**Q: ${f.question}**`, '', f.answer, '')
  }
  return lines
}

function renderVoices(voices?: Voice[]): string[] {
  if (!voices?.length) return []
  const lines = ['## In their own words', '']
  for (const v of voices) {
    const attribution = [v.name, v.title, v.org].filter(Boolean).join(', ')
    const profile = v.profileUrl ? ` (${v.profileUrl})` : ''
    lines.push(`> "${v.quote}"`, `> — ${attribution}${profile}${v.source ? ` — ${v.source}` : ''}`, '')
  }
  return lines
}

function renderMethodology(methodology?: unknown): string[] {
  const md = portableTextToMarkdown(methodology)
  if (!md) return []
  return ['## Methodology', '', md, '']
}

function header(title: string, url: string, publishedAt?: string, author?: string, kind?: string): string[] {
  const meta = [
    publishedAt ? `Published ${fmtDate(publishedAt)}` : '',
    author ? `by ${author}` : '',
    kind,
  ]
    .filter(Boolean)
    .join(' · ')
  return [`# ${title}`, '', meta, '', `Source URL: ${url}`, '']
}

interface WhitePaperDoc {
  title: string
  slug: { current: string }
  description?: string
  publishedAt?: string
  author?: { name?: string } | string | null
  tldr?: string
  keyFindings?: string[]
  stats?: Stat[]
  methodology?: unknown
  faqs?: Faq[]
  featuredVoices?: Voice[]
}

export function whitePaperToMarkdown(doc: WhitePaperDoc): string {
  const url = `${siteUrl}/white-papers/${doc.slug.current}`
  const lines = [
    ...header(doc.title, url, doc.publishedAt, authorName(doc.author), 'Rapid Relay White Paper'),
  ]
  if (doc.description) lines.push(`_${doc.description}_`, '')
  if (doc.tldr) lines.push('## Summary', '', doc.tldr, '')
  lines.push(...renderFindings(doc.keyFindings))
  lines.push(...renderStats(doc.stats))
  lines.push(...renderMethodology(doc.methodology))
  lines.push(...renderVoices(doc.featuredVoices))
  lines.push(...renderFaqs(doc.faqs))
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

interface BenchmarkDoc {
  title: string
  slug: { current: string }
  description?: string
  period?: string
  series?: string
  publishedAt?: string
  author?: { name?: string } | string | null
  tldr?: string
  keyFindings?: string[]
  headlineMetrics?: Array<{ label: string; value: string; change?: string; source?: string }>
  dataTables?: Array<{ caption?: string; columns?: string[]; rows?: Array<{ cells?: string[] }> }>
  methodology?: unknown
  faqs?: Faq[]
  featuredVoices?: Voice[]
}

function renderMetrics(metrics?: BenchmarkDoc['headlineMetrics']): string[] {
  if (!metrics?.length) return []
  const lines = ['## Headline metrics', '']
  for (const m of metrics) {
    const change = m.change ? ` (${m.change})` : ''
    const src = m.source ? ` — ${m.source}` : ''
    lines.push(`- **${m.value}** — ${m.label}${change}${src}`)
  }
  lines.push('')
  return lines
}

function renderTables(tables?: BenchmarkDoc['dataTables']): string[] {
  if (!tables?.length) return []
  const lines: string[] = []
  for (const t of tables) {
    if (t.caption) lines.push(`### ${t.caption}`, '')
    if (t.columns?.length) {
      lines.push(`| ${t.columns.join(' | ')} |`)
      lines.push(`| ${t.columns.map(() => '---').join(' | ')} |`)
      for (const row of t.rows ?? []) {
        lines.push(`| ${(row.cells ?? []).join(' | ')} |`)
      }
      lines.push('')
    }
  }
  return lines
}

export function benchmarkToMarkdown(doc: BenchmarkDoc): string {
  const url = `${siteUrl}/benchmarks/${doc.slug.current}`
  const kind = `Rapid Relay Benchmark${doc.period ? ` · ${doc.period}` : ''}`
  const lines = [...header(doc.title, url, doc.publishedAt, authorName(doc.author), kind)]
  if (doc.description) lines.push(`_${doc.description}_`, '')
  if (doc.tldr) lines.push('## Summary', '', doc.tldr, '')
  lines.push(...renderMetrics(doc.headlineMetrics))
  lines.push(...renderFindings(doc.keyFindings))
  lines.push(...renderTables(doc.dataTables))
  lines.push(...renderMethodology(doc.methodology))
  lines.push(...renderVoices(doc.featuredVoices))
  lines.push(...renderFaqs(doc.faqs))
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

interface PostDoc {
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  author?: { name?: string } | string | null
  body?: unknown
  faqs?: Faq[]
}

export function postToMarkdown(doc: PostDoc): string {
  const url = `${siteUrl}/blog/${doc.slug.current}`
  const lines = [...header(doc.title, url, doc.publishedAt, authorName(doc.author), 'Rapid Relay Blog')]
  if (doc.excerpt) lines.push(`_${doc.excerpt}_`, '')
  const bodyMd = portableTextToMarkdown(doc.body)
  if (bodyMd) lines.push(bodyMd, '')
  lines.push(...renderFaqs(doc.faqs))
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}
