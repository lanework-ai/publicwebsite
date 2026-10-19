import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  // Always read from the live API, never apicdn.sanity.io. The Sanity webhook
  // (app/api/revalidate) triggers revalidatePath seconds after a publish, and
  // the CDN can still serve pre-mutation data at that moment; the stale result
  // then gets cached for the full ISR window (revalidate = 86400). Seen on
  // 2026-10-12: /blog kept old category chips after a bulk edit.
  // Load is fine without the CDN: every importer is a server component or
  // route handler, so ISR plus the Netlify cache absorb traffic and Sanity is
  // only hit on builds, webhook revalidations, the daily ISR refresh, and the
  // gated-content API routes (one call per form submit or download click).
  useCdn: false,
  // The production dataset is private (it also holds lead, contact and
  // subscriber docs), so reads need a token. Server-only: never prefix it with
  // NEXT_PUBLIC_ and never import this file from a "use client" component.
  // Falls back to the write token so a missing read token can't blank the site.
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  // A token can see drafts, and with an apiVersion before 2025-02-19 the
  // default perspective is "raw" (drafts included). Pin it to published.
  perspective: 'published',
})

// Helper function to generate image URLs
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
