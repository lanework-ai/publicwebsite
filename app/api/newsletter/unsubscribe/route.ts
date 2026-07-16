import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PAGE_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    background: #f9fafb;
  }
  .container {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    max-width: 500px;
  }
  h1 { color: #1a1a2e; margin-bottom: 20px; }
  p { color: #6b7280; margin-bottom: 16px; line-height: 1.6; }
  a {
    display: inline-block;
    background: linear-gradient(135deg, #235784 0%, #40a8c4 100%);
    color: white;
    padding: 12px 30px;
    text-decoration: none;
    border-radius: 8px;
    margin-top: 16px;
  }
`

function successPage(siteUrl: string, removedFromNewsletter: boolean, dripPaused: number): NextResponse {
  const detail =
    removedFromNewsletter && dripPaused > 0
      ? `You're unsubscribed from the Rapid Relay newsletter and the ${dripPaused === 1 ? 'gated-content follow-up sequence' : `${dripPaused} gated-content follow-up sequences`} you'd signed up for.`
      : removedFromNewsletter
        ? `You're unsubscribed from the Rapid Relay newsletter. You will no longer receive newsletter emails.`
        : dripPaused > 0
          ? `You're unsubscribed from your gated-content follow-up emails. You will no longer receive these messages.`
          : `That email wasn't on any of our mailing lists, but it's now suppressed from future communications either way.`
  return new NextResponse(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unsubscribed - Rapid Relay</title><style>${PAGE_STYLES}</style></head>
<body><div class="container">
  <h1>You're unsubscribed</h1>
  <p>${detail}</p>
  <p style="font-size:13px;color:#9ca3af;">If this was a mistake, you can always resubscribe from our website.</p>
  <a href="${siteUrl}">Return to Homepage</a>
</div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  )
}

function errorPage(siteUrl: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unsubscribe - Rapid Relay</title><style>${PAGE_STYLES}</style></head>
<body><div class="container">
  <h1>We couldn't process that just now</h1>
  <p>Something went wrong on our end while updating your preferences. Please try the link again in a few minutes. If it keeps happening, email <a style="background:none;color:#235784;padding:0;text-decoration:underline;" href="mailto:support@rapidrelay.ai">support@rapidrelay.ai</a> and we'll take care of it right away.</p>
  <a href="${siteUrl}">Return to Homepage</a>
</div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  )
}

/**
 * Suppress an email everywhere: remove from the Newsletter list and pause any
 * active gated-content drip sequences. deleteMany/updateMany never throw on a
 * missing row, so this is safe for addresses that were never subscribed.
 */
async function suppressEmail(email: string): Promise<{ newsletterRemoved: number; dripPaused: number }> {
  const newsletterResult = await prisma.newsletter.deleteMany({ where: { email } })
  const dripResult = await prisma.gatedContentLead.updateMany({
    where: { email, dripUnsubscribedAt: null },
    data: { dripUnsubscribedAt: new Date() },
  })
  console.log(
    `[unsubscribe] email=${email} newsletter_removed=${newsletterResult.count} drip_paused=${dripResult.count}`
  )
  return { newsletterRemoved: newsletterResult.count, dripPaused: dripResult.count }
}

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  try {
    const emailRaw = new URL(request.url).searchParams.get('email')
    if (!emailRaw) {
      return NextResponse.json({ success: false, message: 'Email parameter required' }, { status: 400 })
    }
    const { newsletterRemoved, dripPaused } = await suppressEmail(emailRaw.toLowerCase())
    return successPage(siteUrl, newsletterRemoved > 0, dripPaused)
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return errorPage(siteUrl)
  }
}

/**
 * RFC 8058 one-click handler. Gmail/Yahoo POST here (with body
 * `List-Unsubscribe=One-Click`) when the user clicks the native unsubscribe
 * button, reading the email from the `?email=` query that's in the
 * List-Unsubscribe header URL. Returns plain 2xx — no HTML page needed.
 */
export async function POST(request: NextRequest) {
  try {
    let email = new URL(request.url).searchParams.get('email')
    if (!email) {
      // Some clients place the email in the form body instead of the URL.
      const body = await request.text().catch(() => '')
      email = new URLSearchParams(body).get('email')
    }
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email parameter required' }, { status: 400 })
    }
    await suppressEmail(email.toLowerCase())
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscribe (one-click) error:', error)
    return NextResponse.json({ success: false, message: 'Failed to unsubscribe' }, { status: 500 })
  }
}
