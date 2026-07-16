import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const line of readFileSync(resolve(__dirname, '../.env.local'), 'utf8').split('\n')) {
  const eq = line.indexOf('=')
  if (eq > 0 && !process.env[line.slice(0,eq).trim()]) process.env[line.slice(0,eq).trim()] = line.slice(eq+1).trim()
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const TOKEN = process.env.SANITY_API_WRITE_TOKEN
const SLUG = 'driver-retention-is-a-data-problem'
const NEW_DATE = '2026-06-19T12:00:00Z'

const patchUrl = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`
const queryUrl = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(`*[_type == "whitePaper" && slug.current == "${SLUG}"][0]{ _id, title, publishedAt }`)}`

const doc = (await (await fetch(queryUrl, { headers: { Authorization: `Bearer ${TOKEN}` } })).json()).result
console.log(`Found: "${doc.title}" — current date: ${doc.publishedAt}`)

const res = await fetch(patchUrl, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations: [{ patch: { id: doc._id, set: { publishedAt: NEW_DATE } } }] }),
})
const body = await res.json()
if (res.ok) console.log(`✓ Updated publishedAt to ${NEW_DATE}`)
else console.error('Failed:', body)
