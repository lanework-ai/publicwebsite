import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CORS headers for Sanity Studio
// TODO: add cors for specific origins only
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug parameter required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if newsletter already sent for this post
    const existingSend = await prisma.newsletterSend.findUnique({
      where: { postSlug: slug },
    })

    if (existingSend && existingSend.status === 'completed') {
      return NextResponse.json({
        alreadySent: true,
        recipientCount: existingSend.recipientCount,
        sentAt: existingSend.sentAt,
        status: existingSend.status,
      }, { headers: corsHeaders })
    }

    return NextResponse.json({
      alreadySent: false,
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Newsletter check error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to check newsletter status' },
      { status: 500, headers: corsHeaders }
    )
  }
}
