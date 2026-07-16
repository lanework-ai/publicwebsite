'use client'

import { useEffect } from 'react'
import { trackGatedContentDownloadComplete } from '@/lib/analytics'

interface Props {
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
}

/**
 * Fires conversion events on thank-you page mount. URL-based pixel firings are
 * substantially more reliable than in-page submit events for paid-ad attribution
 * because the page-load itself is the conversion signal.
 *
 * Server-side beacon hits a lightweight endpoint that records the conversion
 * even if client-side pixels are blocked.
 */
export default function ThankYouAnalytics({ contentType, contentSlug, contentTitle }: Props) {
  useEffect(() => {
    trackGatedContentDownloadComplete({ contentType, contentSlug, contentTitle })

    // Server-side beacon (no-op if endpoint not implemented yet).
    try {
      const url = `/api/analytics/conversion?type=${encodeURIComponent(contentType)}&slug=${encodeURIComponent(contentSlug)}`
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        navigator.sendBeacon(url)
      }
    } catch {
      /* swallow */
    }
  }, [contentType, contentSlug, contentTitle])

  return null
}
