/**
 * Netlify Scheduled Function that pokes /api/cron/drip once a day.
 *
 * Schedule is set in `netlify.toml`. When promoted, Netlify hits this function
 * on the cron, which in turn calls the Next.js route handler. We do it this way
 * (rather than scheduling the route handler directly) because Netlify Scheduled
 * Functions run via the Netlify Functions runtime, while Next.js route handlers
 * run via the Next.js runtime — invoking one from the other keeps the actual
 * advancement logic in one place (the Next.js handler).
 *
 * Environment:
 *   - CRON_SECRET    (required) shared secret for /api/cron/drip
 *   - URL or DEPLOY_URL (auto-set by Netlify) used as the base URL
 */
import type { Config } from '@netlify/functions'

export default async (req: Request) => {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return new Response(JSON.stringify({ ok: false, error: 'CRON_SECRET not set' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  const base = process.env.URL || process.env.DEPLOY_URL || ''
  if (!base) {
    return new Response(JSON.stringify({ ok: false, error: 'no base URL available' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  const target = `${base}/api/cron/drip`
  const upstream = await fetch(target, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secret}` },
  })
  const body = await upstream.text()
  console.log(`[drip-tick] -> ${target} status=${upstream.status} body=${body.slice(0, 500)}`)

  return new Response(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
  })
}

export const config: Config = {
  // Runs once daily at 14:00 UTC (~09:00 ET / 06:00 PT — middle of US-fleet workday)
  schedule: '0 14 * * *',
}
