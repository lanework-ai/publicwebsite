'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from './ds'
import { lw } from '@/lib/labs/config'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  readTime?: string
  mainImage?: { asset?: { url?: string }; alt?: string }
  categories?: string[]
}

function fmt(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function LabsBlogList({ posts }: { posts: Post[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((p) => p.categories?.forEach((c) => set.add(c)))
    return ['All', ...Array.from(set)]
  }, [posts])

  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? posts : posts.filter((p) => p.categories?.includes(active))

  return (
    <>
      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {categories.map((c) => {
            const on = c === active
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '7px 13px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  color: on ? 'var(--lw-bg)' : 'var(--lw-muted)',
                  background: on ? 'var(--lw-fg)' : 'transparent',
                  border: on ? '1px solid var(--lw-fg)' : '1px solid var(--lw-line-2)',
                }}
              >
                {c}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((p) => (
          <Card as={Link} key={p._id} href={lw(`/blog/${p.slug.current}`)} padding={0} radius={12} style={{ display: 'block', overflow: 'hidden' }}>
            <div style={{ position: 'relative', aspectRatio: '16 / 9', background: 'var(--lw-panel)' }}>
              {p.mainImage?.asset?.url && (
                <Image src={p.mainImage.asset.url} alt={p.mainImage.alt || p.title} fill sizes="(min-width:900px) 360px, 100vw" style={{ objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--lw-dim)', letterSpacing: '0.06em' }}>
                {p.categories?.[0] && <span style={{ color: 'var(--lw-accent-soft)' }}>{p.categories[0].toUpperCase()}</span>}
                <span>{fmt(p.publishedAt)}</span>
                {p.readTime && <span>· {p.readTime}</span>}
              </div>
              <div style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.3, marginBottom: 8, color: 'var(--lw-fg)' }}>{p.title}</div>
              {p.excerpt && <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{p.excerpt}</p>}
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ fontSize: 14, color: 'var(--lw-faint)' }}>No notes in this category yet.</p>
      )}
    </>
  )
}
