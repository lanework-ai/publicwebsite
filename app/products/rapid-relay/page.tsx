import Image from 'next/image'
import { PageHeader, SectionLabel, CtaBand } from '@/components/labs/ui'
import { Card } from '@/components/labs/ds'
import Ecosystem from '@/components/labs/Ecosystem'

export const metadata = { title: 'Rapid Relay · Lanework' }

const psr = [
  { k: 'The problem', v: 'Traditional trucking wastes 35% of miles empty, costing $42B annually while forcing drivers to spend weeks away from home.' },
  { k: 'Our solution', v: 'AI relay operations match backhauls, eliminate deadhead, and keep trucks moving 24/7 with seamless regional driver handoffs across the network.' },
  { k: 'The result', v: '80%+ asset utilization, drivers home daily, and up to 50% faster delivery than traditional long-haul trucking.' },
]

const steps = [
  { n: '01', t: 'Planning engine', d: 'Analyzes long-haul lanes and breaks them into optimized segments built around predictable driver shifts, realistic time windows, and minimal dwell.' },
  { n: '02', t: 'Relay point selection', d: 'Identifies optimal handoff locations along every route: terminals, drop yards, shared facilities, customer sites, or neutral third-party locations.' },
  { n: '03', t: 'Multi-leg route builder', d: 'Generates complete relay plans instantly with segment mileage, transit times, shift alignment, handoff timing, utilization impact, and cost estimates.' },
  { n: '04', t: 'Carrier control', d: 'Carriers keep full control over driver assignments, facilities, and assets while Rapid Relay provides intelligent recommendations and operational support.' },
]

const features = [
  { t: 'Route planning', d: 'AI-powered segmentation that breaks long-haul lanes into efficient regional segments.' },
  { t: 'Relay coordination', d: 'Visual timeline with drag-and-drop scheduling for handoffs and driver assignments.' },
  { t: 'Live tracking', d: 'Real-time freight monitoring across all relay segments with instant delay alerts.' },
  { t: 'Analytics dashboard', d: 'Performance metrics, cost analysis, and utilization reports for data-driven decisions.' },
]

const benefits = [
  { t: 'Faster transit', d: 'The trailer keeps moving 24/7, so freight that once took two to three days can arrive in half the time.' },
  { t: 'Higher asset utilization', d: 'Relay turns a long haul into a continuous flow of short segments, cutting idle time and keeping trucks in motion.' },
  { t: 'Stable driver schedules', d: 'Drivers stay within their region and return home predictably, which reduces turnover for large carriers.' },
  { t: 'Network flexibility', d: 'Serve distant markets without opening new terminals; add external drop yards or shared networks at any time.' },
]

const audiences = [
  { t: 'Carriers (100+ trucks)', d: 'Established fleets optimizing long-haul operations, reducing driver turnover, and raising asset utilization without expanding infrastructure.' },
  { t: 'Brokerage & 3PL partners', d: 'Reliable relay-based coverage on long-distance lanes. All activity runs through the carrier of record.' },
]

export default function RapidRelayPage() {
  return (
    <>
      <PageHeader
        eyebrow="RAPID RELAY · NETWORK & LANES"
        title="Relay as a service for modern trucking."
        sub="Transform long-haul lanes into coordinated regional relay trips. Faster transit. Higher asset utilization. Stable driver schedules."
      />

      {/* Product mark — the proof carries its own brand */}
      <section className="ll-section" style={{ paddingBottom: 28 }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18, border: '1px solid var(--lw-line-2)', borderRadius: 14, padding: '30px 36px' }}>
          <Image src="/rapid-relay-logo.png" alt="Rapid Relay" width={1280} height={969} priority style={{ height: 108, width: 'auto' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--lw-muted)', textTransform: 'uppercase' }}>
            A Lanework proof · live with carriers
          </span>
        </div>
      </section>

      {/* Problem / Solution / Result */}
      <section className="ll-section" style={{ paddingBottom: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {psr.map((c) => (
          <Card key={c.k}>
            <div className="ll-label" style={{ fontSize: 11, marginBottom: 12 }}>{c.k}</div>
            <p style={{ fontSize: 14, color: 'var(--lw-fg-2)', lineHeight: 1.6, margin: 0 }}>{c.v}</p>
          </Card>
        ))}
      </section>

      {/* How it works */}
      <section className="ll-section" style={{ paddingTop: 52, paddingBottom: 16 }}>
        <SectionLabel index="01">How it works</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {steps.map((s) => (
            <Card key={s.n}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--lw-accent-soft)', marginBottom: 10 }}>{s.n}</div>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>{s.t}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform features */}
      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 16 }}>
        <SectionLabel index="02">Platform features</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {features.map((f) => (
            <Card key={f.t}>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>{f.t}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 16 }}>
        <SectionLabel index="03">Why large carriers use it</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {benefits.map((b) => (
            <Card key={b.t}>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>{b.t}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{b.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 52 }}>
        <SectionLabel index="04">Who it's for</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {audiences.map((a) => (
            <Card key={a.t}>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>{a.t}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{a.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <Ecosystem index="05" />

      <div style={{ paddingBottom: 44 }} />

      <CtaBand title="See Rapid Relay on your lanes" body="Tell us about your network and we'll show how relay operations change your long-haul economics." />
    </>
  )
}
