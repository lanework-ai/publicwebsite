import { pageMetadata } from '@/lib/seo'

/**
 * app/connect/page.tsx is a Client Component (it owns the multi-step form state)
 * and so cannot export metadata. Without this layout the page inherited the root
 * title and description and had no canonical of its own.
 */
export const metadata = pageMetadata({
  title: 'Work with us · Lanework',
  description:
    'Start with one bounded problem: a free network readiness snapshot, a network or fulfillment assessment, operational due diligence, or a fractional analytics engagement.',
  path: '/connect',
})

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  return children
}
