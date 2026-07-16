-- Migration: add drip sequence columns to gated_content_leads
-- Generated 2026-05-15 for Phase 2 (drip email nurture).
-- Purely additive. No existing data touched.
--
-- HOW TO APPLY (same workflow as the first migration):
--   1. Open https://supabase.com/dashboard/project/wtitdfptdzweywabpovv/sql/new
--   2. Paste this whole file. Click Run.
--   3. Should report "Success. No rows returned."

BEGIN;

ALTER TABLE "gated_content_leads"
  ADD COLUMN IF NOT EXISTS "dripStep" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "dripNextSendAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "dripUnsubscribedAt" TIMESTAMP(3);

-- Backfill: existing leads from the first build should have their drip start clock
-- begin 2 days after their createdAt. Skip leads older than 30 days (drip window
-- has long passed; not worth re-engaging via this sequence).
UPDATE "gated_content_leads"
SET "dripNextSendAt" = "createdAt" + INTERVAL '2 days'
WHERE "dripNextSendAt" IS NULL
  AND "createdAt" > NOW() - INTERVAL '30 days';

CREATE INDEX IF NOT EXISTS "gated_content_leads_dripStep_dripNextSendAt_idx"
  ON "gated_content_leads" ("dripStep", "dripNextSendAt");

COMMIT;
