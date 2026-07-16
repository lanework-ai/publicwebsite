import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit, validateHoneypot } from '@/lib/rateLimit'
import { sendNewsletterNotifications } from '@/lib/email'
import { sendLaneworkNewsletter } from '@/lib/labs-email'
import { syncNewsletterToSanity } from '@/lib/sanity-write-client'

// Types for request and response
interface NewsletterFormData {
  email: string
  _honeypot?: string
}

interface ApiResponse {
  success: boolean
  message: string
  id?: string
  errors?: Array<{ field: string; message: string }>
}

// Enhanced email validation schema
const newsletterSchema = z.object({
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
  _honeypot: z.string().optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Apply rate limiting (5 requests per minute)
    const rateLimitResult = rateLimit(request, { maxRequests: 5, windowMs: 60000 });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          }
        }
      )
    }

    const body: unknown = await request.json()

    // Validate honeypot (bot detection)
    if ('_honeypot' in (body as object) && !validateHoneypot((body as NewsletterFormData)._honeypot)) {
      // Silently reject bot submissions (return success to avoid detection)
      console.log('Bot detected via honeypot field');
      return NextResponse.json(
        {
          success: true,
          message: 'Successfully subscribed to newsletter!',
        },
        { status: 201 }
      )
    }

    // Validate request body
    const validatedData = newsletterSchema.parse(body) as NewsletterFormData

    // Which brand the subscriber signed up under (drives welcome + broadcast templates).
    const brand =
      typeof body === 'object' && body !== null && (body as { brand?: string }).brand === 'lanework'
        ? 'lanework'
        : 'rapidrelay'

    // Save to database
    const newsletter = await prisma.newsletter.create({
      data: {
        email: validatedData.email,
        brand,
      },
    })

    // Send email notifications (non-blocking). Lanework signups get the Lanework
    // welcome; everything else keeps the Rapid Relay flow.
    if (brand === 'lanework') {
      sendLaneworkNewsletter(validatedData.email).catch((error) => {
        console.error('Failed to send Lanework newsletter emails:', error)
      })
    } else {
      sendNewsletterNotifications(validatedData.email).catch((error) => {
        console.error('Failed to send newsletter notification emails:', error)
      })
    }

    // Sync to Sanity (awaited to ensure it completes before serverless function exits)
    try {
      const syncResult = await syncNewsletterToSanity({
        postgresId: newsletter.id,
        email: validatedData.email,
        subscribedAt: newsletter.createdAt.toISOString(),
        isActive: true,
      })
      await prisma.sanitySync.create({
        data: {
          entityType: 'newsletter',
          entityId: newsletter.id,
          sanityId: syncResult.success ? syncResult.sanityId : undefined,
          status: syncResult.success ? 'synced' : 'failed',
          attempts: 1,
          lastError: syncResult.success ? undefined : syncResult.error,
        },
      })
      if (syncResult.success) {
        console.log('Successfully synced newsletter subscriber to Sanity:', syncResult.sanityId)
      } else {
        console.error('Failed to sync newsletter to Sanity:', syncResult.error)
      }
    } catch (error) {
      console.error('Error during Sanity sync process (non-fatal):', error)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to newsletter!',
        id: newsletter.id,
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

    // Handle unique constraint violation (email already exists)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'This email is already subscribed to our newsletter.',
        },
        { status: 409 }
      )
    }

    // Handle other database errors
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
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    )
  }
}
