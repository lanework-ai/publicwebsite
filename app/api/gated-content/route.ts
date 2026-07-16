import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit, validateHoneypot } from '@/lib/rateLimit'
import { sendGatedContentDownloadEmail } from '@/lib/email'
import { sendLaneworkGatedDownloadEmail } from '@/lib/labs-email'
import { client } from '@/sanity/client'
import { whitePaperPdfBySlugQuery, benchmarkPdfBySlugQuery } from '@/lib/sanity-queries'
import { syncGatedContentLeadToSanity } from '@/lib/sanity-write-client'
import { fireLeadGeneratedServerSide } from '@/lib/server-analytics'

const TOKEN_TTL_HOURS = 24
// First drip-email firing is 2 days after sign-up (Day 2 of the sequence).
const DRIP_FIRST_DELAY_MS = 2 * 24 * 60 * 60 * 1000

const formSchema = z.object({
  email: z
    .email({ message: 'Invalid email address' })
    .trim()
    .transform((email) => email.toLowerCase())
    .refine(
      (email) => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email),
      { message: 'Please enter a valid email address' }
    )
    .refine(
      (email) => {
        const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com', 'mailinator.com']
        const domain = email.split('@')[1]
        return !disposableDomains.includes(domain)
      },
      { message: 'Please use a valid work email' }
    ),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  company: z.string().trim().min(2, 'Company name must be at least 2 characters').max(150),
  contentType: z.enum(['whitepaper', 'benchmark']),
  contentSlug: z.string().trim().min(1).max(200),
  // Optional attribution
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
  referrer: z.string().max(500).optional(),
  landingPage: z.string().max(500).optional(),
  _honeypot: z.string().optional(),
})

type FormPayload = z.infer<typeof formSchema>

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests / minute / IP
    const rateLimitResult = rateLimit(request, { maxRequests: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      )
    }

    const body: unknown = await request.json()

    // Honeypot: silent success on bot detection
    if (
      typeof body === 'object' &&
      body !== null &&
      '_honeypot' in body &&
      !validateHoneypot((body as { _honeypot?: string })._honeypot)
    ) {
      console.log('Bot detected via honeypot (gated content)')
      return NextResponse.json({ success: true, message: 'Submission received.' }, { status: 200 })
    }

    let data: FormPayload
    try {
      data = formSchema.parse(body) as FormPayload
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
          },
          { status: 400 }
        )
      }
      throw err
    }

    // Look up the content in Sanity to (a) confirm it exists, (b) get the canonical title.
    const pdfQuery =
      data.contentType === 'whitepaper' ? whitePaperPdfBySlugQuery : benchmarkPdfBySlugQuery
    const sanityDoc = await client.fetch<{ title: string; pdfUrl: string | null } | null>(
      pdfQuery,
      { slug: data.contentSlug }
    )
    if (!sanityDoc) {
      return NextResponse.json(
        { success: false, message: 'Content not found.' },
        { status: 404 }
      )
    }
    if (!sanityDoc.pdfUrl) {
      console.error(`Gated content ${data.contentType}/${data.contentSlug} has no pdfFile attached`)
      return NextResponse.json(
        { success: false, message: 'This download is not available right now. Please try again later.' },
        { status: 503 }
      )
    }

    const downloadToken = randomUUID().replace(/-/g, '')
    const now = new Date()
    const tokenExpiresAt = new Date(now.getTime() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
    const dripNextSendAt = new Date(now.getTime() + DRIP_FIRST_DELAY_MS)

    // Which brand captured this lead. Stored so the drip cron sends the right
    // sequence (Lanework research nurture vs Rapid Relay product nurture).
    const brand =
      typeof body === 'object' && body !== null && (body as { brand?: string }).brand === 'lanework'
        ? 'lanework'
        : 'rapidrelay'

    const lead = await prisma.gatedContentLead.create({
      data: {
        contentType: data.contentType,
        contentSlug: data.contentSlug,
        contentTitle: sanityDoc.title,
        email: data.email,
        name: data.name,
        company: data.company,
        brand,
        downloadToken,
        tokenExpiresAt,
        // Drip starts at step 0 (= day-0 confirmation sent inline below). Day-2 is queued.
        dripStep: 0,
        dripNextSendAt,
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        utmContent: data.utmContent ?? null,
        utmTerm: data.utmTerm ?? null,
        referrer: data.referrer ?? null,
        landingPage: data.landingPage ?? null,
      },
    })

    const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/gated-content/download?token=${downloadToken}`

    // Fire server-side conversion event (non-blocking; no-ops if GA4 not configured)
    fireLeadGeneratedServerSide({
      contentType: data.contentType,
      contentSlug: data.contentSlug,
      contentTitle: sanityDoc.title,
    }).catch(() => {
      /* already logged inside */
    })

    // Fire the download email (non-blocking). Lanework leads get the Lanework-branded
    // email; everything else keeps the Rapid Relay template.
    if (brand === 'lanework') {
      sendLaneworkGatedDownloadEmail({
        to: data.email,
        name: data.name,
        contentType: data.contentType,
        contentSlug: data.contentSlug,
        contentTitle: sanityDoc.title,
        downloadUrl,
      }).catch((error) => {
        console.error('Failed to send Lanework gated download email:', error)
      })
    } else {
      sendGatedContentDownloadEmail({
        to: data.email,
        name: data.name,
        company: data.company,
        contentType: data.contentType,
        contentSlug: data.contentSlug,
        contentTitle: sanityDoc.title,
        downloadUrl,
        dripNextSendAt,
        utm: {
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmContent: data.utmContent,
          utmTerm: data.utmTerm,
          referrer: data.referrer,
          landingPage: data.landingPage,
        },
      }).catch((error) => {
        console.error('Failed to send gated content download email:', error)
      })
    }

    // Sync to Sanity (awaited so it completes before the serverless function exits)
    try {
      const syncResult = await syncGatedContentLeadToSanity({
        postgresId: lead.id,
        contentType: data.contentType,
        contentSlug: data.contentSlug,
        contentTitle: sanityDoc.title,
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
        submittedAt: lead.createdAt.toISOString(),
        downloadedAt: null,
      })
      if (syncResult.success) {
        await prisma.gatedContentLead.update({
          where: { id: lead.id },
          data: { sanityId: syncResult.sanityId },
        })
      }
      await prisma.sanitySync.create({
        data: {
          entityType: 'gatedContentLead',
          entityId: lead.id,
          sanityId: syncResult.success ? syncResult.sanityId : undefined,
          status: syncResult.success ? 'synced' : 'failed',
          attempts: 1,
          lastError: syncResult.success ? undefined : syncResult.error,
        },
      })
    } catch (error) {
      console.error('Error during gated-content Sanity sync (non-fatal):', error)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Check your inbox for the download link.',
        id: lead.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Gated content lead capture error:', error)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
