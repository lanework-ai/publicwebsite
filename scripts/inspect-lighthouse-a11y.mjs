/**
 * Pulls specific failing elements for color-contrast, heading-order, and
 * target-size audits from the Lighthouse JSON reports we already generated.
 * Tells us EXACTLY which CSS classes / DOM nodes to fix.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const reportsDir = join(__dirname, '..', 'lighthouse-reports')

const files = readdirSync(reportsDir).filter((f) => f.endsWith('.json'))
const AUDITS_TO_INSPECT = ['color-contrast', 'heading-order', 'target-size']

const aggregate = new Map() // auditId -> array of { page, items[] }

for (const file of files) {
  const report = JSON.parse(readFileSync(join(reportsDir, file), 'utf8'))
  for (const auditId of AUDITS_TO_INSPECT) {
    const audit = report.audits[auditId]
    if (!audit || audit.score === 1 || !audit.details?.items) continue
    if (!aggregate.has(auditId)) aggregate.set(auditId, [])
    aggregate.get(auditId).push({ page: file.replace('.json', ''), items: audit.details.items })
  }
}

for (const [auditId, perPage] of aggregate) {
  console.log(`\n=== ${auditId} ===`)
  // Deduplicate by selector / text snippet
  const dedup = new Map()
  for (const { page, items } of perPage) {
    for (const it of items) {
      const key = JSON.stringify({
        selector: it.node?.selector || it.selector || 'unknown',
        snippet: (it.node?.snippet || '').slice(0, 200),
      })
      if (!dedup.has(key)) dedup.set(key, { ...it, pages: new Set() })
      dedup.get(key).pages.add(page)
    }
  }
  for (const it of dedup.values()) {
    console.log(`\n  Pages: ${[...it.pages].join(', ')}`)
    console.log(`  Selector: ${it.node?.selector || it.selector || '?'}`)
    if (it.node?.snippet) console.log(`  Snippet:  ${it.node.snippet.replace(/\s+/g, ' ').trim().slice(0, 180)}`)
    if (it.node?.explanation) console.log(`  Why:      ${it.node.explanation.replace(/\s+/g, ' ').trim().slice(0, 200)}`)
    if (typeof it.contrastRatio === 'number') console.log(`  Contrast: ${it.contrastRatio.toFixed(2)} (need >= 4.5 for body text)`)
    if (it.size) console.log(`  Size: ${it.size}`)
  }
}
