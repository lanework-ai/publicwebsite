export default function BlogPostSchema({ post }: { post: any }) {
  const headline = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt
  const imageUrl = post.ogImage?.asset?.url || post.mainImage?.asset?.url
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rapidrelay.ai'
  const postUrl = `${siteUrl}/blog/${post.slug.current}`

  const allKeywords = post.focusKeyword
    ? [post.focusKeyword, ...(post.keywords || [])]
    : post.keywords || []

  // Estimate word count from Portable Text body blocks
  const wordCount = post.body
    ? post.body
        .filter((block: any) => block._type === 'block' && block.children)
        .flatMap((block: any) => block.children)
        .filter((child: any) => child._type === 'span' && child.text)
        .map((child: any) => child.text.trim().split(/\s+/).length)
        .reduce((sum: number, n: number) => sum + n, 0)
    : undefined

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    url: postUrl,
    inLanguage: 'en-US',
    image: imageUrl
      ? { '@type': 'ImageObject', url: imageUrl, width: 1200, height: 630 }
      : undefined,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      ...(post.author.bio && { description: post.author.bio }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Rapid Relay Technologies, LLC',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/rapid-relay-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    ...(allKeywords.length > 0 && { keywords: allKeywords.join(', ') }),
    ...(wordCount && wordCount > 0 && { wordCount }),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  }

  const faqSchema =
    post.faqs && post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}
