import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/client'
import { postSlugsQuery, getPostBySlug } from '@/lib/sanity-queries'
import RichText from '@/components/Resources/RichText'
import { FAQItem, Card } from '@/components/labs/ds'
import { lw } from '@/lib/labs/config'

export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(postSlugsQuery)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = (await getPostBySlug(slug)) as any
  return { title: post ? `${post.title} · Lanework Notes` : 'Notes · Lanework' }
}

function fmt(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const h2: React.CSSProperties = { fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', margin: '0 0 16px' }

export default async function LabsNoteDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = (await getPostBySlug(slug)) as any
  if (!post) notFound()
  const authorName = typeof post.author === 'string' ? post.author : post.author?.name
  const category = Array.isArray(post.categories) ? post.categories[0] : undefined

  return (
    <>
      <article className="ll-section" style={{ paddingTop: 56, paddingBottom: 48, maxWidth: 780 }}>
        <Link href={lw('/blog')} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--lw-muted)', letterSpacing: '0.06em' }}>
          ← NOTES
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '24px 0 14px', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--lw-dim)', letterSpacing: '0.06em' }}>
          {category && <span style={{ color: 'var(--lw-accent-soft)' }}>{category.toUpperCase()}</span>}
          <span>{fmt(post.publishedAt)}</span>
          {post.readTime && <span>· {post.readTime}</span>}
          {authorName && <span>· {authorName}</span>}
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.12, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 28px' }}>
          {post.title}
        </h1>

        {post.mainImage?.asset?.url && (
          <div style={{ position: 'relative', aspectRatio: '16 / 9', width: '100%', overflow: 'hidden', borderRadius: 12, border: '1px solid var(--lw-line-2)', marginBottom: 36 }}>
            <Image src={post.mainImage.asset.url} alt={post.mainImage.alt || post.title} fill sizes="(min-width:900px) 780px, 100vw" priority style={{ objectFit: 'cover' }} />
          </div>
        )}

        {Array.isArray(post.body) && post.body.length > 0 && (
          <div style={{ fontSize: 16, lineHeight: 1.7 }}>
            <RichText value={post.body} />
          </div>
        )}

        {Array.isArray(post.faqs) && post.faqs.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={h2}>FAQs</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {post.faqs.map((f: any, i: number) => (
                <FAQItem key={i} question={f.question}>
                  {f.answer}
                </FAQItem>
              ))}
            </div>
          </div>
        )}
      </article>

      {Array.isArray(post.relatedPosts) && post.relatedPosts.length > 0 && (
        <section style={{ borderTop: '1px solid var(--lw-line)' }}>
          <div className="ll-section" style={{ paddingTop: 48, paddingBottom: 56 }}>
            <h2 style={{ ...h2, marginBottom: 24 }}>Keep reading</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {post.relatedPosts.map((p: any) => (
                <Card as={Link} key={p._id} href={lw(`/blog/${p.slug.current}`)} padding={20} style={{ display: 'block' }}>
                  <div style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{p.title}</div>
                  <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{p.excerpt ?? ''}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
