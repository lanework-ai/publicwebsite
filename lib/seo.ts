import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string; // Only used when ogType is 'article'
  noIndex?: boolean;
}

/**
 * Generates SEO metadata with proper canonical URLs
 * @param props - SEO configuration options
 * @returns Next.js Metadata object
 */
export function generateSEO(props: SEOProps = {}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rapidrelay.ai';
  const {
    title,
    description,
    keywords,
    canonical,
    ogImage = '/og-image.png',
    ogType = 'website',
    publishedTime,
    noIndex = false,
  } = props;

  const metadata: Metadata = {
    ...(title && { title }),
    ...(description && { description }),
    ...(keywords && keywords.length > 0 && { keywords }),
    ...(canonical && {
      alternates: {
        canonical,
      },
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      ...(title && { title }),
      ...(description && { description }),
      type: ogType,
      ...(canonical && { url: `${siteUrl}${canonical}` }),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || 'Rapid Relay',
        },
      ],
      // Only include publishedTime for articles
      ...(ogType === 'article' && publishedTime && { publishedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      ...(title && { title }),
      ...(description && { description }),
      images: [ogImage],
    },
  };

  return metadata;
}
