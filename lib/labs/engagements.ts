/**
 * What you can hire Lanework for, organised by the two buyer tracks.
 *
 * Single source of truth for the commercial surface, the same pattern as
 * lib/labs/field-work.ts. Scope and duration only: fees are quoted per
 * engagement, never published.
 *
 * Vocabulary rule: call this work engagements, studies, assessments, and
 * diligence. The c-word for advisory services carries the wrong connotation
 * with these buyers and must never appear in site copy, even in a denial.
 */
export interface Engagement {
  id: string
  name: string
  /** Who this is aimed at. */
  persona: string
  /** The job they are hiring us to do, in their words. */
  job: string
  /** What lands at the end. */
  deliverable: string
  /** How long it runs. */
  duration: string
  /** Free entry offer, surfaced differently. */
  free?: boolean
}

export interface Track {
  id: 'operators' | 'investors'
  label: string
  /** Who sits in this track. */
  audience: string
  /** Why they come to us. */
  premise: string
  engagements: Engagement[]
}

export const tracks: Track[] = [
  {
    id: 'operators',
    label: 'Operators',
    audience: 'Carriers, fleets, 3PLs, brokers, and the shippers who rely on them.',
    premise:
      'You own the margin line. Empty miles and driver turnover are the two biggest leaks, and both are decided by how the network is designed rather than by how hard the team works.',
    engagements: [
      {
        id: 'network-readiness-snapshot',
        name: 'Network readiness snapshot',
        persona: 'VP Operations, Director of Logistics, or owner.',
        job: 'Show me whether there is anything here worth chasing, before I commit budget.',
        deliverable:
          'A short read on where your network is likely leaking, which lanes look restructurable, and what a full assessment would go after. Enough to decide whether to go further.',
        duration: 'Free, about a week',
        free: true,
      },
      {
        id: 'network-assessment',
        name: 'Network assessment',
        persona: 'VP Operations or VP Network Strategy at a for-hire carrier or 3PL.',
        job: 'Find the margin I am losing to empty miles and turnover, and tell me exactly which lanes to restructure.',
        deliverable:
          'Every lane ranked by empty-mile rate and fully loaded cost, the lanes with the bilateral density to support closed-loop corridors, relay points positioned against return-origin density, driver domiciles aligned, and a lane-level view of which routes are manufacturing driver exits. Delivered as a prioritised roadmap with the recovery modelled in dollars.',
        duration: 'Scoped to fleet size, typically 3 to 6 weeks',
      },
      {
        id: 'fractional-advisory',
        name: 'Fractional analytics advisory',
        persona: 'Operators who want the analysis to keep running after the assessment.',
        job: 'Keep watching the numbers with me and tell me when something moves.',
        deliverable:
          'Ongoing corridor and retention monitoring, benchmarking against the operators we measure, and a standing line to the team that ran your assessment.',
        duration: 'Monthly, rolling',
      },
    ],
  },
  {
    id: 'investors',
    label: 'Investors and acquirers',
    audience: 'Private equity, independent sponsors, search funds, and corporate development teams.',
    premise:
      'Standard diligence prices fleet age, customer concentration, and lane economics. It almost never prices workforce instability or structural empty miles, which is where the hidden liability and the unpriced upside both sit.',
    engagements: [
      {
        id: 'operational-diligence',
        name: 'Operational due diligence',
        persona: 'Operating partners and deal teams with trucking, logistics, or brokerage targets.',
        job: 'Do not let me overpay, and show me the margin I can recover after close.',
        deliverable:
          'A retention- and deadhead-adjusted view of EBITDA: per-driver replacement cost as a share of revenue, turnover and empty miles decomposed by lane, the gap between hire-time promises and operational reality, and a modelled recovery path. Delivered as a diligence appendix your IC can lean on, built from public benchmarks so every number is auditable.',
        duration: '2 to 4 weeks, tied to your deal timeline',
      },
      {
        id: 'value-creation-playbook',
        name: '100-day value creation playbook',
        persona: 'Sponsors who have closed and need the thesis executed.',
        job: 'We own it now. Tell us what to do first, and what it is worth.',
        deliverable:
          'The diligence findings turned into a sequenced operating plan: which lanes to restructure in what order, what each move is worth, and how to instrument the result so the gain is attributable.',
        duration: 'First 100 days post-close',
      },
    ],
  },
]

/** Lower-priority engagements, listed but not led with. */
export const alsoAvailable = [
  { name: 'Fulfillment performance diagnostic', note: 'For e-commerce and 3PL fulfillment operations.' },
  { name: 'Benchmarking and market reports', note: 'Segment benchmarks on retention and utilization.' },
]

/** The three we lead with, surfaced on the homepage. */
export const leadEngagements = [
  { id: 'network-readiness-snapshot', track: 'operators' as const },
  { id: 'network-assessment', track: 'operators' as const },
  { id: 'operational-diligence', track: 'investors' as const },
]

export function getEngagement(id: string) {
  for (const t of tracks) {
    const e = t.engagements.find((x) => x.id === id)
    if (e) return { engagement: e, track: t }
  }
  return undefined
}
