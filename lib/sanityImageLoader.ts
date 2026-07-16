/**
 * Custom next/image loader that serves Sanity-hosted images through Sanity's own
 * (free, unmetered) image CDN with transform params, instead of routing them
 * through Netlify's metered Image CDN. Sanity's `auto=format` negotiates
 * WebP/AVIF per request and `fit=max` prevents upscaling.
 *
 * Non-Sanity sources (e.g. local /public assets) are returned unchanged.
 */
interface LoaderArgs {
  src: string
  width: number
  quality?: number
}

export default function sanityImageLoader({ src, width, quality }: LoaderArgs): string {
  if (!src.includes('cdn.sanity.io')) return src
  const sep = src.includes('?') ? '&' : '?'
  return `${src}${sep}w=${width}&q=${quality || 75}&auto=format&fit=max`
}
