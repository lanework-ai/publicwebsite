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

// Site URL for newsletter action (must use SANITY_STUDIO_ prefix for Vite to inject it)
export const siteUrl = process.env.SANITY_STUDIO_SITE_URL!

// Newsletter API key for Sanity Studio
export const newsletterApiKey = process.env.SANITY_STUDIO_NEWSLETTER_API_KEY!

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
