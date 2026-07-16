import { client } from '@/sanity/client'
import { researchFeedQuery } from '@/lib/sanity-queries'
import { LANEWORK_BASE } from '@/lib/labs/config'

export const revalidate = 86400

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rapidrelay.ai') + LANEWORK_BASE

interface FeedItem {
  _type: 'whitePaper' | 'benchmark' | 'post'
  title: string
  slug: string
  publishedAt: string
  _updatedAt: string
  summary?: string
  author?: string
  voices?: string[]
}

// Lanework merges white papers + benchmarks under /research; posts are Notes.
const pathFor = (type: FeedItem['_type'], slug: string) =>
  type === 'post' ? `/blog/${slug}` : `/research/${slug}`

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function GET() {
  const items = await client.fetch<FeedItem[]>(researchFeedQuery)
  const lastBuild = items[0]?._updatedAt || new Date().toISOString()

  const body = items
    .filter((i) => i.slug)
    .map((i) => {
      const url = `${base}${pathFor(i._type, i.slug)}`
      const voiceLine = i.voices && i.voices.length > 0 ? ` Featuring: ${i.voices.filter(Boolean).join(', ')}.` : ''
      const description = `${i.summary || ''}${voiceLine}`.trim()
      return `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${new Date(i.publishedAt).toUTCString()}</pubDate>
      ${i.author ? `<dc:creator>${esc(i.author)}</dc:creator>` : ''}
      <description>${esc(description)}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Lanework Research</title>
    <link>${base}/research</link>
    <atom:link href="${base}/research/feed.xml" rel="self" type="application/rss+xml" />
    <description>Applied research on how freight moves: driver retention, carrier performance, asset utilization, and the operational data behind fleet results.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
${body}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 's-maxage=3600, stale-while-revalidate' },
  })
}
