import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { client } from '@/sanity/client'
import { whitePaperPdfBySlugQuery, benchmarkPdfBySlugQuery } from '@/lib/sanity-queries'
import { patchGatedContentLeadInSanity } from '@/lib/sanity-write-client'

// A download link may be used a few times within its 24h window, then it dies.
const MAX_DOWNLOADS = 3

function errorPage(title: string, message: string, status: number) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  return new NextResponse(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0f;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;">
  <div style="max-width:480px;">
    <h1 style="font-size:28px;margin:0 0 12px;background:linear-gradient(135deg,#40a8c4,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${title}</h1>
    <p style="font-size:16px;color:#cbd5e1;line-height:1.6;margin:0 0 24px;">${message}</p>
    <a href="${siteUrl}/white-papers" style="display:inline-block;background:linear-gradient(135deg,#235784,#40a8c4);color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;">Back to resources</a>
  </div>
</body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return errorPage(
      'Missing download token',
      'No download token was provided. Please use the link from the email you received.',
      400
    )
  }

  const lead = await prisma.gatedContentLead.findUnique({ where: { downloadToken: token } })
  if (!lead) {
    return errorPage(
      'Download link not recognized',
      'This download link is not valid. It may have been mistyped. Try requesting a fresh link from the resource page.',
      404
    )
  }

  if (lead.tokenExpiresAt.getTime() < Date.now()) {
    return errorPage(
      'Download link expired',
      'Download links expire 24 hours after they are issued. Head back to the resource page and submit the form again to get a fresh link.',
      410
    )
  }

  // Single-use-ish: a link works a few times within its 24h window (tolerates
  // inbox link-prefetch and accidental re-clicks) but cannot be recycled forever.
  if (lead.downloadCount >= MAX_DOWNLOADS) {
    return errorPage(
      'Download link already used',
      'This link has been used the maximum number of times. Head back to the resource page and submit the form again to get a fresh one.',
      410
    )
  }

  // Resolve the gated PDF asset URL server-side
  const pdfQuery =
    lead.contentType === 'whitepaper' ? whitePaperPdfBySlugQuery : benchmarkPdfBySlugQuery
  const doc = await client.fetch<{ title: string; pdfUrl: string | null } | null>(pdfQuery, {
    slug: lead.contentSlug,
  })
  if (!doc || !doc.pdfUrl) {
    return errorPage(
      'Resource unavailable',
      'The file you requested is no longer available. Please contact us if you believe this is an error.',
      404
    )
  }

  // Count this download and stamp downloadedAt on first use.
  const firstDownload = !lead.downloadedAt
  const downloadedAt = lead.downloadedAt ?? new Date()
  await prisma.gatedContentLead.update({
    where: { id: lead.id },
    data: {
      downloadCount: { increment: 1 },
      ...(firstDownload ? { downloadedAt } : {}),
    },
  })
  if (firstDownload && lead.sanityId) {
    patchGatedContentLeadInSanity(lead.sanityId, { downloadedAt: downloadedAt.toISOString() }).catch(
      (e) => console.error('Failed to patch Sanity lead with downloadedAt:', e)
    )
  }

  // Redirect to the Sanity-hosted PDF asset URL. Token validation is the security boundary.
  return NextResponse.redirect(doc.pdfUrl, { status: 307 })
}
