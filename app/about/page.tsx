import { PageHeader, SectionLabel, CtaBand, LabsCard } from '@/components/labs/ui'

export const metadata = { title: 'About · Lanework' }

const pillars = [
  { t: 'Lower costs', d: 'Reduce expenses through optimized routing and fewer empty miles.' },
  { t: 'Higher earnings', d: 'Increase revenue with 80%+ asset utilization and coordinated backhauls.' },
  { t: 'Drivers home daily', d: 'Long-haul freight while drivers return home nightly.' },
]

const howWeWork = [
  { step: 'Study', d: 'We run independent research on the operational data the freight industry already holds, and publish what we find. The research stands on its own.' },
  { step: 'Prove', d: 'We pressure-test findings with operators and build working software to show they hold in production. Evidence over decks.' },
  { step: 'Build', d: 'When a proof earns its keep, it becomes a product. We are not consultants; the research and the software are the deliverable.' },
]

const values = [
  { t: 'Independent', d: 'The research stands on its own and we publish it openly. Findings come before any product we might sell.' },
  { t: 'Evidence-led', d: 'We combine logistics expertise with data science to understand the problem before we build anything.' },
  { t: 'Operator-grounded', d: 'We work hands-on with freight planners and drivers, and test every claim against real networks.' },
  { t: 'Partnership, not consulting', d: 'You start with a study, not a statement of work. We build alongside you and the work is ours to stand behind.' },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="COMPANY"
        title="An applied research lab for logistics."
        sub="Logistics experts, technologists, and data scientists studying how freight actually moves, then building software to prove what we find."
      />

      {/* Thesis */}
      <section className="ll-section" style={{ paddingBottom: 8 }}>
        <SectionLabel index="01">Our thesis</SectionLabel>
        <p style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', lineHeight: 1.4, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--lw-fg)', maxWidth: 720, margin: '0 0 28px' }}>
          Logistics runs on fragmented data. The industry&rsquo;s hardest problems are not a shortage
          of trucks or software, but a shortage of evidence about what actually works. We exist to
          supply it, and to build the AI systems that act on it.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { t: 'Lower costs', d: 'Cut waste through better routing and fewer empty miles.' },
            { t: 'Higher earnings', d: 'Raise utilization and coordinate backhauls.' },
            { t: 'Drivers home daily', d: 'Long-haul freight while drivers return home nightly.' },
          ].map((p) => (
            <LabsCard key={p.t}>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>{p.t}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{p.d}</p>
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--lw-accent)', marginBottom: 10 }}>0{i + 1} · {w.step.toUpperCase()}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-fg-2)', lineHeight: 1.6, margin: 0 }}>{w.d}</p>
            </LabsCard>
          ))}
        </div>
      </section>

      {/* The waste, quantified */}
      <section className="ll-section" style={{ paddingTop: 48, paddingBottom: 16 }}>
        <SectionLabel index="03">Why it matters</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { v: '35%', l: 'of miles run empty' },
            { v: '$42B', l: 'lost to deadhead annually' },
            { v: '$18.7B', l: 'lost to driver turnover, modeled' },
          ].map((s) => (
            <div key={s.l}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--lw-fg)' }}>{s.v}</div>
              <div style={{ fontSize: 13, color: 'var(--lw-faint)', marginTop: 5 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--lw-fg-2)', maxWidth: 620, margin: 0 }}>
          Logistics leaks value at every layer: empty miles, idle assets, avoidable turnover, freight
          mispriced against demand. The losses are well known; the evidence on what actually fixes them
          is not. We quantify where the leakage is, domain by domain, and build the systems that close it.
        </p>
      </section>

      {/* Values */}
      <section className="ll-section" style={{ paddingTop: 48, paddingBottom: 52 }}>
        <SectionLabel index="04">Our values</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {values.map((v) => (
            <LabsCard key={v.t}>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>{v.t}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{v.d}</p>
            </LabsCard>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
