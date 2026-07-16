/**
 * One-shot cleanup: replaces every em dash (U+2014) with a comma + space in all
 * Sanity documents we care about. Scope:
 *   - post: title, excerpt, body (PortableText), seoTitle, seoDescription,
 *           focusKeyword, keywords[], faqs[].question, faqs[].answer
 *   - author: name, bio
 *   - category: title, description
 *
 * Idempotent and safe to re-run: only patches docs that actually contain an em dash.
 *
 * Note on replacement choice:
 * A blanket "—" -> ", " produces good readability ~90% of the time. The remaining
 * cases (e.g. labels like "Topic — Subtopic") might read as "Topic, Subtopic" which
 * is still fine but could be polished further by editors in Studio.
 *
 * Run: node scripts/strip-em-dashes.mjs
 *
 * Add --dry-run to preview without writing.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@sanity/client'

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

const DRY_RUN = process.argv.includes('--dry-run')
const EM_DASH = '—'
const REPLACEMENT = ', '

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-30'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// Replace every em dash in a string. Returns [newString, count].
function clean(s) {
  if (typeof s !== 'string' || !s.includes(EM_DASH)) return [s, 0]
  const count = (s.match(new RegExp(EM_DASH, 'g')) || []).length
  return [s.replaceAll(EM_DASH, REPLACEMENT), count]
}

// Walk PortableText body: array of blocks, each with children: [{ _type:'span', text, marks }, ...]
function cleanBody(body) {
  if (!Array.isArray(body)) return { body, changes: 0 }
  let total = 0
  const cleaned = body.map((block) => {
    if (!block || block._type !== 'block' || !Array.isArray(block.children)) return block
    return {
      ...block,
      children: block.children.map((child) => {
        if (child?._type !== 'span') return child
        const [newText, n] = clean(child.text)
        total += n
        return n > 0 ? { ...child, text: newText } : child
      }),
    }
  })
  return { body: cleaned, changes: total }
}

function cleanArrayOfStrings(arr) {
  if (!Array.isArray(arr)) return { value: arr, changes: 0 }
  let total = 0
  const next = arr.map((s) => {
    const [v, n] = clean(s)
    total += n
    return v
  })
  return { value: next, changes: total }
}

function cleanFaqs(faqs) {
  if (!Array.isArray(faqs)) return { value: faqs, changes: 0 }
  let total = 0
  const next = faqs.map((f) => {
    if (!f || typeof f !== 'object') return f
    const [q, qn] = clean(f.question)
    const [a, an] = clean(f.answer)
    total += qn + an
    return qn + an > 0 ? { ...f, question: q, answer: a } : f
  })
  return { value: next, changes: total }
}

async function processDocs({ type, fields, multilineFields = [], bodyField = null, arrayFields = [], faqField = null }) {
  console.log(`\n=== ${type} ===`)
  const docs = await client.fetch(`*[_type == $type]`, { type })
  console.log(`Fetched ${docs.length} ${type} docs`)
  let touched = 0
  let totalChanges = 0

  for (const doc of docs) {
    const patch = {}
    let docChanges = 0

    for (const f of [...fields, ...multilineFields]) {
      const [v, n] = clean(doc[f])
      if (n > 0) {
        patch[f] = v
        docChanges += n
      }
    }
    for (const f of arrayFields) {
      const { value, changes } = cleanArrayOfStrings(doc[f])
      if (changes > 0) {
        patch[f] = value
        docChanges += changes
      }
    }
    if (faqField && doc[faqField]) {
      const { value, changes } = cleanFaqs(doc[faqField])
      if (changes > 0) {
        patch[faqField] = value
        docChanges += changes
      }
    }
    if (bodyField && doc[bodyField]) {
      const { body, changes } = cleanBody(doc[bodyField])
      if (changes > 0) {
        patch[bodyField] = body
        docChanges += changes
      }
    }

    if (docChanges > 0) {
      const title = doc.title || doc.name || doc._id
      console.log(`  [${docChanges} em dashes] ${title}`)
      if (!DRY_RUN) {
        await client.patch(doc._id).set(patch).commit()
      }
      touched++
      totalChanges += docChanges
    }
  }
  console.log(`  ${touched} ${type} doc(s) ${DRY_RUN ? 'would be' : 'were'} patched (${totalChanges} replacements)`)
}

async function main() {
  console.log(`Sanity cleanup: project=${projectId} dataset=${dataset} ${DRY_RUN ? '(DRY RUN)' : ''}`)
  console.log(`Replacing every "${EM_DASH}" with "${REPLACEMENT}"`)

  // Blog posts (most important; the existing imported content has em dashes)
  await processDocs({
    type: 'post',
    fields: ['title', 'focusKeyword', 'seoTitle', 'canonicalUrl'],
    multilineFields: ['excerpt', 'seoDescription'],
    arrayFields: ['keywords'],
    faqField: 'faqs',
    bodyField: 'body',
  })

  // Authors
  await processDocs({
    type: 'author',
    fields: ['name'],
    multilineFields: ['bio'],
  })

  // Categories
  await processDocs({
    type: 'category',
    fields: ['title'],
    multilineFields: ['description'],
  })

  // White papers (already cleaned via seed, but defensive)
  await processDocs({
    type: 'whitePaper',
    fields: ['title', 'focusKeyword', 'seoTitle', 'canonicalUrl', 'readTime'],
    multilineFields: ['description', 'tldr', 'seoDescription'],
    arrayFields: ['keywords', 'keyFindings'],
    faqField: 'faqs',
    bodyField: 'methodology',
  })

  // Benchmarks
  await processDocs({
    type: 'benchmark',
    fields: ['title', 'series', 'period', 'focusKeyword', 'seoTitle', 'canonicalUrl'],
    multilineFields: ['description', 'tldr', 'seoDescription'],
    arrayFields: ['keywords', 'keyFindings'],
    faqField: 'faqs',
    bodyField: 'methodology',
  })

  console.log('\n✅ Done.')
}

main().catch((e) => {
  console.error('\n✗ Failed:', e?.message || e)
  process.exit(1)
})
