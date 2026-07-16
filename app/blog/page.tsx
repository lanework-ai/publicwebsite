import { client } from '@/sanity/client'
import { postsQuery } from '@/lib/sanity-queries'
import { PageHeader, CtaBand } from '@/components/labs/ui'
import LabsBlogList from '@/components/labs/LabsBlogList'
import LabsNewsletter from '@/components/labs/LabsNewsletter'

export const metadata = { title: 'Notes · Lanework' }
export const revalidate = 86400

export default async function LabsNotes() {
  const posts = await client.fetch<any[]>(postsQuery)
  return (
    <>
      <PageHeader
        eyebrow="NOTES"
        title="Shorter writing between the research."
        sub="Field notes, analysis, and commentary on freight, data, and the operating reality of logistics."
      />
      <section className="ll-section" style={{ paddingBottom: 40 }}>
        <LabsBlogList posts={posts} />
      </section>
      <section className="ll-section" style={{ paddingBottom: 52 }}>
        <LabsNewsletter />
      </section>
      <CtaBand />
    </>
  )
}
