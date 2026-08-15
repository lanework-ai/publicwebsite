'use client'

/**
 * Embedded Sanity Studio at /admin/studio.
 *
 * Renders the same config used everywhere else (sanity.config.ts), so a schema
 * change shows up here on the next Next.js build with no separate
 * `sanity deploy`. Access is gated by the Basic-Auth middleware over /admin/*
 * and, on top of that, Studio's own Sanity login.
 *
 * Must be a Client Component: sanity.config.ts initializes React context at
 * module scope, which cannot run in the RSC server environment. The Studio's
 * `metadata` and `viewport` come from the sibling layout (a Server Component),
 * since client components cannot export them.
 */
import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
