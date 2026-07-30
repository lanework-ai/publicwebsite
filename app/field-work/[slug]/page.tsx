import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CtaBand, SectionLabel } from '@/components/labs/ui'
import { Card, Badge } from '@/components/labs/ds'
import Ecosystem, { IntegrationRow } from '@/components/labs/Ecosystem'
import { lw } from '@/lib/labs/config'
import { fieldWork, getFieldWork, statusLabel } from '@/lib/labs/field-work'

export function generateStaticParams() {
  return fieldWork.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const f = getFieldWork(slug)
  return { title: f ? `${f.title} · Lanework` : 'Field work · Lanework' }
}

export default async function FieldWorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const f = getFieldWork(slug)
  if (!f) notFound()

  return (
    <>
      <article className="ll-section" style={{ paddingTop: 56, paddingBottom: 44, maxWidth: 760 }}>
        <Link href={lw('/field-work')} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--lw-muted)', letterSpacing: '0.06em' }}>
          ← FIELD WORK
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--lw-accent-soft)', border: '1px solid rgba(127,149,255,0.4)', borderRadius: 999, padding: '4px 10px' }}>
            {f.product}
          </span>
          <span className="ll-label" style={{ fontSize: 13 }}>{f.domain}</span>
          <Badge tone={f.status === 'live' ? 'live' : 'pilot'} dot>{statusLabel[f.status]}</Badge>
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 4.4vw, 43px)', lineHeight: 1.12, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
          {f.title}
        </h1>

        {f.demoUrl && (
          <a
            href={f.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.06em', color: 'var(--lw-bg)', background: 'var(--lw-accent-soft)', padding: '6px 12px', borderRadius: 6, marginBottom: 32 }}
          >
            VIEW LIVE DEMO →
          </a>
        )}

        {f.body.map((p, i) => (
          <p key={i} style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--lw-fg-2)', margin: '0 0 18px' }}>{p}</p>
        ))}

        {/* What moved */}
        {f.results && f.results.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div className="ll-label" style={{ fontSize: 13, marginBottom: 16 }}>What moved</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
              {f.results.map((r) => (
                <Card key={r.label} padding={18}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: 'var(--lw-accent-soft)', letterSpacing: '-0.01em' }}>{r.value}</div>
                  <div style={{ fontSize: 14, color: 'var(--lw-faint)', marginTop: 6, lineHeight: 1.5 }}>{r.label}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {f.integrations && (
          <IntegrationRow partners={f.integrations} note={f.integrationsNote} />
        )}
      </article>

      {/* How the software works, where we shipped a platform */}
      {f.howItWorks && f.howItWorks.length > 0 && (
        <section className="ll-section" style={{ paddingTop: 8, paddingBottom: 44 }}>
          <SectionLabel index="01">How it works</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {f.howItWorks.map((s) => (
              <Card key={s.n}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--lw-accent-soft)', marginBottom: 10 }}>{s.n}</div>
                <div style={{ fontWeight: 500, fontSize: 17, marginBottom: 8 }}>{s.t}</div>
                <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Integrations matter where we shipped an operating platform */}
      {f.howItWorks && <Ecosystem index="02" />}

      <div style={{ paddingBottom: 44 }} />

      <CtaBand title="Could this be your operation?" body="Tell us about your network and we will model the opportunity with you, starting with one bounded problem." />
    </>
  )
}
