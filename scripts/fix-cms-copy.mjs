/**
 * CMS copy pass (American English + spelling, Oct 2026). Fixes, in Sanity:
 *   1. Literal backslashes left by the original import: \' → ’ and \" → ".
 *   2. towards → toward (and Towards → Toward).
 *   3. The " ,  " leftovers strip-em-dashes.mjs left in what-makes-a-lane-profitable.
 *   4. The flattened ELD table (harnessing-eld blocks 9–11, rebuilt as bold label + text),
 *      and the run-together lists in the carrier-setup guide.
 *   5. Brand and word fixes, truncated seoTitles, the white paper's title case,
 *      "home-time frequency", and the "Spot Market" category title.
 *   6. Typos found in the three draft-only posts.
 *
 * Run:
 *   node scripts/fix-cms-copy.mjs                     dry run (default): prints every change
 *   node scripts/fix-cms-copy.mjs --apply             writes a backup JSON, then commits one transaction
 *   node scripts/fix-cms-copy.mjs --restore <file>    puts the backed-up fields back (add --apply to write)
 *
 * Only copy fields are visited: span text, title, excerpt, seoTitle, seoDescription,
 * keywords, faqs[].question/answer, keyFindings and dataTables cells. Slugs, assets,
 * links and every `_` field are never read or written. Published docs and their
 * drafts are both patched (a draft is never published), and every patch carries
 * ifRevisionId, so a concurrent Studio edit aborts the write instead of being lost.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
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

const TYPES = ['post', 'whitePaper', 'benchmark', 'category']
// Top-level copy fields. body, faqs and dataTables are walked further below.
const FIELDS = ['title', 'excerpt', 'seoTitle', 'seoDescription', 'keywords', 'keyFindings', 'faqs', 'body', 'dataTables']

const NBSP = ' '

/** Applied to every visited string in every doc. `expect` is the instance count across all docs. */
const GLOBAL = [
  { rule: "\\' → ’", find: /\\'/g, replace: '’' },
  { rule: '\\" → "', find: /\\"/g, replace: '"' },
  { rule: 'towards', find: /\btowards\b/g, replace: 'toward' },
  { rule: 'Towards', find: /\bTowards\b/g, replace: 'Toward' },
  { rule: 'benefiting', find: /\bbenefitting\b/g, replace: 'benefiting' },
  { rule: 'FreightWaves', find: /\bFreightwaves\b/g, replace: 'FreightWaves' },
  { rule: 'SmartWay', find: /\bSmartway\b/g, replace: 'SmartWay' },
  { rule: 'Amid', find: /\bAmidst\b/g, replace: 'Amid' },
  { rule: 'home-time frequency', find: /\bhome time frequency\b/g, replace: 'home-time frequency' },
]

/**
 * Slug → targeted find/replace. Each `find` must occur exactly `count` times (default 1)
 * in each doc with that slug, or the run stops. `field` limits it to one top-level field.
 * These run after GLOBAL, so `find` is written against already-unescaped text.
 */
const TEXT_FIXES = {
  'what-makes-a-lane-profitable': [
    ['the holy grail ,  the one stat', 'the holy grail, the one stat'],
    ['a load ,  or a lane ,  is', 'a load, or a lane, is'],
    ['Deadhead Miles Matter ,  A Lot', 'Deadhead Miles Matter (A Lot)'],
    ['for the deadhead ,  and that’s before fuel', 'for the deadhead, and that’s before fuel'],
    ['a line item ,  it’s a profit killer', 'a line item; it’s a profit killer'],
    ['mountain terrain too ,  climbing eats fuel fast', 'mountain terrain too; climbing eats fuel fast'],
    ['how far ,  it’s about how long', 'how far; it’s about how long'],
    ['the outbound ,  they’re about the', 'the outbound; they’re about the'],
    ['If those aren’t included ,  or aren’t enforced ,  you', 'If those aren’t included, or aren’t enforced, you'],
    ['the smartest carriers win ,  not the ones', 'the smartest carriers win: not the ones'],
  ],
  'harnessing-eld-data-for-efficiency-and-safety-in-2023': [
    ['Besides the fact the ELDs are', 'Besides the fact that ELDs are'],
    // Not in the original plan: missing possessive apostrophe in block 7.
    ['FMCSAs main aim', 'FMCSA’s main aim'],
  ],
  'comprehensive-guide-to-setting-up-quality-carriers': [
    [
      'include:Entity Type (CARRIER)Operating Status (AUTHORIZED FOR Property)Power Units (Number of registered trucks)Out of Service Date (Active status)Operation Classification (Interstate or Intrastate)This verification',
      'include: Entity Type (CARRIER); Operating Status (AUTHORIZED FOR Property); Power Units (Number of registered trucks); Out of Service Date (Active status); Operation Classification (Interstate or Intrastate). This verification',
    ],
    ['including:Liability Insurance:', 'including: Liability Insurance:'],
    ['their property.Cargo Insurance:', 'their property. Cargo Insurance:'],
    ['cargo loads.Additional Policies:', 'cargo loads. Additional Policies:'],
  ],
  'lanework-take-on-logistics-investments-and-developments': [
    { field: 'seoTitle', find: 'Lanework’s Take on Logistics Investments and Developm...', replace: 'Lanework’s Take on Logistics Investments and Developments' },
  ],
  'uber-freight-api-leap-and-effects-it-has-on-human-elements': [
    // The full title is exactly 60 characters, the schema's max.
    { field: 'seoTitle', find: "Uber Freight's API Leap and Effects It Has on Human Elem...", replace: "Uber Freight's API Leap and Effects It Has on Human Elements" },
  ],
  'driver-retention-is-a-data-problem': [
    { field: 'title', find: 'Driver Retention is a Data Problem', replace: 'Driver Retention Is a Data Problem' },
    // The draft's seoTitle also has a trailing space.
    { field: 'seoTitle', find: /^Driver Retention is a Data Problem \| Lanework\s*$/, replace: 'Driver Retention Is a Data Problem | Lanework' },
  ],
  'spot-market': [{ field: 'title', find: 'Spot market', replace: 'Spot Market' }],

  // Draft-only posts (not live). Found by proofreading their text.
  'how-shipping-containers-revolutionized-and-developed-trade': [
    ['What is a Standard Shipping Container?', 'What Is a Standard Shipping Container?'],
    ['containers suitable for multi-modal transport', 'containers suitable for multimodal transport'],
    ['Well; until something better is invented.', 'Well, until something better is invented.'],
  ],
  'the-strategic-edge-of-xtra-lease-scale-meets-innovation': [
    { field: 'excerpt', find: 'Xtra Lease:', replace: 'XTRA Lease:' },
    { field: 'seoDescription', find: 'Xtra Lease:', replace: 'XTRA Lease:' },
  ],
  'xpo-logistics-a-titan-of-north-american-logistics': [
    ['the American University in Beirut', 'the American University of Beirut'],
    ['has a significant leadership experience', 'has significant leadership experience'],
    ['a graduate of Notre Dam University and', 'a graduate of the University of Notre Dame and'],
    ['Company Spin Offs and Synergies', 'Company Spin-Offs and Synergies'],
  ],
}

/**
 * harnessing-eld blocks 9–11 are table rows flattened into one span each. Each is
 * rebuilt as a bold label span plus a text span. `was` must match the current span
 * exactly (U+00A0 and trailing spaces included) or the run stops.
 */
const BLOCK_REWRITES = {
  'harnessing-eld-data-for-efficiency-and-safety-in-2023': {
    s3hukpfi2: {
      was: `Vehicles Geolocationwhen engine is started or turned offvehicle location every 60 mins of operationwhen there’s a change of duty status (changing from off-duty driving to on-duty driving, fueling, loading, unloading, or sleeper berth)${NBSP}`,
      label: 'Vehicle geolocation:',
      text: ' when the engine is started or turned off; vehicle location every 60 minutes of operation; when there’s a change of duty status (changing from off-duty driving to on-duty driving, fueling, loading, unloading, or sleeper berth)',
    },
    oi1c5o4qf: {
      was: `Vehicles Runtime and Drivers Work Timeengine run time or turned off to verify compliance with HOS regulations${NBSP}vehicle loading or unloading timesprolonged idle time or unscheduled stops`,
      label: 'Vehicle runtime and driver work time:',
      text: ' engine run time or turned off, to verify compliance with HOS regulations; vehicle loading or unloading times; prolonged idle time or unscheduled stops',
    },
    uip4tmusg: {
      was: `Device Alternations and Malfunctions${NBSP}track alterations made to ELD data records${NBSP}track malfunctions and data inconsistencies${NBSP}`,
      label: 'Device alterations and malfunctions:',
      text: ' track alterations made to ELD data records; track malfunctions and data inconsistencies',
    },
  },
}

/**
 * What the plan counted, so the dry run can be checked at a glance. Global rules are
 * counted per doc kind: published docs (live), drafts of published docs, draft-only posts.
 */
const EXPECT = {
  "\\' → ’": { published: 96, draftOnly: 30 },
  '\\" → "': { published: 6, draftOnly: 2 },
  towards: { published: 15 },
  Towards: { published: 2 },
  benefiting: { published: 1 },
  FreightWaves: { published: 3 },
  SmartWay: { published: 2 },
  Amid: { published: 2 },
  'home-time frequency': { published: 2, draft: 1 },
}
const EXPECT_BACKSLASH_DOCS = 17 // published docs with at least one backslash

/* ---- Helpers ------------------------------------------------------------- */

const baseId = (id) => id.replace(/^drafts\./, '')
const newKey = () => randomBytes(6).toString('hex')
const short = (s) => s.replace(/\n/g, '\\n') // keep log lines on one line; show backslashes as-is

function fail(msg) {
  console.error(`\n✖ ${msg}`)
  process.exit(1)
}

/** Applies a string or RegExp find/replace, logging each hit with a little context. */
function replaceLogged(s, find, replace, rule, log) {
  const re = typeof find === 'string' ? new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g') : find
  let hits = 0
  const out = s.replace(re, (m, ...args) => {
    const at = args[args.length - 2]
    hits++
    const pre = s.slice(Math.max(0, at - 28), at)
    const post = s.slice(at + m.length, at + m.length + 28)
    log.push(`${rule.padEnd(20)} …${short(pre)}«${short(m)}»${short(post)}… → «${short(replace)}»`)
    return replace
  })
  return { out, hits }
}

/**
 * Walks one top-level field, calling fn(string, path) on each copy string and
 * storing what it returns. Never descends into `_` keys or non-copy keys.
 */
function mapCopy(field, value, fn) {
  if (value == null) return value
  if (['title', 'excerpt', 'seoTitle', 'seoDescription'].includes(field)) return typeof value === 'string' ? fn(value, field) : value
  if (field === 'keywords' || field === 'keyFindings')
    return value.map((s, i) => (typeof s === 'string' ? fn(s, `${field}[${i}]`) : s))
  if (field === 'faqs')
    return value.map((q) => ({
      ...q,
      ...(typeof q.question === 'string' && { question: fn(q.question, `faqs[${q._key}].question`) }),
      ...(typeof q.answer === 'string' && { answer: fn(q.answer, `faqs[${q._key}].answer`) }),
    }))
  if (field === 'dataTables')
    return value.map((t) => ({
      ...t,
      rows: (t.rows ?? []).map((r) => ({
        ...r,
        cells: (r.cells ?? []).map((c, i) => (typeof c === 'string' ? fn(c, `dataTables[${t._key}].rows[${r._key}].cells[${i}]`) : c)),
      })),
    }))
  if (field === 'body')
    return value.map((b) =>
      b._type !== 'block'
        ? b
        : {
            ...b,
            children: (b.children ?? []).map((c) =>
              c._type === 'span' && typeof c.text === 'string' ? { ...c, text: fn(c.text, `body[${b._key}].children[${c._key}].text`) } : c
            ),
          }
    )
  return value
}

/* ---- Restore ------------------------------------------------------------- */

if (RESTORE_FILE) {
  const backup = JSON.parse(readFileSync(RESTORE_FILE, 'utf8'))
  const ids = Object.keys(backup.docs)
  const current = Object.fromEntries((await sanity.fetch(`*[_id in $ids]{ _id, _rev }`, { ids })).map((d) => [d._id, d._rev]))
  const tx = sanity.transaction()
  for (const id of ids) {
    if (!current[id]) {
      console.log(`  skip ${id} (no longer exists)`)
      continue
    }
    const { fields } = backup.docs[id]
    const set = {}
    const unset = []
    for (const [f, v] of Object.entries(fields)) v === null ? unset.push(f) : (set[f] = v)
    // If the doc changed after --apply, restoring would discard that edit too.
    const edited = backup.appliedRev && current[id] !== backup.appliedRev
    let p = sanity.patch(id).ifRevisionId(current[id])
    if (Object.keys(set).length) p = p.set(set)
    if (unset.length) p = p.unset(unset)
    tx.patch(p)
    console.log(`  restore ${id}: ${Object.keys(fields).join(', ')}${edited ? '  ⚠ edited since apply; those edits to these fields will be lost' : ''}`)
  }
  if (!APPLY) {
    console.log('\nDry run of restore; add --apply to write.')
    process.exit(0)
  }
  await tx.commit()
  console.log('\n✅ Restored.')
  process.exit(0)
}

/* ---- Load current state -------------------------------------------------- */

if (!process.env.SANITY_API_WRITE_TOKEN) fail('SANITY_API_WRITE_TOKEN is not set (needed to see drafts and to write).')

const docs = await sanity.fetch(`*[_type in $types]{ _id, _rev, _type, "slug": slug.current, ${FIELDS.join(', ')} }`, { types: TYPES })
const publishedIds = new Set(docs.filter((d) => !d._id.startsWith('drafts.')).map((d) => d._id))
const kindOf = (d) => (!d._id.startsWith('drafts.') ? 'published' : publishedIds.has(baseId(d._id)) ? 'draft' : 'draftOnly')

for (const slug of [...Object.keys(TEXT_FIXES), ...Object.keys(BLOCK_REWRITES)]) {
  const bases = new Set(docs.filter((d) => d.slug === slug).map((d) => baseId(d._id)))
  if (bases.size !== 1) fail(`Slug "${slug}" matches ${bases.size} documents; expected exactly one (plus its draft).`)
}

/* ---- Build the change set ------------------------------------------------ */

const backup = { createdAt: new Date().toISOString(), docs: {} }
const changes = [] // { doc, set, logs }
const counts = {} // rule → { published, draft, draftOnly }
const backslashDocs = new Set()

for (const doc of docs) {
  const kind = kindOf(doc)
  const fixes = (TEXT_FIXES[doc.slug] ?? []).map((f) => (Array.isArray(f) ? { find: f[0], replace: f[1] } : f))
  const fixHits = fixes.map(() => 0)
  const rewrites = BLOCK_REWRITES[doc.slug] ?? {}
  const logs = [] // [path, line]
  const set = {}

  for (const field of FIELDS) {
    if (doc[field] == null) continue
    let value = doc[field]

    if (field === 'body' && Object.keys(rewrites).length) {
      value = value.map((b) => {
        const rw = rewrites[b._key]
        if (!rw) return b
        const kids = b.children ?? []
        if (kids.length !== 1 || kids[0].text !== rw.was) fail(`${doc._id} body[${b._key}] no longer matches the expected text; re-check it before rewriting.`)
        logs.push([`body[${b._key}]`, `rebuild   «${short(rw.was)}»\n${' '.repeat(16)}→ **${rw.label}**${short(rw.text)}`])
        return {
          ...b,
          markDefs: b.markDefs ?? [],
          children: [
            { _type: 'span', _key: newKey(), marks: ['strong'], text: rw.label },
            { ...kids[0], marks: [], text: rw.text },
          ],
        }
      })
    }

    const mapped = mapCopy(field, value, (s, path) => {
      const log = []
      let out = s
      for (const g of GLOBAL) {
        const r = replaceLogged(out, g.find, g.replace, g.rule, log)
        out = r.out
        if (r.hits) {
          counts[g.rule] ??= { published: 0, draft: 0, draftOnly: 0 }
          counts[g.rule][kind] += r.hits
          if (g.rule.startsWith('\\') && kind === 'published') backslashDocs.add(doc._id)
        }
      }
      fixes.forEach((f, i) => {
        if (f.field && f.field !== field) return
        const r = replaceLogged(out, f.find, f.replace, 'fix', log)
        out = r.out
        fixHits[i] += r.hits
      })
      for (const line of log) logs.push([path, line])
      return out
    })

    if (JSON.stringify(mapped) !== JSON.stringify(doc[field])) set[field] = mapped
  }

  fixes.forEach((f, i) => {
    const want = f.count ?? 1
    if (fixHits[i] !== want) fail(`${doc._id}: fix ${JSON.stringify(String(f.find))} matched ${fixHits[i]} time(s), expected ${want}.`)
  })

  if (Object.keys(set).length) {
    backup.docs[doc._id] = { rev: doc._rev, fields: Object.fromEntries(Object.keys(set).map((f) => [f, doc[f] ?? null])) }
    changes.push({ doc, kind, set, logs })
  }
}

/* ---- Report -------------------------------------------------------------- */

const KIND_LABEL = { published: 'LIVE', draft: 'DRAFT', draftOnly: 'DRAFT-ONLY' }
for (const { doc, kind, set, logs } of changes) {
  console.log(`\n${doc._type}  ${doc.slug ?? ''}  [${KIND_LABEL[kind]} ${doc._id}]  fields: ${Object.keys(set).join(', ')}`)
  let last = null
  for (const [path, line] of logs) {
    if (path !== last) console.log(`  ${path}`)
    last = path
    console.log(`      ${line}`)
  }
}

console.log('\nCounts (published / draft of published / draft-only):')
let mismatch = false
for (const g of GLOBAL) {
  const c = counts[g.rule] ?? { published: 0, draft: 0, draftOnly: 0 }
  const e = { published: 0, draft: 0, draftOnly: 0, ...EXPECT[g.rule] }
  const ok = c.published === e.published && c.draft === e.draft && c.draftOnly === e.draftOnly
  if (!ok) mismatch = true
  console.log(`  ${ok ? '✓' : '✖'} ${g.rule.padEnd(20)} ${c.published} / ${c.draft} / ${c.draftOnly}${ok ? '' : `   expected ${e.published} / ${e.draft} / ${e.draftOnly}`}`)
}
const bsOk = backslashDocs.size === EXPECT_BACKSLASH_DOCS
if (!bsOk) mismatch = true
const bsTotal = (counts["\\' → ’"]?.published ?? 0) + (counts['\\" → "']?.published ?? 0)
console.log(`  ${bsOk ? '✓' : '✖'} backslashes in live posts: ${bsTotal} in ${backslashDocs.size} docs (plan: 102 in ${EXPECT_BACKSLASH_DOCS})`)
const fixTotal = Object.values(TEXT_FIXES).flat().length
const rebuildTotal = Object.values(BLOCK_REWRITES).reduce((n, r) => n + Object.keys(r).length, 0)
console.log(`  ✓ targeted fixes: ${fixTotal} rules, each matched exactly once per doc; ${rebuildTotal} ELD blocks rebuilt`)

// Anything the rules above should have caught but did not.
const leftovers = []
const scan = (s, path, doc) => {
  if (s.includes('\\')) leftovers.push(`${doc._id} ${path}: backslash`)
  if (/\btowards\b/i.test(s)) leftovers.push(`${doc._id} ${path}: towards`)
  if (s.includes(' ,  ')) leftovers.push(`${doc._id} ${path}: " ,  "`)
  if (path === 'seoTitle' && s.endsWith('...')) leftovers.push(`${doc._id} ${path}: ends in "..."`)
}
for (const doc of docs) {
  const after = changes.find((c) => c.doc === doc)?.set ?? {}
  for (const f of FIELDS) if (doc[f] != null) mapCopy(f, after[f] ?? doc[f], (s, path) => (scan(s, path, doc), s))
}
console.log(`  ${leftovers.length ? '✖' : '✓'} leftovers after the change: ${leftovers.length}`)
for (const l of leftovers) console.log(`      ${l}`)

const byKind = (k) => changes.filter((c) => c.kind === k).length
console.log(`\n${changes.length} document patch(es): ${byKind('published')} live, ${byKind('draft')} draft of a live doc, ${byKind('draftOnly')} draft-only.`)

if (mismatch) fail('Counts differ from the plan. Review the rules before applying.')

if (!APPLY) {
  console.log('\nDry run; nothing written. Re-run with --apply to commit.')
  process.exit(0)
}

/* ---- Apply --------------------------------------------------------------- */

const stamp = backup.createdAt.replace(/[:.]/g, '-')
const backupPath = join(__dirname, `fix-cms-copy-backup-${stamp}.json`)
writeFileSync(backupPath, JSON.stringify(backup, null, 2))
console.log(`\nBackup written: ${backupPath}`)

const tx = sanity.transaction()
for (const { doc, set } of changes) tx.patch(sanity.patch(doc._id).ifRevisionId(doc._rev).set(set))
const result = await tx.commit()
// Each patched doc's new _rev is the transaction id; restore uses it to spot later edits.
backup.appliedRev = result.transactionId
writeFileSync(backupPath, JSON.stringify(backup, null, 2))
console.log(`✅ Applied in one transaction (${result.transactionId}).`)
console.log(`To undo: node scripts/fix-cms-copy.mjs --restore "${backupPath}" --apply`)
