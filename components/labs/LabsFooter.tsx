import Link from 'next/link'
import { Logo } from './LaneworkLogo'

const cols: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Research',
    links: [
      { href: '/research', label: 'White papers' },
      { href: '/blog', label: 'Notes' },
    ],
  },
  {
    title: 'Field work',
    links: [
      { href: '/field-work', label: 'All deployments' },
      { href: '/field-work/rapid-relay-orchestration', label: 'Rapid Relay' },
      { href: '/field-work/rapid-load-aggregation', label: 'Rapid Load' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/engagements', label: 'Engagements' },
      { href: '/careers', label: 'Careers' },
      { href: '/connect', label: 'Work with us' },
      { href: '/privacy-policy', label: 'Privacy' },
      { href: '/terms-and-conditions', label: 'Terms' },
    ],
  },
]

export default function LabsFooter() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ borderTop: '1px solid var(--lw-line)', marginTop: 24 }}>
      <div
        className="ll-section"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: 28,
          paddingTop: 44,
          paddingBottom: 36,
        }}
      >
        <div>
          <Logo wordmark size={32} interaction="lead" />
          <p style={{ fontSize: 15, color: 'var(--lw-muted)', lineHeight: 1.6, marginTop: 16, maxWidth: 300, textWrap: 'balance' }}>
            We embed with supply chain operators, turn the data they already hold into independent research, and build the AI systems that put it to work.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            {/* Brighter than .ll-label's default --lw-muted so a column heading reads
                as a heading against the links below it. Overridden locally rather
                than in .ll-label, which is used site-wide. */}
            <p className="ll-label" style={{ fontSize: 13, marginBottom: 14, color: 'var(--lw-fg-2)' }}>
              {c.title}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 9 }}>
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="ll-foot-link" style={{ fontSize: 15 }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="ll-section"
        style={{
          borderTop: '1px solid var(--lw-line)',
          paddingTop: 18,
          paddingBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {/* whiteSpace: nowrap keeps the symbol, year and name together. Without it the
            line breaks after the © at tablet width, leaving the symbol alone. */}
        <span style={{ fontSize: 14, color: 'var(--lw-dim)', whiteSpace: 'nowrap' }}>
          © {year} Lanework. All rights reserved.
        </span>
        {/* Names the three things we sell. The previous line, "Applied AI research ·
            logistics", said logistics when the scope is logistics and supply chain,
            and narrowed a firm that also runs embedded engagements and assessments. */}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em', color: 'var(--lw-muted)', textTransform: 'uppercase' }}>
          Research · Embedded teams · Software
        </span>
      </div>
    </footer>
  )
}
