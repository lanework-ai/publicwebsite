/**
 * Lanework llms-full.txt — full-text Markdown corpus of the public research
 * (TL;DR, findings, sourced stats, methodology, FAQs, attributed quotes). Gated
 * PDF assets are never included.
 */
import { client } from '@/sanity/client'
import { whitePaperToMarkdown, benchmarkToMarkdown, postToMarkdown } from '@/lib/llm-markdown'
import { LANEWORK_BASE } from '@/lib/labs/config'

export const revalidate = 86400

const corpusQuery = `{
  "whitePapers": *[_type == "whitePaper" && noIndex != true && defined(publishedAt)] | order(publishedAt desc) {
    title, slug, description, publishedAt, tldr, keyFindings, stats, methodology, faqs, featuredVoices,
    "author": author->name
  },
  "benchmarks": *[_type == "benchmark" && noIndex != true && defined(publishedAt)] | order(publishedAt desc) {
    title, slug, description, series, period, publishedAt, tldr, keyFindings, headlineMetrics, dataTables, methodology, faqs, featuredVoices,
    "author": author->name
  },
  "posts": *[_type == "post" && noIndex != true && defined(publishedAt)] | order(publishedAt desc)[0...25] {
    title, slug, excerpt, publishedAt, body, faqs,
    "author": author->name
  }
}`

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rapidrelay.ai') + LANEWORK_BASE
  const { whitePapers, benchmarks, posts } = await client.fetch<{ whitePapers: any[]; benchmarks: any[]; posts: any[] }>(corpusQuery)

  const sections: string[] = []
  sections.push('# Lanework — Full Research Corpus')
  sections.push(
    'Lanework is an applied AI research lab for logistics. This document contains the full public ' +
      'text of our research on driver retention, asset utilization, and the operational data behind ' +
      'freight P&L performance.'
  )
  sections.push(`Canonical site: ${base} · Index: ${base}/llms.txt`)

  for (const wp of whitePapers ?? []) sections.push(whitePaperToMarkdown(wp))
  for (const b of benchmarks ?? []) sections.push(benchmarkToMarkdown(b))
  for (const p of posts ?? []) sections.push(postToMarkdown(p))

  const body = sections.join('\n\n---\n\n').trim() + '\n'

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })
}
