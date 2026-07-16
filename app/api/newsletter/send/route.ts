import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBlogNewsletter } from '@/lib/email'
import { sendLaneworkBlogNewsletter } from '@/lib/labs-email'
import { rateLimit } from '@/lib/rateLimit'
import { client as sanityClient } from '@/sanity/lib/client'

interface NewsletterSendRequest {
  postId: string
  slug: string
  title: string
  excerpt: string
  readTime?: string
  mainImageUrl?: string
}

// CORS headers for Sanity Studio
// TODO: add cors for specific origins only
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (10 requests per minute)
    const rateLimitResult = rateLimit(request, { maxRequests: 10, windowMs: 60000 })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Rate limit exceeded' },
        { status: 429, headers: corsHeaders }
      )
    }

    // API key authentication
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.SANITY_STUDIO_NEWSLETTER_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    const body: NewsletterSendRequest = await request.json()

    // Validate required fields
    if (!body.slug || !body.title || !body.postId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: postId, slug, title' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if newsletter already sent for this post (duplicate prevention)
    const existingSend = await prisma.newsletterSend.findUnique({
      where: { postSlug: body.slug },
    })

    if (existingSend && existingSend.status === 'completed') {
      return NextResponse.json(
        {
          success: true,
          message: 'Newsletter already sent for this post',
          sendId: existingSend.id,
          alreadySent: true,
        },
        { status: 200, headers: corsHeaders }
      )
    }

    // Create or update send record with 'processing' status
    const sendRecord = await prisma.newsletterSend.upsert({
      where: { postSlug: body.slug },
      create: {
        postSlug: body.slug,
        postId: body.postId,
        postTitle: body.title,
        recipientCount: 0,
        status: 'processing',
      },
      update: {
        status: 'processing',
        updatedAt: new Date(),
      },
    })

    // Resolve categories from Sanity (references are not expanded in the Studio action payload)
    let categories: string[] = []
    try {
      const post = await sanityClient.fetch<{ categories?: Array<{ title: string }> }>(
        `*[_id == $postId][0]{ categories[]->{ title } }`,
        { postId: body.postId }
      )
      categories = post?.categories?.map((c) => c.title).filter(Boolean) ?? []
    } catch (err) {
      console.error('Failed to resolve post categories from Sanity (non-fatal):', err)
    }

    // Send newsletter emails, per brand: Rapid Relay subscribers get the RR
    // broadcast, Lanework subscribers the Lanework one. Results are combined.
    console.log(`Sending newsletter for post: ${body.title}`)
    const postPayload = {
      title: body.title,
      excerpt: body.excerpt || '',
      slug: body.slug,
      readTime: body.readTime,
      categories,
      mainImageUrl: body.mainImageUrl,
    }
    const [rr, lanework] = await Promise.all([
      sendBlogNewsletter(postPayload),
      sendLaneworkBlogNewsletter(postPayload).catch((error) => {
        console.error('Lanework broadcast failed (non-fatal):', error)
        return { total: 0, sent: 0, failed: 0, errors: [String(error)] }
      }),
    ])
    const results = {
      total: rr.total + lanework.total,
      sent: rr.sent + lanework.sent,
      failed: rr.failed + lanework.failed,
      errors: [...rr.errors, ...lanework.errors],
    }

    // Update send record with results
    await prisma.newsletterSend.update({
      where: { id: sendRecord.id },
      data: {
        recipientCount: results.sent,
        failedCount: results.failed,
        status: results.sent === 0 ? 'failed' : results.failed > 0 ? 'partial' : 'completed',
        errorMessage: results.errors.length > 0 ? results.errors.join('; ') : null,
      },
    })

    console.log(`Newsletter sent: ${results.sent} successful, ${results.failed} failed`)

    return NextResponse.json(
      {
        success: true,
        message: 'Newsletter sent successfully',
        results: {
          total: results.total,
          sent: results.sent,
          failed: results.failed,
        },
        sendId: sendRecord.id,
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Newsletter send error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send newsletter',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
