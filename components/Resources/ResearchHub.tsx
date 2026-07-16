'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ContentCard from '@/components/Resources/ContentCard'
import { cardGridClass } from '@/lib/grid'

interface WhitePaperItem {
  _id: string
  title: string
  slug: { current: string }
  description: string
  publishedAt: string
  readTime?: string
  coverImage?: { asset?: { url?: string }; alt?: string }
}

interface BenchmarkItem {
  _id: string
  title: string
  slug: { current: string }
  description: string
  series: string
  period: string
  publishedAt: string
  coverImage?: { asset?: { url?: string }; alt?: string }
}

type Filter = 'all' | 'whitepaper' | 'benchmark'

interface UnifiedItem {
  _id: string
  type: 'whitepaper' | 'benchmark'
  href: string
  title: string
  description: string
  publishedAt: string
  coverUrl?: string | null
  coverAlt?: string | null
  badge: string
  ctaLabel: string
  meta: Array<string | null | undefined>
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function ResearchHub({
  papers,
  benchmarks,
}: {
  papers: WhitePaperItem[]
  benchmarks: BenchmarkItem[]
}) {
  const [filter, setFilter] = useState<Filter>('all')

  const items: UnifiedItem[] = useMemo(() => {
    const wp: UnifiedItem[] = papers.map((p) => ({
      _id: p._id,
      type: 'whitepaper',
      href: `/white-papers/${p.slug.current}`,
      title: p.title,
      description: p.description,
      publishedAt: p.publishedAt,
      coverUrl: p.coverImage?.asset?.url,
      coverAlt: p.coverImage?.alt ?? p.title,
      badge: 'White Paper',
      ctaLabel: 'Read the white paper',
      meta: [fmtDate(p.publishedAt), p.readTime],
    }))
    const bm: UnifiedItem[] = benchmarks.map((b) => ({
      _id: b._id,
      type: 'benchmark',
      href: `/benchmarks/${b.slug.current}`,
      title: b.title,
      description: b.description,
      publishedAt: b.publishedAt,
      coverUrl: b.coverImage?.asset?.url,
      coverAlt: b.coverImage?.alt ?? b.title,
      badge: b.period,
      ctaLabel: 'View the scorecard',
      meta: [fmtDate(b.publishedAt)],
    }))
    return [...wp, ...bm].sort(
      (a, z) => new Date(z.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }, [papers, benchmarks])

  // Benchmarks are coming soon — exclude them from all views
  const whitepaperItems = items.filter((i) => i.type === 'whitepaper')
  const filtered = filter === 'benchmark' ? [] : (filter === 'all' ? whitepaperItems : whitepaperItems.filter((i) => i.type === filter))

  const chips: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All research' },
    { value: 'whitepaper', label: 'White Papers' },
    { value: 'benchmark', label: 'Benchmarks' },
  ]

  if (items.length === 0) {
    return (
      <div className="glass-effect rounded-2xl p-12 text-center border border-white/10 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Research coming soon</h2>
        <p className="text-gray-400">
          We&apos;re publishing our first white papers and benchmarks shortly. Check back soon.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Filter chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {chips.map((chip) => {
          const active = filter === chip.value
          return (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                active
                  ? 'bg-primary text-white glow-effect'
                  : 'glass-effect text-gray-300 hover:bg-white/10'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {filter === 'benchmark' ? (
          <motion.div
            key="benchmark-soon"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="glass-effect rounded-2xl p-12 text-center border border-white/10 max-w-xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Benchmarks coming soon</h2>
            <p className="text-gray-400">
              We&apos;re preparing our first industry scorecards. Check back soon.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className={cardGridClass(filtered.length)}
          >
            {filtered.map((item, i) => (
              <ContentCard
                key={item._id}
                href={item.href}
                title={item.title}
                description={item.description}
                coverImageUrl={item.coverUrl}
                coverImageAlt={item.coverAlt}
                badge={item.badge}
                variant="resource"
                ctaLabel={item.ctaLabel}
                metaItems={item.meta}
                index={i}
                headingLevel="h2"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
