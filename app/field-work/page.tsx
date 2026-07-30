import Link from 'next/link'
import { PageHeader, CtaBand } from '@/components/labs/ui'
import { Card, Badge } from '@/components/labs/ds'
import Ecosystem from '@/components/labs/Ecosystem'
import { lw } from '@/lib/labs/config'
import { fieldWork, statusLabel } from '@/lib/labs/field-work'

export const metadata = { title: 'Field work · Lanework' }

export default function FieldWorkIndex() {
  return (
    <>
      <PageHeader
        eyebrow="FIELD WORK"
        title="Where the research met a real operation."
        sub="Every engagement starts as a question and a small team on the ground. These are the deployments that followed, what moved, and the software we built to prove the findings hold."
      />

      <section className="ll-section" style={{ paddingBottom: 44, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {fieldWork.map((f) => (
          <Link key={f.slug} href={lw(`/field-work/${f.slug}`)} style={{ display: 'block' }}>
            <Card padding={24} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 18 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--lw-accent-soft)', border: '1px solid rgba(127,149,255,0.4)', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                  {f.product}
                </span>
                <span className="ll-label" style={{ fontSize: 12 }}>{f.domain}</span>
              </div>
              <div style={{ fontWeight: 500, fontSize: 18, lineHeight: 1.3, marginBottom: 10 }}>{f.title}</div>
              <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 16px' }}>{f.summary}</p>
              {/* Pinned to the card floor so the status chips line up across the row */}
              <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                <Badge tone={f.status === 'live' ? 'live' : 'pilot'} dot>{statusLabel[f.status]}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <Ecosystem index="02" variant="slim" />

      <div style={{ paddingBottom: 44 }} />

      <CtaBand />
    </>
  )
}
