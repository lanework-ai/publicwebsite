import { createClient } from '@sanity/client'

// Write client with token for creating documents
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false, // Must be false for write operations
})

// Type definitions
export interface ContactSyncData {
  postgresId: string
  name: string
  email: string
  company: string
  fleetSize: string
  message?: string | null
  submittedAt: string
}

export interface NewsletterSyncData {
  postgresId: string
  email: string
  subscribedAt: string
  isActive: boolean
}

// Sync contact to Sanity
export async function syncContactToSanity(data: ContactSyncData) {
  try {
    const doc = {
      _type: 'contact',
      postgresId: data.postgresId,
      name: data.name,
      email: data.email,
      company: data.company,
      fleetSize: data.fleetSize,
      message: data.message,
      submittedAt: data.submittedAt,
    }

    const result = await writeClient.create(doc)
    return { success: true, sanityId: result._id }
  } catch (error) {
    console.error('Failed to sync contact to Sanity:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export interface GatedContentLeadSyncData {
  postgresId: string
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
  email: string
  name: string
  company: string
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  referrer?: string | null
  landingPage?: string | null
  submittedAt: string
  downloadedAt?: string | null
}

// Sync gated content lead to Sanity (read-only display in Studio)
export async function syncGatedContentLeadToSanity(data: GatedContentLeadSyncData) {
  try {
    const doc = {
      _type: 'gatedContentLead',
      postgresId: data.postgresId,
      contentType: data.contentType,
      contentSlug: data.contentSlug,
      contentTitle: data.contentTitle,
      email: data.email,
      name: data.name,
      company: data.company,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmContent: data.utmContent,
      utmTerm: data.utmTerm,
      referrer: data.referrer,
      landingPage: data.landingPage,
      submittedAt: data.submittedAt,
      downloadedAt: data.downloadedAt,
    }
    const result = await writeClient.create(doc)
    return { success: true as const, sanityId: result._id }
  } catch (error) {
    console.error('Failed to sync gated content lead to Sanity:', error)
    return { success: false as const, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Patch an existing gated content lead Sanity doc (e.g. set downloadedAt)
export async function patchGatedContentLeadInSanity(sanityId: string, patch: Record<string, any>) {
  try {
    await writeClient.patch(sanityId).set(patch).commit()
    return { success: true as const }
  } catch (error) {
    console.error('Failed to patch gated content lead in Sanity:', error)
    return { success: false as const, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Sync newsletter subscriber to Sanity
export async function syncNewsletterToSanity(data: NewsletterSyncData) {
  try {
    const doc = {
      _type: 'newsletterSubscriber',
      postgresId: data.postgresId,
      email: data.email,
      subscribedAt: data.subscribedAt,
      isActive: data.isActive,
    }

    const result = await writeClient.create(doc)
    return { success: true, sanityId: result._id }
  } catch (error) {
    console.error('Failed to sync newsletter to Sanity:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
