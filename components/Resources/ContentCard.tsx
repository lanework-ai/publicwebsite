'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Props {
  href: string
  title: string
  description: string
  coverImageUrl?: string | null
  coverImageAlt?: string | null
  /** Top-left badge, e.g. "White Paper", "Q2 2026", "Blog". */
  badge?: string | null
  /** Bottom-row meta, e.g. date, read time, period. Rendered "a | b" like the blog cards. */
  metaItems?: Array<string | null | undefined>
  /** Footer call-to-action text. Defaults to "Read More" (matching the blog cards). */
  ctaLabel?: string
  /**
   * Visual family. `resource` (white papers / benchmarks) gets a gradient badge so
   * it reads as a report rather than a blog post. `blog` matches the site blog
   * cards exactly (solid cyan badge). Structure/typography are identical either way.
   */
  variant?: 'resource' | 'blog'
  /** Accent border + "New" flag (e.g. newest edition in a benchmark series). */
  highlight?: boolean
  index?: number
  /**
   * Heading level for the card title. Hub pages (cards right after an h1) should
   * pass `h2`; related-content sections under an h2 keep the default `h3`.
   */
  headingLevel?: 'h2' | 'h3'
}

export default function ContentCard({
  href,
  title,
  description,
  coverImageUrl,
  coverImageAlt,
  badge,
  metaItems,
  ctaLabel = 'Read More',
  variant = 'resource',
  highlight,
  index = 0,
  headingLevel = 'h3',
}: Props) {
  const HeadingTag = headingLevel
  const meta = (metaItems ?? []).filter(Boolean) as string[]

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
      className={`glass-effect rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 group cursor-pointer h-full flex flex-col ${
        highlight ? 'ring-1 ring-accent-cyan/40 shadow-[0_0_30px_rgba(64,168,196,0.2)]' : ''
      }`}
    >
      <Link href={href} className="flex flex-col h-full">
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-accent-purple/20">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt={coverImageAlt ?? title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-lg">
              No cover image
            </div>
          )}
          {badge && (
            <div className="absolute top-4 left-4">
              <span
                className={`inline-block px-3 py-1 text-xs font-bold rounded-lg shadow-lg backdrop-blur-md ${
                  variant === 'blog'
                    ? 'bg-accent-cyan/90 text-white'
                    : 'bg-gradient-to-r from-primary to-accent-cyan text-white'
                }`}
              >
                {badge}
              </span>
            </div>
          )}
          {highlight && (
            <span className="absolute top-4 right-4 inline-block px-3 py-1 text-xs font-bold rounded-lg bg-accent-cyan text-[#0a0a0f] shadow-lg">
              New
            </span>
          )}
        </div>

        <div className="p-8 flex flex-col flex-1">
          {meta.length > 0 && (
            <div className="flex items-center text-base text-gray-400 mb-4">
              {meta.map((m, i) => (
                <span key={i} className="flex items-center">
                  {i > 0 && <span className="mx-3 opacity-30">|</span>}
                  {m}
                </span>
              ))}
            </div>
          )}
          <HeadingTag className="text-3xl font-bold text-white mb-4 group-hover:text-accent-cyan transition-colors line-clamp-2 leading-tight">
            {title}
          </HeadingTag>
          <p className="text-lg text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-1">{description}</p>
          <div className="flex items-center justify-end mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-accent-cyan font-bold text-base group-hover:gap-3 transition-all">
              <span>{ctaLabel}</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: '20px', lineHeight: '1' }}
              >
                &rarr;
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
