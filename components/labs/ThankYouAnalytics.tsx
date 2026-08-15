'use client'

import { useEffect } from 'react'
import { trackGatedContentDownloadComplete } from '@/lib/analytics'

/**
 * Fires the conversion event on thank-you page mount.
 *
 * This is deliberately duplicated with the `generate_lead` that LabsGatedForm
 * fires on submit: a page-load conversion survives cases the in-page submit event
 * misses (tab closed mid-request, pixel not yet loaded), and paid-ad platforms
 * attribute URL-based conversions far more reliably. Dedupe in PostHog on
 * distinct_id + content_slug if the double-count ever matters.
 */
export default function ThankYouAnalytics({
  contentType,
  contentSlug,
  contentTitle,
}: {
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
}) {
  useEffect(() => {
    trackGatedContentDownloadComplete({ contentType, contentSlug, contentTitle })
  }, [contentType, contentSlug, contentTitle])

  return null
}
