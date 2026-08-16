import Link from 'next/link'
import {
  isAnalyticsConfigured,
  normalizeRange,
  rangeToDays,
  getTotals,
  getPageviewsTimeseries,
  getChannelBreakdown,
  getAiReferrers,
  getTopSources,
  getTopPages,
  getSectionEngagement,
  getUtmCampaigns,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getGeoBreakdown,
  getConversionFunnel,
} from '@/lib/posthog-query'
import {
  getConversionTotals,
  getContentPerformance,
  getRecentLeads,
  getDripSequenceHealth,
  getRecentContacts,
  getFleetSizeMix,
  getLeadAttribution,
  getNewsletterHealth,
} from '@/lib/admin-metrics'
import {
  StatCards,
  RangeToggle,
  AreaLineChart,
  BarList,
  Funnel,
  WidgetError,
  DataTable,
  StatList,
  ConversionCards,
} from '@/components/Analytics/charts'

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export const metadata = {
  title: 'Analytics · Lanework Admin',
  robots: { index: false, follow: false },
}

// Always render fresh; the underlying PostHog fetches carry their own 5-minute
// revalidate, so this costs one cheap render, not one API round-trip per hit.
export const dynamic = 'force-dynamic'

const RANGE_LABELS: Record<string, string> = { '7d': '7 days', '30d': '30 days', '90d': '90 days' }

/**
 * Native PostHog dashboard for the admin area.
 *
 * Sits behind the Basic-Auth gate in middleware.ts (matcher '/admin/:path*') and
 * is skipped by SiteChrome, so it supplies its own .ll-root wrapper — the design
 * tokens in labs-theme.css hang off that class, not :root.
 *
 * Every widget is fetched through Promise.allSettled: a single failing query
 * (bad key, revoked scope, PostHog outage) degrades to one error panel rather
 * than a 500 for the whole page.
 */
export default async function AdminAnalytics({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range: rawRange } = await searchParams
  const range = normalizeRange(rawRange)
  const days = rangeToDays(range)
  const rangeLabel = RANGE_LABELS[range] ?? '30 days'

  if (!isAnalyticsConfigured()) return <SetupPanel />

  const [
    totals,
    series,
    channels,
    aiRefs,
    sources,
    pages,
    sections,
    utm,
    devices,
    browsers,
    geo,
    funnel,
    convTotals,
    content,
    leads,
    drip,
    contacts,
    fleetMix,
    attribution,
    newsletter,
  ] = await Promise.allSettled([
    getTotals(days),
    getPageviewsTimeseries(days),
    getChannelBreakdown(days),
    getAiReferrers(days),
    getTopSources(days),
    getTopPages(days),
    getSectionEngagement(days),
    getUtmCampaigns(days),
    getDeviceBreakdown(days),
    getBrowserBreakdown(days),
    getGeoBreakdown(days),
    getConversionFunnel(days),
    // Postgres-backed. Ground truth from our own tables rather than client events.
    getConversionTotals(),
    getContentPerformance(),
    getRecentLeads(days),
    getDripSequenceHealth(),
    getRecentContacts(days),
    getFleetSizeMix(days),
    getLeadAttribution(),
    getNewsletterHealth(days),
  ])

  const reason = (r: PromiseSettledResult<unknown>) =>
    r.status === 'rejected' ? String((r.reason as Error)?.message ?? r.reason) : ''

  /** Render a bar-list widget, or an error panel if its query rejected. */
  const bars = (title: string, r: PromiseSettledResult<{ label: string; value: number }[]>) =>
    r.status === 'fulfilled' ? (
      <BarList title={title} items={r.value} />
    ) : (
      <WidgetError title={title} message={reason(r)} />
    )

  return (
    <div className="ll-root">
      <div className="ll-section" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div>
            <div className="ll-label" style={{ fontSize: 12, marginBottom: 8 }}>Lanework Admin</div>
            <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 500, letterSpacing: 'var(--tracking-tight)', margin: 0 }}>
              Analytics
            </h1>
          </div>
          <RangeToggle active={range} />
        </header>

        <div style={{ display: 'grid', gap: 16 }}>
          {totals.status === 'fulfilled' ? (
            <StatCards totals={totals.value} rangeLabel={rangeLabel} />
          ) : (
            <WidgetError title="Totals" message={reason(totals)} />
          )}

          {series.status === 'fulfilled' ? (
            <AreaLineChart data={series.value} />
          ) : (
            <WidgetError title="Pageviews over time" message={reason(series)} />
          )}

          {funnel.status === 'fulfilled' ? (
            <Funnel stages={funnel.value} />
          ) : (
            <WidgetError title="Gated-content conversion funnel" message={reason(funnel)} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {bars('Acquisition channel', channels)}
            {bars('AI assistants & answer engines', aiRefs)}
            {bars('Top referrers', sources)}
            {bars('Top pages', pages)}
            {bars('Visitors by section', sections)}
            {bars('UTM campaigns', utm)}
            {bars('Devices', devices)}
            {bars('Browsers', browsers)}
            {bars('Countries', geo)}
          </div>
        </div>

        {/* Everything above is client-side events, so ad blockers and DNT erode it.
            Everything below is rows our own API routes wrote — it is exact. Keeping
            the two visually separate stops anyone comparing a blocked number against
            a complete one and concluding something is broken. */}
        <div style={{ borderTop: '1px solid var(--lw-line-2)', margin: '36px 0 24px', paddingTop: 28 }}>
          <div className="ll-label" style={{ fontSize: 12, marginBottom: 6 }}>From the database</div>
          <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 680 }}>
            Submissions, downloads and drip state, counted from our own tables. Unlike
            the panels above, nothing here is affected by ad blockers — every number is
            a real row. Totals are all-time; the tables follow the {rangeLabel} range.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {convTotals.status === 'fulfilled' ? (
            <ConversionCards totals={convTotals.value} />
          ) : (
            <WidgetError title="Conversion totals" message={reason(convTotals)} />
          )}

          {content.status === 'fulfilled' ? (
            <DataTable
              title="Gated content performance"
              columns={[
                { key: 'slug', label: 'Content' },
                { key: 'type', label: 'Type' },
                { key: 'leads', label: 'Leads', numeric: true },
                { key: 'downloaded', label: 'Downloaded', numeric: true },
                { key: 'rate', label: 'Rate', numeric: true },
              ]}
              rows={content.value.map((c) => ({
                slug: c.slug,
                type: c.type,
                leads: c.leads,
                downloaded: c.downloaded,
                rate: `${c.rate.toFixed(c.rate < 10 ? 1 : 0)}%`,
              }))}
              empty="No gated leads captured yet."
            />
          ) : (
            <WidgetError title="Gated content performance" message={reason(content)} />
          )}

          {leads.status === 'fulfilled' ? (
            <DataTable
              title={`Recent leads · last ${rangeLabel}`}
              columns={[
                { key: 'when', label: 'Date' },
                { key: 'name', label: 'Name' },
                { key: 'company', label: 'Company' },
                { key: 'slug', label: 'Content' },
                { key: 'downloaded', label: 'Downloaded' },
              ]}
              rows={leads.value.map((l) => ({
                when: dateFmt.format(l.createdAt),
                name: l.name,
                company: l.company,
                slug: l.slug,
                downloaded: l.downloaded ? `Yes (${l.downloadCount}×)` : 'Not yet',
              }))}
              empty={`No leads in the last ${rangeLabel}.`}
            />
          ) : (
            <WidgetError title="Recent leads" message={reason(leads)} />
          )}

          {attribution.status === 'fulfilled' ? (
            <DataTable
              title="Lead attribution — what actually converted"
              columns={[
                { key: 'source', label: 'Source' },
                { key: 'campaign', label: 'Campaign' },
                { key: 'landingPage', label: 'Landing page' },
                { key: 'leads', label: 'Leads', numeric: true },
                { key: 'downloaded', label: 'Downloaded', numeric: true },
              ]}
              rows={attribution.value.map((a) => ({
                source: a.source,
                campaign: a.campaign,
                landingPage: a.landingPage,
                leads: a.leads,
                downloaded: a.downloaded,
              }))}
              empty="No leads captured yet."
            />
          ) : (
            <WidgetError title="Lead attribution" message={reason(attribution)} />
          )}

          {contacts.status === 'fulfilled' ? (
            <DataTable
              title={`Contact enquiries · last ${rangeLabel}`}
              columns={[
                { key: 'when', label: 'Date' },
                { key: 'name', label: 'Name' },
                { key: 'company', label: 'Company' },
                { key: 'fleetSize', label: 'Fleet size' },
                { key: 'flagged', label: 'Flagged' },
              ]}
              rows={contacts.value.map((c) => ({
                when: dateFmt.format(c.createdAt),
                name: c.name,
                company: c.company,
                fleetSize: c.fleetSize,
                flagged: c.flagged ? 'Spam' : '—',
              }))}
              empty={`No enquiries in the last ${rangeLabel}.`}
            />
          ) : (
            <WidgetError title="Contact enquiries" message={reason(contacts)} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {drip.status === 'fulfilled' ? (
              <StatList title="Drip sequence health" items={drip.value} />
            ) : (
              <WidgetError title="Drip sequence health" message={reason(drip)} />
            )}
            {newsletter.status === 'fulfilled' ? (
              <StatList title="Newsletter" items={newsletter.value} />
            ) : (
              <WidgetError title="Newsletter" message={reason(newsletter)} />
            )}
            {fleetMix.status === 'fulfilled' ? (
              <BarList title="Fleet size mix" items={fleetMix.value} />
            ) : (
              <WidgetError title="Fleet size mix" message={reason(fleetMix)} />
            )}
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--lw-dim)', marginTop: 28, lineHeight: 1.6 }}>
          Traffic panels exclude <code>/admin</code> and localhost; the funnel counts its
          events wherever they fired. Figures cache for 5 minutes.{' '}
          <Link href="/admin/studio" style={{ color: 'var(--lw-accent-soft)' }}>Open Studio →</Link>
        </p>
      </div>
    </div>
  )
}

/** Shown until POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID are both set. */
function SetupPanel() {
  return (
    <div className="ll-root">
      <div className="ll-section" style={{ paddingTop: 40, paddingBottom: 64, maxWidth: 720 }}>
        <div className="ll-label" style={{ fontSize: 12, marginBottom: 8 }}>Lanework Admin</div>
        <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 500, letterSpacing: 'var(--tracking-tight)', margin: '0 0 16px' }}>
          Analytics
        </h1>
        <div style={{ border: '1px solid var(--lw-line-2)', borderRadius: 12, padding: 22, background: 'var(--lw-panel)' }}>
          <p style={{ fontSize: 15, color: 'var(--lw-fg-2)', lineHeight: 1.7, margin: '0 0 14px' }}>
            This dashboard reads from PostHog&rsquo;s query API and needs two server-side
            variables that aren&rsquo;t set yet:
          </p>
          <ul style={{ fontSize: 14, color: 'var(--lw-muted)', lineHeight: 1.9, margin: '0 0 14px', paddingLeft: 20 }}>
            <li>
              <code>POSTHOG_PERSONAL_API_KEY</code> — a Personal API Key with query read
              scope, from PostHog → Settings → Personal API keys.
            </li>
            <li>
              <code>POSTHOG_PROJECT_ID</code> — the numeric project id, from PostHog →
              Settings → Project.
            </li>
          </ul>
          <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.7, margin: 0 }}>
            Set both in <code>.env.local</code> locally and in the Netlify site environment
            for production, then reload. Until then, everything is still viewable in
            PostHog itself.
          </p>
        </div>
      </div>
    </div>
  )
}
