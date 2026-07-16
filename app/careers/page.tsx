import Link from 'next/link'
import { PageHeader, SectionLabel } from '@/components/labs/ui'
import { Card, Button } from '@/components/labs/ds'
import { lw } from '@/lib/labs/config'

export const metadata = { title: 'Careers · Lanework' }

const why = [
  {
    t: 'Leverage',
    d: 'A lean team where your work moves the needle. The research you run and the software you build ship to real networks, not a backlog.',
  },
  {
    t: 'Real stakes',
    d: 'Freight leaks value at every layer: empty miles, avoidable turnover, mispriced capacity. Fixing it helps drivers, carriers, and the people freight serves.',
  },
  {
    t: 'Healthy pace',
    d: 'Work hard, sleep well. We win marathons, not sprints, and the evidence-first culture means arguments are settled by data, not volume.',
  },
]

const how = [
  { step: '01 · STUDY', d: 'You start with a question and real operational data, not a spec handed down.' },
  { step: '02 · PROVE', d: 'You pressure-test findings with operators and build software that has to survive production.' },
  { step: '03 · BUILD', d: 'When a proof earns its keep, you turn it into a product and stand behind it.' },
]

export default function LabsCareers() {
  return (
    <>
      <PageHeader
        eyebrow="CAREERS"
        title="Reimagine freight from the evidence up."
        sub="Lanework is a lean team of logistics operators, engineers, and researchers. Early roles are opening in engineering, operations, and research."
      />

      <section className="ll-section" style={{ paddingBottom: 8 }}>
        <SectionLabel index="01">Why join now</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {why.map((w) => (
            <Card key={w.t} padding={24}>
              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 10, color: 'var(--lw-fg)' }}>{w.t}</div>
              <p style={{ fontSize: 13.5, color: 'var(--lw-faint)', lineHeight: 1.65, margin: 0 }}>{w.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 8 }}>
        <SectionLabel index="02">How you would work</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {how.map((h) => (
            <Card key={h.step}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--lw-accent-soft)', marginBottom: 10 }}>{h.step}</div>
              <p style={{ fontSize: 13.5, color: 'var(--lw-fg-2)', lineHeight: 1.6, margin: 0 }}>{h.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--lw-line)', marginTop: 52 }}>
        <div className="ll-section" style={{ paddingTop: 52, paddingBottom: 56 }}>
          <SectionLabel index="03">Open roles</SectionLabel>
          <h2 style={{ fontSize: 'var(--text-h2)', lineHeight: 1.15, fontWeight: 500, letterSpacing: 'var(--tracking-snug)', margin: '0 0 14px', maxWidth: 560 }}>
            Early roles opening soon.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lw-muted)', maxWidth: 520, margin: '0 0 26px' }}>
            Engineering, operations, and research. If the work above sounds like yours, introduce
            yourself before the listings go up: tell us what you would study first.
          </p>
          <Button as={Link} href={lw('/connect')} arrow>Introduce yourself</Button>
        </div>
      </section>
    </>
  )
}
