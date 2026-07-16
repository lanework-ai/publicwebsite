import { cache } from 'react'
import { client } from '@/sanity/client'

// Query for all published posts (excluding noIndex posts)
export const postsQuery = `*[_type == "post" && noIndex != true] | order(publishedAt desc)[0...1000] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  readTime,
  mainImage {
    asset->{
      _id,
      url
    },
    alt
  },
  "author": author->name,
  "categories": categories[]->title
}`

// Unified feed query: white papers + benchmarks + blog posts, newest first.
// Powers the research RSS feed (app/research/feed.xml). Excludes noIndex docs.
export const researchFeedQuery = `*[
  _type in ["whitePaper", "benchmark", "post"] && noIndex != true && defined(publishedAt)
] | order(publishedAt desc)[0...50] {
  _type,
  title,
  "slug": slug.current,
  publishedAt,
  _updatedAt,
  "summary": coalesce(seoDescription, description, excerpt, tldr),
  "author": author->name,
  "voices": featuredVoices[].name
}`

// Query for a single post by slug
export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  slug,
  excerpt,
  publishedAt,
  readTime,
  mainImage {
    asset->{
      _id,
      url
    },
    alt
  },
  body,
  keywords,
  focusKeyword,
  seoTitle,
  seoDescription,
  ogImage {
    asset->{
      _id,
      url
    },
    alt
  },
  canonicalUrl,
  noIndex,
  faqs,
  "author": author->{
    name,
    bio
  },
  "categories": categories[]->title,
  "relatedPosts": relatedPosts[]->{
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    readTime,
    mainImage {
      asset->{
        _id,
        url
      },
      alt
    },
    "author": author->name,
    "categories": categories[]->title
  }
}`

// Query to get all post slugs (for generateStaticParams)
export const postSlugsQuery = `*[_type == "post" && noIndex != true][0...1000].slug.current`

// Query to get all posts with their update timestamps (for sitemap)
export const postsSitemapQuery = `*[_type == "post" && noIndex != true][0...1000] {
  "slug": slug.current,
  _updatedAt
}`

// Cached per-request fetch (deduplicates calls between generateMetadata and the page component)
export const getPostBySlug = cache(async (slug: string) => {
  return client.fetch(postBySlugQuery, { slug })
})

// =============================================================================
// White Papers
// =============================================================================

// All published white papers for the index page (excluding noIndex)
export const whitePapersQuery = `*[_type == "whitePaper" && noIndex != true] | order(publishedAt desc)[0...1000] {
  _id,
  title,
  slug,
  description,
  publishedAt,
  readTime,
  funnelStage,
  coverImage {
    asset->{ _id, url },
    alt
  },
  "author": author->name,
  "categories": categories[]->title
}`

// Full single white paper by slug (used for the detail page)
export const whitePaperBySlugQuery = `*[_type == "whitePaper" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  slug,
  description,
  publishedAt,
  readTime,
  funnelStage,
  coverImage {
    asset->{ _id, url },
    alt
  },
  tldr,
  keyFindings,
  stats,
  methodology,
  faqs,
  featuredVoices,
  keywords,
  focusKeyword,
  seoTitle,
  seoDescription,
  ogImage {
    asset->{ _id, url },
    alt
  },
  canonicalUrl,
  noIndex,
  "author": author->{ name, bio, jobTitle, "sameAs": sameAs, "image": image.asset->url },
  "categories": categories[]->title,
  "categoryIds": categories[]->_id,
  "hasPdf": defined(pdfFile.asset),
  // Note: pdfFile asset URL is intentionally NOT exposed here. It is only resolved
  // server-side inside the download API route after token validation.
  "relatedWhitePapers": relatedWhitePapers[]->{
    _id,
    title,
    slug,
    description,
    publishedAt,
    readTime,
    funnelStage,
    coverImage { asset->{ _id, url }, alt }
  },
  "relatedBenchmarks": relatedBenchmarks[]->{
    _id,
    title,
    slug,
    description,
    period,
    series,
    publishedAt,
    coverImage { asset->{ _id, url }, alt }
  },
  "relatedPosts": relatedPosts[]->{
    _id,
    title,
    slug,
    excerpt,
    readTime,
    publishedAt,
    "category": categories[0]->title,
    mainImage { asset->{ _id, url }, alt }
  }
}`

// Slugs for generateStaticParams + sitemap
export const whitePaperSlugsQuery = `*[_type == "whitePaper" && noIndex != true][0...1000].slug.current`

export const whitePapersSitemapQuery = `*[_type == "whitePaper" && noIndex != true][0...1000] {
  "slug": slug.current,
  _updatedAt
}`

// Server-side-only: resolves the gated PDF asset URL by slug. Only ever called from
// inside the /api/gated-content/download route handler after token validation.
export const whitePaperPdfBySlugQuery = `*[_type == "whitePaper" && slug.current == $slug][0] {
  title,
  "pdfUrl": pdfFile.asset->url
}`

export const getWhitePaperBySlug = cache(async (slug: string) => {
  return client.fetch(whitePaperBySlugQuery, { slug })
})

// =============================================================================
// Related-resources relevance mechanism (white papers + blog posts)
//
// Used to lead a reader from one piece of research into more. Tiered so it works
// with or without editor curation:
//   1. curated relations (relatedWhitePapers / relatedPosts on the doc)
//   2. shared-category matches (automatic relevance)
//   3. latest content (fallback, so the section is never empty)
// =============================================================================

const relatedWpProjection = `
  _id, title, slug, description, readTime, publishedAt,
  coverImage { asset->{ _id, url }, alt }
`
const relatedPostProjection = `
  _id, title, slug, excerpt, readTime, publishedAt,
  "category": categories[0]->title,
  mainImage { asset->{ _id, url }, alt }
`

// Tier 2: content sharing at least one category with the current paper.
export const relatedByCategoryQuery = `{
  "whitePapers": *[_type == "whitePaper" && _id != $currentId && noIndex != true
    && count(categories[@._ref in $categoryIds]) > 0] | order(publishedAt desc)[0...3]{ ${relatedWpProjection} },
  "posts": *[_type == "post" && count(categories[@._ref in $categoryIds]) > 0]
    | order(publishedAt desc)[0...3]{ ${relatedPostProjection} }
}`

// Tier 3: newest content regardless of category.
export const latestResourcesQuery = `{
  "whitePapers": *[_type == "whitePaper" && _id != $currentId && noIndex != true]
    | order(publishedAt desc)[0...3]{ ${relatedWpProjection} },
  "posts": *[_type == "post"] | order(publishedAt desc)[0...3]{ ${relatedPostProjection} }
}`

type RelatedResources = { whitePapers: any[]; posts: any[] }

const dedupeById = (arr: any[]): any[] => {
  const seen = new Set<string>()
  const out: any[] = []
  for (const it of arr) {
    if (it?._id && !seen.has(it._id)) {
      seen.add(it._id)
      out.push(it)
    }
  }
  return out
}

/**
 * Resolve up to 3 related white papers + 3 related blog posts for a research doc,
 * curated-first then filled by shared category, then by recency. See tier notes above.
 */
export const getRelatedResources = cache(
  async (opts: {
    currentId: string
    categoryIds?: string[]
    curatedWhitePapers?: any[]
    curatedPosts?: any[]
  }): Promise<RelatedResources> => {
    // GROQ projections return null (not undefined) for empty arrays, so coalesce
    // with ?? rather than relying on destructuring defaults.
    const currentId = opts.currentId
    const categoryIds = opts.categoryIds ?? []
    const curatedWhitePapers = opts.curatedWhitePapers ?? []
    const curatedPosts = opts.curatedPosts ?? []

    let auto: RelatedResources = { whitePapers: [], posts: [] }
    if (categoryIds.length > 0) {
      auto = await client.fetch(relatedByCategoryQuery, { currentId, categoryIds })
    }

    let whitePapers = dedupeById([...(curatedWhitePapers ?? []), ...(auto.whitePapers ?? [])])
    let posts = dedupeById([...(curatedPosts ?? []), ...(auto.posts ?? [])])

    if (whitePapers.length === 0 || posts.length === 0) {
      const latest: RelatedResources = await client.fetch(latestResourcesQuery, { currentId })
      if (whitePapers.length === 0) whitePapers = dedupeById(latest.whitePapers ?? [])
      if (posts.length === 0) posts = dedupeById(latest.posts ?? [])
    }

    return { whitePapers: whitePapers.slice(0, 3), posts: posts.slice(0, 3) }
  }
)

// =============================================================================
// Benchmarks
// =============================================================================

// All published benchmarks for the index page (excluding noIndex), grouped client-side by series
export const benchmarksQuery = `*[_type == "benchmark" && noIndex != true] | order(publishedAt desc)[0...1000] {
  _id,
  title,
  slug,
  description,
  series,
  period,
  publishedAt,
  funnelStage,
  coverImage {
    asset->{ _id, url },
    alt
  },
  "author": author->name
}`

// Full single benchmark by slug (used for the detail page)
export const benchmarkBySlugQuery = `*[_type == "benchmark" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  slug,
  description,
  series,
  period,
  publishedAt,
  funnelStage,
  "hasPdf": defined(pdfFile.asset),
  coverImage {
    asset->{ _id, url },
    alt
  },
  tldr,
  keyFindings,
  headlineMetrics,
  dataTables,
  chartImages[] {
    asset->{ _id, url },
    alt,
    caption
  },
  methodology,
  faqs,
  featuredVoices,
  keywords,
  focusKeyword,
  seoTitle,
  seoDescription,
  ogImage {
    asset->{ _id, url },
    alt
  },
  canonicalUrl,
  noIndex,
  "author": author->{ name, bio, jobTitle, "sameAs": sameAs, "image": image.asset->url },
  "relatedWhitePapers": relatedWhitePapers[]->{
    _id,
    title,
    slug,
    description,
    publishedAt,
    readTime,
    funnelStage,
    coverImage { asset->{ _id, url }, alt }
  }
}`

// All editions in a series (for prev/next navigation on the detail page)
export const benchmarkSeriesQuery = `*[_type == "benchmark" && series == $series && noIndex != true] | order(publishedAt desc) {
  _id,
  title,
  slug,
  period,
  publishedAt
}`

export const benchmarkSlugsQuery = `*[_type == "benchmark" && noIndex != true][0...1000].slug.current`

export const benchmarksSitemapQuery = `*[_type == "benchmark" && noIndex != true][0...1000] {
  "slug": slug.current,
  _updatedAt
}`

// Server-side-only: resolves the gated PDF asset URL.
export const benchmarkPdfBySlugQuery = `*[_type == "benchmark" && slug.current == $slug][0] {
  title,
  "pdfUrl": pdfFile.asset->url
}`

export const getBenchmarkBySlug = cache(async (slug: string) => {
  return client.fetch(benchmarkBySlugQuery, { slug })
})

export const getBenchmarkSeries = cache(async (series: string) => {
  return client.fetch(benchmarkSeriesQuery, { series })
})

// =============================================================================
// Paid landing pages (/lp/[slug]) need to resolve a slug to either a whitePaper
// or benchmark. This query returns whichever exists for the slug, with the
// minimum fields needed to render the LP.
// =============================================================================
export const lpDocBySlugQuery = `*[
  (_type == "whitePaper" || _type == "benchmark")
  && slug.current == $slug
  && noIndex != true
][0] {
  _id,
  _type,
  title,
  slug,
  description,
  coverImage {
    asset->{ _id, url },
    alt
  },
  ogImage {
    asset->{ _id, url },
    alt
  },
  tldr,
  seoTitle,
  seoDescription,
  keywords
}`

export const lpSlugsQuery = `*[
  (_type == "whitePaper" || _type == "benchmark")
  && noIndex != true
][0...2000].slug.current`

export const getLpDocBySlug = cache(async (slug: string) => {
  return client.fetch(lpDocBySlugQuery, { slug })
})
