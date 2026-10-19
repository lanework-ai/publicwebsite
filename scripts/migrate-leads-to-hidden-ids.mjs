/**
 * Moves contact, gatedContentLead and newsletterSubscriber docs from their
 * public ids (X) to hidden ids (leads.X) in Sanity project 7vdz7vm0, dataset
 * production (shared with rapidrelay-landing).
 *
 * Why: the dataset is public (private datasets need a paid Sanity plan), so these
 * docs, which hold names, emails and companies, answered anonymous queries.
 * Sanity hides any document whose _id contains a dot from unauthenticated
 * requests; Studio users and token reads still see them. New docs are written
 * under leads. by lib/sanity-write-client.ts, and its hiddenLeadId() maps the
 * old ids Postgres still stores (gated_content_leads.sanityId, sanity_syncs) to
 * leads.X, so Postgres needs no update.
 *
 * Run:
 *   node scripts/migrate-leads-to-hidden-ids.mjs                    dry run (default): counts and id mapping only
 *   node scripts/migrate-leads-to-hidden-ids.mjs --apply            backup JSON, then ONE transaction that creates
 *                                                                   leads.X and deletes X for every doc
 *   node scripts/migrate-leads-to-hidden-ids.mjs --restore <file>   puts the backed-up docs back at X and deletes
 *                                                                   leads.X (add --apply to write)
 *
 * The backup holds personal data, so it is written OUTSIDE the git repo, to
 * ../sanity-lead-backups/. Delete it once you've checked the migration.
 * Nothing here prints field values: only ids and counts.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { createClient } from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

try {
  const content = readFileSync(join(repoRoot, '.env.local'), 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch {}

const APPLY = process.argv.includes('--apply')
const restoreIdx = process.argv.indexOf('--restore')
const RESTORE_FILE = restoreIdx > -1 ? process.argv[restoreIdx + 1] : null

const TYPES = ['contact', 'gatedContentLead', 'newsletterSubscriber']
const PREFIX = 'leads.'
const BACKUP_DIR = resolve(repoRoot, '..', 'sanity-lead-backups')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-30'
const token = process.env.SANITY_API_WRITE_TOKEN
if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN (.env.local).')
  process.exit(1)
}

const sanity = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: 'raw' })

/** What an anonymous visitor can count right now (no token, uncached API host). */
async function anonymousCount() {
  const query = `count(*[_type in ${JSON.stringify(TYPES)}])`
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`
  const res = await fetch(url)
  return res.ok ? (await res.json()).result : `HTTP ${res.status}`
}

/** A doc ready to be created at a new id: system fields dropped, _type kept. */
function copyAt(doc, newId) {
  const out = { _id: newId, _type: doc._type }
  for (const [k, v] of Object.entries(doc)) if (!k.startsWith('_')) out[k] = v
  return out
}

async function counts() {
  return sanity.fetch(
    `{
      "public": count(*[_type in $types && _id in path("*")]),
      "hidden": count(*[_type in $types && _id in path("${PREFIX}**")]),
      "drafts": count(*[_type in $types && _id in path("drafts.**")])
    }`,
    { types: TYPES }
  )
}

async function migrate() {
  // _id in path("*") = a single-segment id, i.e. publicly readable.
  const docs = await sanity.fetch(`*[_type in $types && _id in path("*")] | order(_type asc, _createdAt asc)`, {
    types: TYPES,
  })
  const existingHidden = new Set(
    await sanity.fetch(`*[_id in $ids]._id`, { ids: docs.map((d) => PREFIX + d._id) })
  )

  const byType = Object.fromEntries(TYPES.map((t) => [t, 0]))
  for (const d of docs) byType[d._type]++
  console.log(`Public docs to move: ${docs.length}`, byType)
  if (existingHidden.size) {
    console.error(`\n${existingHidden.size} target id(s) already exist, e.g. ${[...existingHidden][0]}. Aborting.`)
    process.exit(1)
  }
  for (const d of docs.slice(0, 5)) console.log(`  ${d._type.padEnd(21)} ${d._id}  ->  ${PREFIX}${d._id}`)
  if (docs.length > 5) console.log(`  ... and ${docs.length - 5} more`)

  if (!APPLY) {
    console.log('\nDry run; nothing written. Re-run with --apply to move them.')
    return
  }
  if (docs.length === 0) {
    console.log('\nNothing to move.')
    return
  }

  mkdirSync(BACKUP_DIR, { recursive: true })
  const backupFile = join(BACKUP_DIR, `migrate-leads-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  writeFileSync(backupFile, JSON.stringify({ dataset, createdAt: new Date().toISOString(), docs }, null, 2))
  console.log(`\nBackup (contains personal data, keep it out of git): ${backupFile}`)

  // One transaction: either every doc moves or none does. create() fails the
  // whole transaction if a leads. id appeared since the check above.
  const tx = sanity.transaction()
  for (const d of docs) {
    tx.create(copyAt(d, PREFIX + d._id))
    tx.delete(d._id)
  }
  const result = await tx.commit({ visibility: 'sync' })
  console.log(`Committed transaction ${result.transactionId}: moved ${docs.length} doc(s).`)
}

async function restore(file) {
  const { docs } = JSON.parse(readFileSync(file, 'utf8'))
  console.log(`Backup has ${docs.length} doc(s). Restoring each to its original id and deleting ${PREFIX}<id>.`)
  if (!APPLY) {
    console.log('Dry run; nothing written. Add --apply to restore.')
    return
  }
  const tx = sanity.transaction()
  for (const d of docs) {
    tx.createOrReplace(copyAt(d, d._id))
    tx.delete(PREFIX + d._id)
  }
  const result = await tx.commit({ visibility: 'sync' })
  console.log(`Committed transaction ${result.transactionId}: restored ${docs.length} doc(s).`)
}

console.log(`Sanity ${projectId}/${dataset}  (${APPLY ? 'APPLY' : 'dry run'})`)
console.log('Before:', await counts(), '| anonymous count:', await anonymousCount())

if (RESTORE_FILE) await restore(RESTORE_FILE)
else await migrate()

if (APPLY) console.log('After: ', await counts(), '| anonymous count:', await anonymousCount())
