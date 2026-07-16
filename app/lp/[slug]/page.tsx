import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { getLpDocBySlug, lpSlugsQuery } from '@/lib/sanity-queries'
import { resolveLpVariant } from '@/lib/paid-lp-variants'
import LabsGatedForm from '@/components/labs/LabsGatedForm'
import { Stat } from '@/components/labs/ds'
import { lw } from '@/lib/labs/config'

// Research-credibility stats (same set as the Rapid Relay paid-LP social proof).
const proofStats = [
  { value: '94%', label: 'industry-avg long-haul turnover' },
  { value: '$18.7B', label: 'annual replacement cost' },
  { value: '7%', label: "Walmart's private-fleet turnover" },
  { value: '~80%', label: 'sub-500mi fleets keep turnover under 50%' },
]

interface LpDoc {
  _id: string
  _type: 'whitePaper' | 'benchmark'
  title: string
  slug: { current: string }
  description: string
  coverImage?: { asset?: { url?: string }; alt?: string }
  tldr?: string
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(lpSlugsQuery)
  return slugs.map((slug) => ({ slug }))
}

// Paid landing pages must never be indexed (they duplicate the organic page).
export const metadata = { robots: { index: false, follow: false } }
export const revalidate = 86400

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ variant?: string }>
}

export default async function LabsPaidLandingPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { variant } = await searchParams
  const doc = (await getLpDocBySlug(slug)) as LpDoc | null
  if (!doc) notFound()

  const contentType = doc._type === 'benchmark' ? 'benchmark' : 'whitepaper'
  const eyebrowFallback = contentType === 'benchmark' ? 'FREE SCORECARD' : 'FREE WHITE PAPER'
  const copy = resolveLpVariant(slug, variant ?? null, {
    eyebrow: eyebrowFallback,
    headline: doc.title,
    subhead: doc.tldr || doc.description,
  })

  return (
    <section className="ll-section" style={{ paddingTop: 56, paddingBottom: 64 }}>
      <div className="ll-lp-grid" style={{ display: 'grid', gap: 40 }}>
        <div>
          {copy.eyebrow && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lw-accent-soft)', marginBottom: 18 }}>
              {copy.eyebrow}
            </div>
          )}
          <h1 style={{ fontSize: 'var(--text-hero)', lineHeight: 'var(--leading-display)', fontWeight: 500, letterSpacing: 'var(--tracking-tight)', margin: '0 0 20px', maxWidth: 620 }}>
            {copy.headline}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lw-muted)', maxWidth: 560, margin: '0 0 28px' }}>{copy.subhead}</p>

          {copy.ctaCalloutHtml && (
            <div
              style={{ border: '1px solid rgba(127,149,255,0.3)', borderRadius: 12, padding: '16px 18px', background: 'var(--lw-panel-accent)', maxWidth: 560, fontSize: 14, color: 'var(--lw-fg-2)', lineHeight: 1.6, marginBottom: 28 }}
              dangerouslySetInnerHTML={{ __html: copy.ctaCalloutHtml }}
            />
          )}

          {doc.coverImage?.asset?.url && (
            <div style={{ position: 'relative', aspectRatio: '16 / 10', width: '100%', maxWidth: 440, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--lw-line-2)' }}>
              <Image src={doc.coverImage.asset.url} alt={doc.coverImage.alt || doc.title} fill sizes="(min-width:900px) 40vw, 100vw" style={{ objectFit: 'cover' }} />
            </div>
          )}

          <p style={{ fontSize: 12.5, color: 'var(--lw-dim)', marginTop: 24 }}>
            Prefer the full page?{' '}
            <Link href={lw(`/research/${slug}`)} style={{ color: 'var(--lw-accent-soft)' }}>Read the research →</Link>
          </p>
        </div>

        <div style={{ maxWidth: 420 }}>
          <LabsGatedForm
            contentType={contentType}
            contentSlug={slug}
            contentTitle={doc.title}
            thankYouPath={lw(`/research/${slug}/thank-you`)}
          />
        </div>
      </div>

      {/* Research-credibility strip */}
      <div style={{ borderTop: '1px solid var(--lw-line)', marginTop: 48, paddingTop: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {proofStats.map((s) => (
          <Stat key={s.label} value={s.value} label={s.label} size={24} />
        ))}
      </div>
    </section>
  )
}
