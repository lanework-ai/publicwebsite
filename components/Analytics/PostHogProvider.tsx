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

/**
 * Initialise posthog-js exactly once, DURING RENDER rather than inside an effect.
 *
 * This ordering is load-bearing. React flushes effects bottom-up — every child's
 * effect runs before its parent's — so an init() in this component's useEffect
 * lands AFTER the tracking components nested in {children} have already called
 * posthog.capture(). posthog-js drops captures made before init without throwing,
 * so those events vanish with no error anywhere.
 *
 * That cost us `view_resource` and `gated_content_download_complete`: both fire on
 * mount with stable deps, so each ran exactly once — too early — and never arrived.
 * `$pageview` survived only by accident, because PostHogPageview depends on
 * `searchParams`, whose identity changes after hydration, re-running that effect
 * once init had happened. Verified against a live project: click-triggered events
 * (`demo_cta_click`, `$autocapture`) landed while both mount-triggered ones did not.
 *
 * Render runs top-down, so calling this from the component body guarantees init
 * completes before any descendant mounts. The `initialized` guard keeps it
 * idempotent across re-renders and Strict Mode's double invocation.
 */
/**
 * Path that netlify.toml proxies to PostHog. Deliberately unremarkable rather than
 * PostHog's documented /ingest.
 */
const PROXY_PATH = '/api/v1/m'

/** PostHog's real host. Also what lib/posthog-query.ts uses server-side. */
const directHost = () => process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

/**
 * Where the browser should send events.
 *
 * Production goes through the first-party proxy so ad blockers have no
 * third-party hostname to match. Local dev cannot: the proxy is a set of
 * netlify.toml redirects, which `next dev` knows nothing about, so pointing at
 * PROXY_PATH locally would 404 every capture. Dev talks to PostHog directly —
 * and localhost traffic is excluded from the admin dashboard anyway
 * (see windowClause in lib/posthog-query.ts).
 */
function ingestionHost(): string {
  const h = window.location.hostname
  const isLocal = h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
  return isLocal ? directHost() : PROXY_PATH
}

function ensureInitialized() {
  if (initialized || typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  posthog.init(key, {
    api_host: ingestionHost(),
    // Without this, posthog-js assumes the PostHog app lives at api_host, and the
    // Toolbar and its "view in PostHog" links would point at lanework.ai. The
    // ingestion host (us.i.) and the app host (us.) are different subdomains.
    ui_host: directHost().replace('.i.posthog.com', '.posthog.com'),
    capture_pageview: false, // captured manually below for the App Router
    capture_pageleave: true,
    autocapture: true,
    person_profiles: 'identified_only',
    // posthog-js defaults this to false. The Privacy Policy states that we honour
    // Do Not Track and Global Privacy Control, so it has to be on for that claim to
    // be true. There is no advertising business here that would suffer for it.
    respect_dnt: true,
  })
  initialized = true
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  ensureInitialized()

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
