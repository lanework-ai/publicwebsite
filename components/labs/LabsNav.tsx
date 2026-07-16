'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Logo } from './LaneworkLogo'
import { Button } from './ds'

const links = [
  { href: '/research', label: 'Research' },
  { href: '/products', label: 'Proofs' },
  { href: '/case-studies', label: 'Applied research' },
  { href: '/blog', label: 'Notes' },
  { href: '/about', label: 'About' },
]

export default function LabsNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <header
      style={{
        borderBottom: '1px solid var(--lw-line)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--lw-bg)',
      }}
    >
      <nav
        className="ll-section"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        <Link href="/" aria-label="Lanework home" onClick={() => setOpen(false)}>
          <Logo size={34} />
        </Link>

        <button
          type="button"
          className="ll-nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
            {open ? (
              <>
                <line x1="2" y1="2" x2="18" y2="12" stroke="currentColor" strokeWidth="1.6" />
                <line x1="18" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.6" />
              </>
            ) : (
              <>
                <line x1="1" y1="2" x2="19" y2="2" stroke="currentColor" strokeWidth="1.6" />
                <line x1="1" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.6" />
                <line x1="1" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.6" />
              </>
            )}
          </svg>
        </button>

        <div
          className={`ll-nav-links${open ? ' open' : ''}`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--lw-muted)',
          }}
        >
          {links.map((l) => {
            const active = isActive(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                style={{ color: active ? 'var(--lw-fg)' : 'var(--lw-muted)' }}
              >
                {l.label}
              </Link>
            )
          })}
          <Button as={Link} href="/connect" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Get in touch
          </Button>
        </div>
      </nav>
    </header>
  )
}
