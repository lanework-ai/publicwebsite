/**
 * Shared SEO metadata and structured data.
 *
 * The Sanity queries in lib/sanity-queries.ts already return seoTitle,
 * seoDescription, ogImage, canonicalUrl, keywords, publishedAt and _updatedAt for
 * posts, white papers and benchmarks. Before this module every generateMetadata
 * returned only a title and discarded the rest, so each article inherited the
 * site-wide description and the generic OG image. Everything here reads fields
 * that are already being fetched; no query or schema change is needed.
 */
import type { Metadata } from 'next'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lanework.ai'
export const DEFAULT_OG_IMAGE = '/og-image.png'

/** Stable @id anchors for the Organization and WebSite nodes in app/layout.tsx. */
export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`

interface SanityImage {
  asset?: { url?: string } | null
  alt?: string
}

interface SanityAuthor {
  name?: string
  bio?: string
  jobTitle?: string
  sameAs?: string[]
  image?: string
}

export interface SeoDoc {
  title?: string
  seoTitle?: string
  seoDescription?: string
  description?: string
  excerpt?: string
  tldr?: string
  keywords?: string[]
  canonicalUrl?: string
  noIndex?: boolean
  publishedAt?: string
  _updatedAt?: string
  ogImage?: SanityImage | null
  coverImage?: SanityImage | null
  mainImage?: SanityImage | null
  author?: SanityAuthor | string | null
  faqs?: { question?: string; answer?: string }[]
}

export function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Next.js merges `metadata` shallowly, so any page that sets `alternates` for a
 * canonical replaces the root layout's `alternates` wholesale and would drop the
 * RSS link. Every helper here rebuilds the full set.
 *
 * `markdownPath` points at the Markdown view of the current document where one
 * exists (research and notes both serve `<url>/llms.txt`), otherwise at the
 * site-wide corpus index. That is the machine-readable counterpart to the page
 * and the main discovery hook for answer engines.
 */
function alternatesFor(canonical: string, markdownPath = '/llms.txt') {
  return {
    canonical,
    types: {
      'application/rss+xml': absoluteUrl('/research/feed.xml'),
      'text/markdown': absoluteUrl(markdownPath),
    },
  }
}

/**
 * Mirrors the coalesce(seoDescription, description, excerpt, tldr) ordering the
 * research feed query already uses, so a doc reads the same everywhere.
 */
export function pickDescription(doc: SeoDoc): string | undefined {
  const raw = doc.seoDescription || doc.description || doc.excerpt || doc.tldr
  if (!raw) return undefined
  const flat = raw.replace(/\s+/g, ' ').trim()
  // Search engines truncate around 160 characters; cut on a word boundary so the
  // snippet does not end mid-word.
  if (flat.length <= 160) return flat
  return `${flat.slice(0, 157).replace(/\s+\S*$/, '')}...`
}

export function pickImage(doc: SeoDoc): string {
  return (
    doc.ogImage?.asset?.url ||
    doc.coverImage?.asset?.url ||
    doc.mainImage?.asset?.url ||
    absoluteUrl(DEFAULT_OG_IMAGE)
  )
}

export function authorName(doc: SeoDoc): string | undefined {
  if (!doc.author) return undefined
  return typeof doc.author === 'string' ? doc.author : doc.author.name
}

/**
 * Full page metadata for a CMS-backed document.
 *
 * `path` is the site-relative canonical path, e.g. `/research/some-slug`. A
 * canonicalUrl set in Sanity wins over it, which is how a syndicated piece can
 * point at its original home.
 */
export function docMetadata({
  doc,
  path,
  titleSuffix = 'Lanework',
  hasMarkdownView = true,
}: {
  doc: SeoDoc
  path: string
  titleSuffix?: string
  /** Research and notes serve `<path>/llms.txt`; set false for anything that does not. */
  hasMarkdownView?: boolean
}): Metadata {
  const title = doc.seoTitle || doc.title || 'Lanework'
  const description = pickDescription(doc)
  const image = pickImage(doc)
  const canonical = doc.canonicalUrl || absoluteUrl(path)
  const author = authorName(doc)

  // An editor-written seoTitle is used verbatim. Several already carry their own
  // brand suffix ("... | Lanework Technologies"), and appending ours produced
  // doubled-up titles like "X | Lanework Technologies · Lanework". Only the
  // fallback path, where the title is just the headline, gets the suffix.
  const pageTitle = doc.seoTitle ? doc.seoTitle : `${title} · ${titleSuffix}`

  return {
    title: pageTitle,
    description,
    keywords: doc.keywords?.length ? doc.keywords : undefined,
    alternates: alternatesFor(canonical, hasMarkdownView ? `${path}/llms.txt` : '/llms.txt'),
    ...(doc.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'article',
      url: canonical,
      siteName: 'Lanework',
      title,
      description,
      images: [{ url: image, alt: doc.title || 'Lanework' }],
      publishedTime: doc.publishedAt,
      modifiedTime: doc._updatedAt || doc.publishedAt,
      authors: author ? [author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

/** Metadata for a static (non-CMS) page. */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string
  description?: string
  path: string
  noIndex?: boolean
}): Metadata {
  const canonical = absoluteUrl(path)
  return {
    title,
    description,
    alternates: alternatesFor(canonical),
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: 'Lanework',
      title,
      description,
      images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE), alt: 'Lanework' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
  }
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

function authorNode(doc: SeoDoc) {
  if (!doc.author) return { '@id': ORG_ID }
  if (typeof doc.author === 'string') return { '@type': 'Person', name: doc.author }
  const a = doc.author
  return {
    '@type': 'Person',
    name: a.name,
    ...(a.jobTitle ? { jobTitle: a.jobTitle } : {}),
    ...(a.bio ? { description: a.bio } : {}),
    ...(a.image ? { image: a.image } : {}),
    ...(a.sameAs?.length ? { sameAs: a.sameAs } : {}),
  }
}

/**
 * Article-family node. `type` is BlogPosting for notes and Report for research,
 * which is the closest schema.org type for a published white paper or benchmark.
 * isPartOf and publisher point at the WebSite and Organization nodes declared in
 * the root layout so the graph connects instead of floating.
 */
export function articleSchema({
  doc,
  path,
  type,
}: {
  doc: SeoDoc
  path: string
  type: 'BlogPosting' | 'Report'
}) {
  const url = doc.canonicalUrl || absoluteUrl(path)
  const description = pickDescription(doc)
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#article`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: doc.title,
    ...(description ? { description } : {}),
    image: pickImage(doc),
    ...(doc.publishedAt ? { datePublished: doc.publishedAt } : {}),
    dateModified: doc._updatedAt || doc.publishedAt,
    author: authorNode(doc),
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    ...(doc.keywords?.length ? { keywords: doc.keywords.join(', ') } : {}),
  }
}

/** FAQPage node. Returns null when there is nothing usable, so callers can skip it. */
export function faqSchema(faqs?: { question?: string; answer?: string }[]) {
  const items = (faqs ?? []).filter((f) => f.question && f.answer)
  if (items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

/** BreadcrumbList from an ordered [label, path] trail. Home is prepended. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  const items = [{ name: 'Home', path: '/' }, ...trail]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
