/** Shared Lanework legal document renderer (privacy, terms). */
import Link from 'next/link'

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
          fontSize: 15,
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
      <p style={{ fontSize: 15, color: 'var(--lw-faint)', margin: '0 0 44px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{effective}</p>

      <div style={{ display: 'grid', gap: 36 }}>
        {sections.map((s, i) => (
          <div key={i}>
            <h2 style={{ fontSize: 21, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--lw-fg)', margin: '0 0 12px' }}>{s.heading}</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {s.blocks.map((b, j) =>
                'p' in b ? (
                  <p key={j} style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--lw-fg-2)', margin: 0 }}>
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
                      <li key={k} style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--lw-fg-2)' }}>
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

      {/* No generic "Questions about this document?" sign-off here. Each legal page
          carries its own substantive contact section, which a policy needs anyway
          (how to reach us, how to exercise data rights, response window), and a
          duplicated sign-off underneath it was pure noise. */}
    </section>
  )
}
