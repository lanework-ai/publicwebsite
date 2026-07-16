import Link from 'next/link'
import { PageHeader, CtaBand } from '@/components/labs/ui'
import { Card } from '@/components/labs/ds'
import { lw } from '@/lib/labs/config'
import { caseStudies } from '@/lib/labs/case-studies'

export const metadata = { title: 'Case studies · Lanework' }

export default function CaseStudiesIndex() {
  return (
    <>
      <PageHeader
        eyebrow="CASE STUDIES"
        title="What the platforms do in the field."
        sub="Measured outcomes from carriers running Lanework platforms across retention, utilization, transit time, and empty miles."
      />

      <section className="ll-section" style={{ paddingBottom: 52, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {caseStudies.map((c) => (
          <Link key={c.slug} href={lw(`/case-studies/${c.slug}`)} style={{ display: 'block' }}>
            <Card padding={24} style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 18 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--lw-accent-soft)', border: '1px solid rgba(127,149,255,0.4)', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>{c.product}</span>
                <span className="ll-label" style={{ fontSize: 10 }}>{c.segment}</span>
              </div>
              {c.results && c.results.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, color: 'var(--lw-accent-soft)', letterSpacing: '-0.01em' }}>{c.results[0].value}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--lw-faint)', display: 'block', marginTop: 4 }}>{c.results[0].label}</span>
                </div>
              )}
              <div style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.3, marginBottom: 10 }}>{c.title}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 16px' }}>{c.summary}</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--lw-dim)', letterSpacing: '0.06em' }}>
                {c.meta.join(' · ').toUpperCase()}
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <CtaBand />
    </>
  )
}
