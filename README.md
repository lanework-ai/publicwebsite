# Lanework

The public site for [lanework.ai](https://lanework.ai), an applied research lab for
logistics and supply chain. Next.js app with a Sanity-backed research library, a
Postgres lead and subscriber store, and an automated email layer (gated-content
delivery, a drip sequence, and blog broadcasts).

Split out of the Rapid Relay repo in July 2026, where it lived gated at `/labs`.
Rapid Relay and Rapid Load still appear here as products in the field-work case
studies; the rapidrelay.ai domain itself is being retired.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind + CSS custom properties in `app/labs-theme.css` |
| CMS | Sanity, embedded Studio at `/admin/studio` |
| Database | Supabase Postgres via Prisma 7 (`@prisma/adapter-pg`) |
| Email | Resend |
| Analytics | PostHog |
| Hosting | Netlify, plus a scheduled function for the drip tick |

Sanity's project and dataset are **shared with Rapid Relay** (same research
content). The database is **Lanework's own Supabase project**, separate from RR.

## Getting started

Requires Node 18+.

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill it in. The values that must be set for
a useful local run are `NEXT_PUBLIC_SANITY_*`, `DATABASE_URL`, and `RESEND_API_KEY`.

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Then open http://localhost:3000.

`npm run build` runs `prisma generate && next build`. Note the build talks to Sanity
to prerender research and blog pages, so the Sanity vars must be present.

## Routes

| Path | What it is |
| --- | --- |
| `/` | Homepage |
| `/research`, `/research/[slug]` | White papers and benchmarks, some gated |
| `/blog`, `/blog/[slug]` | Notes, the shorter-form analysis |
| `/field-work`, `/field-work/[slug]` | Deployment case studies, from `lib/labs/field-work.ts` |
| `/engagements`, `/about`, `/careers`, `/connect` | Company pages |
| `/lp/[slug]` | Paid landing pages, noindex |
| `/admin/studio` | Embedded Sanity Studio, Basic-Auth gated |

Field work and engagements are code-defined (`lib/labs/`), not CMS-driven. Research
and notes come from Sanity.

## Search and answer-engine surface

Beyond the usual sitemap and robots, the site publishes a Markdown corpus for LLMs:

- `/llms.txt` indexes the citable research
- `/llms-full.txt` is the full-text corpus
- Appending `/llms.txt` to any research or note URL returns that document as Markdown
- `/research/feed.xml` is the RSS feed

`app/robots.ts` names the AI crawlers explicitly (GPTBot, ClaudeBot, PerplexityBot,
Google-Extended, and others) so the intent is legible rather than implied.

## Email

`lib/labs-email.ts` holds every template and send path:

- **Gated content**: a lead submits a form, gets a tokenized download link
- **Drip**: a multi-step sequence, advanced by `/api/cron/drip` and the Netlify
  scheduled function `netlify/functions/drip-tick.mts`
- **Broadcast**: "Send Newsletter" in Sanity Studio posts to `/api/newsletter/send`
- **Unsubscribe**: one-click, at `/api/newsletter/unsubscribe`

Every subscriber and lead row carries `brand = "lanework"` (the Prisma default). The
column is a leftover from the shared-database era and is no longer settable from a
request; the broadcast query filters on it, so it must stay consistent.

## Scripts

`scripts/` holds operational one-offs, run with `node`:

| Script | Purpose |
| --- | --- |
| `run-drip-tick.mjs` | Advance the drip locally |
| `check-latest-lead.mjs` | Inspect the most recent gated-content lead |
| `delete-test-leads.mjs` | Remove test rows |
| `run-lighthouse-audit.mjs` | Lighthouse pass, including the SEO score |
| `update-covers.mjs`, `update-publish-date.mjs` | Bulk Sanity edits |
| `strip-em-dashes.mjs` | Normalize punctuation in CMS copy |

## Deploying

Netlify builds from `main` via its native Git integration, so **every push publishes
and spends build credits**. Work locally and batch pushes to the weekly deploy day
rather than pushing per change.

Secrets live in the Netlify site environment, not in `netlify.toml` and not in GitHub
secrets. `netlify.toml` carries only the non-secret `NEXT_PUBLIC_*` build config.
