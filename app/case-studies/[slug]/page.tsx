import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CtaBand } from '@/components/labs/ui'
import { Card } from '@/components/labs/ds'
import { lw } from '@/lib/labs/config'
import { caseStudies, getCaseStudy } from '@/lib/labs/case-studies'

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getCaseStudy(slug)
  return { title: c ? `${c.title} · Lanework` : 'Case study · Lanework' }
}

export default async function CaseStudyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getCaseStudy(slug)
  if (!c) notFound()

  return (
    <>
      <article className="ll-section" style={{ paddingTop: 56, paddingBottom: 48, maxWidth: 760 }}>
        <Link href={lw('/case-studies')} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--lw-muted)', letterSpacing: '0.06em' }}>
          ← CASE STUDIES
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--lw-accent-soft)', border: '1px solid rgba(127,149,255,0.4)', borderRadius: 999, padding: '4px 10px' }}>{c.product}</span>
          <span className="ll-label" style={{ fontSize: 11 }}>{c.segment}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', lineHeight: 1.12, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
          {c.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 36, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--lw-dim)', letterSpacing: '0.06em' }}>
            {c.meta.join(' · ').toUpperCase()}
          </span>
          {c.demoUrl && (
            <a href={c.demoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--lw-bg)', background: 'var(--lw-accent-soft)', padding: '6px 12px', borderRadius: 6 }}>
              VIEW LIVE DEMO →
            </a>
          )}
        </div>

        {c.body.map((p, i) => (
          <p key={i} style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--lw-fg-2)', margin: '0 0 18px' }}>{p}</p>
        ))}

        {/* Supporting outcome stats */}
        {c.results && c.results.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div className="ll-label" style={{ fontSize: 11, marginBottom: 16 }}>Results</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
              {c.results.map((r, i) => (
                <Card key={i} padding={18}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--lw-accent-soft)', letterSpacing: '-0.01em' }}>{r.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--lw-faint)', marginTop: 6, lineHeight: 1.5 }}>{r.label}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </article>

      <CtaBand title="Could this be your network?" body="Tell us about your lanes and we'll model the opportunity with you." />
    </>
  )
}
