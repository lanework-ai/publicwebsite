'use client'

import { motion } from 'framer-motion'

/**
 * Social-proof strip for paid landing pages. Hard-coded stats that work as
 * trust signals for cold paid-ad traffic. Marketing can update these as new
 * data lands.
 */
export default function PaidLpSocialProof() {
  const items = [
    { stat: '94%', label: 'industry-avg long-haul turnover' },
    { stat: '$18.7B', label: 'annual replacement cost' },
    { stat: '7%', label: "Walmart's private-fleet turnover" },
    { stat: '~80%', label: 'sub-500mi fleets keep turnover < 50%' },
  ]
  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-effect rounded-2xl px-4 sm:px-6 py-4 sm:py-5 border border-white/10">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-cyan font-semibold mb-3 text-center">
          The numbers we are building this around
        </p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {items.map((it, i) => (
            <div key={i} className="text-center">
              <div className="text-xl sm:text-2xl font-black gradient-text mb-0.5">{it.stat}</div>
              <div className="text-[11px] sm:text-xs text-gray-400 leading-snug">{it.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
