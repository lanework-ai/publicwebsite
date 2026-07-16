/**
 * Sends a test admin lead-notification email to a given address so you can
 * preview the "Drip Campaign" section alongside the lead details + attribution.
 *
 * Usage:
 *   node scripts/test-admin-notification.mjs [recipient]
 *   node scripts/test-admin-notification.mjs aalmassry@rapidrelay.ai
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = resolve(__dirname, '../.env.local')
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const val = trimmed.slice(eq + 1).trim()
  if (!process.env[key]) process.env[key] = val
}

const recipient = process.argv[2] || 'aalmassry@rapidrelay.ai'
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM || 'support@rapidrelay.ai'

if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY not found in .env.local')
  process.exit(1)
}

// Inline the admin notification HTML (same logic as lib/email.ts)
const LOGO_CID = 'rrlogo'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rapidrelay.ai'

function firstName(full) {
  const first = (full || '').trim().split(/\s+/)[0] || 'there'
  return first.charAt(0).toUpperCase() + first.slice(1)
}

const UTM_LABELS = {
  utmSource: 'UTM Source',
  utmMedium: 'UTM Medium',
  utmCampaign: 'UTM Campaign',
  utmContent: 'UTM Content',
  utmTerm: 'UTM Term',
  referrer: 'Referrer',
  landingPage: 'Landing Page',
}

const FF = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`

function detailRow(k, v) {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #eef2f5;font-family:${FF};font-size:13px;color:#64748b;width:120px;min-width:120px;vertical-align:top;text-transform:uppercase;letter-spacing:0.04em;">${k}</td>
    <td style="padding:12px 0;border-bottom:1px solid #eef2f5;font-family:${FF};font-size:15px;color:#1a2b3c;font-weight:600;">${v}</td>
  </tr>`
}

function buildAdminHtml({ name, email, company, contentTitle, contentTypeLabel, utm, dripNextSendAt }) {
  const utmRows = utm
    ? Object.entries(utm).filter(([, v]) => v).map(([k, v]) => detailRow(UTM_LABELS[k] ?? k, String(v))).join('')
    : ''

  let dripSection = ''
  if (dripNextSendAt) {
    const d2 = dripNextSendAt
    const d5 = new Date(d2.getTime() + 3 * 24 * 60 * 60 * 1000)
    const d12 = new Date(d2.getTime() + 10 * 24 * 60 * 60 * 1000)
    const fmt = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    dripSection = `
      <tr><td style="padding:30px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <p style="margin:0 0 4px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;font-weight:700;">Drip Campaign</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${detailRow('Day 2', fmt(d2))}
          ${detailRow('Day 5', fmt(d5))}
          ${detailRow('Day 12', fmt(d12) + ' <span style="color:#94a3b8;font-weight:400;">(final — from Ahmed)</span>')}
        </table>
      </td></tr>`
  }

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New ${contentTypeLabel} lead: ${company}</title>
  <style>
    body{margin:0;padding:0;background-color:#eef2f5;}
    table{border-collapse:collapse;}
    .btn-cell,[data-ogsb] .btn-cell{background-color:#235784!important;}
    .btn-link,[data-ogsc] .btn-link{color:#ffffff!important;}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#eef2f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#eef2f5">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">
        <tr><td bgcolor="#0f2740" align="center" style="background-color:#0f2740;border-radius:14px 14px 0 0;padding:32px 40px 30px 40px;">
          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">Rapid Relay</p>
        </td></tr>
        <tr><td bgcolor="#235784" align="center" style="background-color:#235784;padding:18px 40px;">
          <h1 style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;">New ${contentTypeLabel} lead</h1>
        </td></tr>
        <tr><td bgcolor="#40a8c4" style="background-color:#40a8c4;font-size:0;line-height:0;height:4px;">&nbsp;</td></tr>

        <tr><td bgcolor="#ffffff" style="background-color:#ffffff;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="padding:34px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a2b3c;">
              <p style="margin:0 0 4px 0;"><strong style="color:#0f2740;">${name}</strong> from <strong style="color:#0f2740;">${company}</strong> just downloaded:</p>
              <p style="margin:0 0 4px 0;color:#235784;font-weight:600;">${contentTitle}</p>
            </td></tr>
            <tr><td style="padding:18px 40px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${detailRow('Name', name)}
                ${detailRow('Email', `<a href="mailto:${email}" style="color:#235784;text-decoration:none;">${email}</a>`)}
                ${detailRow('Company', company)}
                ${detailRow('Resource', `${contentTitle} <span style="color:#64748b;font-weight:400;">(${contentTypeLabel})</span>`)}
              </table>
            </td></tr>
            <tr><td style="padding:22px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;">
              <a href="mailto:${email}" style="color:#235784;font-weight:700;text-decoration:none;">&rarr; Reply to ${firstName(name)}</a>
            </td></tr>
            ${dripSection}
            ${utmRows ? `<tr><td style="padding:30px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <p style="margin:0 0 4px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;font-weight:700;">Attribution</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${utmRows}</table>
            </td></tr>` : ''}
            <tr><td style="padding:0 40px 36px 40px;">&nbsp;</td></tr>
          </table>
        </td></tr>

        <tr><td bgcolor="#f4f6f8" align="center" style="background-color:#f4f6f8;border-radius:0 0 14px 14px;padding:24px 40px 28px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:#94a3b8;">Internal lead notification from rapidrelay.ai</p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#b6c0cc;">&copy; ${new Date().getFullYear()} Rapid Relay Technologies. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// Test data
const now = new Date()
const dripNextSendAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

const html = buildAdminHtml({
  name: 'Dan Kovacs',
  email: 'dan.kovacs@acmefreight.com',
  company: 'Acme Freight',
  contentTitle: 'Driver Retention Benchmark 2025',
  contentTypeLabel: 'benchmark',
  utm: {
    utmSource: 'linkedin',
    utmMedium: 'cpc',
    utmCampaign: 'driver_retention_q2',
  },
  dripNextSendAt,
})

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: `Lead Notification <${FROM_EMAIL}>`,
    to: recipient,
    subject: '[TEST] New benchmark lead: Acme Freight (Driver Retention Benchmark 2025)',
    html,
  }),
})

const body = await res.json()
if (res.ok) {
  console.log(`✓ Test email sent to ${recipient} (id: ${body.id})`)
} else {
  console.error('✗ Resend error:', body)
  process.exit(1)
}
