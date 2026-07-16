/**
 * Server-side PostHog data layer.
 *
 * Reads analytics straight from PostHog's HogQL Query API so the admin dashboard
 * can render native, on-brand charts instead of an embedded iframe. ALL functions
 * here run server-side only — they use POSTHOG_PERSONAL_API_KEY, a high-privilege
 * secret that must NEVER reach the client bundle (no NEXT_PUBLIC_ prefix).
 *
 * Required env (server runtime, e.g. Netlify site env + .env.local):
 *   POSTHOG_PERSONAL_API_KEY — a PostHog Personal API Key with read/query scope.
 *   POSTHOG_PROJECT_ID       — the numeric project id (Settings → Project).
 *   NEXT_PUBLIC_POSTHOG_HOST — ingestion host; the app/query host is derived from it.
 *
 * Each query is a small parameterless HogQL SELECT over the `events` table, scoped
 * to a time window and with /admin traffic excluded so our own team activity never
 * skews the numbers (mirrors the capture-side opt-out in PostHogProvider).
 */

const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 } as const
export type RangeKey = keyof typeof RANGE_DAYS
export const RANGE_KEYS = Object.keys(RANGE_DAYS) as RangeKey[]
export const DEFAULT_RANGE: RangeKey = '30d'

export function rangeToDays(range: string | undefined): number {
  return RANGE_DAYS[(range as RangeKey)] ?? RANGE_DAYS[DEFAULT_RANGE]
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(process.env.POSTHOG_PERSONAL_API_KEY && process.env.POSTHOG_PROJECT_ID)
}

/** The PostHog APP host (where /api/projects lives) derived from the ingestion host. */
function apiBase(): string {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com'
  // us.i.posthog.com / eu.i.posthog.com are ingestion; the API lives on us./eu.posthog.com.
  return host.replace('.i.posthog.com', '.posthog.com')
}

export class PostHogQueryError extends Error {}

type Row = (string | number | null)[]

/**
 * Run a HogQL query and return its rows. Throws PostHogQueryError on any failure
 * so callers (the page) can isolate a single failed widget without crashing.
 */
async function posthogQuery(hogql: string): Promise<Row[]> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY
  const projectId = process.env.POSTHOG_PROJECT_ID
  if (!key || !projectId) throw new PostHogQueryError('PostHog analytics is not configured.')

  let res: Response
  try {
    res = await fetch(`${apiBase()}/api/projects/${projectId}/query/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query: hogql } }),
      // Cache for 5 minutes so re-opening the page doesn't re-hit the API every load.
      next: { revalidate: 300 },
    })
  } catch (e) {
    throw new PostHogQueryError(`Network error reaching PostHog: ${(e as Error).message}`)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new PostHogQueryError(`PostHog query failed (${res.status}). ${body.slice(0, 300)}`)
  }

  const json = (await res.json()) as { results?: Row[] }
  return json.results ?? []
}

/**
 * Common filter clause: time window + noise exclusions applied to every query.
 * Always drops local dev traffic (localhost / 127.0.0.1), which otherwise dominates
 * the numbers. When `pathnameFiltered`, also drops our own backend (/admin) and the
 * gated Lanework preview (/labs) so neither skews site metrics. `days` is validated.
 */
function windowClause(days: number, pathnameFiltered = true): string {
  const d = Number.isInteger(days) ? days : 30
  const localExclusion =
    `AND properties.$host NOT LIKE 'localhost%' AND properties.$host NOT LIKE '127.0.0.1%'`
  const pathExclusion = pathnameFiltered
    ? `AND properties.$pathname NOT LIKE '/admin%' AND properties.$pathname NOT LIKE '/labs%'`
    : ''
  return `timestamp >= now() - INTERVAL ${d} DAY ${pathExclusion} ${localExclusion}`
}

// ---- Typed results -------------------------------------------------------------

export type Totals = { pageviews: number; visitors: number; leads: number }
export type TimeseriesPoint = { day: string; views: number; visitors: number }
export type LabelValue = { label: string; value: number }
export type FunnelStage = { label: string; value: number }

const n = (v: string | number | null): number => (typeof v === 'number' ? v : Number(v) || 0)
const s = (v: string | number | null): string => (v == null ? '' : String(v))

export async function getTotals(days: number): Promise<Totals> {
  const rows = await posthogQuery(`
    SELECT
      countIf(event = '$pageview') AS pageviews,
      uniqIf(person_id, event = '$pageview') AS visitors,
      countIf(event = 'generate_lead') AS leads
    FROM events
    WHERE ${windowClause(days)}
  `)
  const r = rows[0] ?? [0, 0, 0]
  return { pageviews: n(r[0]), visitors: n(r[1]), leads: n(r[2]) }
}

export async function getPageviewsTimeseries(days: number): Promise<TimeseriesPoint[]> {
  const rows = await posthogQuery(`
    SELECT toDate(timestamp) AS day, count() AS views, uniq(person_id) AS visitors
    FROM events
    WHERE event = '$pageview' AND ${windowClause(days)}
    GROUP BY day ORDER BY day ASC
  `)
  return rows.map((r) => ({ day: s(r[0]), views: n(r[1]), visitors: n(r[2]) }))
}

export async function getTopSources(days: number): Promise<LabelValue[]> {
  const rows = await posthogQuery(`
    SELECT coalesce(nullIf(properties.$referring_domain, ''), '$direct') AS source, count() AS views
    FROM events
    WHERE event = '$pageview' AND ${windowClause(days)}
    GROUP BY source ORDER BY views DESC LIMIT 10
  `)
  return rows.map((r) => ({ label: s(r[0]) === '$direct' ? 'Direct / none' : s(r[0]), value: n(r[1]) }))
}

export async function getTopPages(days: number): Promise<LabelValue[]> {
  const rows = await posthogQuery(`
    SELECT coalesce(nullIf(properties.$pathname, ''), '/') AS path, count() AS views
    FROM events
    WHERE event = '$pageview' AND ${windowClause(days)}
    GROUP BY path ORDER BY views DESC LIMIT 10
  `)
  return rows.map((r) => ({ label: s(r[0]), value: n(r[1]) }))
}

export async function getUtmCampaigns(days: number): Promise<LabelValue[]> {
  const rows = await posthogQuery(`
    SELECT
      concat(
        coalesce(nullIf(properties.utm_source, ''), '(none)'),
        ' · ',
        coalesce(nullIf(properties.utm_campaign, ''), '(none)')
      ) AS campaign,
      count() AS views
    FROM events
    WHERE event = '$pageview'
      AND properties.utm_source IS NOT NULL AND properties.utm_source != ''
      AND ${windowClause(days)}
    GROUP BY campaign ORDER BY views DESC LIMIT 10
  `)
  return rows.map((r) => ({ label: s(r[0]), value: n(r[1]) }))
}

export async function getDeviceBreakdown(days: number): Promise<LabelValue[]> {
  const rows = await posthogQuery(`
    SELECT coalesce(nullIf(properties.$device_type, ''), 'Unknown') AS device, count() AS views
    FROM events
    WHERE event = '$pageview' AND ${windowClause(days)}
    GROUP BY device ORDER BY views DESC LIMIT 6
  `)
  return rows.map((r) => ({ label: s(r[0]), value: n(r[1]) }))
}

export async function getGeoBreakdown(days: number): Promise<LabelValue[]> {
  const rows = await posthogQuery(`
    SELECT coalesce(nullIf(properties.$geoip_country_name, ''), 'Unknown') AS country, count() AS views
    FROM events
    WHERE event = '$pageview' AND ${windowClause(days)}
    GROUP BY country ORDER BY views DESC LIMIT 10
  `)
  return rows.map((r) => ({ label: s(r[0]), value: n(r[1]) }))
}

export async function getConversionFunnel(days: number): Promise<FunnelStage[]> {
  const rows = await posthogQuery(`
    SELECT
      countIf(event = 'view_resource') AS viewed,
      countIf(event = 'generate_lead') AS lead,
      countIf(event = 'gated_content_download_complete') AS downloaded,
      countIf(event = 'demo_cta_click') AS demo
    FROM events
    WHERE ${windowClause(days, false)}
  `)
  const r = rows[0] ?? [0, 0, 0, 0]
  return [
    { label: 'Viewed resource', value: n(r[0]) },
    { label: 'Submitted lead form', value: n(r[1]) },
    { label: 'Download complete', value: n(r[2]) },
    { label: 'Clicked demo CTA', value: n(r[3]) },
  ]
}

// Referrer domain, lowercased and null-safe. Constant SQL fragment (no user input).
const REF = `lower(coalesce(nullIf(properties.$referring_domain, ''), ''))`
// Reusable predicate matching known AI assistants / answer engines.
const AI_MATCH = `(
  ${REF} LIKE '%chatgpt%' OR ${REF} LIKE '%openai%' OR ${REF} LIKE '%perplexity%'
  OR ${REF} LIKE '%claude.ai%' OR ${REF} LIKE '%gemini%' OR ${REF} LIKE '%copilot%'
  OR ${REF} LIKE '%you.com%' OR ${REF} LIKE '%poe.com%' OR ${REF} LIKE '%phind%'
)`

/**
 * Acquisition channel: how visitors arrived, bucketed into AI assistants vs Google
 * Search vs other search vs social vs direct vs referral. AI is checked before
 * Google so gemini.google.com counts as AI, not Search.
 */
export async function getChannelBreakdown(days: number): Promise<LabelValue[]> {
  const rows = await posthogQuery(`
    SELECT
      multiIf(
        ${REF} = '' OR ${REF} = '$direct', 'Direct / none',
        ${AI_MATCH}, 'AI assistants',
        ${REF} LIKE '%google.%' OR ${REF} LIKE '%google', 'Google Search',
        ${REF} LIKE '%bing.%' OR ${REF} LIKE '%duckduckgo%' OR ${REF} LIKE '%yahoo%'
          OR ${REF} LIKE '%ecosia%' OR ${REF} LIKE '%baidu%' OR ${REF} LIKE '%yandex%', 'Other search',
        ${REF} LIKE '%linkedin%' OR ${REF} LIKE '%lnkd.in%' OR ${REF} LIKE '%twitter%'
          OR ${REF} = 't.co' OR ${REF} LIKE '%facebook%' OR ${REF} LIKE '%reddit%'
          OR ${REF} LIKE '%youtube%' OR ${REF} LIKE '%instagram%', 'Social',
        'Other referral'
      ) AS channel,
      count() AS views
    FROM events
    WHERE event = '$pageview' AND ${windowClause(days)}
    GROUP BY channel ORDER BY views DESC
  `)
  return rows.map((r) => ({ label: s(r[0]), value: n(r[1]) }))
}

/** Which specific AI assistants / answer engines referred traffic. */
export async function getAiReferrers(days: number): Promise<LabelValue[]> {
  const rows = await posthogQuery(`
    SELECT ${REF} AS ref, count() AS views
    FROM events
    WHERE event = '$pageview' AND ${AI_MATCH} AND ${windowClause(days)}
    GROUP BY ref ORDER BY views DESC LIMIT 10
  `)
  return rows.map((r) => ({ label: s(r[0]), value: n(r[1]) }))
}

/** Browser mix (Chrome, Safari, Edge, ...). */
export async function getBrowserBreakdown(days: number): Promise<LabelValue[]> {
  const rows = await posthogQuery(`
    SELECT coalesce(nullIf(properties.$browser, ''), 'Unknown') AS browser, count() AS views
    FROM events
    WHERE event = '$pageview' AND ${windowClause(days)}
    GROUP BY browser ORDER BY views DESC LIMIT 8
  `)
  return rows.map((r) => ({ label: s(r[0]), value: n(r[1]) }))
}

/**
 * Unique visitors per major site section (Home, Research, White papers, Benchmarks,
 * Blog, ...). Answers "how many people visit the research section" etc.
 */
export async function getSectionEngagement(days: number): Promise<LabelValue[]> {
  const rows = await posthogQuery(`
    SELECT
      multiIf(
        path = '/', 'Home',
        path LIKE '/research%', 'Research hub',
        path LIKE '/white-papers%', 'White papers',
        path LIKE '/benchmarks%', 'Benchmarks',
        path LIKE '/blog%', 'Blog',
        path LIKE '/who-we-serve%', 'Who we serve',
        path LIKE '/connect%', 'Connect',
        path LIKE '/about%', 'About',
        path LIKE '/lp/%', 'Landing pages',
        'Other'
      ) AS section,
      uniq(person_id) AS visitors
    FROM (
      SELECT coalesce(nullIf(properties.$pathname, ''), '/') AS path, person_id
      FROM events
      WHERE event = '$pageview' AND ${windowClause(days)}
    )
    GROUP BY section ORDER BY visitors DESC
  `)
  return rows.map((r) => ({ label: s(r[0]), value: n(r[1]) }))
}
