import Link from 'next/link'
import { client } from '@/sanity/client'
import { whitePapersQuery, benchmarksQuery } from '@/lib/sanity-queries'
import { PageHeader, SectionLabel, CtaBand } from '@/components/labs/ui'
import { BulletList, Button } from '@/components/labs/ds'
import { RESEARCH_PARTNER_HREF } from '@/lib/labs/config'
import LabsNewsletter from '@/components/labs/LabsNewsletter'
import { pipeline } from '@/lib/labs/research-pipeline'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Research · Lanework',
  description:
    'White papers and benchmarks on driver retention, network design, and asset utilization, tested against real carrier data. Freight first, because that is where the evidence is.',
  path: '/research',
})
export const revalidate = 86400

interface Item {
  _id: string
  title: string
  slug: { current: string }
  description: string
  publishedAt: string
  series?: string
  period?: string
}

function fmt(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function LabsResearch() {
  const [papers, benchmarks] = await Promise.all([
    client.fetch<Item[]>(whitePapersQuery),
    client.fetch<Item[]>(benchmarksQuery),
  ])

  const rows = [
    ...papers.map((p) => ({ ...p, kind: 'White paper' as const })),
    ...benchmarks.map((b) => ({ ...b, kind: 'Benchmark' as const })),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return (
    <>
      <PageHeader
        eyebrow="RESEARCH"
        title="The data behind how supply chains perform."
        sub="White papers and benchmarks on driver retention, network design, and asset utilization, tested against real carrier data. Freight first, because that is where the evidence is."
      />

      {/* Current research: the question partners are asked to support */}
      <section id="current" className="ll-section" style={{ paddingBottom: 52 }}>
        <SectionLabel index="01">Current research</SectionLabel>
        <h2 style={{ fontSize: 'var(--text-h2)', lineHeight: 1.15, fontWeight: 500, letterSpacing: 'var(--tracking-snug)', margin: '0 0 14px', maxWidth: 620 }}>
          Coordinated Freight Networks
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--lw-muted)', maxWidth: 620, margin: '0 0 24px' }}>
          We are combining freight terminals and hubs with software to test whether carriers can pool
          freight through drop-and-hook relays.
        </p>
        <BulletList
          style={{ maxWidth: 680, marginBottom: 20 }}
          items={[
            <><strong style={{ fontWeight: 500, color: 'var(--lw-fg)' }}>H1:</strong> Single-carrier relay delivers measurable CPM savings versus solo-driver operations.</>,
            <><strong style={{ fontWeight: 500, color: 'var(--lw-fg)' }}>H2:</strong> Multi-carrier pooling delivers additional CPM savings that exceed relay gains.</>,
            <><strong style={{ fontWeight: 500, color: 'var(--lw-fg)' }}>H3:</strong> Pooled relay remains operationally feasible when travel, handling, and handoff times are explicitly accounted for.</>,
          ]}
        />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.06em', color: 'var(--lw-dim)', textTransform: 'uppercase', margin: '0 0 24px' }}>
          Scope: hub-to-hub and DC-to-DC freight; drayage excluded
        </p>
        <Button as={Link} href={RESEARCH_PARTNER_HREF} arrow>Contribute data</Button>
      </section>

      <section className="ll-section" style={{ paddingBottom: 52 }}>
        <SectionLabel index="02">Published research</SectionLabel>
        <div style={{ borderTop: '1px solid var(--lw-line)' }}>
          {rows.map((r) => (
            <Link
              key={r._id}
              href={`/research/${r.slug.current}`}
              style={{ display: 'block', borderBottom: '1px solid var(--lw-line)', padding: '22px 0' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em', color: 'var(--lw-accent-soft)', textTransform: 'uppercase' }}>{r.kind}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--lw-dim)' }}>{fmt(r.publishedAt)}</span>
                {r.period && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--lw-dim)' }}>· {r.period}</span>}
              </div>
              <div style={{ fontSize: 21, fontWeight: 500, marginBottom: 6, letterSpacing: '-0.01em' }}>{r.title}</div>
              <p style={{ fontSize: 15, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0, maxWidth: 680 }}>{r.description}</p>
            </Link>
          ))}
          {rows.length === 0 && (
            <p style={{ fontSize: 16, color: 'var(--lw-faint)', padding: '22px 0' }}>Research is being prepared. Check back soon.</p>
          )}
        </div>
      </section>

      {/* In the pipeline */}
      <section className="ll-section" style={{ paddingTop: 8, paddingBottom: 52 }}>
        <SectionLabel index="→">In the pipeline</SectionLabel>
        <p style={{ fontSize: 16, color: 'var(--lw-muted)', lineHeight: 1.6, maxWidth: 560, margin: '0 0 28px' }}>
          What we&rsquo;re writing next. Research partners get early drafts and can contribute data.{' '}
          <Link href={RESEARCH_PARTNER_HREF} style={{ color: 'var(--lw-accent-soft)' }}>Get in touch.</Link>
        </p>
        <div style={{ borderTop: '1px solid var(--lw-line)' }}>
          {pipeline.map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--lw-line)', padding: '15px 0' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--lw-faint)', border: '1px solid var(--lw-line-2)', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                COMING SOON
              </span>
              <span style={{ fontSize: 17, color: 'var(--lw-fg-2)', letterSpacing: '-0.01em' }}>{t}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ll-section" style={{ paddingBottom: 52 }}>
        <LabsNewsletter />
      </section>

      <CtaBand
        title="Your network, not the industry average."
        body="Published research tells you where the industry sits. Bring us your operating data and we will tell you where you sit, and whether your lanes fit our current relay research."
        href={RESEARCH_PARTNER_HREF}
      />
    </>
  )
}
