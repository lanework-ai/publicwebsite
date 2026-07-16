/**
 * The three Lanework products ("proofs") — single source of truth, shared by the
 * homepage Proofs teaser and the products page. Status is honest:
 * Rapid Relay = live, Rapid Load = live, Rapid Load + TaaS = pilot.
 */
export type ProductStatus = 'live' | 'pilot'

export interface Product {
  name: string
  status: ProductStatus
  domain: string
  /** One-line teaser for the homepage proofs list. */
  teaser: string
  /** Fuller description for the products page. */
  desc: string
  href: string
  hrefLabel: string
  demoUrl?: string
  /** Product logo (public path); rendered where the proof is shown. */
  logo?: string
}

export const products: Product[] = [
  {
    name: 'Rapid Relay',
    status: 'live',
    domain: 'Network & lanes',
    teaser: 'Relay orchestration, live with carriers.',
    desc: 'Relay orchestration software, running in production. Turns long-haul lanes into coordinated regional relays so the trailer keeps moving and drivers stay home.',
    href: '/products/rapid-relay',
    hrefLabel: 'VIEW PLATFORM',
    demoUrl: 'https://demo.rapidrelay.ai/dashboard',
    logo: '/rapid-relay-logo.png',
  },
  {
    name: 'Rapid Load',
    status: 'live',
    domain: 'Freight & pricing',
    teaser: 'Load board aggregation across a fragmented spot market.',
    desc: 'Load board aggregation. One deduplicated, normalized board across a fragmented spot market, so dispatchers search one system instead of five.',
    href: '/case-studies/rapid-load-aggregation',
    hrefLabel: 'READ THE CASE STUDY',
  },
  {
    name: 'Rapid Load + TaaS',
    status: 'pilot',
    domain: 'Assets & capacity',
    teaser: 'Trailer-as-a-Service, synchronized across markets (in pilot).',
    desc: 'Load aggregation plus Trailer-as-a-Service. Integrates REPOWR trailer-pool capacity into the aggregated board with multi-market synchronization. Currently in pilot.',
    href: '/case-studies/repowr-spot-market-integration',
    hrefLabel: 'READ THE CASE STUDY',
  },
]

export const statusLabel: Record<ProductStatus, string> = { live: 'LIVE', pilot: 'IN PILOT' }
