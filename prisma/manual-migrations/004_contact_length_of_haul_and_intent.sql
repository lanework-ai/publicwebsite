-- Migration: add lengthOfHaul and intent to contacts
-- lengthOfHaul is the optional "Typical length of haul" carrier qualifier on the
-- contact form; intent is the value of its "I'd like to" select. Both nullable and
-- purely additive, so code deployed before this runs is unaffected.
--
-- ORDER MATTERS: apply this BEFORE deploying the code that adds these fields to
-- prisma/schema.prisma. prisma.contact.create returns every column, so once the
-- client knows about them every contact submission fails until they exist.
--
-- HOW TO APPLY (same workflow as the previous migrations):
--   node prisma/manual-migrations/run-migration.mjs prisma/manual-migrations/004_contact_length_of_haul_and_intent.sql
-- or paste this file into the Supabase SQL editor and click Run.

BEGIN;

ALTER TABLE "contacts"
  ADD COLUMN IF NOT EXISTS "lengthOfHaul" TEXT,
  ADD COLUMN IF NOT EXISTS "intent" TEXT;

COMMIT;
