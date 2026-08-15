export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-30'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

// Site URL the newsletter action posts to. Reuses NEXT_PUBLIC_SITE_URL, which
// sanity.cli.ts already injects into the Studio bundle and netlify.toml already
// sets to https://lanework.ai. The old SANITY_STUDIO_SITE_URL was a second
// source of truth that was never injected and still pointed at rapidrelay.ai.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lanework.ai'

// Newsletter API key for Sanity Studio
export const newsletterApiKey = process.env.SANITY_STUDIO_NEWSLETTER_API_KEY!

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
