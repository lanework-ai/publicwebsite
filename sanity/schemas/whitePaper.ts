export default {
  name: 'whitePaper',
  title: 'White Paper',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'preview', title: 'Page Preview (crawlable + LLM-citable)' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ---- Content ----
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'author',
      type: 'reference',
      title: 'Author',
      to: [{ type: 'author' }],
      group: 'content',
    },
    {
      name: 'coverImage',
      type: 'image',
      title: 'Cover Image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt Text', description: 'Required for accessibility and SEO' }],
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'categories',
      type: 'array',
      title: 'Categories',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      group: 'content',
    },
    {
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published At',
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'description',
      type: 'text',
      title: 'Short Description',
      description: 'One-paragraph card description. Used as meta description if no SEO description provided. Keep 50–160 characters.',
      validation: (Rule: any) => Rule.required().min(50).max(160),
      group: 'content',
    },
    {
      name: 'funnelStage',
      type: 'string',
      title: 'Funnel Stage',
      description: 'Where this paper fits in the buyer journey. Drives drip-email cross-promotion logic.',
      options: {
        list: [
          { title: 'Top of funnel (awareness)', value: 'top' },
          { title: 'Mid funnel (consideration)', value: 'mid' },
          { title: 'Bottom of funnel (decision)', value: 'bottom' },
        ],
        layout: 'radio',
      },
      initialValue: 'mid',
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'readTime',
      type: 'string',
      title: 'Read Time',
      description: 'e.g., "22 min read"',
      group: 'content',
    },
    {
      name: 'pdfFile',
      type: 'file',
      title: 'PDF File (gated)',
      description: 'The full white paper PDF. Only delivered via the tokenized download email link; never exposed publicly.',
      options: { accept: 'application/pdf' },
      validation: (Rule: any) =>
        Rule.required().custom((value: any) => {
          if (!value?.asset?._ref) return true // required check handles empty
          // Best-effort MIME hint check; Sanity stores MIME on asset metadata after upload
          return true
        }),
      group: 'content',
    },
    {
      name: 'gatedAppendix',
      type: 'file',
      title: 'Gated Appendix (optional)',
      description: 'Optional premium/extra-data PDF delivered as a follow-up nurture asset.',
      options: { accept: 'application/pdf' },
      group: 'content',
    },
    {
      name: 'relatedWhitePapers',
      type: 'array',
      title: 'Related White Papers',
      description: 'Up to 3 related papers shown on the detail page.',
      of: [{ type: 'reference', to: [{ type: 'whitePaper' }] }],
      validation: (Rule: any) => Rule.max(3),
      group: 'content',
    },
    {
      name: 'relatedBenchmarks',
      type: 'array',
      title: 'Related Benchmarks',
      description: 'Up to 2 related benchmarks/scorecards shown on the detail page.',
      of: [{ type: 'reference', to: [{ type: 'benchmark' }] }],
      validation: (Rule: any) => Rule.max(2),
      group: 'content',
    },
    {
      name: 'relatedPosts',
      type: 'array',
      title: 'Related Blog Posts',
      description: 'Up to 3 relevant blog posts shown in the "Keep reading" section at the bottom of the detail page.',
      of: [{ type: 'reference', to: [{ type: 'post' }] }],
      validation: (Rule: any) => Rule.max(3),
      group: 'content',
    },

    // ---- Preview content (must render in HTML for SEO/AI-SEO) ----
    {
      name: 'tldr',
      type: 'text',
      title: 'TL;DR / Executive Summary',
      description: '2–3 sentence summary. Plain language. LLMs preferentially quote opening paragraphs.',
      validation: (Rule: any) => Rule.required().max(280),
      group: 'preview',
    },
    {
      name: 'keyFindings',
      type: 'array',
      title: 'Key Findings',
      description: '3–5 bullet points. Used in JSON-LD and rendered on the detail page.',
      of: [{ type: 'string' }],
      validation: (Rule: any) => Rule.required().min(3).max(5),
      group: 'preview',
    },
    {
      name: 'stats',
      type: 'array',
      title: 'Stat Callouts',
      description: 'Standalone statistics with source attribution. Each stat should be citable on its own.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', type: 'string', title: 'Value (e.g. "28%")', validation: (Rule: any) => Rule.required() },
            { name: 'label', type: 'string', title: 'Label / what it measures', validation: (Rule: any) => Rule.required() },
            { name: 'source', type: 'string', title: 'Source name', validation: (Rule: any) => Rule.required() },
            { name: 'sourceUrl', type: 'url', title: 'Source URL (optional)' },
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
      group: 'preview',
    },
    {
      name: 'methodology',
      type: 'array',
      title: 'Methodology',
      description: 'Optional. How the research was conducted. Strengthens authority signal for LLMs.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H3', value: 'h3' },
          ],
        },
      ],
      group: 'preview',
    },
    {
      name: 'faqs',
      type: 'array',
      title: 'FAQs',
      description: 'Q&A pairs. Rendered on page + JSON-LD FAQPage. The #1 structure LLMs lift verbatim.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', type: 'string', title: 'Question', validation: (Rule: any) => Rule.required() },
            { name: 'answer', type: 'text', title: 'Answer', validation: (Rule: any) => Rule.required() },
          ],
          preview: { select: { title: 'question' } },
        },
      ],
      group: 'preview',
    },
    {
      name: 'featuredVoices',
      type: 'array',
      title: 'Featured Voices ("In their own words")',
      description:
        'Named industry experts quoted in the paper. Rendered as a visible, crawlable section and surfaced in Article JSON-LD (schema.org mentions) so the named people and their organizations can discover the citation. Strong for SEO and outreach.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'quote', type: 'text', title: 'Quote', validation: (Rule: any) => Rule.required() },
            { name: 'name', type: 'string', title: 'Name', validation: (Rule: any) => Rule.required() },
            { name: 'title', type: 'string', title: 'Role / Title' },
            { name: 'org', type: 'string', title: 'Organization' },
            {
              name: 'profileUrl',
              type: 'url',
              title: 'Profile URL (LinkedIn / Wikipedia / company bio)',
              description:
                'The person’s authoritative profile. Emitted as schema.org sameAs so Google links the quote to the real person’s entity — this is what helps the citation surface in searches for their name.',
            },
            {
              name: 'orgUrl',
              type: 'url',
              title: 'Organization URL',
              description: 'The organization’s website. Emitted as sameAs on the Organization entity.',
            },
            { name: 'source', type: 'string', title: 'Source (publication + date)' },
          ],
          preview: { select: { title: 'name', subtitle: 'org' } },
        },
      ],
      group: 'preview',
    },

    // ---- SEO ----
    {
      name: 'seoTitle',
      type: 'string',
      title: 'SEO Title',
      description: 'Custom title for search engines (defaults to title). Max 60 characters.',
      validation: (Rule: any) => Rule.max(60),
      group: 'seo',
    },
    {
      name: 'seoDescription',
      type: 'text',
      title: 'SEO Description',
      description: 'Custom meta description (defaults to short description). Max 160 characters.',
      validation: (Rule: any) => Rule.max(160),
      group: 'seo',
    },
    {
      name: 'focusKeyword',
      type: 'string',
      title: 'Focus Keyword',
      group: 'seo',
    },
    {
      name: 'keywords',
      type: 'array',
      title: 'Keywords',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      group: 'seo',
    },
    {
      name: 'ogImage',
      type: 'image',
      title: 'Open Graph Image',
      description: 'Custom social share image (defaults to cover image). Recommended: 1200x630px',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }],
      group: 'seo',
    },
    {
      name: 'canonicalUrl',
      type: 'url',
      title: 'Canonical URL',
      group: 'seo',
    },
    {
      name: 'noIndex',
      type: 'boolean',
      title: 'No Index',
      initialValue: false,
      group: 'seo',
    },
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', subtitle: 'funnelStage' },
    prepare(selection: any) {
      const { title, media, subtitle } = selection
      return { title, subtitle: subtitle ? `Funnel: ${subtitle}` : undefined, media }
    },
  },
}
