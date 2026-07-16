/**
 * Regenerates the abstract, text-free cover art for every white paper + benchmark
 * in Sanity and patches each doc's coverImage in place. PDFs and all other fields
 * are left untouched.
 *
 * White papers get the 'network' (retention/churn) motif; benchmarks get the
 * 'scorecard' (risk-ranking) motif. Seeded by slug, so covers are stable across
 * re-runs and distinct per item.
 *
 * Run:  node scripts/update-covers.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@sanity/client'
import { generateCover } from './lib/generate-cover.mjs'

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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-30'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function main() {
  console.log(`Connecting to Sanity: project=${projectId} dataset=${dataset}`)
  const docs = await client.fetch(
    `*[_type in ["whitePaper","benchmark"]]{ _id, _type, title, "slug": slug.current }`
  )
  if (!docs.length) {
    console.log('No white papers or benchmarks found.')
    return
  }
  console.log(`Found ${docs.length} doc(s) to re-cover.\n`)

  for (const doc of docs) {
    const theme = doc._type === 'benchmark' ? 'scorecard' : 'network'
    const seed = doc.slug || doc._id
    console.log(`• ${doc._type}  ${doc.title}`)
    console.log(`    theme=${theme} seed=${seed}`)

    const buf = await generateCover({ theme, seed })
    const asset = await client.assets.upload('image', buf, {
      filename: `${seed}-cover.png`,
    })
    console.log(`    uploaded image asset ${asset._id} (${(buf.length / 1024).toFixed(0)} KB)`)

    await client
      .patch(doc._id)
      .set({
        coverImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: `${doc.title} — Rapid Relay Analytics`,
        },
      })
      .commit()
    console.log(`    patched coverImage ✓\n`)
  }

  console.log('✅ Covers updated.')
}

main().catch((e) => {
  console.error('\n✗ Failed:', e?.message || e)
  process.exit(1)
})
