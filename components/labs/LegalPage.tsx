/** Shared Lanework legal document renderer (privacy, terms). */
import Link from 'next/link'
import { lw } from '@/lib/labs/config'

export type LegalBlock = { p: string; link?: { href: string; label: string } } | { ul: string[] }
export type LegalSection = { heading: string; blocks: LegalBlock[] }

export function LegalPage({
  title,
  effective,
  sections,
}: {
  title: string
  effective: string
  sections: LegalSection[]
}) {
  return (
    <section className="ll-section" style={{ paddingTop: 60, paddingBottom: 64, maxWidth: 820 }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          letterSpacing: '0.22em',
          color: 'var(--lw-accent-soft)',
          marginBottom: 20,
          textTransform: 'uppercase',
        }}
      >
        Legal
      </div>
      <h1 style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--leading-tight)', fontWeight: 500, letterSpacing: 'var(--tracking-tight)', margin: '0 0 12px' }}>
        {title}
      </h1>
      <p style={{ fontSize: 13, color: 'var(--lw-faint)', margin: '0 0 44px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{effective}</p>

      <div style={{ display: 'grid', gap: 36 }}>
        {sections.map((s, i) => (
          <div key={i}>
            <h2 style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--lw-fg)', margin: '0 0 12px' }}>{s.heading}</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {s.blocks.map((b, j) =>
                'p' in b ? (
                  <p key={j} style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--lw-fg-2)', margin: 0 }}>
                    {b.p}
                    {b.link && (
                      <>
                        {' '}
                        <Link href={b.link.href} style={{ color: 'var(--lw-accent-soft)' }}>
                          {b.link.label}
                        </Link>
                      </>
                    )}
                  </p>
                ) : (
                  <ul key={j} style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
                    {b.ul.map((it, k) => (
                      <li key={k} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lw-fg-2)' }}>
                        {it}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--lw-dim)', lineHeight: 1.6, marginTop: 48 }}>
        Questions about this document?{' '}
        <Link href={lw('/connect')} style={{ color: 'var(--lw-accent-soft)' }}>Submit them through our contact form</Link>.
      </p>
    </section>
  )
}
