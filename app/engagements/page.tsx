import Link from 'next/link'
import { PageHeader, SectionLabel, CtaBand } from '@/components/labs/ui'
import { Card, Badge, Button } from '@/components/labs/ds'
import { lw, RESEARCH_PARTNER_HREF } from '@/lib/labs/config'
import { tracks, alsoAvailable, researchPartnerAsks } from '@/lib/labs/engagements'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Partner with us · Lanework',
  description:
    'Partner with Lanework: support our research on coordinated freight networks with a carrier introduction or lane and dispatch data, or commission a readiness snapshot, network assessment, or operational due diligence.',
  path: '/engagements',
})

export default function EngagementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="PARTNER WITH US"
        title="Start with one question."
        sub="Most partners start by supporting our research with an introduction or a dataset. Operators and investors who want a direct, defensible read on their own network can also commission one."
      />

      {/* Research partners: the first and easiest way in */}
      <section className="ll-section" style={{ paddingTop: 0, paddingBottom: 8 }}>
        <SectionLabel index="01">Research partners</SectionLabel>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--lw-fg-2)', maxWidth: 640, margin: '0 0 26px' }}>
          We are looking for industry partners to support our current research on coordinated freight
          networks. All three asks are small, and none needs a budget line.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 22 }}>
          {researchPartnerAsks.map((a) => (
            <Card key={a.name} padding={22} accent>
              <div style={{ fontWeight: 500, fontSize: 17, marginBottom: 8, color: 'var(--lw-fg)' }}>{a.name}</div>
              <p style={{ fontSize: 15, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{a.detail}</p>
            </Card>
          ))}
        </div>
        <div style={{ maxWidth: 640 }}>
          <div className="ll-label" style={{ fontSize: 12, marginBottom: 5 }}>What you get</div>
          <p style={{ fontSize: 15, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>
            Early findings on your own lanes, and the result either way, including when the evidence says
            not to change anything.
          </p>
        </div>
        <Button as={Link} href={RESEARCH_PARTNER_HREF} arrow style={{ marginTop: 22 }}>
          Become a research partner
        </Button>
      </section>

      {tracks.map((t, ti) => (
        <section key={t.id} className="ll-section" style={{ paddingTop: 44, paddingBottom: 8 }}>
          {/* Research partners take 01, so the paid tracks start at 02. */}
          <SectionLabel index={`0${ti + 2}`}>{t.label}</SectionLabel>

          <div style={{ maxWidth: 640, marginBottom: 26 }}>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--lw-fg-2)', margin: '0 0 8px' }}>{t.premise}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.06em', color: 'var(--lw-dim)', textTransform: 'uppercase', margin: 0 }}>
              {t.audience}
            </p>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {t.engagements.map((e) => (
              <Card key={e.id} padding={26} accent={e.free}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 500, fontSize: 21, color: 'var(--lw-fg)' }}>{e.name}</span>
                  {e.free && <Badge tone="paper" dot>Free</Badge>}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--lw-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {e.duration}
                  </span>
                </div>

                <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--lw-fg-2)', margin: '0 0 16px', fontStyle: 'italic' }}>
                  &ldquo;{e.job}&rdquo;
                </p>

                {/* No "Who it is for" block. Naming a job title tells every other
                    reader the work is not for them, and the track-level audience line
                    above already sets the scope without filtering anyone out. The
                    persona data is retained in lib/labs/engagements.ts for internal use. */}
                <div>
                  <div className="ll-label" style={{ fontSize: 12, marginBottom: 5 }}>What you get</div>
                  <p style={{ fontSize: 15, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{e.deliverable}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {/* Secondary menu */}
      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 44 }}>
        <SectionLabel index="04">Also available</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {alsoAvailable.map((a) => (
            <Card key={a.name} padding={20}>
              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 6, color: 'var(--lw-fg)' }}>{a.name}</div>
              <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{a.note}</p>
            </Card>
          ))}
        </div>
        <p style={{ fontSize: 15, color: 'var(--lw-dim)', lineHeight: 1.6, margin: '20px 0 0', maxWidth: 560 }}>
          Every engagement is scoped and quoted against your network. The easiest ways in cost nothing:
          become a research partner, or request a snapshot.
        </p>
        <Button as={Link} href={lw('/connect?intent=snapshot')} arrow style={{ marginTop: 22 }}>
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
