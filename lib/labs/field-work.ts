/**
 * Field work — the deployments Lanework has run, and the software that remained.
 *
 * Single source of truth, replacing the old split between lib/labs/products.ts
 * ("Proofs") and lib/labs/case-studies.ts ("Field work"), which described the
 * same three subjects twice and kept drifting apart. One entry per deployment:
 * who it is, what changed, and how the software works.
 */
export type FieldWorkStatus = 'live' | 'pilot'

export interface FieldWork {
  slug: string
  /** Product name carried by the deployment. */
  product: 'Rapid Relay' | 'Rapid Load' | 'Rapid Load + TaaS'
  /** Research domain this belongs to, matching lib/labs/domains.ts. */
  domain: string
  status: FieldWorkStatus
  /** Outcome-led headline used on the index card and the detail page. */
  title: string
  /** One-line summary for the index card and the homepage teaser. */
  summary: string
  /** The narrative: the situation, what we did, what changed. */
  body: string[]
  /** Before/after outcomes. Shown on the detail page. */
  results?: { value: string; label: string }[]
  /** How the software works. Only where we shipped a platform. */
  howItWorks?: { n: string; t: string; d: string }[]
  /** Product logo (public path) where a mark exists. */
  logo?: string
  demoUrl?: string
}

export const fieldWork: FieldWork[] = [
  {
    slug: 'rapid-relay-orchestration',
    product: 'Rapid Relay',
    domain: 'Network & lanes',
    status: 'live',
    title: 'Driver turnover cut from 92% to 51%',
    summary:
      'Long-haul lanes rebuilt as coordinated regional relays, so the trailer keeps moving and drivers stay regional and home.',
    logo: '/rapid-relay-logo.png',
    demoUrl: 'https://demo.rapidrelay.ai/dashboard',
    results: [
      { value: '92% → 51%', label: 'driver turnover, 350-truck carrier' },
      { value: '52% → 81%', label: 'asset utilization, 175-truck fleet' },
      { value: '2.5d → 18h', label: 'LA–Dallas transit time' },
      { value: '38% → <12%', label: 'empty miles, +$3M revenue' },
    ],
    body: [
      'The research said driver exits track route length, home time, and schedule predictability more than pay. This deployment tested that where it actually runs: inside a long-haul carrier losing drivers faster than it could recruit them.',
      'We worked the carrier’s own lane and dispatch data alongside their planners, then rebuilt the longest lanes as coordinated regional relays. Drivers run a segment and hand off, so the trailer keeps moving 24/7 while each driver stays in their region and gets home. Dispatchers plan and adjust the multi-leg trips from one console, with segment mileage, shift alignment, handoff timing, and cost modeled as they go. The carrier keeps control of driver assignments, facilities, and assets throughout.',
      'The findings held in production. Retention, utilization, and transit time all moved together, and backhaul matching cut the empty miles that quietly erode margin. What survived that deployment became Rapid Relay, the platform we now run with carriers.',
    ],
    howItWorks: [
      { n: '01', t: 'Planning engine', d: 'Analyzes long-haul lanes and breaks them into segments built around predictable driver shifts, realistic time windows, and minimal dwell.' },
      { n: '02', t: 'Relay point selection', d: 'Identifies handoff locations along every route: terminals, drop yards, shared facilities, customer sites, or neutral third-party locations.' },
      { n: '03', t: 'Multi-leg route builder', d: 'Generates complete relay plans with segment mileage, transit times, shift alignment, handoff timing, utilization impact, and cost estimates.' },
      { n: '04', t: 'Carrier control', d: 'Carriers keep full control over driver assignments, facilities, and assets while Rapid Relay supplies the recommendations and operational support.' },
    ],
  },
  {
    slug: 'rapid-load-aggregation',
    product: 'Rapid Load',
    domain: 'Freight & pricing',
    status: 'live',
    title: 'One board for a fragmented spot market',
    summary:
      'Spot freight scattered across five systems consolidated into a single deduplicated board dispatchers actually work from.',
    body: [
      'Spot freight is scattered across load boards, each with its own interface, data format, and duplicate postings. Sitting with dispatchers, we watched them burn hours reconciling those sources by hand and still miss matches.',
      'Rapid Load aggregates the sources into one searchable board. It normalizes lane, rate, and equipment data into a single schema and deduplicates the same load posted in several places, so what a dispatcher sees is the real, unique market rather than noise.',
      'The result is a single pane for spot capacity: faster search, cleaner data, and a trustworthy market view to build matching and backhaul optimization on top of.',
    ],
  },
  {
    slug: 'repowr-spot-market-integration',
    product: 'Rapid Load + TaaS',
    domain: 'Assets & capacity',
    status: 'pilot',
    title: 'Synchronizing REPOWR capacity across spot markets',
    summary:
      'Trailer-pool capacity brought into the aggregated board, with a synchronization layer that keeps inventory consistent across markets.',
    body: [
      'Spot-market capacity is fragmented, and trailer capacity more so. REPOWR operates a trailer-pool marketplace, but its capacity lived outside the dispatcher’s aggregated load view, so teams reconciled listings across systems by hand and cross-market opportunities stayed invisible.',
      'Rapid Load + TaaS integrates REPOWR directly into the aggregated board, surfacing Trailer-as-a-Service capacity alongside spot freight in one place. Data integrations normalize listings from multiple sources into a single schema so dispatchers stop tab-switching and work from one view.',
      'The hard part is synchronization. We researched and built a multi-market layer that keeps aggregated capacity and loads consistent in near-real-time: it deduplicates overlapping inventory, reconciles state as listings change, and prevents a load or trailer matched in one market from being double-booked in another.',
      'The result is one view spanning spot freight and trailer capacity, faster matching, and cross-market backhaul opportunities manual workflows missed. This one is still in pilot.',
    ],
  },
]

export const statusLabel: Record<FieldWorkStatus, string> = { live: 'LIVE', pilot: 'IN PILOT' }

export function getFieldWork(slug: string) {
  return fieldWork.find((f) => f.slug === slug)
}
