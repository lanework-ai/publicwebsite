import Link from 'next/link'
import { PageHeader, SectionLabel, CtaBand } from '@/components/labs/ui'
import { Card, Badge, Button } from '@/components/labs/ds'
import { lw } from '@/lib/labs/config'
import { tracks, alsoAvailable } from '@/lib/labs/engagements'

export const metadata = {
  title: 'Engagements · Lanework',
  description:
    'How to work with Lanework: a free network readiness snapshot, network assessments for operators, and operational due diligence for investors and acquirers.',
}

export default function EngagementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="ENGAGEMENTS"
        title="Start with one bounded problem."
        sub="We work with two kinds of buyer: the operators who run freight networks, and the investors who buy them. Both hire us for the same thing, a defensible number on what is leaking and what it is worth to fix."
      />

      {tracks.map((t, ti) => (
        <section key={t.id} className="ll-section" style={{ paddingTop: ti === 0 ? 0 : 44, paddingBottom: 8 }}>
          <SectionLabel index={`0${ti + 1}`}>{t.label}</SectionLabel>

          <div style={{ maxWidth: 640, marginBottom: 26 }}>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--lw-fg-2)', margin: '0 0 8px' }}>{t.premise}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--lw-dim)', textTransform: 'uppercase', margin: 0 }}>
              {t.audience}
            </p>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {t.engagements.map((e) => (
              <Card key={e.id} padding={26} accent={e.free}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 500, fontSize: 18, color: 'var(--lw-fg)' }}>{e.name}</span>
                  {e.free && <Badge tone="paper" dot>Free</Badge>}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--lw-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {e.duration}
                  </span>
                </div>

                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lw-fg-2)', margin: '0 0 16px', fontStyle: 'italic' }}>
                  &ldquo;{e.job}&rdquo;
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <div className="ll-label" style={{ fontSize: 10, marginBottom: 5 }}>Who it is for</div>
                    <p style={{ fontSize: 13, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{e.persona}</p>
                  </div>
                  <div>
                    <div className="ll-label" style={{ fontSize: 10, marginBottom: 5 }}>What you get</div>
                    <p style={{ fontSize: 13, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{e.deliverable}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {/* Secondary menu */}
      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 44 }}>
        <SectionLabel index="03">Also available</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {alsoAvailable.map((a) => (
            <Card key={a.name} padding={20}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6, color: 'var(--lw-fg)' }}>{a.name}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{a.note}</p>
            </Card>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--lw-dim)', lineHeight: 1.6, margin: '20px 0 0', maxWidth: 560 }}>
          Every engagement is scoped and quoted against your network. The snapshot is the easiest way in:
          it costs nothing and tells you whether the rest is worth doing.
        </p>
        <Button as={Link} href={lw('/connect')} arrow style={{ marginTop: 22 }}>
          Request a snapshot
        </Button>
      </section>

      <CtaBand
        title="Bring us one question."
        body="Tell us about your network or your target. We will tell you what we would look at first, and what it is likely worth."
      />
    </>
  )
}
