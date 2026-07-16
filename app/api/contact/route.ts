import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { validateHoneypot } from '@/lib/rateLimit'
import { hashIp, checkContactAbuse, looksLikeSpam } from '@/lib/spam'
import { sendContactNotification } from '@/lib/email'
import { syncContactToSanity } from '@/lib/sanity-write-client'

// Types for request and response
interface ContactFormData {
  name: string
  email: string
  company: string
  fleetSize: string
  message?: string
  _honeypot?: string
  formLoadedAt?: number
}

interface ApiResponse {
  success: boolean
  message: string
  id?: string
  errors?: Array<{ field: string; message: string }>
}

// Enhanced email validation schema
const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z
    .email({ message: 'Invalid email address' })
    .trim()
    .transform((email) => email.toLowerCase())
    .refine(
      (email) => {
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
        return emailRegex.test(email)
      },
      { message: 'Please enter a valid email address' }
    )
    .refine(
      (email) => {
        const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com']
        const domain = email.split('@')[1]
        return !disposableDomains.includes(domain)
      },
      { message: 'Please use a valid email address' }
    ),
  company: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must not exceed 200 characters')
    .trim(),
  fleetSize: z
    .string()
    .min(1, 'Fleet size is required')
    .refine(
      (value) => ['100-250', '250-500', '500-1000', '1000+'].includes(value),
      { message: 'Invalid fleet size selection' }
    ),
  message: z.string().max(500, 'Message must not exceed 500 characters').optional().nullable(),
  _honeypot: z.string().optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: unknown = await request.json()
    const raw = (body ?? {}) as Record<string, unknown>

    // Reused for every bot signal below: return the normal success response so a
    // bot gets no feedback (no row is written, no email is sent).
    const silentOk = () =>
      NextResponse.json(
        { success: true, message: 'Thank you for reaching out! We\'ll get back to you soon.' },
        { status: 201 }
      )

    // 1. Honeypot must be present AND empty. A script POSTing JSON straight to the
    //    API omits it entirely, so requiring presence blocks direct-API bots.
    if (!('_honeypot' in raw) || !validateHoneypot(raw._honeypot)) {
      console.log('[contact] dropped: honeypot')
      return silentOk()
    }

    // 2. Submit timing: real users take a few seconds; bots submit instantly.
    //    Drop submissions faster than 3s or older than 2h (stale/replayed).
    const loadedAt = Number(raw.formLoadedAt)
    const elapsed = Number.isFinite(loadedAt) ? Date.now() - loadedAt : NaN
    if (!Number.isFinite(elapsed) || elapsed < 3000 || elapsed > 2 * 60 * 60 * 1000) {
      console.log('[contact] dropped: timing', elapsed)
      return silentOk()
    }

    // Validate request body (real validation errors still surface to users)
    const validatedData = contactSchema.parse(body) as ContactFormData
    const cleanMessage =
      validatedData.message && validatedData.message.trim() ? validatedData.message.trim() : null

    // 3. DB-backed rate limit + duplicate suppression (the "repeated messages" fix).
    const ipHash = hashIp(request)
    const abuse = await checkContactAbuse({ ipHash, email: validatedData.email, message: cleanMessage })
    if (abuse) {
      console.log('[contact] dropped:', abuse)
      return silentOk()
    }

    // 4. Soft spam flag: store for audit but skip the admin email + CRM sync.
    const flagged = looksLikeSpam(cleanMessage)

    // Save to database
    const contact = await prisma.contact.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        fleetSize: validatedData.fleetSize,
        message: cleanMessage,
        ipHash,
        flagged,
      },
    })

    // Flagged (likely-spam) leads are stored for audit but not surfaced: skip the
    // admin email and the CRM sync so the inbox and Sanity stay clean.
    if (!flagged) {
      // Send email notification to admin
      sendContactNotification({
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        fleetSize: validatedData.fleetSize,
        message: cleanMessage,
      }).catch((error) => {
        console.error('Failed to send contact notification email:', error)
      })

      // Sync to Sanity
      try {
        const syncResult = await syncContactToSanity({
          postgresId: contact.id,
          name: validatedData.name,
          email: validatedData.email,
          company: validatedData.company,
          fleetSize: validatedData.fleetSize,
          message: cleanMessage,
          submittedAt: contact.createdAt.toISOString(),
        })
        await prisma.sanitySync.create({
          data: {
            entityType: 'contact',
            entityId: contact.id,
            sanityId: syncResult.success ? syncResult.sanityId : undefined,
            status: syncResult.success ? 'synced' : 'failed',
            attempts: 1,
            lastError: syncResult.success ? undefined : syncResult.error,
          },
        })
        if (syncResult.success) {
          console.log('Successfully synced contact to Sanity:', syncResult.sanityId)
        } else {
          console.error('Failed to sync contact to Sanity:', syncResult.error)
        }
      } catch (error) {
        console.error('Error during Sanity sync process (non-fatal):', error)
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for reaching out! We\'ll get back to you soon.',
        id: contact.id,
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle database errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Database error. Please try again later.',
        },
        { status: 500 }
      )
    }

    // Handle other errors
    console.error('Contact form error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    )
  }
}
