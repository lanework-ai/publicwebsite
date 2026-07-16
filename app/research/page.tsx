import Link from 'next/link'
import { client } from '@/sanity/client'
import { whitePapersQuery, benchmarksQuery } from '@/lib/sanity-queries'
import { PageHeader, SectionLabel, CtaBand } from '@/components/labs/ui'
import LabsNewsletter from '@/components/labs/LabsNewsletter'
import { Logo } from '@/components/labs/LaneworkLogo'

export const metadata = { title: 'Research · Lanework' }
export const revalidate = 86400

// Upcoming white papers — shown as "in the pipeline" so visitors know more is
// coming. `progress` drives the work-in-progress accent lane on the batch mark.
const pipeline: { window: string; progress: number; titles: string[] }[] = [
  {
    window: 'Shipping before July 2026',
    progress: 0.7,
    titles: [
      'The Driver Shortage Will Not Be Solved by Hiring More Drivers',
      'Empty Miles Are a Solvable Problem',
      'Why Most Relay Attempts Fail at the Coordination Layer',
    ],
  },
  {
    window: 'October 2026',
    progress: 0.4,
    titles: [
      'The Rate Recovery Will Punish Carriers Without Relay Infrastructure',
      'The Real Cost of Driver Turnover',
      'Why Most WMS Software Fails Frontline Ops',
    ],
  },
  {
    window: 'December 2026',
    progress: 0.15,
    titles: ['The Last Mile Math', 'The PE Guide to Logistics Due Diligence'],
  },
]

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
        title="The data behind how freight performs."
        sub="White papers and recurring benchmarks on driver retention, carrier performance, asset utilization, and the operational decisions that define fleet results."
      />

      <section className="ll-section" style={{ paddingBottom: 52 }}>
        <div style={{ borderTop: '1px solid var(--lw-line)' }}>
          {rows.map((r) => (
            <Link
              key={r._id}
              href={`/research/${r.slug.current}`}
              style={{ display: 'block', borderBottom: '1px solid var(--lw-line)', padding: '22px 0' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--lw-accent-soft)', textTransform: 'uppercase' }}>{r.kind}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--lw-dim)' }}>{fmt(r.publishedAt)}</span>
                {r.period && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--lw-dim)' }}>· {r.period}</span>}
              </div>
              <div style={{ fontSize: 19, fontWeight: 500, marginBottom: 6, letterSpacing: '-0.01em' }}>{r.title}</div>
              <p style={{ fontSize: 13.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0, maxWidth: 680 }}>{r.description}</p>
            </Link>
          ))}
          {rows.length === 0 && (
            <p style={{ fontSize: 14, color: 'var(--lw-faint)', padding: '22px 0' }}>Research is being prepared. Check back soon.</p>
          )}
        </div>
      </section>

      {/* In the pipeline */}
      <section className="ll-section" style={{ paddingTop: 8, paddingBottom: 52 }}>
        <SectionLabel index="→">In the pipeline</SectionLabel>
        <p style={{ fontSize: 14, color: 'var(--lw-muted)', lineHeight: 1.6, maxWidth: 560, margin: '0 0 28px' }}>
          A look at what we&rsquo;re currently researching. Want early access to a draft, or to
          contribute data to one of these? <Link href="/connect" style={{ color: 'var(--lw-accent-soft)' }}>Get in touch.</Link>
        </p>
        <div style={{ display: 'grid', gap: 28 }}>
          {pipeline.map((batch) => (
            <div key={batch.window}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {/* Work-in-progress mark: the accent lane fills as the batch nears shipping */}
                <Logo wordmark={false} size={22} interaction="none" progress={batch.progress} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em', color: 'var(--lw-dim)', textTransform: 'uppercase' }}>
                  {batch.window}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--lw-line)' }}>
                {batch.titles.map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--lw-line)', padding: '15px 0' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.08em', color: 'var(--lw-faint)', border: '1px solid var(--lw-line-2)', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                      COMING SOON
                    </span>
                    <span style={{ fontSize: 15, color: 'var(--lw-fg-2)', letterSpacing: '-0.01em' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ll-section" style={{ paddingBottom: 52 }}>
        <LabsNewsletter />
      </section>

      <CtaBand title="Collaborate on research" body="Co-author a benchmark or test a hypothesis against real network data with our team." />
    </>
  )
}
