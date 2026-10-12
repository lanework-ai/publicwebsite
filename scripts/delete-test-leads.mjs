/**
 * Deletes smoke-test submissions from Supabase + Sanity.
 *
 * Default (gated-content leads):
 *   Matches on: email = 'rapidrelayapp@gmail.com' AND company LIKE 'Rapid Relay (test%'
 *   Run: node scripts/delete-test-leads.mjs
 *
 * --contacts (contact-form enquiries):
 *   Matches on: email = 'rapidrelayapp@gmail.com' AND company LIKE 'Lanework (test%'
 *   Deletes the Sanity contact docs, their sanity_syncs rows, then the contacts rows.
 *   Run: node scripts/delete-test-leads.mjs --contacts
 *
 * Add --dry-run to preview without deleting.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'
import { createClient } from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

try {
  const content = readFileSync(join(repoRoot, '.env.local'), 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {}

const DRY_RUN = process.argv.includes('--dry-run')

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-30',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL })

// contacts has no sanityId column, so the Sanity doc ids come from sanity_syncs,
// falling back to a lookup by postgresId. Read them before any row is deleted.
async function deleteTestContacts() {
  const { rows } = await pgClient.query(
    `SELECT c.id, c.email, c.company, s."sanityId"
     FROM contacts c
     LEFT JOIN sanity_syncs s ON s."entityType" = 'contact' AND s."entityId" = c.id
     WHERE c.email = 'rapidrelayapp@gmail.com' AND c.company LIKE 'Lanework (test%'`
  )
  console.log(`Found ${rows.length} test contact(s):`)
  for (const r of rows) {
    console.log(`  - ${r.id} | ${r.email} | ${r.company} | sanityId: ${r.sanityId || 'none'}`)
  }
  if (rows.length === 0) {
    console.log('Nothing to delete.')
    return
  }

  const contactIds = [...new Set(rows.map((r) => r.id))]
  const byPostgresId = await sanity.fetch(
    `*[_type == "contact" && postgresId in $ids]._id`,
    { ids: contactIds }
  )
  const sanityIds = [...new Set([...rows.map((r) => r.sanityId).filter(Boolean), ...byPostgresId])]
  console.log(`Sanity contact doc(s) to delete: ${sanityIds.length ? sanityIds.join(', ') : 'none'}`)

  if (DRY_RUN) {
    console.log('\nDry run; nothing deleted.')
    return
  }

  if (sanityIds.length > 0) {
    const tx = sanity.transaction()
    for (const id of sanityIds) tx.delete(id)
    await tx.commit()
    console.log(`  Deleted ${sanityIds.length} Sanity contact doc(s).`)
  }
  const { rowCount: syncsDeleted } = await pgClient.query(
    `DELETE FROM sanity_syncs WHERE "entityType" = 'contact' AND "entityId" = ANY($1::text[])`,
    [contactIds]
  )
  console.log(`  Deleted ${syncsDeleted} sanity_syncs row(s).`)
  const { rowCount: contactsDeleted } = await pgClient.query(
    `DELETE FROM contacts WHERE id = ANY($1::text[])`,
    [contactIds]
  )
  console.log(`  Deleted ${contactsDeleted} contacts row(s).`)
  console.log('\n✅ Done.')
}

if (process.argv.includes('--contacts')) {
  try {
    await pgClient.connect()
    await deleteTestContacts()
  } catch (e) {
    console.error('Failed:', e.message)
    process.exitCode = 1
  } finally {
    await pgClient.end()
  }
  process.exit()
}

try {
  await pgClient.connect()
  const { rows } = await pgClient.query(
    `SELECT id, email, company, "sanityId" FROM gated_content_leads
     WHERE email = 'rapidrelayapp@gmail.com' AND company LIKE 'Rapid Relay (test%'`
  )
  console.log(`Found ${rows.length} test lead(s):`)
  for (const r of rows) {
    console.log(`  - ${r.id} | ${r.email} | ${r.company} | sanityId: ${r.sanityId || 'none'}`)
  }
  if (rows.length === 0) {
    console.log('Nothing to delete.')
    process.exit(0)
  }

  if (DRY_RUN) {
    console.log('\nDry run; nothing deleted.')
    process.exit(0)
  }

  // Delete Sanity docs first (so the back-reference from Postgres exists if we hit an error mid-loop)
  const sanityIds = rows.map((r) => r.sanityId).filter(Boolean)
  if (sanityIds.length > 0) {
    console.log(`\nDeleting ${sanityIds.length} Sanity gatedContentLead doc(s)...`)
    const tx = sanity.transaction()
    for (const id of sanityIds) tx.delete(id)
    await tx.commit()
    console.log('  Sanity docs deleted.')
  }

  // Delete corresponding sanity_syncs rows (optional cleanup so the log is tidy)
  const leadIds = rows.map((r) => r.id)
  const { rowCount: syncsDeleted } = await pgClient.query(
    `DELETE FROM sanity_syncs WHERE "entityType" = 'gatedContentLead' AND "entityId" = ANY($1::text[])`,
    [leadIds]
  )
  console.log(`  Deleted ${syncsDeleted} sanity_syncs row(s).`)

  const { rowCount: leadsDeleted } = await pgClient.query(
    `DELETE FROM gated_content_leads WHERE id = ANY($1::text[])`,
    [leadIds]
  )
  console.log(`  Deleted ${leadsDeleted} gated_content_leads row(s).`)

  console.log('\n✅ Done.')
} catch (e) {
  console.error('Failed:', e.message)
  process.exit(1)
} finally {
  await pgClient.end()
}
