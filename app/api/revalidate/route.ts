/**
 * Sanity webhook handler for on-demand revalidation.
 *
 * Every content route is ISR with `revalidate = 86400`, so without this a publish
 * in Studio takes up to 24 hours to reach the live site. This invalidates exactly
 * the pages a given document feeds, so publishing goes live in seconds.
 *
 * This does NOT trigger a Netlify build. `revalidatePath` marks the cached page
 * stale; it regenerates on its next request. The daily `revalidate` stays in place
 * on every route as a safety net, so a misconfigured webhook degrades to today's
 * behaviour rather than serving stale content forever.
 *
 * Setup (one-time):
 *   1. Set SANITY_REVALIDATE_SECRET in the Netlify site env (any long random string).
 *   2. sanity.io/manage > API > Webhooks > Create webhook:
 *        URL         https://www.lanework.ai/api/revalidate
 *        Dataset     production
 *        Trigger on  Create, Update, Delete   (leave drafts OFF)
 *        Filter      _type in ["post","whitePaper","benchmark","author","category"]
 *        Projection  {_type, "slug": slug.current}
 *        Secret      same value as SANITY_REVALIDATE_SECRET
 *
 * The filter is load-bearing, not tidiness. lib/sanity-write-client.ts mirrors
 * contact, gatedContentLead, and newsletterSubscriber documents into this same
 * dataset on every form submission, so an unfiltered webhook would fire a
 * revalidation on every whitepaper download. REVALIDATABLE_TYPES below is a second,
 * independent guard against that.
 *
 * Drafts do not reach us: Sanity only fires on published changes unless draft
 * triggering is explicitly enabled, so Studio autosave cannot storm this endpoint.
 */
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { parseBody } from 'next-sanity/webhook'

/** Document types this endpoint will act on. Mirrors the GROQ filter on the webhook. */
const REVALIDATABLE_TYPES = ['post', 'whitePaper', 'benchmark', 'author', 'category'] as const
type RevalidatableType = (typeof REVALIDATABLE_TYPES)[number]

interface WebhookBody {
  _type?: string
  slug?: string
}

/** Routes that list or aggregate content, and so go stale whenever anything changes. */
const BLOG_INDEX_PATHS = ['/blog', '/llms.txt', '/llms-full.txt', '/sitemap.xml']
const RESEARCH_INDEX_PATHS = [
  '/research',
  '/research/feed.xml',
  '/', // homepage teasers query white papers and benchmarks, not posts
  '/llms.txt',
  '/llms-full.txt',
  '/sitemap.xml',
]

/**
 * Paths a document feeds. `slug` is optional on purpose: Sanity's docs do not
 * specify whether a projection resolves slug.current on a delete, so a missing
 * slug is treated as expected input. In that case we refresh the listings only,
 * which is the right outcome for a delete anyway, and we never interpolate
 * "undefined" into a URL.
 */
function pathsFor(type: RevalidatableType, slug?: string): string[] {
  if (type === 'author' || type === 'category') return []

  if (type === 'post') {
    const perDoc = slug ? [`/blog/${slug}`, `/blog/${slug}/llms.txt`] : []
    return [...perDoc, ...BLOG_INDEX_PATHS]
  }

  // whitePaper | benchmark. /lp/[slug] is built from the same slugs
  // (lpSlugsQuery selects from whitePaper || benchmark), so it goes stale too.
  const perDoc = slug
    ? [
        `/research/${slug}`,
        `/research/${slug}/llms.txt`,
        `/research/${slug}/thank-you`,
        `/lp/${slug}`,
      ]
    : []
  return [...perDoc, ...RESEARCH_INDEX_PATHS]
}

function isSignatureError(error: unknown): error is { statusCode: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as { statusCode: unknown }).statusCode === 'number'
  )
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET

  // Checked before parseBody for two reasons: it keeps "not configured" (503)
  // distinguishable from "bad signature" (401), and parseBody sleeps 3s whenever
  // the signature is not explicitly invalid, which we don't want to spend on
  // unauthenticated traffic.
  if (!secret) {
    console.error('[revalidate] SANITY_REVALIDATE_SECRET is not set; refusing unsigned payloads')
    return NextResponse.json({ ok: false, error: 'webhook not configured' }, { status: 503 })
  }

  let body: WebhookBody | null
  let isValidSignature: boolean | null
  try {
    // parseBody throws on a malformed signature header and on unparseable JSON;
    // it only returns cleanly when the header is absent entirely.
    ;({ body, isValidSignature } = await parseBody<WebhookBody>(request, secret))
  } catch (err) {
    const status = isSignatureError(err) ? err.statusCode : 400
    console.warn('[revalidate] could not parse webhook body:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false, error: 'invalid payload' }, { status })
  }

  if (isValidSignature !== true) {
    console.warn('[revalidate] signature verification failed')
    return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 })
  }

  const type = body?._type
  if (!type || !REVALIDATABLE_TYPES.includes(type as RevalidatableType)) {
    // Not an error: the GROQ filter should have caught it, but if it is ever
    // loosened we no-op instead of revalidating on every captured lead.
    console.log(`[revalidate] ignoring _type=${type ?? 'unknown'}`)
    return NextResponse.json({ ok: true, action: 'ignored', type: type ?? null })
  }

  const slug = typeof body?.slug === 'string' && body.slug ? body.slug : undefined

  // Author and category names render across many documents, so a targeted list
  // would miss pages. These are rare enough that revalidating the whole tree is
  // the cheaper trade.
  if (type === 'author' || type === 'category') {
    revalidatePath('/', 'layout')
    console.log(`[revalidate] _type=${type} -> layout revalidation`)
    return NextResponse.json({ ok: true, action: 'revalidated', type, scope: 'layout' })
  }

  const paths = [...new Set(pathsFor(type as RevalidatableType, slug))]
  for (const path of paths) revalidatePath(path)

  console.log(`[revalidate] _type=${type} slug=${slug ?? 'none'} paths=${paths.join(',')}`)

  return NextResponse.json({
    ok: true,
    action: 'revalidated',
    type,
    slug: slug ?? null,
    paths,
  })
}
