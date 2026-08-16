/**
 * Server-side Postgres metrics for the admin dashboard.
 *
 * Counterpart to lib/posthog-query.ts. Where that answers "who visited" from
 * client-side events — which ad blockers, DNT and network failures all erode —
 * this answers "who converted" from the rows our own API routes wrote. It is
 * ground truth: every number here corresponds to a real database row.
 *
 * Server-only. Never import from a Client Component.
 *
 * Prisma is imported lazily inside each function on purpose. lib/prisma.ts throws
 * at MODULE level when DATABASE_URL is unset, so a static import would take the
 * whole dashboard down with it rather than degrading to one error panel, which is
 * exactly what the page's Promise.allSettled is there to prevent.
 */

async function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set, so the Postgres panels cannot load.')
  }
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

/** Start of the window for range-filtered panels. */
function since(days: number): Date {
  const d = Number.isInteger(days) ? days : 30
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000)
}

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0)

// ---- Types ---------------------------------------------------------------------

export type ConversionTotals = {
  leads: number
  downloaded: number
  downloadRate: number
  contacts: number
  subscribers: number
  newsletterUnsubscribes: number
  dripUnsubscribes: number
}

export type ContentRow = {
  slug: string
  type: string
  leads: number
  downloaded: number
  rate: number
}

export type LeadRow = {
  createdAt: Date
  name: string
  company: string
  email: string
  slug: string
  downloaded: boolean
  downloadCount: number
}

export type DripStage = { label: string; value: number }

export type ContactRow = {
  createdAt: Date
  name: string
  company: string
  email: string
  fleetSize: string
  flagged: boolean
}

export type AttributionRow = {
  source: string
  campaign: string
  landingPage: string
  leads: number
  downloaded: number
}

// ---- Queries -------------------------------------------------------------------

/**
 * Lifetime totals. Deliberately NOT range-filtered: at current volume a 7-day
 * window reads as all zeros, which looks broken rather than empty. The detail
 * tables below honour the range instead.
 */
export async function getConversionTotals(): Promise<ConversionTotals> {
  const prisma = await db()
  const [leads, downloaded, contacts, subscribers, newsletterUnsubscribes, dripUnsubscribes] =
    await Promise.all([
      prisma.gatedContentLead.count(),
      prisma.gatedContentLead.count({ where: { downloadedAt: { not: null } } }),
      prisma.contact.count(),
      prisma.newsletter.count(),
      prisma.newsletterUnsubscribe.count(),
      prisma.gatedContentLead.count({ where: { dripUnsubscribedAt: { not: null } } }),
    ])

  return {
    leads,
    downloaded,
    downloadRate: pct(downloaded, leads),
    contacts,
    subscribers,
    newsletterUnsubscribes,
    dripUnsubscribes,
  }
}

/**
 * Per-paper performance. The download rate is the interesting column: a paper that
 * captures leads but is never downloaded usually means the email did not arrive.
 */
export async function getContentPerformance(): Promise<ContentRow[]> {
  const prisma = await db()
  const rows = await prisma.gatedContentLead.groupBy({
    by: ['contentSlug', 'contentType'],
    _count: { _all: true },
    orderBy: { _count: { contentSlug: 'desc' } },
  })

  // downloadedAt is nullable, so it needs its own pass — groupBy cannot count a
  // filtered subset alongside the total in one query.
  const downloads = await prisma.gatedContentLead.groupBy({
    by: ['contentSlug'],
    where: { downloadedAt: { not: null } },
    _count: { _all: true },
  })
  const downloadedBySlug = new Map(downloads.map((d) => [d.contentSlug, d._count._all]))

  return rows.map((r) => {
    const leads = r._count._all
    const downloaded = downloadedBySlug.get(r.contentSlug) ?? 0
    return {
      slug: r.contentSlug,
      type: r.contentType === 'benchmark' ? 'Benchmark' : 'White paper',
      leads,
      downloaded,
      rate: pct(downloaded, leads),
    }
  })
}

/** Most recent leads in the window, newest first. */
export async function getRecentLeads(days: number, limit = 25): Promise<LeadRow[]> {
  const prisma = await db()
  const rows = await prisma.gatedContentLead.findMany({
    where: { createdAt: { gte: since(days) } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      createdAt: true,
      name: true,
      company: true,
      email: true,
      contentSlug: true,
      downloadedAt: true,
      downloadCount: true,
    },
  })

  return rows.map((r) => ({
    createdAt: r.createdAt,
    name: r.name,
    company: r.company,
    email: r.email,
    slug: r.contentSlug,
    downloaded: r.downloadedAt !== null,
    downloadCount: r.downloadCount,
  }))
}

/**
 * Where leads sit in the 3-email drip sequence.
 *
 * Labels describe what was LAST SENT, matching the dripStep comment in
 * prisma/schema.prisma. Labelling by what is next would read off-by-one against
 * the schema and against the cron in app/api/cron/drip.
 */
export async function getDripSequenceHealth(): Promise<DripStage[]> {
  const prisma = await db()
  const [byStep, unsubscribed] = await Promise.all([
    prisma.gatedContentLead.groupBy({
      by: ['dripStep'],
      where: { dripUnsubscribedAt: null },
      _count: { _all: true },
    }),
    prisma.gatedContentLead.count({ where: { dripUnsubscribedAt: { not: null } } }),
  ])

  const at = (step: number) => byStep.find((s) => s.dripStep === step)?._count._all ?? 0

  return [
    { label: 'Confirmation sent (day 0)', value: at(0) },
    { label: 'Day-2 email sent', value: at(1) },
    { label: 'Day-5 email sent', value: at(2) },
    { label: 'Sequence complete (day 12)', value: at(3) },
    { label: 'Unsubscribed from drip', value: unsubscribed },
  ]
}

/** Recent contact-form enquiries. */
export async function getRecentContacts(days: number, limit = 25): Promise<ContactRow[]> {
  const prisma = await db()
  const rows = await prisma.contact.findMany({
    where: { createdAt: { gte: since(days) } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      createdAt: true,
      name: true,
      company: true,
      email: true,
      fleetSize: true,
      flagged: true,
    },
  })

  return rows.map((r) => ({
    createdAt: r.createdAt,
    name: r.name,
    company: r.company,
    email: r.email,
    // Null is meaningful, not missing: the form only asks for fleet size on
    // carrier intents (see the schema comment on Contact.fleetSize).
    fleetSize: r.fleetSize ?? 'Not asked',
    flagged: r.flagged,
  }))
}

/** Fleet-size mix across contact enquiries, for the carrier-side split. */
export async function getFleetSizeMix(days: number): Promise<{ label: string; value: number }[]> {
  const prisma = await db()
  const rows = await prisma.contact.groupBy({
    by: ['fleetSize'],
    where: { createdAt: { gte: since(days) } },
    _count: { _all: true },
  })

  return rows
    .map((r) => ({ label: r.fleetSize ?? 'Not asked', value: r._count._all }))
    .sort((a, b) => b.value - a.value)
}

/**
 * Which campaigns produced actual leads.
 *
 * This is the panel PostHog structurally cannot provide: it can tell you which
 * campaign drove pageviews, but only these rows know which drove a conversion.
 *
 * Attribution capture was added to LabsGatedForm at the same time as this panel —
 * leads created before that stay NULL forever and collect under "Direct / none".
 */
export async function getLeadAttribution(): Promise<AttributionRow[]> {
  const prisma = await db()
  const rows = await prisma.gatedContentLead.findMany({
    select: {
      utmSource: true,
      utmCampaign: true,
      referrer: true,
      landingPage: true,
      downloadedAt: true,
    },
  })

  const grouped = new Map<string, AttributionRow>()
  for (const r of rows) {
    // Fall back to the referring host when there is no UTM, so organic and
    // referral traffic is still attributable rather than lumped into "direct".
    let source = r.utmSource?.trim() || ''
    if (!source && r.referrer) {
      try {
        source = new URL(r.referrer).hostname
      } catch {
        /* malformed referrer — leave it as direct */
      }
    }
    const key = [source || 'Direct / none', r.utmCampaign || '—', r.landingPage || '—'].join('||')
    const existing = grouped.get(key)
    if (existing) {
      existing.leads += 1
      if (r.downloadedAt) existing.downloaded += 1
    } else {
      grouped.set(key, {
        source: source || 'Direct / none',
        campaign: r.utmCampaign || '—',
        landingPage: r.landingPage || '—',
        leads: 1,
        downloaded: r.downloadedAt ? 1 : 0,
      })
    }
  }

  return [...grouped.values()].sort((a, b) => b.leads - a.leads)
}

/** Newsletter list health: joins in the window vs departures. */
export async function getNewsletterHealth(
  days: number
): Promise<{ label: string; value: number }[]> {
  const prisma = await db()
  const from = since(days)
  const [subscribers, joined, left, sends] = await Promise.all([
    prisma.newsletter.count(),
    prisma.newsletter.count({ where: { createdAt: { gte: from } } }),
    prisma.newsletterUnsubscribe.count({ where: { unsubscribedAt: { gte: from } } }),
    prisma.newsletterSend.count(),
  ])

  return [
    { label: 'Subscribers (current)', value: subscribers },
    { label: 'Joined in window', value: joined },
    { label: 'Unsubscribed in window', value: left },
    { label: 'Broadcasts sent (all time)', value: sends },
  ]
}
