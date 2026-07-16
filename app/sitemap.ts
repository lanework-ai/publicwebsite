import { MetadataRoute } from 'next'
import { client } from '@/sanity/client'
import {
  postsSitemapQuery,
  whitePapersSitemapQuery,
  benchmarksSitemapQuery,
} from '@/lib/sanity-queries'
import { caseStudies } from '@/lib/labs/case-studies'

// On Lanework, white papers and benchmarks both render under /research/[slug];
// blog posts under /blog/[slug]. Paid /lp pages are intentionally excluded.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lanework.ai'

  const [posts, whitePapers, benchmarks] = await Promise.all([
    client.fetch<{ slug: string; _updatedAt: string }[]>(postsSitemapQuery),
    client.fetch<{ slug: string; _updatedAt: string }[]>(whitePapersSitemapQuery),
    client.fetch<{ slug: string; _updatedAt: string }[]>(benchmarksSitemapQuery),
  ])

  const research: MetadataRoute.Sitemap = [...whitePapers, ...benchmarks].map((d) => ({
    url: `${baseUrl}/research/${d.slug}`,
    lastModified: new Date(d._updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const caseStudyPages: MetadataRoute.Sitemap = caseStudies.map((c) => ({
    url: `${baseUrl}/case-studies/${c.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/research`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/products`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/products/rapid-relay`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/case-studies`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/who-we-serve`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/careers`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/connect`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/terms-and-conditions`, changeFrequency: 'yearly', priority: 0.4 },
  ]

  return [...staticPages, ...research, ...blogPosts, ...caseStudyPages]
}
