'use client'

import Link from 'next/link'
import { Button } from '@/components/labs/ds'
import { trackDemoCtaClick } from '@/lib/analytics'

/**
 * A ds `Button` that reports its click before navigating.
 *
 * Autocapture already records the raw click, but it keys off DOM shape (selector,
 * text) — so a copy change silently breaks any funnel built on it. Naming the
 * event and passing an explicit `source` makes "gated download → sales conversation"
 * measurable across pages and survives redesigns.
 */
export default function DemoCtaLink({
  href,
  source,
  children,
  variant = 'solid',
  arrow = false,
}: {
  href: string
  source: string
  children: React.ReactNode
  variant?: 'solid' | 'outline'
  arrow?: boolean
}) {
  return (
    <Button as={Link} href={href} variant={variant} arrow={arrow} onClick={() => trackDemoCtaClick(source)}>
      {children}
    </Button>
  )
}
