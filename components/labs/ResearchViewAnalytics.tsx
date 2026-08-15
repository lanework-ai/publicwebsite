'use client'

import { useEffect } from 'react'
import { trackResourceView } from '@/lib/analytics'

/**
 * Fires a `view_resource` event on mount. Builds the "viewed but didn't convert"
 * retargeting audience — pair it with `generate_lead` to get the drop-off rate
 * on any given paper.
 *
 * Rendered from the (server) research detail page, which is why this exists as a
 * separate client island rather than an effect on the page itself.
 */
export default function ResearchViewAnalytics({
  contentType,
  contentSlug,
  contentTitle,
  gated,
}: {
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
  /** Whether this doc has a PDF, i.e. whether the page offered a download at all. */
  gated: boolean
}) {
  useEffect(() => {
    trackResourceView({ contentType, contentSlug, contentTitle, gated })
  }, [contentType, contentSlug, contentTitle, gated])

  return null
}
