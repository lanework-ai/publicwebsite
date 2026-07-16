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
  const wp = await getWhitePaperBySlug(slug)
  if (wp) return md(whitePaperToMarkdown(wp as never))
  const bm = await getBenchmarkBySlug(slug)
  if (bm) return md(benchmarkToMarkdown(bm as never))
  return new Response('Not found', { status: 404 })
}
