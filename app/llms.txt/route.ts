/**
 * Lanework llms.txt — index of citable research pages for AI crawlers.
 */
import { client } from '@/sanity/client'
import { whitePapersQuery, benchmarksQuery, postsQuery } from '@/lib/sanity-queries'
import { LANEWORK_BASE } from '@/lib/labs/config'
import { fieldWork } from '@/lib/labs/field-work'

export const revalidate = 86400

interface Listing {
  title: string
  slug: { current: string }
  description: string
}
interface BenchmarkListing extends Listing {
  series: string
  period: string
}
interface PostListing {
  title: string
  slug: { current: string }
  excerpt?: string
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lanework.ai') + LANEWORK_BASE
  const [papers, benchmarks, posts] = await Promise.all([
    client.fetch<Listing[]>(whitePapersQuery),
    client.fetch<BenchmarkListing[]>(benchmarksQuery),
    client.fetch<PostListing[]>(postsQuery),
  ])

  const lines: string[] = []
  lines.push('# Lanework')
  lines.push('')
  lines.push('> Lanework is an applied AI research lab for logistics and supply chain, covering')
  lines.push('> freight, fulfillment, and warehousing. We turn the operational data operators')
  lines.push('> already hold into independent research, and into')
  lines.push('> software when it proves out.')
  lines.push('')
  lines.push(`Canonical site: ${base}`)
  lines.push('')
  lines.push('## For LLMs')
  lines.push('')
  lines.push(`- Full-text corpus of all research in Markdown: ${base}/llms-full.txt`)
  lines.push('- Any white paper, benchmark, or note is also available as Markdown by appending `/llms.txt` to its URL (e.g. `' + base + '/research/<slug>/llms.txt`).')
  lines.push('')

  if (papers.length > 0) {
    lines.push('## White papers')
    lines.push('')
    for (const p of papers) lines.push(`- [${p.title}](${base}/research/${p.slug.current}): ${p.description}`)
    lines.push('')
  }

  if (benchmarks.length > 0) {
    lines.push('## Benchmarks & scorecards')
    lines.push('')
    for (const b of benchmarks) lines.push(`- [${b.title}](${base}/research/${b.slug.current}): ${b.description} (Series: ${b.series}, Period: ${b.period})`)
    lines.push('')
  }

  if (fieldWork.length > 0) {
    lines.push('## Field work')
    lines.push('')
    lines.push('Deployments where the research met a live operation, and the software that remained.')
    lines.push('')
    for (const f of fieldWork) {
      const results = f.results?.length
        ? ` Measured: ${f.results.map((r) => `${r.value} ${r.label}`).join('; ')}.`
        : ''
      lines.push(
        `- [${f.title}](${base}/field-work/${f.slug}): ${f.summary} (Product: ${f.product}, Domain: ${f.domain}, Status: ${f.status}).${results}`
      )
    }
    lines.push('')
  }

  lines.push('## Notes')
  lines.push('')
  lines.push(`- [Notes index](${base}/blog): shorter-form analysis of logistics trends, relay operations, and fleet optimization.`)
  for (const p of posts) {
    lines.push(`- [${p.title}](${base}/blog/${p.slug.current})${p.excerpt ? `: ${p.excerpt}` : ''}`)
  }
  lines.push('')

  lines.push('## Company')
  lines.push('')
  lines.push(`- [About](${base}/about): who Lanework is, and how a study, an embedded engagement, and a build fit together.`)
  lines.push(`- [Engagements](${base}/engagements): how to work with us, from a free network readiness snapshot through network assessments and operational due diligence for investors.`)
  lines.push(`- [Careers](${base}/careers): open roles in engineering, operations, and research.`)
  lines.push(`- [Contact](${base}/connect): start a conversation.`)
  lines.push('')

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })
}
