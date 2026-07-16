/**
 * Uploads the white paper PDF to Sanity and patches the document to reference it.
 *
 * Usage:
 *   node scripts/upload-whitepaper-pdf.mjs <path-to-pdf>
 *   node scripts/upload-whitepaper-pdf.mjs "C:\Users\a_alm\Desktop\Rapid_Relay_Technologies_—_Driver_Retention_is_a_Data_Problem.pdf"
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createReadStream } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = resolve(__dirname, '../.env.local')
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const val = trimmed.slice(eq + 1).trim()
  if (!process.env[key]) process.env[key] = val
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const TOKEN = process.env.SANITY_API_WRITE_TOKEN

if (!PROJECT_ID || !DATASET || !TOKEN) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

const pdfPath = process.argv[2]
if (!pdfPath) {
  console.error('Usage: node scripts/upload-whitepaper-pdf.mjs <path-to-pdf>')
  process.exit(1)
}

const SLUG = 'driver-retention-is-a-data-problem'
const DOWNLOAD_FILENAME = 'Rapid-Relay-Driver-Retention-Is-A-Data-Problem.pdf'

const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/assets/files/${DATASET}`

console.log(`Uploading ${pdfPath} → Sanity as "${DOWNLOAD_FILENAME}"...`)

// 1. Upload the PDF as a Sanity file asset
const pdfStream = createReadStream(pdfPath)
const uploadRes = await fetch(`${BASE_URL}?filename=${encodeURIComponent(DOWNLOAD_FILENAME)}`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/pdf',
  },
  body: pdfStream,
  duplex: 'half',
})

if (!uploadRes.ok) {
  const body = await uploadRes.text()
  console.error('Upload failed:', uploadRes.status, body)
  process.exit(1)
}

const asset = await uploadRes.json()
const assetId = asset.document._id
console.log(`✓ Uploaded asset: ${assetId}`)

// 2. Find the white paper document by slug
const queryUrl = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(`*[_type == "whitePaper" && slug.current == "${SLUG}"][0]{ _id, title }`)}`
const queryRes = await fetch(queryUrl, {
  headers: { Authorization: `Bearer ${TOKEN}` },
})
const queryData = await queryRes.json()
const doc = queryData.result

if (!doc) {
  console.error(`No whitePaper document found with slug "${SLUG}"`)
  console.log('Make sure the document exists in Sanity Studio before running this script.')
  process.exit(1)
}

console.log(`Found document: "${doc.title}" (${doc._id})`)

// 3. Patch pdfFile to reference the new asset
const patchUrl = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`
const patchRes = await fetch(patchUrl, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mutations: [
      {
        patch: {
          id: doc._id,
          set: {
            pdfFile: {
              _type: 'file',
              asset: { _type: 'reference', _ref: assetId },
            },
          },
        },
      },
    ],
  }),
})

if (!patchRes.ok) {
  const body = await patchRes.text()
  console.error('Patch failed:', patchRes.status, body)
  process.exit(1)
}

console.log(`✓ White paper "${doc.title}" now points to "${DOWNLOAD_FILENAME}"`)
console.log(`  Asset ID: ${assetId}`)
console.log(`  Download filename: ${DOWNLOAD_FILENAME}`)
