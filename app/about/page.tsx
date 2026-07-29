import { PageHeader, SectionLabel, CtaBand, LabsCard } from '@/components/labs/ui'

export const metadata = { title: 'About · Lanework' }

const pillars = [
  { t: 'Lower costs', d: 'Reduce expenses through optimized routing and fewer empty miles.' },
  { t: 'Higher earnings', d: 'Increase revenue with 80%+ asset utilization and coordinated backhauls.' },
  { t: 'Drivers home daily', d: 'Long-haul freight while drivers return home nightly.' },
]

const howWeWork = [
  { step: 'Study', d: 'We run independent research on the operational data the freight industry already holds, and publish what we find. The research stands on its own.' },
  { step: 'Embed', d: 'We forward-deploy a small team into the operation. We work your real data next to your planners and drivers, and improve the process in place. Evidence over decks.' },
  { step: 'Build', d: 'Not every improvement needs software. When one does, it becomes a product we stand behind. The research and the working system are the deliverable, never a slide deck.' },
]

const values = [
  { t: 'Independent', d: 'The research stands on its own and we publish it openly. Findings come before any product we might sell.' },
  { t: 'Evidence-led', d: 'We combine logistics expertise with data science to understand the problem before we build anything.' },
  { t: 'Forward-deployed', d: 'We work from inside the operation, not above it. Our team sits with freight planners and drivers, and every claim is tested against a real network.' },
  { t: 'Operators, not theorists', d: 'We have run these networks ourselves. You start with a bounded, embedded study, not a statement of work, and what you get back is a decision you can act on rather than a deck.' },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="COMPANY"
        title="An applied research lab for logistics."
        sub="Logistics experts, technologists, and data scientists who embed with operators to study how freight actually moves, improve the process on the ground, and build software to prove what we find."
      />

      {/* Thesis */}
      <section className="ll-section" style={{ paddingBottom: 8 }}>
        <SectionLabel index="01">Our thesis</SectionLabel>
        <p style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', lineHeight: 1.4, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--lw-fg)', maxWidth: 720, margin: '0 0 28px' }}>
          Logistics runs on fragmented data. The industry&rsquo;s hardest problems are not a shortage
          of trucks or software, but a shortage of evidence about what actually works. We supply that
          evidence from inside the operation: we deploy alongside your team, improve the process where
          it runs, and build the AI systems that act on it.
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
          is not. We quantify where the leakage is, domain by domain, then embed with the operators who
          live it and build the systems that close it.
        </p>
      </section>

      {/* Why us */}
      <section className="ll-section" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <SectionLabel index="04">Why operators call us</SectionLabel>
        <p style={{ fontSize: 'clamp(18px, 2.2vw, 22px)', lineHeight: 1.45, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--lw-fg)', maxWidth: 680, margin: '0 0 26px' }}>
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
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>{v.t}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{v.d}</p>
            </LabsCard>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="ll-section" style={{ paddingTop: 48, paddingBottom: 52 }}>
        <SectionLabel index="05">Our values</SectionLabel>
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
