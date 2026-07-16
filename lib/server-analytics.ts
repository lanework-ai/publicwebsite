/**
 * Server-side analytics helpers. Sends events to GA4 via the Measurement
 * Protocol from Node, which survives ad-blockers, ITP, and tab-close races
 * that client-side gtag misses.
 *
 * Requires NEXT_PUBLIC_GA4_MEASUREMENT_ID + GA4_API_SECRET to be set; no-ops
 * otherwise.
 */

interface Ga4Args {
  eventName: string
  params: Record<string, unknown>
  clientId?: string
}

async function fireGa4Measurement(args: Ga4Args) {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const apiSecret = process.env.GA4_API_SECRET
  if (!measurementId || !apiSecret) return

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`
  const clientId = args.clientId || `${Date.now()}.${Math.floor(Math.random() * 1e9)}`

  const payload = {
    client_id: clientId,
    non_personalized_ads: false,
    events: [{ name: args.eventName, params: args.params }],
  }

  await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  })
}

export async function fireGatedContentDownloadCompleteServerSide(args: { contentType: string; contentSlug: string }) {
  await fireGa4Measurement({
    eventName: 'gated_content_download_complete',
    params: { content_type: args.contentType, content_slug: args.contentSlug, value: 1 },
  }).catch((e) => console.error('[ssr-analytics] download-complete send failed:', e))
}

export async function fireLeadGeneratedServerSide(args: {
  contentType: string
  contentSlug: string
  contentTitle: string
}) {
  await fireGa4Measurement({
    eventName: 'generate_lead',
    params: {
      content_type: args.contentType,
      content_slug: args.contentSlug,
      content_title: args.contentTitle,
      value: 1,
      currency: 'USD',
    },
  }).catch((e) => console.error('[ssr-analytics] generate-lead send failed:', e))
}
