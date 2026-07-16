/**
 * Single call surface for all client-side analytics + conversion pixels.
 *
 * Every event we care about fires through here so we have one place to:
 *   - reason about what's being tracked
 *   - swap or add platforms
 *   - silently no-op when pixel IDs aren't set
 *
 * All functions are SAFE TO CALL even when pixels haven't loaded — they check
 * for the global function before invoking. Server-rendering also no-ops.
 *
 * Pixel IDs come from these env vars (all optional, exposed to client):
 *   NEXT_PUBLIC_GA4_MEASUREMENT_ID         — e.g. "G-ABC123XYZ"
 *   NEXT_PUBLIC_META_PIXEL_ID              — Facebook/Meta numeric pixel ID
 *   NEXT_PUBLIC_LINKEDIN_PARTNER_ID        — LinkedIn Insight Tag partner ID
 *   NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID — LinkedIn conversion ID for lead form fills
 *   NEXT_PUBLIC_LINKEDIN_DOWNLOAD_CONVERSION_ID — LinkedIn conversion ID for gated-content downloads
 */

import posthog from 'posthog-js'

// Re-declare loose typings for the pixel globals (avoid pulling in heavy SDK types)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
    lintrk?: (action: string, data?: Record<string, any>) => void
  }
}

type GatedContentParams = {
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
}

function safe<T>(fn: () => T): T | void {
  if (typeof window === 'undefined') return
  try {
    return fn()
  } catch (e) {
    console.warn('[analytics] suppressed error:', e)
  }
}

/**
 * Fired when a visitor lands on a white-paper or benchmark detail page.
 * Useful for retargeting audiences ("viewed but didn't convert").
 */
export function trackResourceView(params: GatedContentParams) {
  safe(() => {
    window.gtag?.('event', 'view_resource', {
      content_type: params.contentType,
      content_slug: params.contentSlug,
      content_title: params.contentTitle,
    })
    window.fbq?.('trackCustom', 'ViewResource', {
      content_category: params.contentType,
      content_name: params.contentTitle,
    })
    posthog.capture?.('view_resource', {
      content_type: params.contentType,
      content_slug: params.contentSlug,
      content_title: params.contentTitle,
    })
  })
}

/**
 * Fired when the gated form is successfully submitted (client-side; thank-you
 * page also fires the URL-based version which is more reliable for paid attribution).
 */
export function trackLeadSubmit(params: GatedContentParams) {
  safe(() => {
    window.gtag?.('event', 'generate_lead', {
      content_type: params.contentType,
      content_slug: params.contentSlug,
      content_title: params.contentTitle,
      value: 1,
    })
    window.fbq?.('track', 'Lead', {
      content_category: params.contentType,
      content_name: params.contentTitle,
      value: 1,
      currency: 'USD',
    })
    const leadConvId = process.env.NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID
    if (leadConvId) {
      window.lintrk?.('track', { conversion_id: Number(leadConvId) })
    }
    posthog.capture?.('generate_lead', {
      content_type: params.contentType,
      content_slug: params.contentSlug,
      content_title: params.contentTitle,
    })
  })
}

/**
 * Fired on the thank-you page (URL-based, more reliable than in-page submit events
 * for paid-ad attribution because the page-load itself triggers conversion).
 */
export function trackGatedContentDownloadComplete(params: GatedContentParams) {
  safe(() => {
    window.gtag?.('event', 'gated_content_download_complete', {
      content_type: params.contentType,
      content_slug: params.contentSlug,
      content_title: params.contentTitle,
      value: 1,
    })
    window.fbq?.('track', 'CompleteRegistration', {
      content_category: params.contentType,
      content_name: params.contentTitle,
      value: 1,
      currency: 'USD',
    })
    const downloadConvId = process.env.NEXT_PUBLIC_LINKEDIN_DOWNLOAD_CONVERSION_ID
    if (downloadConvId) {
      window.lintrk?.('track', { conversion_id: Number(downloadConvId) })
    }
    posthog.capture?.('gated_content_download_complete', {
      content_type: params.contentType,
      content_slug: params.contentSlug,
      content_title: params.contentTitle,
    })
  })
}

/**
 * Fired when the user clicks the "Book a 15-min walkthrough" CTA on the thank-you
 * page (or anywhere else). Lets us measure cross-sell rate from gated content to
 * sales meetings.
 */
export function trackDemoCtaClick(source: string) {
  safe(() => {
    window.gtag?.('event', 'demo_cta_click', { source })
    window.fbq?.('trackCustom', 'DemoCtaClick', { source })
    posthog.capture?.('demo_cta_click', { source })
  })
}
