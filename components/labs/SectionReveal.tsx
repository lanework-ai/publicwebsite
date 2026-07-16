'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Single-gesture scroll reveal (per the DS motion principle: draw or fade in once,
 * then settle — nothing loops). Observes every content `.ll-section` inside <main>:
 * sections already in view on load show immediately (no flash); sections below the
 * fold fade + rise as they scroll into view. Honors prefers-reduced-motion. Re-runs
 * on route change so client-navigated pages get the same treatment.
 */
export default function SectionReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('#main .ll-section'))
    if (els.length === 0) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      els.forEach((el) => el.classList.add('is-revealed'))
      return
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            obs.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )

    const vh = window.innerHeight
    for (const el of els) {
      // Already on screen at load → reveal instantly (no fade-in from empty).
      if (el.getBoundingClientRect().top < vh * 0.92) {
        el.classList.add('is-revealed')
      } else {
        el.classList.add('ll-reveal')
        io.observe(el)
      }
    }

    return () => io.disconnect()
  }, [pathname])

  return null
}
