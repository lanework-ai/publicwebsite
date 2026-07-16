/**
 * Shared Lanework page primitives, now backed by the design-system components in
 * ./ds. These wrappers keep their original signatures so pages migrate incrementally;
 * new work should import directly from ./ds.
 */
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { Button, Card, Eyebrow, SectionHeader } from './ds'

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return <SectionHeader index={index} label={children} style={{ marginBottom: 26 }} />
}

export function PageHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <section className="ll-section" style={{ paddingTop: 60, paddingBottom: 40 }}>
      <Eyebrow emphasis="hero" style={{ marginBottom: 20 }}>
        {eyebrow}
      </Eyebrow>
      <h1
        style={{
          fontSize: 'var(--text-h1)',
          lineHeight: 'var(--leading-tight)',
          fontWeight: 500,
          letterSpacing: 'var(--tracking-tight)',
          margin: 0,
          maxWidth: 720,
        }}
      >
        {title}
      </h1>
      {sub && (
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lw-muted)', maxWidth: 600, margin: '20px 0 0' }}>{sub}</p>
      )}
    </section>
  )
}

/** Reusable closing call-to-action band ("Work with us"). */
export function CtaBand({
  title = 'Work with us',
  body = 'Bring us a network, a dataset, or a question. We partner on applied research and deploy our platforms with carriers.',
}: {
  title?: string
  body?: string
}) {
  return (
    <section style={{ borderTop: '1px solid var(--lw-line)' }}>
      <div className="ll-section" style={{ paddingTop: 52, paddingBottom: 52 }}>
        <h2
          style={{
            fontSize: 'var(--text-h2)',
            lineHeight: 1.15,
            fontWeight: 500,
            letterSpacing: 'var(--tracking-snug)',
            margin: '0 0 14px',
            maxWidth: 520,
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lw-muted)', maxWidth: 500, margin: '0 0 26px' }}>{body}</p>
        <Button as={Link} href="/connect" arrow>
          Get in touch
        </Button>
      </div>
    </section>
  )
}

/** Hairline-bordered content card (kept for back-compat; prefer <Card> from ./ds). */
export function LabsCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <Card style={style}>{children}</Card>
}
