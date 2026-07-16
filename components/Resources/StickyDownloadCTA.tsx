'use client'

import { useState } from 'react'
import GatedContentForm from './GatedContentForm'

interface Props {
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
}

/**
 * Sticky download CTA:
 *  - Desktop (lg+): sticky right-rail card embedded in the parent grid (parent handles position).
 *  - Mobile (<lg): fixed bottom bar with a button that expands the full form on tap.
 *
 * Two render paths so we can show full form on desktop and a collapsed bar on mobile
 * without doubling up event handlers or state.
 */
export default function StickyDownloadCTA(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop / tablet: in-flow form. Sticky positioning applied by parent on lg+. */}
      <div className="hidden lg:block">
        <GatedContentForm {...props} variant="card" />
      </div>

      {/* Mobile: collapsed bar; expands into a sheet */}
      <div className="lg:hidden">
        {!mobileOpen && (
          <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/10">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="w-full px-5 py-3 text-white font-bold rounded-lg text-sm uppercase tracking-wide bg-gradient-to-r from-primary to-accent-cyan shadow-[0_0_20px_rgba(64,168,196,0.3)]"
            >
              Get the full {props.contentType === 'whitepaper' ? 'white paper' : 'scorecard'} →
            </button>
          </div>
        )}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="max-w-md mx-auto mt-12">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20"
                  aria-label="Close"
                >
                  ×
                </button>
                <GatedContentForm {...props} variant="card" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
