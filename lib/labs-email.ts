/**
 * Every transactional email Lanework sends: gated downloads, newsletter welcome
 * and broadcast, the drip sequence, and internal notifications. This is the only
 * email module in the app.
 *
 * Design: light-locked (dark-mode-safe) with a near-black header band carrying the
 * LANEWORK wordmark as text rather than an image, so it renders in every client
 * and there is no logo attachment to go stale. One indigo accent (--lw-accent),
 * white body, indigo buttons.
 *
 * Addresses all come from env so nothing is hardcoded to a domain:
 *   EMAIL_FROM            the visible sender, e.g. research@lanework.ai
 *   SALES_REPLY_TO        where replies land, e.g. hello@lanework.ai
 *   ADMIN_EMAIL           internal notifications destination
 *   PERSONAL_SENDER_EMAIL the human sender on the final drip note
 */
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const REPLY_TO = process.env.SALES_REPLY_TO || 'hello@lanework.ai'
// Links always point at the Lanework site, whatever host the job runs on.
// Defaults to lanework.ai; override with LANEWORK_SITE_URL.
const SITE_ROOT = process.env.LANEWORK_SITE_URL || 'https://lanework.ai'

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const ACCENT = '#4f6bff'
const HEADER_BG = '#0d1016'

const esc = (v: unknown): string =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const firstName = (full: string): string => {
  const first = (full || '').trim().split(/\s+/)[0] || 'there'
  // Capitalize so lowercase form entries read like a name (matches lib/email.ts).
  return first.charAt(0).toUpperCase() + first.slice(1)
}

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
      replyTo: REPLY_TO,
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

/**
 * Named sender for the final personal note (shared with the RR sequence's sender).
 * Name and address are read together from env so they can never drift apart: setting
 * only PERSONAL_SENDER_EMAIL would otherwise produce a From line like
 * "Alexander at Lanework <someone.else@lanework.ai>".
 */
const PERSONAL = {
  name: process.env.PERSONAL_SENDER_NAME || 'Alexander',
  email: process.env.PERSONAL_SENDER_EMAIL || 'alexander@lanework.ai',
}

interface LaneworkDripContext {
  to: string
  name: string
  contentTitle: string
  contentSlug: string
}

/**
 * Per-paper drip copy, keyed by contentSlug. Mirrors the variantsBySlug pattern in
 * the Rapid Relay app's lib/paid-lp-variants.ts: look the slug up, fall back cleanly
 * when it is not mapped.
 *
 * `paras` are trusted HTML fragments authored here. Anything derived from the lead
 * or the Sanity doc must be passed through esc() when the copy is built.
 */
interface DripStepCopy {
  subject: string
  heading: string
  preheader: string
  paras: string[]
  cta: { label: string; href: string }
}
interface DripPaperCopy {
  step1: DripStepCopy
  step2: DripStepCopy
  /** Step 3 keeps the `One last note, <first>` subject and the unbranded layout. */
  step3: { paras: string[] }
}
type DripCopyFactory = (ctx: LaneworkDripContext) => DripPaperCopy

/**
 * Content-agnostic default. A paper with no entry below still gets copy that is
 * true of any Lanework research, so a newly published paper can never inherit a
 * different paper's argument.
 */
const genericDripCopy: DripCopyFactory = (ctx) => ({
  step1: {
    subject: 'The data behind the paper',
    heading: 'The data behind the paper',
    preheader: 'More research on the same territory, free to read.',
    paras: [
      `A couple of days ago you read &#8216;<strong>${esc(ctx.contentTitle)}</strong>.&#8217; If the findings raised questions, the rest of our research digs into the same territory: driver retention, asset utilization, and the operational data behind fleet results.`,
      'Everything we publish is independent and free to read.',
    ],
    cta: { label: 'Read the research', href: `${SITE_ROOT}/research` },
  },
  step2: {
    subject: 'Start with a study, not a contract',
    heading: 'Start with a study, not a contract',
    preheader: 'How an applied study with Lanework works.',
    paras: [
      'Most of our work starts the way your download did: with a question. Operators bring us a network or a dataset, we run the applied research, and we share what we find. Software only gets built when the evidence earns it.',
      'Here is what that looks like on real networks.',
    ],
    cta: { label: 'See the field work', href: `${SITE_ROOT}/field-work` },
  },
  step3: {
    paras: [
      `${PERSONAL.name} here. I lead research at Lanework. You read &#8216;${esc(ctx.contentTitle)}&#8217; a couple of weeks ago, and I wanted to ask one thing: did it hold up against what you see in your own network?`,
      'Whether a finding matches your data or contradicts it, that is the most useful reply you could send us. And if you want us to look at your network directly, we start with a study, not a contract.',
      'Either way, thanks for reading.',
    ],
  },
})

/** White paper #2: "One in Six Miles Earns $0" (deadhead / empty miles). */
const deadheadDripCopy: DripCopyFactory = (ctx) => ({
  step1: {
    subject: 'One in six miles earns nothing',
    heading: 'One in six miles earns nothing',
    preheader: 'The 2024 deadhead number, and what it costs per truck.',
    paras: [
      `A couple of days ago you read &#8216;<strong>${esc(ctx.contentTitle)}</strong>.&#8217; The number underneath the title is worth sitting with: the average U.S. truckload carrier drove 16.7% of its miles empty in 2024. Across all fleet types the unfiltered range runs 15% to 35%.`,
      'On a truck running 100,000 miles a year at a 20% empty rate, that is about $37,000 gone. Across a 50 truck fleet it is roughly $1.85M a year. Industry wide the estimate lands somewhere between $27B and $54B.',
      'It compounds a margin problem that is already tight. Non-fuel operating costs hit a record $1.779 per mile in 2024, against an average truckload operating margin of negative 2.3%.',
    ],
    cta: { label: 'Read the research', href: `${SITE_ROOT}/research` },
  },
  step2: {
    subject: 'Why load boards did not fix it',
    heading: 'Why load boards did not fix it',
    preheader: 'Every fix so far optimizes the wrong unit.',
    paras: [
      'The second half of the paper is the part that tends to take longer to land: deadhead has not survived because nobody attacked it. It survived because every fix attacked the wrong unit.',
      'Load boards, digital freight matching, and AI routing all do the same thing. They find a load for a truck that is already empty and already out of position. That helps at the margin, and reported gains land in the 10% to 45% range, but the architecture that created the empty mile is left untouched.',
      'Relay changes the unit of optimization. It breaks a long haul into regional segments and designs the backhaul into the route before the driver departs, so the return leg is planned rather than hunted. Deadhead moves from a default condition to an exception, and asset utilization moves from roughly 65% toward 80% or better.',
    ],
    cta: { label: 'See the field work', href: `${SITE_ROOT}/field-work` },
  },
  step3: {
    paras: [
      `${PERSONAL.name} here. I lead research at Lanework. You read &#8216;${esc(ctx.contentTitle)}&#8217; a couple of weeks ago and I wanted to ask one thing: do you know your own deadhead rate, and does it sit above or below the 16.7% average?`,
      'Most operators we talk to either do not measure it at the route level or measure it after the fact, once the empty mile is already paid for. If you have the number and it contradicts what we published, that is genuinely the most useful reply you could send.',
      'And if you want us to look at your network directly, we start with a study, not a contract.',
      'Either way, thanks for reading.',
    ],
  },
})

/**
 * White paper #1: "Driver Retention is a Data Problem". Originally nurtured by the
 * Rapid Relay sequence; moved here so both papers are Lanework-voiced as rapidrelay.ai
 * sunsets. The drip cron routes this slug to the Lanework sender regardless of brand.
 */
const driverRetentionDripCopy: DripCopyFactory = (ctx) => ({
  step1: {
    subject: 'Bigger fleets lose more drivers',
    heading: 'Bigger fleets lose more drivers',
    preheader: 'A 94% turnover rate, and why it is not about pay.',
    paras: [
      `A couple of days ago you read &#8216;<strong>${esc(ctx.contentTitle)}</strong>.&#8217; The figure that reframes the whole conversation: large long-haul carriers lose roughly 94% of their drivers every year, against an industry average of 48%.`,
      'The scale of it is easy to lose track of. Replacing one driver costs about $12,799, and the industry spends an estimated $18.7B a year on departures that were largely preventable.',
      'The instinct is to read that as a pay problem. Our research does not support that. Route length, home time frequency, and asset utilization explain more of the variation in turnover than pay raises do.',
    ],
    cta: { label: 'Read the research', href: `${SITE_ROOT}/research` },
  },
  step2: {
    subject: 'They are not leaving trucking',
    heading: 'They are not leaving trucking',
    preheader: 'Most turnover is a competitive loss, not an industry exit.',
    paras: [
      'The finding in the paper that tends to take longest to land is this one: most turnover is drivers switching carriers, not leaving trucking. That makes it a competitive failure rather than a labor shortage. Those drivers went to operators running better lanes.',
      'The structure shows up clearly in the data. Around 80% of fleets with a length of haul under 500 miles report turnover below 50%, and 49.1% of job-seeking drivers cite the need for consistent miles as a reason for moving.',
      'That is why short-haul, regional, and dedicated operations retain so much better than long-haul OTR. Relay restructures the same three variables that predict exits, which is the structural fix the paper builds toward.',
    ],
    cta: { label: 'See the field work', href: `${SITE_ROOT}/field-work` },
  },
  step3: {
    paras: [
      `${PERSONAL.name} here. I lead research at Lanework. You read &#8216;${esc(ctx.contentTitle)}&#8217; a couple of weeks ago and I wanted to ask one thing: do you know your own turnover number, and do you know which lanes produce it?`,
      'Most operators can tell us the fleet-wide figure but not the route-level one, and the route level is where the decision that caused the exit actually happened. If your data contradicts what we published, that is genuinely the most useful reply you could send.',
      'And if you want us to look at your network directly, we start with a study, not a contract.',
      'Either way, thanks for reading.',
    ],
  },
})

const DRIP_COPY_BY_SLUG: Record<string, DripCopyFactory> = {
  'driver-retention-is-a-data-problem': driverRetentionDripCopy,
  'one-in-six-miles-earns-zero': deadheadDripCopy,
}

function resolveDripCopy(ctx: LaneworkDripContext): DripPaperCopy {
  return (DRIP_COPY_BY_SLUG[ctx.contentSlug] ?? genericDripCopy)(ctx)
}

/** Render body paragraphs; the last one drops its bottom margin. */
function dripParas(items: string[]): string {
  return items
    .map((p, i) => `<p style="margin:0 0 ${i === items.length - 1 ? '0' : '14px'} 0;">${p}</p>`)
    .join('\n      ')
}

function dripBrandedHtml(ctx: LaneworkDripContext, copy: DripStepCopy): string {
  const body = `
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.65;color:#1a2b3c;">
      <p style="margin:0 0 14px 0;">Hi ${esc(firstName(ctx.name))},</p>
      ${dripParas(copy.paras)}
    </td></tr>
    <tr><td align="center" style="padding:24px 40px;">${button(copy.cta.label, copy.cta.href)}</td></tr>
    <tr><td class="px" style="padding:0 40px 0 40px;font-family:${FONT};font-size:16px;line-height:1.6;color:#1a2b3c;">
      <p style="margin:0 0 2px 0;">Thanks,</p>
      <p style="margin:0;color:#0f172a;">The Lanework team</p>
    </td></tr>`
  return shell({ title: copy.subject, preheader: copy.preheader, heading: copy.heading, body, email: ctx.to })
}

/** Final note is a plain personal 1:1, deliberately unbranded (no header band). */
function dripFinalHtml(ctx: LaneworkDripContext, copy: DripPaperCopy['step3']): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>One last note</title></head>
<body style="margin:0;padding:24px;background-color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;font-family:${FONT};font-size:15px;line-height:1.7;color:#1a2b3c;">
    <p style="margin:0 0 14px 0;">Hi ${esc(firstName(ctx.name))},</p>
    ${copy.paras.map((p) => `<p style="margin:0 0 14px 0;">${p}</p>`).join('\n    ')}
    <p style="margin:0;">${PERSONAL.name}<br><span style="color:#64748b;font-size:13px;">Lanework · applied AI research for logistics</span></p>
    <p style="margin:24px 0 0 0;font-size:12px;color:#94a3b8;"><a href="${unsubscribeUrl(ctx.to)}" style="color:#94a3b8;text-decoration:underline;">Stop these emails</a></p>
  </div>
</body>
</html>`.trim()
}

/**
 * Subject + HTML for one step of the sequence. Exported so local previews and tests
 * render the real copy rather than duplicating it (see scripts/preview-drip-emails.mjs).
 */
export function renderLaneworkDrip(
  step: 1 | 2 | 3,
  ctx: LaneworkDripContext
): { subject: string; html: string } {
  const copy = resolveDripCopy(ctx)
  const subjects: Record<1 | 2 | 3, string> = {
    1: copy.step1.subject,
    2: copy.step2.subject,
    3: `One last note, ${firstName(ctx.name)}`,
  }
  const htmls: Record<1 | 2 | 3, string> = {
    1: dripBrandedHtml(ctx, copy.step1),
    2: dripBrandedHtml(ctx, copy.step2),
    3: dripFinalHtml(ctx, copy.step3),
  }
  return { subject: subjects[step], html: htmls[step] }
}

/** Lanework drip sender; the drip cron routes lanework-brand leads here. */
export async function sendLaneworkDripEmail(step: 1 | 2 | 3, ctx: LaneworkDripContext) {
  const rendered = renderLaneworkDrip(step, ctx)
  const subjects = { [step]: rendered.subject } as Record<1 | 2 | 3, string>
  const htmls = { [step]: rendered.html } as Record<1 | 2 | 3, string>
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

/* ---- Contact form: internal admin notification ---------------------------- */
/**
 * Notifies the team when someone submits the contact form. Internal only, so it
 * uses the plain internal footer rather than the marketing one, and carries no
 * unsubscribe link. Replies go to the person who filled in the form.
 */
export async function sendContactNotification(contact: {
  name: string
  email: string
  company: string
  fleetSize?: string | null
  message?: string | null
  intent?: string | null
}) {
  if (!ADMIN_EMAIL) {
    console.warn('[labs-email] ADMIN_EMAIL not set; skipping contact notification')
    return { skipped: true }
  }

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:7px 0;font-family:${FONT};font-size:13px;color:#6b7280;width:120px;vertical-align:top;">${esc(label)}</td>
      <td style="padding:7px 0;font-family:${FONT};font-size:14px;color:#111827;">${esc(value)}</td>
    </tr>`

  const body = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
      ${row('Name', contact.name)}
      ${row('Email', contact.email)}
      ${row('Company', contact.company)}
      ${contact.intent ? row('Interested in', contact.intent) : ''}
      ${contact.fleetSize ? row('Fleet size', contact.fleetSize) : ''}
    </table>
    ${
      contact.message
        ? `<p style="font-family:${FONT};font-size:14px;line-height:1.65;color:#374151;margin:20px 0 0;white-space:pre-wrap;">${esc(contact.message)}</p>`
        : `<p style="font-family:${FONT};font-size:13px;color:#9ca3af;margin:20px 0 0;">No message provided.</p>`
    }`

  try {
    const { data, error } = await resend.emails.send({
      from: `Lanework <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      replyTo: contact.email,
      subject: `New enquiry from ${contact.company}`,
      html: shell({
        title: 'New enquiry',
        preheader: `${contact.name} at ${contact.company}`,
        heading: 'New enquiry',
        body,
        footerVariant: 'internal',
      }),
    })
    if (error) {
      console.error('[labs-email] contact notification failed', error)
      return { error }
    }
    return { data }
  } catch (err) {
    console.error('[labs-email] contact notification threw', err)
    return { error: err }
  }
}
