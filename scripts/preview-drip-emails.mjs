#!/usr/bin/env node
/**
 * Render every Lanework drip email to HTML so the copy can be reviewed in a browser
 * without sending anything. Bundles lib/labs-email.ts with esbuild and calls the real
 * renderLaneworkDrip(), so what you see here is exactly what Resend would deliver.
 *
 * Resend and Prisma are stubbed at bundle time: rendering touches neither, and this
 * script never opens a database connection or an API call.
 *
 * Usage:
 *   node scripts/preview-drip-emails.mjs [outDir]     # default: .drip-preview
 */
import { build } from 'esbuild'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(process.argv[2] || join(projectRoot, '.drip-preview'))
const tmp = mkdtempSync(join(tmpdir(), 'drip-preview-'))

// Papers to render. Add a slug here when a new paper gets its own copy entry.
const CASES = [
  { label: 'White paper #1', slug: 'driver-retention-is-a-data-problem', title: 'Driver Retention is a Data Problem' },
  { label: 'White paper #2', slug: 'one-in-six-miles-earns-zero', title: 'One in Six Miles Earns $0' },
  { label: 'Unmapped slug (generic fallback)', slug: 'some-future-paper', title: 'Some Future Paper' },
]

const RECIPIENT = { to: 'preview@example.com', name: 'jordan reyes' }

try {
  // Stub the two module-load side effects so the bundle is pure rendering.
  writeFileSync(join(tmp, 'prisma-stub.js'), 'export const prisma = {}\nexport default { prisma }\n')
  writeFileSync(
    join(tmp, 'resend-stub.js'),
    'export class Resend { constructor() { this.emails = { send: async () => ({}) }; this.batch = { send: async () => ({}) } } }\n'
  )

  const bundlePath = join(tmp, 'labs-email.mjs')
  await build({
    entryPoints: [join(projectRoot, 'lib', 'labs-email.ts')],
    outfile: bundlePath,
    bundle: true,
    platform: 'node',
    format: 'esm',
    tsconfig: join(projectRoot, 'tsconfig.json'),
    logLevel: 'warning',
    alias: {
      '@/lib/prisma': join(tmp, 'prisma-stub.js'),
      resend: join(tmp, 'resend-stub.js'),
    },
  })

  const { renderLaneworkDrip } = await import(pathToFileURL(bundlePath).href)

  mkdirSync(outDir, { recursive: true })
  const index = []

  for (const testCase of CASES) {
    for (const step of [1, 2, 3]) {
      const { subject, html } = renderLaneworkDrip(step, {
        ...RECIPIENT,
        contentTitle: testCase.title,
        contentSlug: testCase.slug,
      })
      const file = `${testCase.slug}-step${step}.html`
      writeFileSync(join(outDir, file), html, 'utf8')
      index.push({ label: testCase.label, slug: testCase.slug, step, subject, file })
      console.log(`step ${step}  ${testCase.slug.padEnd(34)}  ${subject}`)
    }
  }

  const rows = index
    .map(
      (r) =>
        `<tr><td>${r.label}</td><td>Day ${{ 1: 2, 2: 5, 3: 12 }[r.step]}</td><td><code>${r.subject}</code></td><td><a href="./${r.file}">open</a></td></tr>`
    )
    .join('\n')
  writeFileSync(
    join(outDir, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>Drip preview</title>
<style>body{font:15px/1.5 system-ui,sans-serif;margin:32px;max-width:900px}
table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #e5e7eb;padding:8px 10px;text-align:left}
code{background:#f4f4f5;padding:2px 5px;border-radius:4px}</style>
<h1>Lanework drip preview</h1>
<p>Rendered from <code>lib/labs-email.ts</code>. Nothing was sent.</p>
<table><tr><th>Paper</th><th>Send</th><th>Subject</th><th></th></tr>
${rows}
</table>`,
    'utf8'
  )

  console.log(`\nWrote ${index.length} emails to ${outDir}`)
  console.log(`Open ${join(outDir, 'index.html')}`)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
