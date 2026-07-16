/** Markdown view of a Lanework note (blog post) for LLMs. */
import { client } from '@/sanity/client'
import { postSlugsQuery, getPostBySlug } from '@/lib/sanity-queries'
import { postToMarkdown } from '@/lib/llm-markdown'

export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(postSlugsQuery)
  return slugs.map((slug) => ({ slug }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = await getPostBySlug(slug)
  if (!doc) return new Response('Not found', { status: 404 })
  return new Response(postToMarkdown(doc as never), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })
}
