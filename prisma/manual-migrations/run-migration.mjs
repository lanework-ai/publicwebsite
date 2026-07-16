// One-off migration runner that bypasses Prisma's schema engine
// (which doesn't play well with Supabase's Supavisor pooler).
// Uses the same pg driver Prisma uses at runtime, which DOES work with the pooler.
//
// Usage:  node prisma/manual-migrations/run-migration.mjs <sql-file>
//
// Reads DATABASE_URL from process.env (or .env.local).

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename } from 'node:path'
import pg from 'pg'

// Cheap .env.local loader (no dep)
const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')
try {
  const envContent = readFileSync(join(repoRoot, '.env.local'), 'utf8')
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL not set in env or .env.local')
  process.exit(1)
}

const sqlFile = process.argv[2]
if (!sqlFile) {
  console.error('Usage: node run-migration.mjs <sql-file>')
  process.exit(1)
}
const sqlPath = join(repoRoot, sqlFile)
const sql = readFileSync(sqlPath, 'utf8')

console.log(`Running ${basename(sqlPath)} against ${url.replace(/:[^:@]+@/, ':****@')}`)

const client = new pg.Client({ connectionString: url })
try {
  await client.connect()
  await client.query(sql)
  console.log('✓ Migration applied successfully')
} catch (err) {
  console.error('✗ Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
