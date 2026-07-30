import { PageHeader, SectionLabel, CtaBand, LabsCard } from '@/components/labs/ui'

export const metadata = { title: 'About · Lanework' }

const howWeWork = [
  { step: 'Study', d: 'We run independent research on the operational data operators already hold, and publish what we find. The research stands on its own.' },
  { step: 'Embed', d: 'We forward-deploy a small team into the operation. We work your real data next to the people running it, and improve the process in place. Evidence over decks.' },
  { step: 'Build', d: 'Not every improvement needs software. When one does, it becomes a product we stand behind. The research and the working system are the deliverable, never a slide deck.' },
]

/**
 * Disciplines the team covers. Deliberately skills and domains only: no individual
 * names, no degrees, no employer names, consistent with the rest of the site's
 * unnamed operator credential.
 */
const disciplines = [
  {
    t: 'Operations & supply chain',
    d: 'Running large-scale logistics and fulfillment: network and lane design, dock and yard flow, frontline scheduling, and the cost models underneath all three.',
  },
  {
    t: 'Data science & applied AI',
    d: 'Turning operational exhaust from TMS, ELD, WMS, and HR systems into forecasting, optimization, and decision models that hold up against a real operation.',
  },
  {
    t: 'Product & platform engineering',
    d: 'Distributed systems, data pipelines, and analytics products built to enterprise reliability standards, so a finding can become software people depend on.',
  },
  {
    t: 'Commercial & capital strategy',
    d: 'Complex enterprise deals, operational due diligence, and value creation planning, framing every finding in terms an investment committee can act on.',
  },
]

const values = [
  { t: 'Independent', d: 'The research stands on its own and we publish it openly. Findings come before any product we might sell.' },
  { t: 'Evidence-led', d: 'We combine logistics expertise with data science to understand the problem before we build anything.' },
  { t: 'Forward-deployed', d: 'We work from inside the operation, not above it. Our team sits with planners, dispatchers, and floor leads, and every claim is tested against a real operation.' },
  { t: 'Operators, not theorists', d: 'We have run these networks ourselves. You start with a bounded, embedded study, not a statement of work, and what you get back is a decision you can act on rather than a deck.' },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="COMPANY"
        title="An applied research lab for logistics and supply chain."
        sub="Operators, technologists, and data scientists who embed with the teams running freight, fulfillment, and warehousing, study how the work actually happens, improve the process on the ground, and build software to prove what we find."
      />

      {/* Thesis */}
      <section className="ll-section" style={{ paddingBottom: 8 }}>
        <SectionLabel index="01">Our thesis</SectionLabel>
        <p style={{ fontSize: 'clamp(22px, 2.8vw, 29px)', lineHeight: 1.4, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--lw-fg)', maxWidth: 720, margin: '0 0 28px' }}>
          Supply chains run on fragmented data. The hardest problems are not a shortage of trucks,
          docks, or software, but a shortage of evidence about what actually works. We supply that
          evidence from inside the operation: we deploy alongside your team, improve the process where
          it runs, and build the AI systems that act on it.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { t: 'Lower cost to serve', d: 'Cut the waste designed into the network and the facilities that feed it.' },
            { t: 'Higher utilization', d: 'Get more out of the assets, docks, and hours you already pay for.' },
            { t: 'Work people stay in', d: 'Predictable schedules and fewer avoidable exits on the frontline.' },
          ].map((p) => (
            <LabsCard key={p.t}>
              <div style={{ fontWeight: 500, fontSize: 17, marginBottom: 8 }}>{p.t}</div>
              <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{p.d}</p>
            </LabsCard>
          ))}
        </div>
      </section>

      {/* How we work */}
      <section className="ll-section" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <SectionLabel index="02">How we work</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {howWeWork.map((w, i) => (
            <LabsCard key={w.step}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--lw-accent)', marginBottom: 10 }}>0{i + 1} · {w.step.toUpperCase()}</div>
              <p style={{ fontSize: 14, color: 'var(--lw-fg-2)', lineHeight: 1.6, margin: 0 }}>{w.d}</p>
            </LabsCard>
          ))}
        </div>
      </section>

      {/* The waste, quantified */}
      <section className="ll-section" style={{ paddingTop: 48, paddingBottom: 16 }}>
        <SectionLabel index="03">Why it matters</SectionLabel>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--lw-fg-2)', maxWidth: 620, margin: '0 0 24px' }}>
          Freight is the first area we quantified, because the numbers are large and nobody had put
          them together. Here is what that work found:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { v: '35%', l: 'of miles run empty' },
            { v: '$42B', l: 'lost to deadhead annually' },
            { v: '$18.7B', l: 'lost to driver turnover, modeled' },
          ].map((s) => (
            <div key={s.l}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, color: 'var(--lw-fg)' }}>{s.v}</div>
              <div style={{ fontSize: 15, color: 'var(--lw-faint)', marginTop: 5 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--lw-fg-2)', maxWidth: 620, margin: 0 }}>
          The same pattern holds everywhere we look: idle capacity, avoidable turnover, and demand
          mispriced against what the operation can actually do. It is as true of a fulfillment centre
          as it is of a lane network, and in both the losses are well known while the evidence on what
          fixes them is not. We quantify where the leakage is, problem by problem, then embed with the
          operators who live it and build the systems that close it.
        </p>
      </section>

      {/* Why us */}
      <section className="ll-section" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <SectionLabel index="04">Why operators call us</SectionLabel>
        <p style={{ fontSize: 'clamp(20px, 2.4vw, 25px)', lineHeight: 1.45, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--lw-fg)', maxWidth: 680, margin: '0 0 26px' }}>
          We have run these networks. Anyone can analyze one from the outside; we have carried the
          pager for fulfillment and freight operations at national scale, and it shows in what we
          choose to measure.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { t: 'Every claim resolves to a dollar', d: 'We do not sell vague efficiency. We quantify the liability and the recovery in numbers a CFO or an investment committee can act on, built from benchmarks anyone can audit.' },
            { t: 'We use data you already own', d: 'The answers are sitting in your TMS, ELD, and HR systems. Nothing to install, nothing to rip out, and no year-long integration before the first finding.' },
            { t: 'We speak your language', d: 'Deadhead, HOS, length of haul, lane density. We arrive as peers who have run the operation, not outsiders learning it on your time.' },
          ].map((v) => (
            <LabsCard key={v.t}>
              <div style={{ fontWeight: 500, fontSize: 17, marginBottom: 8 }}>{v.t}</div>
              <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{v.d}</p>
            </LabsCard>
          ))}
        </div>
      </section>

      {/* What the team covers */}
      <section className="ll-section" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <SectionLabel index="05">What the team covers</SectionLabel>
        <p style={{ fontSize: 'clamp(20px, 2.4vw, 25px)', lineHeight: 1.45, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--lw-fg)', maxWidth: 700, margin: '0 0 26px' }}>
          Four disciplines in one small team, which is why the work moves from analysis to the floor
          without a handoff gap.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {disciplines.map((v) => (
            <LabsCard key={v.t}>
              <div style={{ fontWeight: 500, fontSize: 17, marginBottom: 8 }}>{v.t}</div>
              <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{v.d}</p>
            </LabsCard>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="ll-section" style={{ paddingTop: 48, paddingBottom: 52 }}>
        <SectionLabel index="06">Our values</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {values.map((v) => (
            <LabsCard key={v.t}>
              <div style={{ fontWeight: 500, fontSize: 17, marginBottom: 8 }}>{v.t}</div>
              <p style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{v.d}</p>
            </LabsCard>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
