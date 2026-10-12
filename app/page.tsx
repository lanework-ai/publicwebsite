import Link from 'next/link'
import Image from 'next/image'
import { SectionHeader, Button, Card, Stat, DomainRow, Badge, Callout } from '@/components/labs/ds'
import { lw, LAB_DESCRIPTOR, RESEARCH_PARTNER_HREF } from '@/lib/labs/config'
import { client } from '@/sanity/client'
import { whitePapersQuery, benchmarksQuery } from '@/lib/sanity-queries'
import { domains } from '@/lib/labs/domains'
import { fieldWork, statusLabel } from '@/lib/labs/field-work'

export const revalidate = 86400

const stats = [
  // TODO(open-q): recheck against the real pipeline ship dates.
  { value: '9', label: 'white papers in 2026' },
  { value: '92% → 51%', label: 'driver turnover at a live carrier' },
  { value: '$18.7B', label: 'driver turnover modeled' },
  { value: '3', label: 'deployments · 2 live, 1 in pilot' },
]

const howWeWork = [
  { step: 'Study', desc: 'We run independent research on the operational data operators already hold, and publish what we find.' },
  { step: 'Prove', desc: 'We test findings with partner carriers, on their real lane and dispatch data and alongside their planners and dispatchers, to see whether they hold on the ground.' },
  { step: 'Build', desc: 'Not every finding needs software. When one does, we build it and stand behind it. Research is the moat; software is the evidence.' },
]

// The three research-partner asks. Engagements words them slightly differently,
// so it keeps its own copy rather than sharing this array.
const partnerAsks = [
  { t: 'Carrier introductions', d: 'Anyone running 550–600 mile lanes who would talk about how they schedule them.' },
  { t: '3 months of lane and dispatch history', d: 'Whatever your TMS already exports, anonymized.' },
  { t: 'Frontier introductions', d: 'Researchers, operators, and founders working the same problem from another side.' },
]

interface TeaserItem {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
}

export default async function LabsHome() {
  const [papers, benchmarks] = await Promise.all([
    client.fetch<TeaserItem[]>(whitePapersQuery),
    client.fetch<TeaserItem[]>(benchmarksQuery),
  ])
  const latest = [...(papers ?? []), ...(benchmarks ?? [])]
    .filter((i) => i.publishedAt)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 2)

  return (
    <>
      {/* Hero */}
      <section className="ll-section" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <h1 style={{ fontSize: 'var(--text-hero)', lineHeight: 'var(--leading-display)', fontWeight: 500, letterSpacing: 'var(--tracking-tight)', margin: '0 0 22px', maxWidth: 760 }}>
          We study where innovation changes what is possible for drivers, for the companies that move the freight, and for the communities it runs through.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--lw-muted)', maxWidth: 560, margin: '0 0 32px' }}>
          Lanework is an {LAB_DESCRIPTOR}, based in Columbus, Ohio. We test promising ideas against real
          carrier data, publish what we find, and build software to prove the findings hold.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button as={Link} href={lw('/research')} arrow>Read the research</Button>
          <Button as={Link} href={RESEARCH_PARTNER_HREF} variant="outline">Become a research partner</Button>
        </div>
      </section>

      {/* Proof strip */}
      <div style={{ borderTop: '1px solid var(--lw-line)', borderBottom: '1px solid var(--lw-line)' }}>
        <div className="ll-section" style={{ paddingTop: 30, paddingBottom: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {stats.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>

      {/* What we study (research domains) */}
      <section className="ll-section" style={{ paddingTop: 52, paddingBottom: 52 }}>
        <SectionHeader index="01" label="What we study" style={{ marginBottom: 26 }} />
        <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--lw-fg-2)', maxWidth: 580, margin: '0 0 28px' }}>
          Freight is fragmented across carriers, systems, and markets, and the same failures recur in
          every network. We map the problem across six domains and follow the evidence to where the
          leverage is.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--lw-line)', border: '1px solid var(--lw-line)', borderRadius: 8, overflow: 'hidden' }}>
          {domains.map((d) => (
            <DomainRow key={d.id} index={d.id} title={d.name} description={d.desc} href={lw('/research')} />
          ))}
        </div>
        <Callout label="Now studying" style={{ marginTop: 24 }}>
          <strong style={{ fontWeight: 500 }}>Coordinated Freight Networks.</strong> Can carriers pool freight through
          drop-and-hook relays to lower cost per mile and raise asset utilization? We are testing three hypotheses on
          hub-to-hub and DC-to-DC freight.{' '}
          <Link href={lw('/research#current')} style={{ color: 'var(--lw-accent-soft)', whiteSpace: 'nowrap' }}>
            See the research →
          </Link>
        </Callout>
      </section>

      {/* How we work */}
      <section style={{ borderTop: '1px solid var(--lw-line)' }}>
        <div className="ll-section" style={{ paddingTop: 52, paddingBottom: 52 }}>
          <SectionHeader index="02" label="How we work" style={{ marginBottom: 26 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {howWeWork.map((w, i) => (
              <Card key={w.step}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--lw-accent-soft)', marginBottom: 10 }}>
                  0{i + 1} · {w.step.toUpperCase()}
                </div>
                <p style={{ fontSize: 15, color: 'var(--lw-fg-2)', lineHeight: 1.6, margin: 0 }}>{w.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Proofs + research teasers */}
      <section className="ll-section" style={{ paddingTop: 52, paddingBottom: 56, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <Card>
          <SectionHeader index="03" label="Field work" style={{ marginBottom: 20 }} />
          <p style={{ fontSize: 15, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 6px' }}>
            Where the research met a real operation, what moved, and the software we built to prove it holds.
          </p>
          {fieldWork.map((f) => (
            <Link key={f.slug} href={lw(`/field-work/${f.slug}`)} style={{ display: 'block', borderTop: '1px solid var(--lw-line)', paddingTop: 10, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500, fontSize: 16, color: 'var(--lw-fg)' }}>{f.product}</span>
                <Badge tone={f.status === 'live' ? 'live' : 'pilot'}>{statusLabel[f.status]}</Badge>
                {f.logo && (
                  <span className="ll-partner" style={{ marginLeft: 'auto' }}>
                    <Image src={f.logo} alt={`${f.product} logo`} width={80} height={18} style={{ height: 15, width: 'auto' }} />
                  </span>
                )}
              </div>
              <div style={{ fontSize: 14, color: 'var(--lw-faint)', marginTop: 3 }}>{f.title}</div>
            </Link>
          ))}
          <Button as={Link} href={lw('/field-work')} variant="ghost" size="sm" arrow style={{ marginTop: 16, paddingLeft: 0 }}>All field work</Button>
        </Card>
        <Card>
          <SectionHeader index="04" label="Research" style={{ marginBottom: 20 }} />
          {latest.map((r) => (
            <Link key={r._id} href={lw(`/research/${r.slug.current}`)} style={{ display: 'block', fontSize: 15, color: 'var(--lw-fg-2)', lineHeight: 1.7, borderBottom: '1px solid var(--lw-line)', paddingBottom: 9, marginBottom: 9 }}>
              {r.title}
            </Link>
          ))}
          {/* TODO(open-q): recheck this count once the pipeline ship dates are set. */}
          <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 10px' }}>
            Plus 7 more white papers and a carrier scorecard shipping through 2026.
          </p>
          <Button as={Link} href={lw('/research')} variant="ghost" size="sm" arrow style={{ paddingLeft: 0 }}>All research</Button>
        </Card>
      </section>

      {/* Where you come in: the research-partner ask */}
      <section style={{ borderTop: '1px solid var(--lw-line)' }}>
        <div className="ll-section" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <SectionHeader index="05" label="Where you come in" style={{ marginBottom: 26 }} />
          <h2 style={{ fontSize: 'var(--text-h2)', lineHeight: 1.15, fontWeight: 500, letterSpacing: 'var(--tracking-snug)', margin: '0 0 16px', maxWidth: 620 }}>
            Everyone else optimizes inside the architecture that creates the problem.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--lw-muted)', maxWidth: 560, margin: '0 0 28px' }}>
            We test what happens when you redesign it, and we need industry partners to do it. Every ask
            is small, and none needs a budget line.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 30 }}>
            {partnerAsks.map((c) => (
              <Card key={c.t} padding={20}>
                <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8, color: 'var(--lw-fg)' }}>{c.t}</div>
                <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </Card>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button as={Link} href={RESEARCH_PARTNER_HREF} arrow>Become a research partner</Button>
            <Button as={Link} href={lw('/connect?intent=snapshot')} variant="ghost" arrow>
              Want a read on your own network? The snapshot is free
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
