'use client'

import { motion } from 'framer-motion'

interface Props {
  eyebrow?: string
  titleStart: string
  titleAccent?: string
  subtitle: string
}

export default function ResourceHero({ eyebrow, titleStart, titleAccent, subtitle }: Props) {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-50" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs sm:text-sm uppercase tracking-[0.2em] text-accent-cyan font-semibold mb-4"
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8"
          >
            <span className="gradient-text">{titleStart}</span>
            {titleAccent ? <span className="text-white"> {titleAccent}</span> : null}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed text-pretty"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
