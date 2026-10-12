import { pageMetadata } from '@/lib/seo'

/**
 * app/connect/page.tsx is a Client Component (it owns the multi-step form state)
 * and so cannot export metadata. Without this layout the page inherited the root
 * title and description and had no canonical of its own.
 */
export const metadata = pageMetadata({
  title: 'Get in touch · Lanework',
  description:
    'Support our research with a carrier introduction or lane and dispatch data, request a free network readiness snapshot, or ask about an assessment, operational due diligence, or a role.',
  path: '/connect',
})

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  return children
}
