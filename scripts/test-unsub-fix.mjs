/**
 * Verifies that hitting /api/newsletter/unsubscribe also pauses the gated-content
 * drip sequence for that email.
 *
 * Flow:
 *   1. Create a fresh test lead via POST /api/gated-content
 *   2. Confirm dripStep=0, dripUnsubscribedAt=null, dripNextSendAt populated
 *   3. Hit /api/newsletter/unsubscribe?email=...
 *   4. Confirm dripUnsubscribedAt is now set
 *   5. Run the drip cron at +5 days (would normally fire day-2)
 *   6. Confirm zero emails sent (the lead was filtered out)
 *   7. Cleanup
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

try {
  const content = readFileSync(join(repoRoot, '.env.local'), 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {}

const BASE = 'http://localhost:3000'
const TEST_EMAIL = 'unsub-test@rapidrelay-test.com'

const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL })
await pgClient.connect()

let pass = 0, fail = 0
function check(name, ok, detail) {
  const badge = ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'
  console.log(`  ${badge}  ${name}${detail ? '  -> ' + detail : ''}`)
  if (ok) pass++; else fail++
}

console.log('\nUnsubscribe-pauses-drip integration test\n')

// 0. Clean any stale rows
await pgClient.query(`DELETE FROM gated_content_leads WHERE email = $1`, [TEST_EMAIL])

// 1. Create lead
const post = await fetch(`${BASE}/api/gated-content`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    email: TEST_EMAIL,
    name: 'Unsub Test',
    company: 'unsub test',
    contentType: 'whitepaper',
    contentSlug: 'driver-retention-is-a-data-problem',
  }),
})
check('1. POST /api/gated-content returns 201', post.status === 201)

// 2. Inspect initial state
const { rows: before } = await pgClient.query(
  `SELECT "dripStep", "dripNextSendAt", "dripUnsubscribedAt" FROM gated_content_leads WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1`,
  [TEST_EMAIL]
)
check('2. lead has dripStep=0', before[0]?.dripStep === 0)
check('2. lead has dripNextSendAt populated', before[0]?.dripNextSendAt != null)
check('2. lead has dripUnsubscribedAt=null', before[0]?.dripUnsubscribedAt == null)

// 3. Hit unsubscribe
const unsub = await fetch(`${BASE}/api/newsletter/unsubscribe?email=${encodeURIComponent(TEST_EMAIL)}`)
check('3. unsub returns 200 even if email not in Newsletter table', unsub.status === 200, `status=${unsub.status}`)

// 4. Inspect post-unsub state
const { rows: after } = await pgClient.query(
  `SELECT "dripUnsubscribedAt" FROM gated_content_leads WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1`,
  [TEST_EMAIL]
)
check('4. dripUnsubscribedAt is now set', after[0]?.dripUnsubscribedAt != null, after[0]?.dripUnsubscribedAt?.toISOString())

// 5+6. Run cron at +5 days. Lead should NOT be in the due set.
const cronUrl = `${BASE}/api/cron/drip?secret=${encodeURIComponent(process.env.CRON_SECRET)}&nowOffsetMs=${5 * 86400000}`
const cronRes = await fetch(cronUrl)
const cronBody = await cronRes.json()
const hitsForOurEmail = (cronBody.results || []).filter((r) => r.email === TEST_EMAIL)
check('5. cron at +5d does not fire for unsubscribed lead', hitsForOurEmail.length === 0, `hits=${hitsForOurEmail.length}, total due=${cronBody.dueCount}`)

// 7. Cleanup
await pgClient.query(`DELETE FROM gated_content_leads WHERE email = $1`, [TEST_EMAIL])
await pgClient.end()

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail > 0 ? 1 : 0)
