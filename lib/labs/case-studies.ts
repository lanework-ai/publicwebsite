/**
 * Case studies for the Lanework preview, organized around the three products:
 *   - Rapid Relay        — relay orchestration software (live; demo.rapidrelay.ai)
 *   - Rapid Load         — load board aggregation
 *   - Rapid Load + TaaS  — load aggregation + Trailer-as-a-Service (REPOWR)
 * Local data for the feedback phase; promote to a Sanity `caseStudy` schema later.
 */
export interface CaseStudy {
  slug: string
  product: 'Rapid Relay' | 'Rapid Load' | 'Rapid Load + TaaS'
  title: string
  segment: string
  summary: string
  body: string[]
  /** Small mono meta chips. */
  meta: string[]
  /** Optional supporting outcome stats (shown as a grid on the detail page). */
  results?: { value: string; label: string }[]
  /** Optional live demo link. */
  demoUrl?: string
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'rapid-relay-orchestration',
    product: 'Rapid Relay',
    title: 'Relay orchestration, running in production',
    segment: 'Relay orchestration',
    meta: ['Rapid Relay', 'Live'],
    demoUrl: 'https://demo.rapidrelay.ai/dashboard',
    summary:
      'Rapid Relay orchestrates long-haul freight as coordinated regional relays, live today. Carriers running it post large gains in retention, utilization, and transit time.',
    results: [
      { value: '92% → 51%', label: 'driver turnover, 350-truck carrier' },
      { value: '52% → 81%', label: 'asset utilization, 175-truck fleet' },
      { value: '2.5d → 18h', label: 'LA–Dallas transit time' },
      { value: '38% → <12%', label: 'empty miles, +$3M revenue' },
    ],
    body: [
      'Rapid Relay is our relay orchestration platform, running in production today. It analyzes long-haul lanes, breaks them into optimized regional segments, and coordinates driver handoffs so the trailer keeps moving 24/7 while drivers stay regional and home.',
      'Dispatchers plan, adjust, and execute multi-leg relays from a single console, with segment mileage, shift alignment, handoff timing, and cost modeled in real time. Carriers keep full control; Rapid Relay supplies the orchestration and the recommendations.',
      'The outcomes compound across the metrics that matter most to a long-haul carrier: retention, asset utilization, and speed, with backhaul matching cutting the empty miles that quietly erode margin.',
    ],
  },
  {
    slug: 'rapid-load-aggregation',
    product: 'Rapid Load',
    title: 'One board for a fragmented spot market',
    segment: 'Load aggregation',
    meta: ['Rapid Load', 'Load board'],
    summary:
      'Rapid Load aggregates a fragmented spot market into a single, deduplicated load board, so dispatchers stop searching five systems and start working one.',
    body: [
      'Spot freight is scattered across load boards, each with its own interface, data formats, and duplicate postings. Dispatchers burn hours reconciling them by hand and still miss matches.',
      'Rapid Load aggregates these sources into one searchable board. It normalizes lane, rate, and equipment data into a single schema and deduplicates the same load posted in multiple places, so what a dispatcher sees is the real, unique market, not noise.',
      'The result is a single pane for spot capacity: faster search, cleaner data, and the foundation for matching and backhaul optimization built on top of an aggregated, trustworthy market view.',
    ],
  },
  {
    slug: 'repowr-spot-market-integration',
    product: 'Rapid Load + TaaS',
    title: 'Trailer-as-a-Service: synchronizing REPOWR across spot markets',
    segment: 'Trailer-as-a-Service',
    meta: ['Rapid Load + TaaS', 'REPOWR', 'Spot market'],
    summary:
      'We brought REPOWR’s trailer-pool capacity into Rapid Load and built the multi-market synchronization layer that keeps spot inventory and Trailer-as-a-Service capacity consistent across markets.',
    body: [
      'Spot-market capacity is fragmented, and trailer capacity even more so. REPOWR operates a trailer-pool marketplace, but its capacity lived outside the dispatcher’s aggregated load view, forcing teams to reconcile listings across systems and markets by hand. Cross-market opportunities were effectively invisible.',
      'Rapid Load + TaaS integrates REPOWR directly into the aggregated board, surfacing Trailer-as-a-Service capacity alongside spot freight in one place. Data integrations normalize listings from multiple sources into a single schema so dispatchers stop tab-switching and work from one view.',
      'The hard part is synchronization. We researched and built a multi-market synchronization layer that keeps aggregated capacity and loads consistent across markets in near-real-time: it deduplicates overlapping inventory, reconciles state as listings change, and prevents a load or trailer matched in one market from being double-booked in another.',
      'The result is one view spanning spot freight and trailer capacity, faster matching, and cross-market backhaul opportunities that manual workflows missed, the foundation for optimization across market boundaries.',
    ],
  },
]

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug)
}
