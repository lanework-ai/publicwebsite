'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

/**
 * PostHog client integration.
 *
 * - Initializes only when NEXT_PUBLIC_POSTHOG_KEY is set, so it no-ops cleanly
 *   in any environment without a key (same pattern as components/Analytics/Pixels).
 * - Autocapture (clicks, inputs) + manual $pageview on App Router navigations.
 * - Capturing is turned OFF on the Studio subtree (/admin/studio) so editor
 *   activity never pollutes site analytics.
 */
let initialized = false

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key || initialized) return
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: false, // captured manually below for the App Router
      capture_pageleave: true,
      autocapture: true,
      person_profiles: 'identified_only',
    })
    initialized = true
  }, [])

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  )
}

function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !pathname) return

    // Never capture inside the admin backend (Studio, hub, analytics) — that's
    // our own team, not site traffic, and it would pollute the funnel.
    if (pathname.startsWith('/admin')) {
      if (!posthog.has_opted_out_capturing?.()) posthog.opt_out_capturing?.()
      return
    }
    if (posthog.has_opted_out_capturing?.()) posthog.opt_in_capturing?.()

    let url = window.location.origin + pathname
    const qs = searchParams?.toString()
    if (qs) url += `?${qs}`
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}
