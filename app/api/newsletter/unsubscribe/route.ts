import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Same address replies to Lanework mail land on, so a stuck unsubscribe reaches a
// human who can action it. Kept in sync with REPLY_TO in lib/labs-email.ts.
const SUPPORT_EMAIL = process.env.SALES_REPLY_TO || 'hello@lanework.ai'

/**
 * Lanework-themed standalone page styles. Mirrors the design system used across the
 * site and the transactional email shell: near-black canvas, off-white text, one
 * indigo accent, hairline borders, no gradients and no shadows. Values are literal
 * rather than CSS vars because this HTML is served by an API route, outside the app
 * shell that defines the tokens.
 */
const PAGE_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    padding: 24px;
    background: #08090a;
    color: #f4f5f6;
  }
  .container {
    text-align: center;
    padding: 40px;
    background: #0d1016;
    border: 1px solid #22262e;
    border-radius: 12px;
    max-width: 520px;
  }
  .mark {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #868d97;
    margin-bottom: 20px;
  }
  h1 { color: #f4f5f6; font-size: 22px; font-weight: 500; margin: 0 0 16px; }
  p { color: #868d97; margin: 0 0 14px; line-height: 1.65; font-size: 14px; }
  a.btn {
    display: inline-block;
    background: #4f6bff;
    color: #fff;
    padding: 11px 26px;
    text-decoration: none;
    border-radius: 6px;
    margin-top: 18px;
    font-size: 14px;
  }
  a.inline { color: #7e95ff; text-decoration: underline; }
`

function successPage(siteUrl: string, removedFromNewsletter: boolean, dripPaused: number): NextResponse {
  const detail =
    removedFromNewsletter && dripPaused > 0
      ? `You're unsubscribed from the Lanework newsletter and the ${dripPaused === 1 ? 'research follow-up sequence' : `${dripPaused} research follow-up sequences`} you'd signed up for.`
      : removedFromNewsletter
        ? `You're unsubscribed from the Lanework newsletter. You will no longer receive newsletter emails.`
        : dripPaused > 0
          ? `You're unsubscribed from your research follow-up emails. You will no longer receive these messages.`
          : `That email wasn't on any of our mailing lists, but it's now suppressed from future communications either way.`
  return new NextResponse(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>Unsubscribed | Lanework</title><style>${PAGE_STYLES}</style></head>
<body><div class="container">
  <div class="mark">Lanework</div>
  <h1>You're unsubscribed</h1>
  <p>${detail}</p>
  <p style="font-size:12.5px;">If this was a mistake, you can resubscribe from the research page any time.</p>
  <a class="btn" href="${siteUrl}">Back to Lanework</a>
</div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  )
}

function errorPage(siteUrl: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>Unsubscribe | Lanework</title><style>${PAGE_STYLES}</style></head>
<body><div class="container">
  <div class="mark">Lanework</div>
  <h1>We couldn't process that just now</h1>
  <p>Something went wrong on our end while updating your preferences. Please try the link again in a few minutes. If it keeps happening, email <a class="inline" href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> and we'll take care of it right away.</p>
  <a class="btn" href="${siteUrl}">Back to Lanework</a>
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
