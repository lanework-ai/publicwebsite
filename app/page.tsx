import Link from 'next/link'
import Image from 'next/image'
import { SectionHeader, Button, Card, Stat, DomainRow, Badge } from '@/components/labs/ds'
import { lw } from '@/lib/labs/config'
import { client } from '@/sanity/client'
import { whitePapersQuery, benchmarksQuery } from '@/lib/sanity-queries'
import { domains } from '@/lib/labs/domains'
import { fieldWork, statusLabel } from '@/lib/labs/field-work'

export const revalidate = 86400

const stats = [
  { value: '9', label: 'white papers in 2026' },
  { value: '6', label: 'research domains' },
  { value: '$18.7B', label: 'driver turnover modeled' },
  { value: '3', label: 'deployments · 2 live, 1 in pilot' },
]

const howWeWork = [
  { step: 'Study', desc: 'We run independent research on the operational data the freight industry already holds, and publish what we find.' },
  { step: 'Embed', desc: 'We forward-deploy a small team into your operation. We work your real data alongside your planners and dispatchers, and improve the process on the ground.' },
  { step: 'Build', desc: 'Not every fix needs software. When one does, we build it and stand behind it. Research is the moat; the product is what remains.' },
]

const workWithUs = [
  { t: 'Network readiness snapshot', d: 'Free. A short read on where your network is likely leaking and whether the rest is worth doing.' },
  { t: 'Network assessment', d: 'Every lane ranked by empty miles and turnover risk, with the recovery modelled in dollars.' },
  { t: 'Operational due diligence', d: 'For investors: a retention- and deadhead-adjusted view of EBITDA, in time for your deal.' },
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
          We deploy into your operation and make it run better.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lw-muted)', maxWidth: 560, margin: '0 0 32px' }}>
          Lanework is a research lab for logistics. We send in a small team, dig into the data you
          already have, and fix what it turns up. Sometimes the answer is a better process, sometimes
          it&rsquo;s software we build.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button as={Link} href={lw('/research')} arrow>Read the research</Button>
          <Button as={Link} href={lw('/connect')} variant="outline">Work with us</Button>
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
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lw-fg-2)', maxWidth: 580, margin: '0 0 28px' }}>
          Logistics is fragmented across systems, markets, and silos. We study it as one stack, six
          domains deep, and follow the evidence wherever the leverage is.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--lw-line)', border: '1px solid var(--lw-line)', borderRadius: 8, overflow: 'hidden' }}>
          {domains.map((d) => (
            <DomainRow key={d.id} index={d.id} title={d.name} description={d.desc} href={lw('/research')} />
          ))}
        </div>
      </section>

      {/* How we work */}
      <section style={{ borderTop: '1px solid var(--lw-line)' }}>
        <div className="ll-section" style={{ paddingTop: 52, paddingBottom: 52 }}>
          <SectionHeader index="02" label="How we work" style={{ marginBottom: 26 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {howWeWork.map((w, i) => (
              <Card key={w.step}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--lw-accent-soft)', marginBottom: 10 }}>
                  0{i + 1} · {w.step.toUpperCase()}
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--lw-fg-2)', lineHeight: 1.6, margin: 0 }}>{w.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Proofs + research teasers */}
      <section className="ll-section" style={{ paddingTop: 52, paddingBottom: 56, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <Card>
          <SectionHeader index="03" label="Field work" style={{ marginBottom: 20 }} />
          <p style={{ fontSize: 13, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 6px' }}>
            What changed inside real operations, and the software that remained to prove the findings hold.
          </p>
          {fieldWork.map((f) => (
            <Link key={f.slug} href={lw(`/field-work/${f.slug}`)} style={{ display: 'block', borderTop: '1px solid var(--lw-line)', paddingTop: 10, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--lw-fg)' }}>{f.product}</span>
                <Badge tone={f.status === 'live' ? 'live' : 'pilot'}>{statusLabel[f.status]}</Badge>
                {f.logo && (
                  <span className="ll-partner" style={{ marginLeft: 'auto' }}>
                    <Image src={f.logo} alt={`${f.product} logo`} width={80} height={18} style={{ height: 15, width: 'auto' }} />
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--lw-faint)', marginTop: 3 }}>{f.title}</div>
            </Link>
          ))}
          <Button as={Link} href={lw('/field-work')} variant="ghost" size="sm" arrow style={{ marginTop: 16, paddingLeft: 0 }}>All field work</Button>
        </Card>
        <Card>
          <SectionHeader index="04" label="Research" style={{ marginBottom: 20 }} />
          {latest.map((r) => (
            <Link key={r._id} href={lw(`/research/${r.slug.current}`)} style={{ display: 'block', fontSize: 13, color: 'var(--lw-fg-2)', lineHeight: 1.7, borderBottom: '1px solid var(--lw-line)', paddingBottom: 9, marginBottom: 9 }}>
              {r.title}
            </Link>
          ))}
          <p style={{ fontSize: 12, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 10px' }}>
            Plus 7 more white papers and a carrier scorecard shipping through 2026.
          </p>
          <Button as={Link} href={lw('/research')} variant="ghost" size="sm" arrow style={{ paddingLeft: 0 }}>All research</Button>
        </Card>
      </section>

      {/* Work with us band — study-first */}
      <section style={{ borderTop: '1px solid var(--lw-line)' }}>
        <div className="ll-section" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <SectionHeader index="05" label="What you can hire us for" style={{ marginBottom: 26 }} />
          <h2 style={{ fontSize: 'var(--text-h2)', lineHeight: 1.15, fontWeight: 500, letterSpacing: 'var(--tracking-snug)', margin: '0 0 16px', maxWidth: 620 }}>
            Everyone else optimizes inside the architecture that creates the problem.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lw-muted)', maxWidth: 560, margin: '0 0 28px' }}>
            We redesign the architecture, and price what that is worth. Start with one bounded problem:
            the snapshot is free and tells you whether the rest is worth doing.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 30 }}>
            {workWithUs.map((c) => (
              <Card key={c.t} padding={20}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8, color: 'var(--lw-fg)' }}>{c.t}</div>
                <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </Card>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button as={Link} href={lw('/engagements')} arrow>See all engagements</Button>
            <Button as={Link} href={lw('/connect')} variant="outline">Request a snapshot</Button>
          </div>
        </div>
      </section>
    </>
  )
}
