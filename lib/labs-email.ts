/**
 * Lanework-branded transactional emails. Self-contained so the shared Rapid Relay
 * templates in lib/email.ts stay byte-identical (no cross-brand bleed). The Lanework
 * flows (gated download, newsletter) route here via a `brand: 'lanework'` flag.
 *
 * Design: light-locked (dark-mode-safe) with a near-black header band carrying the
 * LANEWORK wordmark (no image, so it renders everywhere), one indigo accent, white
 * body, indigo buttons — the Lanework brand, email-client-safe.
 */
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const REPLY_TO = process.env.SALES_REPLY_TO || 'support@rapidrelay.ai'
// Lanework links always point at the Lanework site, independent of which app
// sends the mail. In the standalone Lanework app NEXT_PUBLIC_SITE_URL already is
// lanework.ai; in the Rapid Relay app (whose cron sends Lanework drips against
// the shared DB) set LANEWORK_SITE_URL so those links don't fall back to rapidrelay.ai.
const SITE_ROOT =
  process.env.LANEWORK_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://lanework.ai'

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const ACCENT = '#4f6bff'
const HEADER_BG = '#0d1016'

const esc = (v: unknown): string =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const firstName = (full: string): string => (full || '').trim().split(/\s+/)[0] || 'there'

function unsubscribeUrl(email: string): string {
  return `${SITE_ROOT}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
}
function unsubscribeHeaders(email: string): Record<string, string> {
  const url = unsubscribeUrl(email)
  return { 'List-Unsubscribe': `<${url}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
}

function button(label: string, href: string): string {
  return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td align="center" bgcolor="${ACCENT}" style="background-color:${ACCENT};border-radius:8px;padding:15px 34px;">
          <a href="${href}" style="display:inline-block;font-family:${FONT};font-size:15px;font-weight:700;line-height:1.1;color:#ffffff !important;text-decoration:none;white-space:nowrap;"><font color="#ffffff" style="color:#ffffff !important;">${label}</font></a>
        </td>
      </tr>
    </table>`
}

function shell(opts: {
  title: string
  preheader: string
  heading: string
  body: string
  footerVariant?: 'marketing' | 'internal'
  email?: string
}): string {
  const year = new Date().getFullYear()
  const unsub =
    opts.footerVariant === 'internal' || !opts.email
      ? ''
      : `<p style="margin:8px 0 0 0;font-size:12px;line-height:1.6;color:#94a3b8;"><a href="${unsubscribeUrl(opts.email)}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a></p>`
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${esc(opts.title)}</title>
  <style>
    :root { color-scheme: light only; supported-color-schemes: light only; }
    body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; }
    table { border-collapse:collapse; }
    a { text-decoration:none; }
    @media only screen and (max-width:600px) { .container { width:100% !important; } .px { padding-left:24px !important; padding-right:24px !important; } }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#eef2f5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#eef2f5;">${esc(opts.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#eef2f5" style="background-color:#eef2f5;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">
        <tr><td bgcolor="${HEADER_BG}" align="center" style="background-color:${HEADER_BG};border-radius:14px 14px 0 0;padding:30px 40px 26px 40px;">
          <span style="font-family:${FONT};font-size:20px;font-weight:500;letter-spacing:3px;color:#f4f5f6;">LANEWORK</span>
        </td></tr>
        <tr><td bgcolor="${ACCENT}" style="background-color:${ACCENT};font-size:0;line-height:0;height:3px;">&nbsp;</td></tr>
        <tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding:36px 0 8px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="px">
            <tr><td class="px" style="padding:0 40px 8px 40px;font-family:${FONT};">
              <h1 style="margin:0 0 18px 0;font-size:22px;line-height:1.3;font-weight:600;color:#0f172a;">${esc(opts.heading)}</h1>
            </td></tr>
            ${opts.body}
            <tr><td style="padding:0 40px 36px 40px;">&nbsp;</td></tr>
          </table>
        </td></tr>
        <tr><td bgcolor="#f4f6f8" align="center" style="background-color:#f4f6f8;border-radius:0 0 14px 14px;padding:24px 40px 28px 40px;font-family:${FONT};">
          ${opts.footerVariant === 'internal'
            ? `<p style="margin:0 0 4px 0;font-size:12px;line-height:1.6;color:#94a3b8;">Internal notification from Lanework.</p>`
            : `<p style="margin:0 0 4px 0;font-size:12px;line-height:1.6;color:#94a3b8;">You're receiving this because you signed up at Lanework.</p>`}
          <p style="margin:0;font-size:12px;line-height:1.6;color:#b6c0cc;">&copy; ${year} Lanework. Applied AI research &middot; logistics.</p>
          ${unsub}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim()
}

function gatedDownloadHtml(data: { name: string; contentTitle: string; contentTypeLabel: string; downloadUrl: string; resourceUrl: string }): string {
  const body = `
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.65;color:#1a2b3c;">
      <p style="margin:0 0 14px 0;">Hi ${esc(firstName(data.name))},</p>
      <p style="margin:0;">Thanks for requesting our ${esc(data.contentTypeLabel)}, &#8216;<strong>${esc(data.contentTitle)}</strong>.&#8217; Your download is one click away.</p>
    </td></tr>
    <tr><td align="center" style="padding:24px 40px;">${button('Download the PDF', data.downloadUrl)}</td></tr>
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:13px;line-height:1.6;color:#64748b;text-align:center;">
      Button not working? Paste this link into your browser:<br>
      <a href="${data.downloadUrl}" style="color:${ACCENT};word-break:break-all;">${esc(data.downloadUrl)}</a>
    </td></tr>
    <tr><td class="px" style="padding:22px 40px 0 40px;font-family:${FONT};font-size:14px;line-height:1.6;color:#475569;">
      Heads up: this link expires in 24 hours. If it stops working, you can <a href="${data.resourceUrl}" style="color:${ACCENT};font-weight:600;text-decoration:underline;">grab a fresh one here</a>.
    </td></tr>
    <tr><td class="px" style="padding:22px 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.6;color:#1a2b3c;">
      <p style="margin:0 0 2px 0;">Thanks,</p>
      <p style="margin:0;color:#0f172a;">The Lanework team</p>
    </td></tr>`
  return shell({ title: `Your download: ${data.contentTitle}`, preheader: `Your copy of "${data.contentTitle}" is ready to download.`, heading: 'Your research is ready', body })
}

function welcomeHtml(email: string): string {
  const body = `
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.65;color:#1a2b3c;">
      <p style="margin:0 0 14px 0;">Hi there,</p>
      <p style="margin:0;">Thanks for subscribing to Lanework research. You'll get our white papers and benchmarks as they ship: independent analysis of how freight actually moves, no sales pitch.</p>
    </td></tr>
    <tr><td class="px" style="padding:20px 40px 0 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f0f2ff" style="background-color:#f0f2ff;border-radius:8px;">
        <tr><td width="4" bgcolor="${ACCENT}" style="background-color:${ACCENT};border-radius:8px 0 0 8px;">&nbsp;</td>
        <td style="padding:16px 18px;font-family:${FONT};font-size:14px;line-height:1.7;color:#334155;">
          <strong style="color:#0f172a;">What to expect</strong><br>
          Driver retention, carrier performance, and asset utilization research<br>
          Recurring benchmarks and scorecards<br>
          One or two emails a month
        </td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:24px 40px;">${button('Read the latest research', `${SITE_ROOT}/research`)}</td></tr>
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.6;color:#1a2b3c;">
      <p style="margin:0 0 2px 0;">Best,</p>
      <p style="margin:0;color:#0f172a;">The Lanework team</p>
    </td></tr>`
  return shell({ title: 'Welcome to Lanework research', preheader: 'Thanks for subscribing. Here is what to expect.', heading: 'Welcome to Lanework', body, email })
}

// ---- Send functions --------------------------------------------------------

export async function sendLaneworkGatedDownloadEmail(payload: {
  to: string
  name: string
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
  downloadUrl: string
}) {
  const contentTypeLabel = payload.contentType === 'whitepaper' ? 'research' : 'benchmark'
  const resourceUrl = `${SITE_ROOT}/research/${payload.contentSlug}`
  try {
    const { error } = await resend.emails.send({
      from: `Lanework <${FROM_EMAIL}>`,
      to: payload.to,
      replyTo: REPLY_TO,
      subject: `Your download: ${payload.contentTitle}`,
      headers: unsubscribeHeaders(payload.to),
      html: gatedDownloadHtml({ name: payload.name, contentTitle: payload.contentTitle, contentTypeLabel, downloadUrl: payload.downloadUrl, resourceUrl }),
    })
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[labs-email] gated download send failed:', error)
    return { success: false, error }
  }
}

export async function sendLaneworkNewsletter(email: string) {
  try {
    const welcome = await resend.emails.send({
      from: `Lanework <${FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to Lanework research',
      headers: unsubscribeHeaders(email),
      html: welcomeHtml(email),
    })
    if (ADMIN_EMAIL) {
      await resend.emails.send({
        from: `Lanework <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: 'New Lanework subscriber',
        html: shell({
          title: 'New Lanework subscriber',
          preheader: `${email} subscribed`,
          heading: 'New subscriber',
          footerVariant: 'internal',
          body: `<tr><td class="px" style="padding:0 40px;font-family:${FONT};font-size:15px;line-height:1.6;color:#1a2b3c;">A new subscriber joined the Lanework research list: <a href="mailto:${esc(email)}" style="color:${ACCENT};">${esc(email)}</a>.</td></tr>`,
        }),
      })
    }
    if (welcome.error) throw welcome.error
    return { success: true }
  } catch (error) {
    console.error('[labs-email] newsletter send failed:', error)
    return { success: false, error }
  }
}

// ---- Drip nurture (Lanework-voiced, research-first; same Day 2/5/12 cadence) ----

/** Named sender for the final personal note (shared with the RR sequence's sender). */
const PERSONAL = {
  name: 'Ahmed',
  email: process.env.PERSONAL_SENDER_EMAIL || 'aali@rapidrelay.ai',
}

interface LaneworkDripContext {
  to: string
  name: string
  contentTitle: string
  contentSlug: string
}

function dripStep1Html(ctx: LaneworkDripContext): string {
  const body = `
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.65;color:#1a2b3c;">
      <p style="margin:0 0 14px 0;">Hi ${esc(firstName(ctx.name))},</p>
      <p style="margin:0 0 14px 0;">A couple of days ago you read &#8216;<strong>${esc(ctx.contentTitle)}</strong>.&#8217; If the findings raised questions, the rest of our research digs into the same territory: driver retention, asset utilization, and the operational data behind fleet results.</p>
      <p style="margin:0;">Everything we publish is independent and free to read.</p>
    </td></tr>
    <tr><td align="center" style="padding:24px 40px;">${button('Read the research', `${SITE_ROOT}/research`)}</td></tr>
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.6;color:#1a2b3c;">
      <p style="margin:0 0 2px 0;">Thanks,</p>
      <p style="margin:0;color:#0f172a;">The Lanework team</p>
    </td></tr>`
  return shell({ title: 'The data behind the paper', preheader: 'More research on the same territory, free to read.', heading: 'The data behind the paper', body, email: ctx.to })
}

function dripStep2Html(ctx: LaneworkDripContext): string {
  const body = `
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.65;color:#1a2b3c;">
      <p style="margin:0 0 14px 0;">Hi ${esc(firstName(ctx.name))},</p>
      <p style="margin:0 0 14px 0;">Most of our work starts the way your download did: with a question. Operators bring us a network or a dataset, we run the applied research, and we share what we find. Software only gets built when the evidence earns it.</p>
      <p style="margin:0;">Here is what that looks like on real networks.</p>
    </td></tr>
    <tr><td align="center" style="padding:24px 40px;">${button('See applied research', `${SITE_ROOT}/case-studies`)}</td></tr>
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.6;color:#1a2b3c;">
      <p style="margin:0 0 2px 0;">Thanks,</p>
      <p style="margin:0;color:#0f172a;">The Lanework team</p>
    </td></tr>`
  return shell({ title: 'Start with a study, not a contract', preheader: 'How an applied study with Lanework works.', heading: 'Start with a study, not a contract', body, email: ctx.to })
}

/** Final note is a plain personal 1:1, deliberately unbranded (no header band). */
function dripFinalHtml(ctx: LaneworkDripContext): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>One last note</title></head>
<body style="margin:0;padding:24px;background-color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;font-family:${FONT};font-size:15px;line-height:1.7;color:#1a2b3c;">
    <p style="margin:0 0 14px 0;">Hi ${esc(firstName(ctx.name))},</p>
    <p style="margin:0 0 14px 0;">Ahmed here. I lead research at Lanework. You read &#8216;${esc(ctx.contentTitle)}&#8217; a couple of weeks ago, and I wanted to ask one thing: did it hold up against what you see in your own network?</p>
    <p style="margin:0 0 14px 0;">Whether a finding matches your data or contradicts it, that is the most useful reply you could send us. And if you want us to look at your network directly, we start with a study, not a contract.</p>
    <p style="margin:0 0 14px 0;">Either way, thanks for reading.</p>
    <p style="margin:0;">Ahmed<br><span style="color:#64748b;font-size:13px;">Lanework · applied AI research for logistics</span></p>
    <p style="margin:24px 0 0 0;font-size:12px;color:#94a3b8;"><a href="${unsubscribeUrl(ctx.to)}" style="color:#94a3b8;text-decoration:underline;">Stop these emails</a></p>
  </div>
</body>
</html>`.trim()
}

/** Lanework drip sender; the drip cron routes lanework-brand leads here. */
export async function sendLaneworkDripEmail(step: 1 | 2 | 3, ctx: LaneworkDripContext) {
  const subjects: Record<typeof step, string> = {
    1: 'The data behind the paper',
    2: 'Start with a study, not a contract',
    3: `One last note, ${firstName(ctx.name)}`,
  }
  const htmls: Record<typeof step, string> = {
    1: dripStep1Html(ctx),
    2: dripStep2Html(ctx),
    3: dripFinalHtml(ctx),
  }
  const from = step === 3 ? `${PERSONAL.name} at Lanework <${PERSONAL.email}>` : `Lanework <${FROM_EMAIL}>`
  const replyTo = step === 3 ? PERSONAL.email : REPLY_TO
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: ctx.to,
      replyTo,
      subject: subjects[step],
      html: htmls[step],
      headers: unsubscribeHeaders(ctx.to),
    })
    if (error) throw error
    return { success: true as const, data }
  } catch (error) {
    console.error(`[labs-email] drip step ${step} send failed:`, error)
    return { success: false as const, error }
  }
}

// ---- Blog broadcast (new-note announcement to Lanework subscribers) ----------

function blogBroadcastHtml(data: {
  title: string
  excerpt: string
  slug: string
  readTime?: string
  categories?: string[]
  mainImageUrl?: string
  recipientEmail: string
}): string {
  const postUrl = `${SITE_ROOT}/blog/${data.slug}`
  const metaBits = [data.categories?.[0], data.readTime].filter(Boolean).map((v) => esc(v as string))
  const body = `
    ${data.mainImageUrl ? `
    <tr><td class="px" style="padding:0 40px 20px 40px;">
      <img src="${data.mainImageUrl}" alt="${esc(data.title)}" width="520" style="width:100%;max-width:520px;height:auto;border-radius:10px;display:block;" />
    </td></tr>` : ''}
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};">
      ${metaBits.length > 0 ? `<p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;">${metaBits.join(' &middot; ')}</p>` : ''}
      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.65;color:#1a2b3c;">${esc(data.excerpt)}</p>
    </td></tr>
    <tr><td align="center" style="padding:8px 40px 24px 40px;">${button('Read the note', postUrl)}</td></tr>`
  return shell({
    title: data.title,
    preheader: data.excerpt.slice(0, 140),
    heading: data.title,
    body,
    email: data.recipientEmail,
  })
}

/** Sends a new-note broadcast to every LANEWORK-brand subscriber. Mirrors the RR
 *  sendBlogNewsletter return shape so /api/newsletter/send can combine results. */
export async function sendLaneworkBlogNewsletter(postData: {
  title: string
  excerpt: string
  slug: string
  readTime?: string
  categories?: string[]
  mainImageUrl?: string
}) {
  const subscribers = await prisma.newsletter.findMany({
    where: { brand: 'lanework' },
    select: { email: true },
  })
  let sent = 0
  let failed = 0
  const errors: string[] = []
  for (const s of subscribers) {
    try {
      const { error } = await resend.emails.send({
        from: `Lanework <${FROM_EMAIL}>`,
        to: s.email,
        subject: `New note: ${postData.title}`,
        headers: unsubscribeHeaders(s.email),
        html: blogBroadcastHtml({ ...postData, recipientEmail: s.email }),
      })
      if (error) throw error
      sent++
    } catch (error) {
      failed++
      errors.push(`${s.email}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return { total: subscribers.length, sent, failed, errors }
}
