import { PageHeader, SectionLabel, CtaBand } from '@/components/labs/ui'
import { Card } from '@/components/labs/ds'

export const metadata = { title: 'Who we serve · Lanework' }

const audiences = [
  {
    t: 'Carriers & fleets',
    meta: '100+ trucks',
    d: 'Established fleets cutting empty miles and driver turnover, and raising asset utilization, without expanding infrastructure. Our proofs (Rapid Relay, Rapid Load) run on your lanes; our research explains why they work.',
  },
  {
    t: 'Brokers & 3PLs',
    meta: 'Coverage & capacity',
    d: 'Reliable relay-based coverage on long-distance lanes and load-board aggregation across a fragmented spot market, with all activity running through the carrier of record.',
  },
  {
    t: 'Shippers',
    meta: 'Predictable freight',
    d: 'Faster, more predictable transit and steadier capacity, backed by research into how relay networks and asset sharing actually change delivery economics.',
  },
  {
    t: 'Private equity & diligence',
    meta: 'Capital',
    d: 'Independent research on logistics targets: retention risk, last-mile economics, and where the operational leverage really sits, tested against real network data.',
  },
  {
    t: 'Operations & software teams',
    meta: 'WMS / TMS',
    d: 'Research and applied studies on frontline operations, transportation and warehouse management, and the data decisions that define fleet results.',
  },
]

const promise = [
  { t: 'Start with a study', d: 'A question or your data, not a statement of work. We run the applied research first.' },
  { t: 'Evidence, then software', d: 'We deploy a proof only when the research earns it. Research is the moat; software is the evidence.' },
  { t: 'Partnership, not consulting', d: 'We build alongside you, publish what we find, and stand behind the work.' },
]

export default function LabsWhoWeServe() {
  return (
    <>
      <PageHeader
        eyebrow="WHO WE SERVE"
        title="Built for the people who move freight."
        sub="Lanework works with the operators, intermediaries, capital, and software teams across the logistics stack, leading with independent research and deploying proofs when the evidence earns it."
      />

      <section className="ll-section" style={{ paddingBottom: 8 }}>
        <SectionLabel index="01">Who we work with</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {audiences.map((a) => (
            <Card key={a.t} padding={24}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500, fontSize: 16, color: 'var(--lw-fg)' }}>{a.t}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', color: 'var(--lw-muted)', textTransform: 'uppercase' }}>{a.meta}</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{a.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 52 }}>
        <SectionLabel index="02">What working with us looks like</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {promise.map((p) => (
            <Card key={p.t} padding={20}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8, color: 'var(--lw-fg)' }}>{p.t}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{p.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <CtaBand title="Start with a study, not a contract." body="Bring us a network, a dataset, or a question. We run the applied research and deploy a proof only when the evidence earns it." />
    </>
  )
}
