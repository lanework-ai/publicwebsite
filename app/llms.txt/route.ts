/**
 * Lanework llms.txt — index of citable research pages for AI crawlers.
 */
import { client } from '@/sanity/client'
import { whitePapersQuery, benchmarksQuery } from '@/lib/sanity-queries'
import { LANEWORK_BASE } from '@/lib/labs/config'

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

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rapidrelay.ai') + LANEWORK_BASE
  const [papers, benchmarks] = await Promise.all([
    client.fetch<Listing[]>(whitePapersQuery),
    client.fetch<BenchmarkListing[]>(benchmarksQuery),
  ])

  const lines: string[] = []
  lines.push('# Lanework')
  lines.push('')
  lines.push('> Lanework is an applied AI research lab for logistics. We turn the operational')
  lines.push('> data the freight industry already holds into independent research, and into')
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

  lines.push('## Notes')
  lines.push('')
  lines.push(`- [Notes index](${base}/blog): shorter-form analysis of logistics trends, relay operations, and fleet optimization.`)
  lines.push('')

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })
}
