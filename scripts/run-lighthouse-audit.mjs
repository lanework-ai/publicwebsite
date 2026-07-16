/**
 * Lighthouse audit for the new Phase 1 + Phase 3 pages.
 *
 * For each URL we run Lighthouse twice (once mobile, once desktop) and emit:
 *   - score table for performance / accessibility / best-practices / SEO
 *   - top opportunities (the actionable ones — slow images, render-blocking JS, etc.)
 *
 * Run: node scripts/run-lighthouse-audit.mjs
 *
 * Writes full reports to ./lighthouse-reports/<page>-<formFactor>.json
 */
import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const reportsDir = join(repoRoot, 'lighthouse-reports')
mkdirSync(reportsDir, { recursive: true })

const PAGES = [
  { name: 'white-papers-hub', path: '/white-papers' },
  { name: 'white-paper-detail', path: '/white-papers/driver-retention-is-a-data-problem' },
  { name: 'benchmarks-hub', path: '/benchmarks' },
  { name: 'benchmark-detail', path: '/benchmarks/carrier-retention-index-q2-2026' },
  { name: 'paid-lp-default', path: '/lp/driver-retention-is-a-data-problem' },
]

const BASE = process.env.LIGHTHOUSE_BASE || 'http://localhost:3000'

async function run(page, formFactor) {
  const outPath = join(reportsDir, `${page.name}-${formFactor}.json`)
  if (existsSync(outPath)) rmSync(outPath)
  const url = `${BASE}${page.path}`
  console.log(`  ${page.name} (${formFactor})...`)
  const ffFlag = formFactor === 'desktop' ? '--preset=desktop' : '--form-factor=mobile'
  const cmd = `npx lighthouse "${url}" --quiet --output=json --output-path="${outPath}" --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox --disable-gpu" ${ffFlag}`
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 120000 })
  } catch (e) {
    if (!existsSync(outPath)) {
      const stderr = e.stderr ? e.stderr.toString() : ''
      const stdout = e.stdout ? e.stdout.toString() : ''
      const last = (stderr + '\n' + stdout).split('\n').filter((l) => l.toLowerCase().includes('error') || l.toLowerCase().includes('runtime')).slice(-2).join(' | ')
      throw new Error(`exit ${e.status}: ${last || 'no output'}`)
    }
  }
  const report = JSON.parse(readFileSync(outPath, 'utf8'))
  return {
    scores: {
      performance: Math.round((report.categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((report.categories.accessibility?.score ?? 0) * 100),
      'best-practices': Math.round((report.categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((report.categories.seo?.score ?? 0) * 100),
    },
    opportunities: Object.values(report.audits)
      .filter((a) => a?.details?.type === 'opportunity' && a.score != null && a.score < 0.9 && a.numericValue > 100)
      .map((a) => ({ id: a.id, title: a.title, savingsMs: Math.round(a.numericValue || 0) }))
      .sort((a, b) => b.savingsMs - a.savingsMs)
      .slice(0, 5),
    diagnostics: Object.values(report.audits)
      .filter((a) => a?.score != null && a.score < 1 && (a.scoreDisplayMode === 'binary' || a.scoreDisplayMode === 'numeric'))
      .map((a) => ({ id: a.id, title: a.title, score: a.score }))
      .filter((a) => !a.id.startsWith('uses-') || a.score < 0.5)
      .slice(0, 8),
  }
}

const results = []
for (const page of PAGES) {
  for (const ff of ['mobile', 'desktop']) {
    try {
      const r = await run(page, ff)
      results.push({ ...page, formFactor: ff, ...r })
    } catch (e) {
      console.error(`  ${page.name}/${ff}: FAILED:`, e.message)
      results.push({ ...page, formFactor: ff, error: e.message })
    }
  }
}

// ---- Print summary table ----
console.log('\n=== Scores (0-100) ===\n')
console.log('| Page                          | FF      | Perf | A11y | BP   | SEO  |')
console.log('|-------------------------------|---------|------|------|------|------|')
for (const r of results) {
  if (r.error) {
    console.log(`| ${r.name.padEnd(30)}| ${r.formFactor.padEnd(8)}| ERROR: ${r.error}`)
    continue
  }
  const c = (n) => (n >= 90 ? `\x1b[32m${n}\x1b[0m` : n >= 70 ? `\x1b[33m${n}\x1b[0m` : `\x1b[31m${n}\x1b[0m`)
  console.log(
    `| ${r.name.padEnd(30)}| ${r.formFactor.padEnd(8)}| ${c(r.scores.performance).padStart(4)} | ${c(r.scores.accessibility).padStart(4)} | ${c(r.scores['best-practices']).padStart(4)} | ${c(r.scores.seo).padStart(4)} |`
  )
}

console.log('\n=== Top opportunities (sorted by potential savings) ===')
for (const r of results.filter((x) => !x.error && x.opportunities.length > 0)) {
  console.log(`\n${r.name} (${r.formFactor}):`)
  for (const o of r.opportunities) {
    console.log(`  - ${o.title}  (~${o.savingsMs}ms)`)
  }
}

console.log('\n=== Failing audits (most common) ===')
const failCount = new Map()
for (const r of results.filter((x) => !x.error)) {
  for (const d of r.diagnostics) {
    failCount.set(d.id, { id: d.id, title: d.title, count: (failCount.get(d.id)?.count ?? 0) + 1 })
  }
}
const sorted = [...failCount.values()].sort((a, b) => b.count - a.count).slice(0, 10)
for (const f of sorted) {
  console.log(`  [${f.count}x] ${f.title}  (${f.id})`)
}

console.log(`\nFull JSON reports written to ./lighthouse-reports/`)
