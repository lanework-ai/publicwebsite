export default {
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true
    },
    {
      name: 'seo',
      title: 'SEO'
    },
  ],
  fields: [
    // Content Fields
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule: any) => Rule.required(),
      group: 'content'
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule: any) => Rule.required(),
      group: 'content'
    },
    {
      name: 'author',
      type: 'reference',
      title: 'Author',
      to: [{ type: 'author' }],
      group: 'content'
    },
    {
      name: 'mainImage',
      type: 'image',
      title: 'Main Image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Important for accessibility and SEO'
        }
      ],
      group: 'content'
    },
    {
      name: 'categories',
      type: 'array',
      title: 'Categories',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      group: 'content'
    },
    {
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published At',
      validation: (Rule: any) => Rule.required(),
      group: 'content'
    },
    {
      name: 'excerpt',
      type: 'text',
      title: 'Excerpt',
      description: 'Required. Used as meta description in search results. Keep between 50–160 characters.',
      validation: (Rule: any) => Rule.required().min(50).max(160),
      group: 'content'
    },
    {
      name: 'body',
      type: 'array',
      title: 'Body',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' }
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL'
                  }
                ]
              }
            ]
          }
        }
      ],
      group: 'content'
    },
    {
      name: 'readTime',
      type: 'string',
      title: 'Read Time',
      description: 'e.g., "8 min read"',
      group: 'content'
    },
    {
      name: 'relatedPosts',
      type: 'array',
      title: 'Related Posts',
      description: 'Select up to 3 related articles to display at the bottom of this post',
      of: [{ type: 'reference', to: [{ type: 'post' }] }],
      validation: (Rule: any) => Rule.max(3),
      group: 'content'
    },

    // SEO Fields
    {
      name: 'seoTitle',
      type: 'string',
      title: 'SEO Title',
      description: 'Custom title for search engines (defaults to post title if empty). Max 60 characters.',
      validation: (Rule: any) => Rule.max(60),
      group: 'seo'
    },
    {
      name: 'seoDescription',
      type: 'text',
      title: 'SEO Description',
      description: 'Custom meta description (defaults to excerpt if empty). Max 160 characters.',
      validation: (Rule: any) => Rule.max(160),
      group: 'seo'
    },
    {
      name: 'focusKeyword',
      type: 'string',
      title: 'Focus Keyword',
      description: 'Primary keyword this post is targeting for SEO',
      group: 'seo'
    },
    {
      name: 'keywords',
      type: 'array',
      title: 'Keywords',
      description: 'Additional keywords for SEO',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      group: 'seo'
    },
    {
      name: 'ogImage',
      type: 'image',
      title: 'Open Graph Image',
      description: 'Custom social share image (defaults to main image if empty). Recommended: 1200x630px',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text'
        }
      ],
      group: 'seo'
    },
    {
      name: 'canonicalUrl',
      type: 'url',
      title: 'Canonical URL',
      description: 'Optional: Use if this content was originally published elsewhere',
      group: 'seo'
    },
    {
      name: 'noIndex',
      type: 'boolean',
      title: 'No Index',
      description: 'Prevent this post from appearing in search engines',
      initialValue: false,
      group: 'seo'
    },
    {
      name: 'faqs',
      type: 'array',
      title: 'FAQ Schema',
      description: 'Add Q&A pairs to generate FAQPage rich results in Google search. Shown as expandable answers in search snippets.',
      of: [
        {
          type: 'object',
          title: 'FAQ Item',
          fields: [
            {
              name: 'question',
              type: 'string',
              title: 'Question',
              validation: (Rule: any) => Rule.required()
            },
            {
              name: 'answer',
              type: 'text',
              title: 'Answer',
              validation: (Rule: any) => Rule.required()
            }
          ],
          preview: {
            select: { title: 'question' }
          }
        }
      ],
      group: 'seo'
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage'
    },
    prepare(selection: any) {
      const { title, author, media } = selection
      return {
        title,
        subtitle: author && `by ${author}`,
        media
      }
    }
  }
}
