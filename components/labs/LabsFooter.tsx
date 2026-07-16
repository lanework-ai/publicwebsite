import Link from 'next/link'
import { Logo } from './LaneworkLogo'

const cols: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Research',
    links: [
      { href: '/research', label: 'White papers' },
      { href: '/case-studies', label: 'Applied research' },
      { href: '/blog', label: 'Notes' },
    ],
  },
  {
    title: 'Proofs',
    links: [
      { href: '/products', label: 'All proofs' },
      { href: '/products/rapid-relay', label: 'Rapid Relay' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/who-we-serve', label: 'Who we serve' },
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
          <Logo wordmark={false} size={28} />
          <p style={{ fontSize: 13, color: 'var(--lw-muted)', lineHeight: 1.55, marginTop: 14, maxWidth: 260 }}>
            Logistics runs on fragmented data. We turn it into research, and the AI systems that act on it.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'var(--lw-dim)',
              marginTop: 12,
              textTransform: 'uppercase',
            }}
          >
            Applied AI research · logistics
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="ll-label" style={{ fontSize: 10.5, marginBottom: 14 }}>
              {c.title}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 9 }}>
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={{ fontSize: 13, color: 'var(--lw-muted)' }}
                  >
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
        <span style={{ fontSize: 12, color: 'var(--lw-dim)' }}>
          © {year} Lanework. All rights reserved.
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', color: 'var(--lw-dim)' }}>
          PRIVATE PREVIEW
        </span>
      </div>
    </footer>
  )
}
