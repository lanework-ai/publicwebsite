/**
 * Studio renders its own full-screen UI. Site chrome is skipped for /admin by
 * components/labs/SiteChrome.tsx; this layout marks the subtree noindex and
 * re-exports Studio's `viewport`, which the page itself cannot do because it is
 * a Client Component.
 */
export { viewport } from 'next-sanity/studio'

export const metadata = {
  title: 'Studio · Lanework Admin',
  robots: { index: false, follow: false },
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children
}
