-- Migration: add gated_content_leads table
-- Generated 2026-05-14 for the white papers + benchmarks build.
-- This is purely additive. No existing tables touched, no data loss possible.
--
-- HOW TO APPLY:
--   Option A (Supabase dashboard, recommended):
--     1. Open https://supabase.com/dashboard/project/wtitdfptdzweywabpovv/sql/new
--     2. Paste the contents of this file
--     3. Click "Run". Should report "Success. No rows returned."
--
--   Option B (psql, if you have direct DB access):
--     psql "<your DATABASE_URL>" -f prisma/manual-migrations/001_add_gated_content_leads.sql

BEGIN;

CREATE TABLE IF NOT EXISTS "gated_content_leads" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentSlug" TEXT NOT NULL,
    "contentTitle" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "downloadToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "downloadedAt" TIMESTAMP(3),
    "sanityId" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "referrer" TEXT,
    "landingPage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gated_content_leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "gated_content_leads_downloadToken_key"
    ON "gated_content_leads" ("downloadToken");

CREATE INDEX IF NOT EXISTS "gated_content_leads_email_idx"
    ON "gated_content_leads" ("email");

CREATE INDEX IF NOT EXISTS "gated_content_leads_contentType_contentSlug_idx"
    ON "gated_content_leads" ("contentType", "contentSlug");

CREATE INDEX IF NOT EXISTS "gated_content_leads_downloadToken_idx"
    ON "gated_content_leads" ("downloadToken");

COMMIT;
