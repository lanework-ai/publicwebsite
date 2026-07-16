/**
 * The six research domains Lanework studies — single source of truth, shared by
 * the homepage ("What we study") and the products page ("Research domains").
 * `product` names the shipped proof for that domain (if any).
 */
export interface Domain {
  id: string
  name: string
  desc: string
  /** Slug of the product that has shipped in this domain, if any. */
  product?: string
}

export const domains: Domain[] = [
  { id: '01', name: 'Labor & retention', desc: 'Driver shortage, turnover economics, scheduling' },
  { id: '02', name: 'Network & lanes', desc: 'Relay, lane design, regional flow', product: 'Rapid Relay' },
  { id: '03', name: 'Assets & capacity', desc: 'Trailers, utilization, Trailer-as-a-Service', product: 'Rapid Load + TaaS' },
  { id: '04', name: 'Freight & pricing', desc: 'Spot market, rate cycles, demand', product: 'Rapid Load' },
  { id: '05', name: 'Operations software', desc: 'WMS / TMS, frontline ops' },
  { id: '06', name: 'Capital & diligence', desc: 'PE in logistics, last-mile economics' },
]
