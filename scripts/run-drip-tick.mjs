/**
 * Drip-sequence smoke test runner.
 *
 * Calls /api/cron/drip with a series of nowOffsetMs values that simulate
 * advancing time by 2, 5, and 12 days. Each tick should fire the next
 * drip email in the sequence for any leads who are due.
 *
 * Requires:
 *   - Dev server running (default http://localhost:3000)
 *   - CRON_SECRET in .env.local
 *   - ALLOW_DRIP_TIME_SHIM=1 in .env.local
 *   - The 002 migration applied to the DB (drip columns exist)
 *
 * Usage:
 *   node scripts/run-drip-tick.mjs           # play the full sequence
 *   node scripts/run-drip-tick.mjs --once    # single tick at now() (production-like)
 *   node scripts/run-drip-tick.mjs --status  # show all leads' drip state without ticking
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

function loadEnv() {
  try {
    const content = readFileSync(join(repoRoot, '.env.local'), 'utf8')
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
    }
  } catch {}
}
loadEnv()

const base = process.env.DRIP_BASE_URL || 'http://localhost:3000'
const secret = process.env.CRON_SECRET
if (!secret) {
  console.error('CRON_SECRET not set in .env.local')
  process.exit(1)
}

async function tick(offsetDays) {
  const offsetMs = offsetDays * 24 * 60 * 60 * 1000
  const url = `${base}/api/cron/drip?secret=${encodeURIComponent(secret)}&nowOffsetMs=${offsetMs}`
  const r = await fetch(url)
  const body = await r.json()
  if (!r.ok) {
    console.error(`  HTTP ${r.status}: ${JSON.stringify(body)}`)
    return body
  }
  return body
}

async function status() {
  // Hit the latest-leads checker via a separate route so we don't import Prisma here.
  // Instead, we'll print a summary directly via pg in check-latest-lead style.
  const { default: pg } = await import('pg')
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    const { rows } = await client.query(`
      SELECT id, email, name, "contentType", "contentSlug",
             "dripStep", "dripNextSendAt", "dripUnsubscribedAt", "createdAt"
      FROM gated_content_leads
      ORDER BY "createdAt" DESC
      LIMIT 10
    `)
    console.log(`Most recent ${rows.length} lead(s):\n`)
    for (const r of rows) {
      const stepDesc = ['day-0 only', 'day-2 sent', 'day-5 sent', 'final sent (done)'][r.dripStep] ?? `step ${r.dripStep}`
      console.log(`  ${r.email}  (${r.name}) — step ${r.dripStep} (${stepDesc})`)
      console.log(`     content:    ${r.contentType}/${r.contentSlug}`)
      console.log(`     created:    ${r.createdAt.toISOString()}`)
      console.log(`     next send:  ${r.dripNextSendAt ? r.dripNextSendAt.toISOString() : 'none (sequence complete or paused)'}`)
      console.log(`     unsub:      ${r.dripUnsubscribedAt ? r.dripUnsubscribedAt.toISOString() : 'no'}`)
      console.log('')
    }
  } finally {
    await client.end()
  }
}

const mode = process.argv[2]

if (mode === '--status') {
  await status()
  process.exit(0)
}

if (mode === '--once') {
  console.log('Single tick at now() (production-like):')
  const out = await tick(0)
  console.log(JSON.stringify(out, null, 2))
  process.exit(0)
}

// Default: play the full sequence by offsetting time forward.
// We use offsetDays values just past each milestone to make sure due rows fire.
const offsets = [2.01, 5.01, 12.01]
console.log(`Running full drip simulation against ${base}\n`)
console.log('Initial status:')
await status()

for (const days of offsets) {
  console.log(`\n--- Tick at +${days} days ---`)
  const out = await tick(days)
  console.log(`  due: ${out.dueCount}, sent: ${out.sentCount}, failed: ${out.failedCount}`)
  for (const r of out.results || []) {
    const dispo = r.ok ? `✓ step ${r.step} sent` : `✗ step ${r.step} failed (${r.error})`
    console.log(`    ${r.email}  ${dispo}  next=${r.nextSendAt || 'done'}`)
  }
}

console.log('\nFinal status:')
await status()
