-- Migration: add downloadCount to gated_content_leads
-- For limiting gated-content download links to a few uses within the 24h token
-- window (prevents indefinite recycling/sharing). Purely additive.
--
-- HOW TO APPLY (same workflow as the previous migrations):
--   1. Open https://supabase.com/dashboard/project/wtitdfptdzweywabpovv/sql/new
--   2. Paste this whole file. Click Run.
--   3. Should report "Success. No rows returned."

BEGIN;

ALTER TABLE "gated_content_leads"
  ADD COLUMN IF NOT EXISTS "downloadCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill: leads that have already been downloaded at least once start at 1 so
-- their remaining allowance is consistent with new leads.
UPDATE "gated_content_leads"
SET "downloadCount" = 1
WHERE "downloadedAt" IS NOT NULL
  AND "downloadCount" = 0;

COMMIT;
