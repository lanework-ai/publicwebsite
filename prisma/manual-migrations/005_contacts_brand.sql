-- Migration: add brand to contacts
-- rapidrelay.ai now writes to this database too (its own Supabase project was
-- deleted), so contacts need the same brand tag newsletters and
-- gated_content_leads already carry. Every existing row is a Lanework inquiry,
-- which the default records. Purely additive, so code deployed before this runs
-- is unaffected.
--
-- ORDER MATTERS: apply this BEFORE deploying the code that adds Contact.brand to
-- prisma/schema.prisma (in this repo or rapidrelay-landing). prisma.contact.create
-- returns every column, so once the client knows about it every contact
-- submission fails until it exists.
--
-- HOW TO APPLY (same workflow as the previous migrations):
--   node prisma/manual-migrations/run-migration.mjs prisma/manual-migrations/005_contacts_brand.sql
-- or paste this file into the Supabase SQL editor and click Run.

BEGIN;

ALTER TABLE "contacts"
  ADD COLUMN IF NOT EXISTS "brand" TEXT NOT NULL DEFAULT 'lanework';

CREATE INDEX IF NOT EXISTS "contacts_brand_createdAt_idx" ON "contacts" ("brand", "createdAt");

COMMIT;
