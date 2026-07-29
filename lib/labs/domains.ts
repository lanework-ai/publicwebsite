/**
 * The six problems Lanework studies — single source of truth for the homepage
 * "What we study" list.
 *
 * Framed as problem types rather than industry verticals, because the same
 * failures recur across the supply chain: turnover looks the same whether it is
 * drivers or warehouse associates, and idle capacity is idle capacity whether it
 * is a trailer or a dock door. Freight is where we started, not the boundary.
 */
export interface Domain {
  id: string
  name: string
  desc: string
}

export const domains: Domain[] = [
  { id: '01', name: 'Labor & retention', desc: 'Frontline turnover, scheduling, and what churn actually costs' },
  { id: '02', name: 'Network design', desc: 'Lanes, nodes, corridors, and where flow should go' },
  { id: '03', name: 'Assets & capacity', desc: 'Trailers, docks, equipment, and the cost of idle' },
  { id: '04', name: 'Throughput & execution', desc: 'Fulfillment, frontline operations, and the systems that run them' },
  { id: '05', name: 'Demand & pricing', desc: 'Spot markets, rate cycles, demand volatility' },
  { id: '06', name: 'Capital & diligence', desc: 'Diligence, value creation, and where operational leverage sits' },
]
