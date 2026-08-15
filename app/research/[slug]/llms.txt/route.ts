/** Markdown view of a Lanework research doc (white paper or benchmark) for LLMs. */
import { client } from '@/sanity/client'
import {
  whitePaperSlugsQuery,
  benchmarkSlugsQuery,
  getWhitePaperBySlug,
  getBenchmarkBySlug,
} from '@/lib/sanity-queries'
import { whitePaperToMarkdown, benchmarkToMarkdown } from '@/lib/llm-markdown'

export const revalidate = 86400

export async function generateStaticParams() {
  const [wp, bm] = await Promise.all([
    client.fetch<string[]>(whitePaperSlugsQuery),
    client.fetch<string[]>(benchmarkSlugsQuery),
  ])
  return [...wp, ...bm].map((slug) => ({ slug }))
}

const md = (body: string) =>
  new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Resolve in the same order as the detail page (white paper wins on a slug
  // collision) so both views agree on which doc a slug refers to.
  const wp = (await getWhitePaperBySlug(slug)) as any
  const bm = wp ? null : ((await getBenchmarkBySlug(slug)) as any)
  const doc = wp ?? bm
  // Mirror the detail page: a noIndex draft must not leak through the Markdown
  // view either, which is the one crawlers are most likely to fetch.
  if (!doc || doc.noIndex) return new Response('Not found', { status: 404 })
  return md(wp ? whitePaperToMarkdown(wp as never) : benchmarkToMarkdown(bm as never))
}
