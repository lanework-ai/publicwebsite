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
    <header className="ll-head">
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
        <Link href="/" className="ll-brand-link" aria-label="Lanework home" onClick={() => setOpen(false)}>
          <Logo size={34} />
        </Link>

        <button
          type="button"
          className={`ll-nav-toggle${open ? ' is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
            <line className="l-top" x1="1" y1="2" x2="19" y2="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line className="l-mid" x1="1" y1="8" x2="19" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line className="l-bot" x1="1" y1="14" x2="19" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <div
          className={`ll-nav-links${open ? ' open' : ''}`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {links.map((l) => {
            const active = isActive(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`ll-nav-link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="ll-nav-dot" aria-hidden="true" />
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
