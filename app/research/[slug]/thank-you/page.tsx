import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getWhitePaperBySlug, getBenchmarkBySlug, getRelatedResources } from '@/lib/sanity-queries'
import { Card, Button } from '@/components/labs/ds'
import { lw } from '@/lib/labs/config'

export const metadata = {
  title: 'Check your inbox · Lanework',
  robots: { index: false, follow: false },
}
export const revalidate = 86400

async function resolve(slug: string) {
  const wp = (await getWhitePaperBySlug(slug)) as any
  if (wp) return wp
  return (await getBenchmarkBySlug(slug)) as any
}

export default async function LabsResearchThankYou({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = await resolve(slug)
  if (!doc) notFound()

  const related = await getRelatedResources({
    currentId: doc._id,
    categoryIds: doc.categoryIds,
    curatedWhitePapers: doc.relatedWhitePapers,
    curatedPosts: doc.relatedPosts,
  })
  const relatedCount = related.whitePapers.length + related.posts.length

  return (
    <>
      <section className="ll-section" style={{ paddingTop: 72, paddingBottom: 52 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '1px solid rgba(127,149,255,0.4)',
              background: 'var(--lw-panel-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--lw-accent-soft)" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--leading-tight)', fontWeight: 500, letterSpacing: 'var(--tracking-tight)', margin: '0 0 16px' }}>
            Check your inbox
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lw-muted)', margin: '0 0 10px' }}>
            We just emailed you a download link for <span style={{ color: 'var(--lw-fg)', fontWeight: 500 }}>{doc.title}</span>.
          </p>
          <p style={{ fontSize: 13, color: 'var(--lw-faint)', margin: '0 0 30px' }}>
            Not there within a couple of minutes? Check spam, or{' '}
            <Link href={lw(`/research/${slug}`)} style={{ color: 'var(--lw-accent-soft)' }}>request a fresh link</Link>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button as={Link} href={lw('/connect')} arrow>Talk research with us</Button>
            <Button as={Link} href={lw('/research')} variant="outline">Browse more research</Button>
          </div>
        </div>
      </section>

      {relatedCount > 0 && (
        <section style={{ borderTop: '1px solid var(--lw-line)' }}>
          <div className="ll-section" style={{ paddingTop: 48, paddingBottom: 56 }}>
            <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', textAlign: 'center', margin: '0 0 24px' }}>
              Keep exploring the research
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {related.whitePapers.map((p: any) => (
                <Card as={Link} key={p._id} href={lw(`/research/${p.slug.current}`)} padding={20} style={{ display: 'block' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--lw-accent-soft)', textTransform: 'uppercase', marginBottom: 8 }}>White paper</div>
                  <div style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{p.title}</div>
                  <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{p.description ?? ''}</p>
                </Card>
              ))}
              {related.posts.map((b: any) => (
                <Card as={Link} key={b._id} href={lw(`/blog/${b.slug.current}`)} padding={20} style={{ display: 'block' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--lw-accent-soft)', textTransform: 'uppercase', marginBottom: 8 }}>{b.category ?? 'Note'}</div>
                  <div style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{b.title}</div>
                  <p style={{ fontSize: 12.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: 0 }}>{b.excerpt ?? ''}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
