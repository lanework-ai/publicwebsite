'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import LabsNav from './LabsNav'
import SectionReveal from './SectionReveal'

/**
 * Site chrome (nav, skip link, footer, reveal observer) for everything except
 * /admin.
 *
 * Sanity Studio at /admin/studio renders its own full-screen UI and must not sit
 * inside the site nav and footer. The Rapid Relay app got this for free because
 * its root layout was bare and each section supplied its own chrome; Lanework's
 * root layout carries the chrome directly, so the admin subtree has to opt out
 * somewhere. Doing it here keeps it to one file instead of moving every page
 * into an `app/(site)/` route group.
 *
 * `footer` is passed in as a prop rather than imported so LabsFooter stays a
 * Server Component. LabsNav and SectionReveal are already client components, so
 * importing them here costs nothing extra.
 */
export default function SiteChrome({
  footer,
  children,
}: {
  footer: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) return <>{children}</>

  return (
    <div className="ll-root">
      <a href="#main" className="ll-skip">
        Skip to content
      </a>
      <LabsNav />
      <main id="main">{children}</main>
      {footer}
      <SectionReveal />
    </div>
  )
}
