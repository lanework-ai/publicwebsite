'use client'

import { useEffect } from 'react'
import { trackResourceView } from '@/lib/analytics'

interface Props {
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
}

/**
 * Fires a `view_resource` event on mount. Builds the "viewed but didn't convert"
 * retargeting audience.
 */
export default function ResourceViewAnalytics(props: Props) {
  useEffect(() => {
    trackResourceView(props)
  }, [props])
  return null
}
