import Link from 'next/link'
import Image from 'next/image'
import { PageHeader, SectionLabel, CtaBand } from '@/components/labs/ui'
import { Card, Badge } from '@/components/labs/ds'
import Ecosystem from '@/components/labs/Ecosystem'
import { products, statusLabel } from '@/lib/labs/products'
import { domains } from '@/lib/labs/domains'

export const metadata = { title: 'Proofs · Lanework' }

export default function ProductsIndex() {
  return (
    <>
      <PageHeader
        eyebrow="PROOFS"
        title="Research that shipped."
        sub="Our software exists to prove the research holds in production. Two proofs are live with operators today and one is in pilot; each one started as a finding, not a roadmap."
      />

      <section className="ll-section" style={{ paddingBottom: 8 }}>
        <SectionLabel index="01">The proofs</SectionLabel>
        <div style={{ display: 'grid', gap: 16 }}>
          {products.map((p) => (
            <Card key={p.name} padding={24}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500, fontSize: 19, color: 'var(--lw-fg)' }}>{p.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--lw-accent-soft)', border: '1px solid rgba(127,149,255,0.4)', borderRadius: 999, padding: '4px 10px' }}>
                  {p.domain}
                </span>
                <Badge tone={p.status === 'live' ? 'live' : 'pilot'} style={{ letterSpacing: '0.08em' }}>
                  {statusLabel[p.status]}
                </Badge>
                {p.logo && (
                  <span className="ll-partner" style={{ marginLeft: 'auto' }}>
                    <Image src={p.logo} alt={`${p.name} logo`} width={110} height={25} style={{ height: 22, width: 'auto' }} />
                  </span>
                )}
              </div>
              <p style={{ fontSize: 14, color: 'var(--lw-fg-2)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 640 }}>{p.desc}</p>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                <Link href={p.href} style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--lw-muted)', letterSpacing: '0.04em' }}>
                  {p.hrefLabel} →
                </Link>
                {p.demoUrl && (
                  <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--lw-accent-soft)', letterSpacing: '0.04em' }}>
                    LIVE DEMO ↗
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 52 }}>
        <SectionLabel index="02">Research domains</SectionLabel>
        <p style={{ fontSize: 15, color: 'var(--lw-muted)', lineHeight: 1.6, maxWidth: 580, margin: '0 0 24px' }}>
          The same six domains we study. Where the research has proven out, we name the proof; the rest
          are active research today.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--lw-line)', border: '1px solid var(--lw-line)', borderRadius: 8, overflow: 'hidden' }}>
          {domains.map((d) => {
            const shipped = !!d.product
            return (
              <div key={d.name} style={{ background: shipped ? 'var(--lw-panel-accent)' : 'var(--lw-panel)', padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 16, borderLeft: shipped ? '2px solid var(--lw-accent)' : '2px solid transparent' }}>
                <span style={{ fontWeight: 500, fontSize: 14, flex: 1, color: 'var(--lw-fg)' }}>{d.name}</span>
                {shipped ? (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.04em', color: 'var(--lw-accent-soft)' }}>{d.product}</span>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.08em', color: 'var(--lw-muted)', textTransform: 'uppercase' }}>Research</span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <Ecosystem index="03" variant="slim" />

      <div style={{ paddingBottom: 44 }} />

      <CtaBand />
    </>
  )
}
