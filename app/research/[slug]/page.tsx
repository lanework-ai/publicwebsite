import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/client'
import {
  whitePaperSlugsQuery,
  benchmarkSlugsQuery,
  getWhitePaperBySlug,
  getBenchmarkBySlug,
} from '@/lib/sanity-queries'
import RichText from '@/components/Resources/RichText'
import { Callout, BulletList, StatCard, Quote, FAQItem, Button } from '@/components/labs/ds'
import LabsGatedForm from '@/components/labs/LabsGatedForm'
import { lw } from '@/lib/labs/config'

export const revalidate = 86400

export async function generateStaticParams() {
  const [wp, bm] = await Promise.all([
    client.fetch<string[]>(whitePaperSlugsQuery),
    client.fetch<string[]>(benchmarkSlugsQuery),
  ])
  return [...wp, ...bm].map((slug) => ({ slug }))
}

async function resolve(slug: string) {
  const wp = (await getWhitePaperBySlug(slug)) as any
  if (wp) return { doc: wp, kind: 'White paper' as const }
  const bm = (await getBenchmarkBySlug(slug)) as any
  if (bm) return { doc: bm, kind: 'Benchmark' as const }
  return null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r = await resolve(slug)
  return { title: r ? `${r.doc.title} · Lanework` : 'Research · Lanework' }
}

function fmt(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const h2: React.CSSProperties = { fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', margin: '0 0 18px' }

export default async function LabsResearchDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r = await resolve(slug)
  if (!r) notFound()
  const { doc, kind } = r
  const authorName = typeof doc.author === 'string' ? doc.author : doc.author?.name
  const metrics = doc.stats ?? doc.headlineMetrics
  const category = Array.isArray(doc.categories) ? doc.categories[0] : undefined
  const related = doc.relatedPosts?.length ? doc.relatedPosts : doc.relatedWhitePapers

  return (
    <>
      <article className="ll-section" style={{ paddingTop: 56, paddingBottom: 48 }}>
        {/* Hero */}
        <Link href={lw('/research')} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--lw-muted)', letterSpacing: '0.06em' }}>
          ← RESEARCH
        </Link>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, margin: '24px 0 14px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--lw-accent-soft)', textTransform: 'uppercase' }}>{kind}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.1, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 16px', maxWidth: 760 }}>
          {doc.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 13, color: 'var(--lw-faint)', marginBottom: 36 }}>
          {authorName && <span>by {authorName}</span>}
          {authorName && <span style={{ color: 'var(--lw-dim)' }}>·</span>}
          <span>{fmt(doc.publishedAt)}</span>
          {doc.readTime && (<><span style={{ color: 'var(--lw-dim)' }}>·</span><span>{doc.readTime}</span></>)}
          {doc.period && (<><span style={{ color: 'var(--lw-dim)' }}>·</span><span>{doc.period}</span></>)}
          {category && (<><span style={{ color: 'var(--lw-dim)' }}>·</span><span>{category}</span></>)}
        </div>

        {/* Two-column body */}
        <div className="ll-article-grid">
          <div>
            {doc.coverImage?.asset?.url && (
              <div style={{ position: 'relative', aspectRatio: '16 / 9', width: '100%', overflow: 'hidden', borderRadius: 12, border: '1px solid var(--lw-line-2)', marginBottom: 36 }}>
                <Image src={doc.coverImage.asset.url} alt={doc.coverImage.alt || doc.title} fill sizes="(min-width:900px) 760px, 100vw" priority style={{ objectFit: 'cover' }} />
              </div>
            )}

            {doc.tldr && (
              <Callout label="TL;DR" style={{ marginBottom: 36 }}>
                {doc.tldr}
              </Callout>
            )}

            {Array.isArray(doc.keyFindings) && doc.keyFindings.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2 style={h2}>Key findings</h2>
                <BulletList items={doc.keyFindings} />
              </div>
            )}

            {Array.isArray(metrics) && metrics.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2 style={h2}>By the numbers</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
                  {metrics.map((m: any, i: number) => (
                    <StatCard key={i} value={m.value} label={m.label} source={m.source} />
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(doc.featuredVoices) && doc.featuredVoices.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2 style={h2}>In their own words</h2>
                <div style={{ display: 'grid', gap: 14 }}>
                  {doc.featuredVoices.map((v: any, i: number) => (
                    <Quote key={i} name={v.name} role={v.title} org={v.org} cite={v.source} href={v.profileUrl}>
                      {v.quote}
                    </Quote>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(doc.methodology) && doc.methodology.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2 style={h2}>Methodology</h2>
                <RichText value={doc.methodology} />
              </div>
            )}

            {Array.isArray(doc.faqs) && doc.faqs.length > 0 && (
              <div>
                <h2 style={h2}>FAQs</h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  {doc.faqs.map((f: any, i: number) => (
                    <FAQItem key={i} question={f.question}>
                      {f.answer}
                    </FAQItem>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky CTA aside — gated download when a PDF exists, else study CTA */}
          <aside>
            <div className="ll-sticky" style={{ display: 'grid', gap: 12 }}>
              {doc.hasPdf ? (
                <LabsGatedForm
                  contentType={kind === 'White paper' ? 'whitepaper' : 'benchmark'}
                  contentSlug={slug}
                  contentTitle={doc.title}
                  thankYouPath={lw(`/research/${slug}/thank-you`)}
                />
              ) : (
                <div style={{ border: '1px solid var(--lw-line-2)', borderRadius: 12, padding: 22 }}>
                  <div className="ll-label" style={{ fontSize: 10.5, marginBottom: 12 }}>Work with us</div>
                  <p style={{ fontSize: 13, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 16px' }}>
                    Talk to the team about applying this research to your network.
                  </p>
                  <Button as={Link} href={lw('/connect')} arrow style={{ width: '100%', justifyContent: 'center' }}>
                    Run a study with us
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>

      {/* Keep reading */}
      {Array.isArray(related) && related.length > 0 && (
        <section style={{ borderTop: '1px solid var(--lw-line)' }}>
          <div className="ll-section" style={{ paddingTop: 48, paddingBottom: 56 }}>
            <h2 style={{ ...h2, marginBottom: 24 }}>Keep reading</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {related.map((p: any) => {
                const isPost = !!p.excerpt
                const href = isPost ? lw(`/blog/${p.slug.current}`) : lw(`/research/${p.slug.current}`)
                return (
                  <Link key={p._id} href={href} style={{ border: '1px solid var(--lw-line-2)', borderRadius: 10, padding: 20, display: 'block' }}>
                    <div style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{p.title}</div>
                    <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{p.excerpt ?? p.description ?? ''}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
