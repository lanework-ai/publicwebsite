/**
 * Notes pruning pass (Before & After doc, Oct 2026):
 *   1. Creates the five Notes categories: Relay, Retention, Capacity, Spot market, Industry.
 *   2. Re-tags every post to exactly ONE of them (the filter chips are built from every
 *      category a listed post references, so adding categories alone would not cut the list).
 *   3. Pins the four relay and pooling posts (post.pinned, sorted first by postsQuery).
 *   4. Unpublishes two off-topic news recaps via noIndex (reversible; hides them from
 *      the list, sitemap and RSS, and 404s the post page).
 *   5. Fixes "| Lanework Technologies" seoTitles to "| Lanework".
 *   6. Adds the matching new categories to the two white papers (appended, not replaced),
 *      so their "Keep reading" lists still find posts that share a category.
 *
 * Run:
 *   node scripts/notes-prune.mjs                     dry run (default): prints every change
 *   node scripts/notes-prune.mjs --apply             writes a backup JSON, then commits one transaction
 *   node scripts/notes-prune.mjs --restore <file>    puts the backed-up fields back
 *
 * Old categories are left in place (unreferenced docs are harmless, and deleting
 * them is not reversible). Uses the write token, which is also what makes drafts visible.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
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

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-30',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw', // see drafts alongside published docs
})

/* ---- Editorial decisions (review these in the dry run) ------------------- */

const CATEGORIES = [
  { key: 'relay', title: 'Relay', description: 'Relay networks, handoffs, and coordinated freight.' },
  { key: 'retention', title: 'Retention', description: 'Driver retention, turnover, and home time.' },
  { key: 'capacity', title: 'Capacity', description: 'Asset utilization, trailer pools, empty miles, and lane economics.' },
  { key: 'spot-market', title: 'Spot market', description: 'Spot freight, load boards, brokerage, and market data.' },
  { key: 'industry', title: 'Industry', description: 'Companies, regulation, technology, and the wider freight industry.' },
]
const categoryId = (key) => `category-notes-${key}`

/** Post slug → the one new category it belongs to. Every post must appear here. */
const POST_CATEGORY = {
  'introduction-of-truck-relaying-in-north-america': 'relay',
  'bols-in-relay-shipments-and-explanations-of-need': 'relay',

  'what-makes-a-lane-profitable': 'capacity',
  'the-evolution-of-asset-sharing-and-trailer-pools-in-trucking': 'capacity',
  'the-impact-of-powerloop-on-shippers-and-their-docks': 'capacity',
  'the-roles-of-vhub-wabash-repowr-and-freightvana': 'capacity',
  'flock-freight-pioneering-a-new-path-in-freight-shipping': 'capacity',

  'navigating-the-logistics-data-banks-through-a-look-at-sonar': 'spot-market',
  'uber-freight-api-leap-and-effects-it-has-on-human-elements': 'spot-market',
  'comprehensive-guide-to-setting-up-quality-carriers': 'spot-market',

  'permits-essential-annual-costs-for-trucking-operations': 'industry',
  'financial-strategies-for-small-trucking-businesses': 'industry',
  'decoding-the-operational-costs-of-owning-a-trucking-business': 'industry',
  'aurora-trailblazing-path-to-autonomous-trucking': 'industry',
  'intermodal-growth-quantum-launch-and-walmart-acquisition': 'industry',
  'motive-revolutionary-impact-on-the-trucking-sector': 'industry',
  'ascendtms-rise-in-transportation-management': 'industry',
  'hirschbach-evolution-pioneering-innovation-in-cold-logistics': 'industry',
  'lanework-take-on-logistics-investments-and-developments': 'industry',
  'the-dawn-and-regulations-of-autonomous-trucking-in-the-us': 'industry',
  'flexport-strategic-conundrum-balancing-expansion': 'industry',
  'regulation-an-introduction-to-the-fmcsa-and-dot': 'industry',
  'harnessing-eld-data-for-efficiency-and-safety-in-2023': 'industry',
  'electronic-logging-device-and-compliance-in-trucking': 'industry',
  'ups-to-cut-jobs-and-expand-layoffs-for-cost-saving-measures': 'industry',
  'insights-into-a-data-driven-perspective-on-forestry': 'industry',
}

const PIN = [
  'what-makes-a-lane-profitable',
  'introduction-of-truck-relaying-in-north-america',
  'bols-in-relay-shipments-and-explanations-of-need',
  'the-evolution-of-asset-sharing-and-trailer-pools-in-trucking',
]

const UNPUBLISH = [
  'ups-to-cut-jobs-and-expand-layoffs-for-cost-saving-measures',
  'insights-into-a-data-driven-perspective-on-forestry',
]

/** White paper slug → new categories to append (existing ones are kept). */
const PAPER_CATEGORIES = {
  'driver-retention-is-a-data-problem': ['retention', 'relay'],
  'one-in-six-miles-earns-zero': ['capacity', 'relay'],
}

const SEO_SUFFIX_FROM = '| Lanework Technologies'
const SEO_SUFFIX_TO = '| Lanework'

/* ---- Helpers ------------------------------------------------------------- */

const baseId = (id) => id.replace(/^drafts\./, '')
const ref = (key) => ({ _key: `notes-${key}`, _type: 'reference', _ref: categoryId(key) })
// Fields this script may touch; the backup and restore cover exactly these.
const TRACKED = ['categories', 'pinned', 'noIndex', 'seoTitle']

function fail(msg) {
  console.error(`\n✖ ${msg}`)
  process.exit(1)
}

/* ---- Restore ------------------------------------------------------------- */

if (RESTORE_FILE) {
  const backup = JSON.parse(readFileSync(RESTORE_FILE, 'utf8'))
  const ids = Object.keys(backup.docs)
  const existing = new Set(await sanity.fetch(`*[_id in $ids]._id`, { ids }))
  const tx = sanity.transaction()
  for (const id of ids) {
    if (!existing.has(id)) {
      console.log(`  skip ${id} (no longer exists)`)
      continue
    }
    const before = backup.docs[id]
    const set = {}
    const unset = []
    for (const f of TRACKED) {
      if (!(f in before)) continue // field was not touched for this doc
      if (before[f] === null) unset.push(f)
      else set[f] = before[f]
    }
    let p = sanity.patch(id)
    if (Object.keys(set).length) p = p.set(set)
    if (unset.length) p = p.unset(unset)
    tx.patch(p)
    console.log(`  restore ${id}: ${[...Object.keys(set), ...unset.map((u) => `-${u}`)].join(', ')}`)
  }
  if (!APPLY) {
    console.log('\nDry run of restore; add --apply to write. (New category docs are left in place.)')
    process.exit(0)
  }
  await tx.commit()
  console.log('\n✅ Restored.')
  process.exit(0)
}

/* ---- Load current state -------------------------------------------------- */

if (!process.env.SANITY_API_WRITE_TOKEN) fail('SANITY_API_WRITE_TOKEN is not set (needed to see drafts and to write).')

const posts = await sanity.fetch(
  `*[_type == "post"]{ _id, title, "slug": slug.current, categories, "categoryTitles": categories[]->title, pinned, noIndex, seoTitle }`
)
const papers = await sanity.fetch(
  `*[_type in ["whitePaper", "benchmark"]]{ _id, _type, title, "slug": slug.current, categories, seoTitle }`
)
const existingCategoryIds = new Set(await sanity.fetch(`*[_type == "category"]._id`))
const takenSlugs = await sanity.fetch(`*[_type == "category"]{ _id, "slug": slug.current }`)

// Guard rails: the mapping must cover exactly the posts that exist.
const publishedSlugs = new Set(posts.filter((p) => !p._id.startsWith('drafts.')).map((p) => p.slug))
const unmapped = [...publishedSlugs].filter((s) => !(s in POST_CATEGORY))
const unknown = Object.keys(POST_CATEGORY).filter((s) => !publishedSlugs.has(s))
if (unmapped.length) fail(`Posts with no category mapping: ${unmapped.join(', ')}`)
if (unknown.length) fail(`Mapping lists slugs that do not exist: ${unknown.join(', ')}`)
for (const s of [...PIN, ...UNPUBLISH]) if (!publishedSlugs.has(s)) fail(`Unknown slug: ${s}`)
for (const c of CATEGORIES) {
  const clash = takenSlugs.find((t) => t.slug === c.key && t._id !== categoryId(c.key))
  if (clash) fail(`Category slug "${c.key}" is already used by ${clash._id}`)
}

/* ---- Build the change set ------------------------------------------------ */

const backup = { createdAt: new Date().toISOString(), docs: {} }
const changes = [] // { id, set, label }

function record(doc, set, label) {
  backup.docs[doc._id] = backup.docs[doc._id] || {}
  for (const f of Object.keys(set)) {
    if (!(f in backup.docs[doc._id])) backup.docs[doc._id][f] = doc[f] ?? null
  }
  changes.push({ id: doc._id, set, label })
}

for (const p of posts) {
  const key = POST_CATEGORY[p.slug]
  if (!key) continue // a draft of a post not yet published; leave it alone
  const set = { categories: [ref(key)] }
  if (PIN.includes(p.slug)) set.pinned = true
  if (UNPUBLISH.includes(p.slug)) set.noIndex = true
  if (p.seoTitle?.includes(SEO_SUFFIX_FROM)) set.seoTitle = p.seoTitle.replace(SEO_SUFFIX_FROM, SEO_SUFFIX_TO)
  record(p, set, `post  ${p._id.startsWith('drafts.') ? '[draft] ' : ''}${p.slug}`)
}

for (const d of papers) {
  const set = {}
  const add = PAPER_CATEGORIES[d.slug]
  if (add) {
    const current = d.categories ?? []
    const have = new Set(current.map((c) => c._ref))
    const extra = add.filter((k) => !have.has(categoryId(k))).map(ref)
    if (extra.length) set.categories = [...current, ...extra]
  }
  if (d.seoTitle?.includes(SEO_SUFFIX_FROM)) set.seoTitle = d.seoTitle.replace(SEO_SUFFIX_FROM, SEO_SUFFIX_TO)
  if (Object.keys(set).length) record(d, set, `${d._type}  ${d._id.startsWith('drafts.') ? '[draft] ' : ''}${d.slug}`)
}

/* ---- Report -------------------------------------------------------------- */

const titleOf = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.title]))
console.log('Categories to create:')
for (const c of CATEGORIES) {
  console.log(`  ${existingCategoryIds.has(categoryId(c.key)) ? '(exists) ' : '+ '}${c.title}  [${categoryId(c.key)}]`)
}

console.log('\nPost re-tags (each post ends with exactly one category):')
const counts = Object.fromEntries(CATEGORIES.map((c) => [c.key, 0]))
for (const p of posts.filter((p) => !p._id.startsWith('drafts.') && POST_CATEGORY[p.slug])) {
  counts[POST_CATEGORY[p.slug]]++
}
for (const c of CATEGORIES) {
  console.log(`\n  ${c.title} (${counts[c.key]})`)
  for (const p of posts.filter((p) => POST_CATEGORY[p.slug] === c.key && !p._id.startsWith('drafts.'))) {
    const flags = [PIN.includes(p.slug) && 'PIN', UNPUBLISH.includes(p.slug) && 'UNPUBLISH'].filter(Boolean)
    console.log(`    ${p.title}${flags.length ? `  [${flags.join(', ')}]` : ''}`)
    console.log(`      was: ${(p.categoryTitles ?? []).join(', ') || '(none)'}`)
  }
}
const empty = CATEGORIES.filter((c) => counts[c.key] === 0)
if (empty.length) {
  console.log(`\n  ⚠ No listed post maps to: ${empty.map((c) => c.title).join(', ')}. Chips are built from`)
  console.log('    posts, so that chip will not appear until a post is tagged with it.')
}
// Unpublished posts drop out of the list; a chip only they carry would vanish too.
const visible = new Set(
  [...publishedSlugs].filter((s) => !UNPUBLISH.includes(s)).map((s) => POST_CATEGORY[s])
)
console.log(`\n  Filter chips after this: All · ${CATEGORIES.filter((c) => visible.has(c.key)).map((c) => c.title).join(' · ')}`)

console.log('\nOther changes:')
for (const ch of changes) {
  // Post re-tags are listed above; show everything else, and paper category appends.
  const isPost = ch.label.startsWith('post')
  const other = Object.entries(ch.set).filter(([k]) => k !== 'categories' || !isPost)
  if (!other.length) continue
  for (const [k, v] of other) {
    const before = backup.docs[ch.id][k]
    const fmt = (x) => (k === 'categories' ? `[${(x ?? []).map((r) => r._ref).join(', ')}]` : JSON.stringify(x))
    console.log(`  ${ch.label}: ${k} ${fmt(before)} → ${fmt(v)}`)
  }
}

const unpublishIds = posts.filter((p) => UNPUBLISH.includes(p.slug)).map((p) => baseId(p._id))
const incoming = await sanity.fetch(
  `*[references($ids) && !(_id in $ids) && !(_id in path("drafts.**"))]{ _type, title, "slug": slug.current, "field": select(count(relatedPosts[_ref in $ids]) > 0 => "relatedPosts", "other reference") }`,
  { ids: unpublishIds }
)
console.log('\nDocs that reference the posts being unpublished:')
if (!incoming.length) console.log('  none')
for (const d of incoming) console.log(`  ${d._type}  ${d.title}  (${d.field})`)
console.log('  Curated relatedPosts are filtered on noIndex in lib/sanity-queries.ts, so these')
console.log('  links disappear once that code is deployed. Deploy it before applying.')

console.log(`\n${changes.length} document patch(es), ${CATEGORIES.filter((c) => !existingCategoryIds.has(categoryId(c.key))).length} category create(s).`)

if (!APPLY) {
  console.log('\nDry run; nothing written. Re-run with --apply to commit.')
  process.exit(0)
}

/* ---- Apply --------------------------------------------------------------- */

const stamp = backup.createdAt.replace(/[:.]/g, '-')
const backupPath = join(__dirname, `notes-prune-backup-${stamp}.json`)
writeFileSync(backupPath, JSON.stringify(backup, null, 2))
console.log(`\nBackup written: ${backupPath}`)

const tx = sanity.transaction()
for (const c of CATEGORIES) {
  tx.createIfNotExists({
    _id: categoryId(c.key),
    _type: 'category',
    title: c.title,
    slug: { _type: 'slug', current: c.key },
    description: c.description,
  })
}
for (const ch of changes) tx.patch(ch.id, (p) => p.set(ch.set))
await tx.commit()
console.log('✅ Applied in one transaction.')
console.log(`To undo: node scripts/notes-prune.mjs --restore "${backupPath}" --apply`)
