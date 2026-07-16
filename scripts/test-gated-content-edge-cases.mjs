/**
 * Edge-case test runner for /api/gated-content and /api/gated-content/download.
 *
 * Walks every scenario in F4-F5 of the original Phase 1 plan:
 *
 *   F4 / POST /api/gated-content
 *     1. happy path                              -> 201
 *     2. invalid email (no @)                    -> 400
 *     3. disposable email domain                 -> 400
 *     4. missing required field (no slug)        -> 400
 *     5. unknown slug                            -> 404
 *     6. honeypot tripped                        -> 200 (silent)
 *     7. rate limit (6 requests in 1 min)        -> last is 429
 *     8. duplicate submission                    -> both 201
 *
 *   F5 / GET /api/gated-content/download
 *     1. valid token                              -> 307 -> PDF
 *     2. missing token                            -> 400
 *     3. unknown token                            -> 404
 *     4. expired token                            -> 410
 *     5. re-download within expiry                -> 307 again, still PDF
 *
 * The script logs PASS/FAIL per scenario and exits non-zero if any case is wrong.
 * Side effects: creates several lead rows in production Supabase (clearly tagged
 * with company="edge-case test") + a few rows in Sanity. The runner deletes its
 * own rows at the end.
 *
 * Run:  node scripts/test-gated-content-edge-cases.mjs
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

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
const SLUG = process.env.TEST_SLUG || 'driver-retention-is-a-data-problem'
const TAG = 'edge-case test'

const results = []
function record(name, ok, detail) {
  results.push({ name, ok, detail })
  const badge = ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'
  console.log(`  ${badge}  ${name}${detail ? '  -> ' + detail : ''}`)
}

async function postLead(overrides = {}) {
  const body = {
    email: 'edge-case-test@rapidrelay-test.com',
    name: 'Edge Test',
    company: TAG,
    contentType: 'whitepaper',
    contentSlug: SLUG,
    ...overrides,
  }
  const r = await fetch(`${BASE}/api/gated-content`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  let json = null
  try { json = await r.json() } catch {}
  return { status: r.status, body: json }
}

async function getDownload(token) {
  const r = await fetch(`${BASE}/api/gated-content/download${token != null ? '?token=' + token : ''}`, {
    redirect: 'manual',
  })
  return { status: r.status, location: r.headers.get('location') }
}

console.log(`\nEdge-case test against ${BASE} (slug: ${SLUG})\n`)

// ----- F4 -----
// IMPORTANT: rate limit is 5 requests / minute / IP. We must order tests so
// each one runs in a clean window. Strategy:
//   - Tests F4.6 (honeypot) goes FIRST in a clean window because it has unique
//     behavior we can't verify any other way.
//   - F4.1-F4.5 use 5 requests, exhausting the window.
//   - F4.7 (rate limit burst) is the next request, which we expect to 429.
//   - We wait, then run F4.8 and F5.
console.log('F4. POST /api/gated-content')

// 6 / honeypot (run first in a clean rate window)
const honeypot = await postLead({ email: 'edge-honeypot@rapidrelay-test.com', _honeypot: 'i am a bot' })
record('F4.6 honeypot tripped returns 200 silent', honeypot.status === 200, `status=${honeypot.status}`)

// 1. Happy path
const happy = await postLead({ email: 'edge-happy@rapidrelay-test.com' })
record('F4.1 happy path returns 201', happy.status === 201 && happy.body?.success === true, `status=${happy.status}`)

// 2. Invalid email
const invalid = await postLead({ email: 'not-an-email' })
record('F4.2 invalid email returns 400', invalid.status === 400, `status=${invalid.status}`)

// 3. Disposable email
const disposable = await postLead({ email: 'spam@tempmail.com' })
record('F4.3 disposable email returns 400', disposable.status === 400, `status=${disposable.status}`)

// 4. Missing slug
const missing = await postLead({ contentSlug: '' })
record('F4.4 missing slug returns 400', missing.status === 400, `status=${missing.status}`)

// 5. Unknown slug. NOTE: this is request #6 in the window, so the rate limiter
// fires first and we get 429 BEFORE the route checks the slug. Skip and verify
// after window reset.
// (To keep flow simple, we just verify it after the wait below.)

// 7. Rate limit. We've just hit 5 in this window, the next request should 429.
const burst = []
for (let i = 0; i < 5; i++) {
  burst.push(await postLead({ email: `edge-rl-${i}@rapidrelay-test.com` }))
}
const limitedAt = burst.findIndex((r) => r.status === 429)
record(
  'F4.7 rate limit triggers 429 within 5 burst requests',
  limitedAt !== -1,
  limitedAt !== -1 ? `limited at burst request #${limitedAt + 1}` : 'never limited'
)

// Wait 65s for the rate-limit window to clear before F4.5 + F4.8 + F5.
console.log('  ... waiting 65s for rate-limit window to clear')
await new Promise((r) => setTimeout(r, 65000))

// 5. Unknown slug (deferred from above)
const unknownSlug = await postLead({ contentSlug: 'this-slug-does-not-exist-xyz', email: 'edge-unknownslug@rapidrelay-test.com' })
record('F4.5 unknown slug returns 404', unknownSlug.status === 404, `status=${unknownSlug.status}`)

// 8. Duplicate submission (same email, same paper)
const dup1 = await postLead({ email: 'edge-dup@rapidrelay-test.com' })
const dup2 = await postLead({ email: 'edge-dup@rapidrelay-test.com' })
record('F4.8 duplicate submission creates two leads (both 201)', dup1.status === 201 && dup2.status === 201, `${dup1.status}/${dup2.status}`)

// ----- F5 -----
console.log('\nF5. GET /api/gated-content/download')

// 1. Need a real token. Fetch the most recent edge-case lead from DB.
const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL })
await pgClient.connect()

const { rows: leadRows } = await pgClient.query(
  `SELECT id, "downloadToken", "tokenExpiresAt" FROM gated_content_leads
   WHERE company = $1 AND email = $2 ORDER BY "createdAt" DESC LIMIT 1`,
  [TAG, 'edge-dup@rapidrelay-test.com']
)
const realToken = leadRows[0]?.downloadToken

// 1. Valid token
const valid = realToken ? await getDownload(realToken) : { status: -1 }
record('F5.1 valid token returns 307', valid.status === 307, `status=${valid.status}`)

// 2. Missing token (omitted ?token=)
const missingToken = await getDownload(null)
record('F5.2 missing token returns 400', missingToken.status === 400, `status=${missingToken.status}`)

// 3. Unknown token
const unknownToken = await getDownload('bogus-token-not-in-db-xyz')
record('F5.3 unknown token returns 404', unknownToken.status === 404, `status=${unknownToken.status}`)

// 4. Expired token. Patch a real lead's expiry into the past.
if (realToken) {
  await pgClient.query(
    `UPDATE gated_content_leads SET "tokenExpiresAt" = NOW() - INTERVAL '1 hour' WHERE "downloadToken" = $1`,
    [realToken]
  )
  const expired = await getDownload(realToken)
  record('F5.4 expired token returns 410', expired.status === 410, `status=${expired.status}`)
  // Restore for F5.5 (push expiry to +24h)
  await pgClient.query(
    `UPDATE gated_content_leads SET "tokenExpiresAt" = NOW() + INTERVAL '24 hours' WHERE "downloadToken" = $1`,
    [realToken]
  )
} else {
  record('F5.4 expired token returns 410', false, 'skipped (no realToken)')
}

// 5. Re-download within expiry should succeed every time
const re1 = realToken ? await getDownload(realToken) : { status: -1 }
const re2 = realToken ? await getDownload(realToken) : { status: -1 }
record('F5.5 re-download within expiry returns 307 every time', re1.status === 307 && re2.status === 307, `${re1.status}/${re2.status}`)

// ----- Cleanup -----
console.log('\nCleanup: removing edge-case test rows from gated_content_leads')
const { rowCount } = await pgClient.query(`DELETE FROM gated_content_leads WHERE company = $1`, [TAG])
console.log(`  deleted ${rowCount} test row(s) from Postgres`)
console.log('  note: corresponding Sanity gatedContentLead docs are NOT auto-deleted')
console.log('        (Sanity Studio: filter by company = "edge-case test" and bulk delete)')
await pgClient.end()

// ----- Summary -----
console.log('\n=== Summary ===')
const passed = results.filter((r) => r.ok).length
const failed = results.filter((r) => !r.ok).length
console.log(`${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('\nFailures:')
  for (const r of results.filter((r) => !r.ok)) {
    console.log(`  ${r.name}: ${r.detail || '(no detail)'}`)
  }
  process.exit(1)
}
process.exit(0)
