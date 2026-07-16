/**
 * Ecosystem band — "Runs with the stack you already have." The five integration
 * categories from the Rapid Relay site, restated in the Lanework voice, with
 * partner marks. Partners with a self-hosted logo in public/labs/partners/ (one
 * map entry below) render the real mark; everyone else renders as a monospace
 * wordmark chip, per the near-iconless design system. Dropping an official SVG
 * into public/labs/partners/ + one PARTNER_LOGOS entry upgrades a chip to a logo.
 */
import { SectionHeader } from './ds'

interface Partner {
  id: string
  name: string
}

interface Category {
  title: string
  desc: string
  partners: Partner[]
}

// Self-hosted partner logos. Height is the render height; SVG aspect is preserved.
const PARTNER_LOGOS: Record<string, { src: string; height: number }> = {
  repowr: { src: '/labs/partners/repowr.svg', height: 14 },
}

const CATEGORIES: Category[] = [
  {
    title: 'Transportation management',
    desc: 'Lane structures and execution history in; optimized relay plans back out.',
    partners: [
      { id: 'mcleod', name: 'McLeod' },
      { id: 'trimble', name: 'Trimble' },
      { id: 'mercurygate', name: 'MercuryGate' },
      { id: 'roserocket', name: 'Rose Rocket' },
    ],
  },
  {
    title: 'ELD & telematics',
    desc: 'Driver availability, HOS constraints, and real execution signals.',
    partners: [
      { id: 'motive', name: 'Motive' },
      { id: 'samsara', name: 'Samsara' },
      { id: 'omnitracs', name: 'Omnitracs' },
      { id: 'geotab', name: 'Geotab' },
    ],
  },
  {
    title: 'Visibility & data',
    desc: 'Timing validation, congestion patterns, and relay-node reliability.',
    partners: [
      { id: 'project44', name: 'project44' },
      { id: 'fourkites', name: 'FourKites' },
      { id: 'macropoint', name: 'MacroPoint' },
      { id: 'transporeon', name: 'Transporeon' },
    ],
  },
  {
    title: 'Trailer pools',
    desc: 'On-demand trailer access; fewer empty miles, higher utilization.',
    partners: [{ id: 'repowr', name: 'REPOWR' }],
  },
  {
    title: 'Spot market',
    desc: 'Backhaul and gap-filling evaluated inside the relay plan.',
    partners: [
      { id: 'dat', name: 'DAT' },
      { id: 'truckstop', name: 'Truckstop' },
      { id: 'chrobinson', name: 'C.H. Robinson' },
      { id: 'schneider', name: 'Schneider' },
    ],
  },
]

function PartnerBadge({ partner }: { partner: Partner }) {
  const logo = PARTNER_LOGOS[partner.id]
  if (logo) {
    return (
      <span className="ll-partner" title={partner.name}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt={partner.name} style={{ height: logo.height, width: 'auto', display: 'block' }} />
      </span>
    )
  }
  return (
    <span
      className="ll-partner"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--lw-muted)',
        border: '1px solid var(--lw-line-2)',
        borderRadius: 999,
        padding: '5px 11px',
        whiteSpace: 'nowrap',
      }}
    >
      {partner.name}
    </span>
  )
}

export default function Ecosystem({
  index = '05',
  variant = 'full',
}: {
  index?: string
  variant?: 'full' | 'slim'
}) {
  if (variant === 'slim') {
    const all = CATEGORIES.flatMap((c) => c.partners)
    return (
      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 8 }}>
        <SectionHeader index={index} label="Runs with your stack" style={{ marginBottom: 18 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {all.map((p) => (
            <PartnerBadge key={p.id} partner={p} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 8 }}>
      <SectionHeader index={index} label="Runs with the stack you already have" style={{ marginBottom: 14 }} />
      <p style={{ fontSize: 15, color: 'var(--lw-muted)', lineHeight: 1.6, maxWidth: 580, margin: '0 0 24px' }}>
        Rapid Relay plugs into the systems carriers already run. No rip and replace.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--lw-line)', border: '1px solid var(--lw-line)', borderRadius: 8, overflow: 'hidden' }}>
        {CATEGORIES.map((c) => (
          <div
            key={c.title}
            style={{ background: 'var(--lw-panel)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            <div style={{ width: 210, flexShrink: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--lw-fg)' }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--lw-faint)', lineHeight: 1.5, marginTop: 3 }}>{c.desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
              {c.partners.map((p) => (
                <PartnerBadge key={p.id} partner={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
