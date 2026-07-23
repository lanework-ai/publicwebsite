import Link from 'next/link'
import { PageHeader, CtaBand } from '@/components/labs/ui'
import { Card, Badge } from '@/components/labs/ds'
import { lw } from '@/lib/labs/config'
import { caseStudies } from '@/lib/labs/case-studies'

export const metadata = { title: 'Case studies · Lanework' }

export default function CaseStudiesIndex() {
  return (
    <>
      <PageHeader
        eyebrow="CASE STUDIES"
        title="What the platforms do in the field."
        sub="Measured outcomes from operations we embedded in: what changed across retention, utilization, transit time, and empty miles."
      />

      <section className="ll-section" style={{ paddingBottom: 52, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {caseStudies.map((c) => (
          <Link key={c.slug} href={lw(`/case-studies/${c.slug}`)} style={{ display: 'block' }}>
            <Card padding={24} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 18 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--lw-accent-soft)', border: '1px solid rgba(127,149,255,0.4)', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>{c.product}</span>
                <span className="ll-label" style={{ fontSize: 10 }}>{c.segment}</span>
              </div>
              <div style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.3, marginBottom: 10 }}>{c.title}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 16px' }}>{c.summary}</p>
              {/* Pinned to the card floor so the status chips line up across the row */}
              <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                <Badge tone={c.status === 'Live' ? 'live' : 'pilot'} dot>{c.status}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <CtaBand />
    </>
  )
}
