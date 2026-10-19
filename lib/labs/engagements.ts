/**
 * How to partner with Lanework: the unpaid research-partner asks, then what you
 * can commission, organized by the two buyer tracks.
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
    // TODO(open-q): fulfillment. Narrow to "Carriers, fleets, 3PLs, brokers, and
    // shippers." if the fulfillment offer is paused.
    audience:
      'Carriers, fleets, 3PLs, brokers, shippers, and the fulfillment and warehouse teams that move the same goods.',
    premise:
      'You own the margin line. Empty miles and driver turnover are the two biggest leaks, and both are decided by how the network is designed rather than by how hard the team works.',
    engagements: [
      {
        id: 'readiness-snapshot',
        name: 'Readiness snapshot',
        persona: 'VP Operations, Director of Logistics, or owner.',
        job: 'Show me whether there is anything here worth chasing, before I commit budget.',
        deliverable:
          'A short read on where your operation is likely leaking, what looks restructurable, and what a full assessment would go after. Enough to decide whether to go further.',
        duration: 'Free, about a week',
        free: true,
      },
      {
        id: 'network-assessment',
        name: 'Network assessment',
        persona: 'VP Operations or VP Network Strategy at a carrier, 3PL, or shipper.',
        job: 'Find the margin I am losing to empty miles and turnover, and tell me exactly which lanes to restructure.',
        deliverable:
          'Every lane ranked by empty-mile rate and fully loaded cost, the lanes with the bilateral density to support closed-loop corridors, relay points positioned against return-origin density, domiciles aligned, and a lane-level view of which routes are manufacturing driver exits. Delivered as a prioritized roadmap with the recovery modeled in dollars.',
        duration: 'Scoped to fleet size, typically 3 to 6 weeks',
      },
      // TODO(open-q): fulfillment. Hide this card until there is a fulfillment
      // deployment to point to, if the team confirms the pause.
      {
        id: 'fulfillment-diagnostic',
        name: 'Fulfillment performance diagnostic',
        persona: 'VP Fulfillment or Director of Operations at an e-commerce brand or 3PL.',
        job: 'Tell me why throughput caps out where it does, and what it costs me.',
        deliverable:
          'Where the constraint actually sits across receiving, pick, pack, and ship, what each hour of it costs, how much of the gap is labor churn rather than process, and the sequence of changes that moves the number. Built from the data your WMS already records.',
        duration: 'Typically 2 to 4 weeks',
      },
      {
        id: 'fractional-advisory',
        name: 'Fractional analytics advisory',
        persona: 'Operators who want the analysis to keep running after the assessment.',
        job: 'Keep watching the numbers with me and tell me when something moves.',
        deliverable:
          'Ongoing performance and retention monitoring, benchmarking against the operators we measure, and a standing line to the team that ran your assessment.',
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
          'A retention- and deadhead-adjusted view of EBITDA: per-driver replacement cost as a share of revenue, turnover and empty miles decomposed by lane, the gap between hire-time promises and operational reality, and a modeled recovery path. Delivered as a diligence appendix your IC can lean on, built from public benchmarks so every number is auditable.',
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
  { name: 'Benchmarking and market reports', note: 'Segment benchmarks on retention and utilization.' },
  { name: 'Data readiness review', note: 'What your systems already capture, and what is missing to answer the question.' },
]

/**
 * The research-partner asks that open the Partner page. Unpaid, and listed ahead
 * of the commissioned work because they are the easiest way in.
 */
export const researchPartnerAsks = [
  {
    name: 'Introductions to regional carriers',
    detail: 'Anyone running 550–600 mile lanes who would talk about how they schedule them.',
  },
  {
    name: '3 months of lane and dispatch history',
    detail: 'Whatever the TMS already exports, with no new instrumentation, and it can be anonymized.',
  },
  {
    name: 'Introductions to others building at the frontier of freight',
    detail: 'Researchers, operators, and founders working the same problem from another side.',
  },
]

export function getEngagement(id: string) {
  for (const t of tracks) {
    const e = t.engagements.find((x) => x.id === id)
    if (e) return { engagement: e, track: t }
  }
  return undefined
}
