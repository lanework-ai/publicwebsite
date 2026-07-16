/**
 * Reads the latest gated_content_leads row from production Supabase so we can
 * verify the smoke-test submission and exercise the download link.
 *
 * Run: node scripts/check-latest-lead.mjs
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

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
try {
  await client.connect()
  const { rows } = await client.query(
    `SELECT id, "contentType", "contentSlug", email, name, company,
            "downloadToken", "tokenExpiresAt", "downloadedAt", "createdAt", "sanityId"
     FROM gated_content_leads
     ORDER BY "createdAt" DESC
     LIMIT 5`
  )
  console.log(`Found ${rows.length} most recent lead(s):\n`)
  for (const r of rows) {
    console.log(`  id:             ${r.id}`)
    console.log(`  email:          ${r.email}`)
    console.log(`  name / company: ${r.name} / ${r.company}`)
    console.log(`  content:        ${r.contentType} / ${r.contentSlug}`)
    console.log(`  token:          ${r.downloadToken}`)
    console.log(`  expires:        ${r.tokenExpiresAt.toISOString()}`)
    console.log(`  downloaded:     ${r.downloadedAt ? r.downloadedAt.toISOString() : 'not yet'}`)
    console.log(`  sanityId:       ${r.sanityId || 'not synced'}`)
    console.log(`  created:        ${r.createdAt.toISOString()}`)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    console.log(`  download URL:   ${siteUrl}/api/gated-content/download?token=${r.downloadToken}`)
    console.log(`  LOCAL download: http://localhost:3000/api/gated-content/download?token=${r.downloadToken}`)
    console.log('')
  }
} catch (e) {
  console.error('Failed:', e.message)
  process.exit(1)
} finally {
  await client.end()
}
