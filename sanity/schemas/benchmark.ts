export default {
  name: 'benchmark',
  title: 'Benchmark / Scorecard',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'data', title: 'Data (metrics & tables)' },
    { name: 'preview', title: 'Page Preview (crawlable + LLM-citable)' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ---- Content ----
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Full title including period, e.g. "Carrier Retention Index Scorecard, Q1 2026"',
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      description: 'Should include the period for recurring series, e.g. "carrier-retention-index-q1-2026"',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'series',
      type: 'string',
      title: 'Series Name',
      description: 'Group recurring scorecards under one series, e.g. "Carrier Retention Index". All editions share this string.',
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'period',
      type: 'string',
      title: 'Reporting Period',
      description: 'e.g. "Q1 2026", "January 2026", "Annual 2026"',
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'author',
      type: 'reference',
      title: 'Author / Research Lead',
      to: [{ type: 'author' }],
      group: 'content',
    },
    {
      name: 'coverImage',
      type: 'image',
      title: 'Cover Image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }],
      validation: (Rule: any) => Rule.required(),
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
      description: 'One-paragraph card description / meta description fallback. 50–160 characters.',
      validation: (Rule: any) => Rule.required().min(50).max(160),
      group: 'content',
    },
    {
      name: 'funnelStage',
      type: 'string',
      title: 'Funnel Stage',
      options: {
        list: [
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
      name: 'pdfFile',
      type: 'file',
      title: 'PDF Scorecard (gated)',
      description: 'The full PDF version of the scorecard. Delivered only via the tokenized download email link.',
      options: { accept: 'application/pdf' },
      validation: (Rule: any) => Rule.required(),
      group: 'content',
    },
    {
      name: 'relatedWhitePapers',
      type: 'array',
      title: 'Related White Papers',
      description: 'Up to 2 related papers shown on the detail page for cross-promotion.',
      of: [{ type: 'reference', to: [{ type: 'whitePaper' }] }],
      validation: (Rule: any) => Rule.max(2),
      group: 'content',
    },

    // ---- Data (the LLM-citable money zone) ----
    {
      name: 'headlineMetrics',
      type: 'array',
      title: 'Headline Metrics',
      description: '3–6 big-number tiles displayed at the top of the page. This is the most-cited part of the page by LLMs.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Label', validation: (Rule: any) => Rule.required() },
            { name: 'value', type: 'string', title: 'Value (e.g. "87.3%")', validation: (Rule: any) => Rule.required() },
            { name: 'change', type: 'string', title: 'Change vs. previous period (e.g. "+2.1pp")' },
            {
              name: 'changeDirection',
              type: 'string',
              title: 'Change Direction',
              options: {
                list: [
                  { title: 'Up', value: 'up' },
                  { title: 'Down', value: 'down' },
                  { title: 'Flat', value: 'flat' },
                ],
                layout: 'radio',
              },
            },
            { name: 'source', type: 'string', title: 'Source / Attribution' },
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
      validation: (Rule: any) => Rule.required().min(3).max(6),
      group: 'data',
    },
    {
      name: 'dataTables',
      type: 'array',
      title: 'Data Tables',
      description: 'Structured tables rendered as real HTML <table> elements (critical for AI SEO).',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'caption', type: 'string', title: 'Table Caption', validation: (Rule: any) => Rule.required() },
            {
              name: 'columns',
              type: 'array',
              title: 'Column Headers',
              of: [{ type: 'string' }],
              validation: (Rule: any) => Rule.required().min(2),
            },
            {
              name: 'rows',
              type: 'array',
              title: 'Rows',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'cells', type: 'array', of: [{ type: 'string' }], title: 'Cells' },
                  ],
                  preview: {
                    select: { cells: 'cells' },
                    prepare(s: any) {
                      return { title: (s.cells || []).join(' | ') }
                    },
                  },
                },
              ],
              validation: (Rule: any) => Rule.required().min(1),
            },
          ],
          preview: { select: { title: 'caption' } },
        },
      ],
      group: 'data',
    },
    {
      name: 'chartImages',
      type: 'array',
      title: 'Chart Images',
      description: 'Data visualizations as images. Always include descriptive alt text.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text', validation: (Rule: any) => Rule.required() },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
      ],
      group: 'data',
    },

    // ---- Preview content ----
    {
      name: 'tldr',
      type: 'text',
      title: 'TL;DR / Executive Summary',
      description: '2–3 sentence summary describing the headline finding.',
      validation: (Rule: any) => Rule.required().max(280),
      group: 'preview',
    },
    {
      name: 'keyFindings',
      type: 'array',
      title: 'Key Findings',
      description: '3–5 bullet points.',
      of: [{ type: 'string' }],
      validation: (Rule: any) => Rule.required().min(3).max(5),
      group: 'preview',
    },
    {
      name: 'methodology',
      type: 'array',
      title: 'Methodology',
      description: 'How the data was collected and analyzed. Builds authority for LLM citation.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H3', value: 'h3' },
          ],
        },
      ],
      validation: (Rule: any) => Rule.required(),
      group: 'preview',
    },
    {
      name: 'faqs',
      type: 'array',
      title: 'FAQs',
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
        'Named industry experts quoted alongside the data. Rendered as a visible, crawlable section and surfaced in Article JSON-LD (schema.org mentions + Quotation, with sameAs) so the named people and their organizations can discover the citation.',
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
              description: 'Emitted as schema.org sameAs so Google links the quote to the real person’s entity.',
            },
            { name: 'orgUrl', type: 'url', title: 'Organization URL' },
            { name: 'source', type: 'string', title: 'Source (publication + date)' },
          ],
          preview: { select: { title: 'name', subtitle: 'org' } },
        },
      ],
      group: 'preview',
    },

    // ---- SEO ----
    { name: 'seoTitle', type: 'string', title: 'SEO Title', validation: (Rule: any) => Rule.max(60), group: 'seo' },
    { name: 'seoDescription', type: 'text', title: 'SEO Description', validation: (Rule: any) => Rule.max(160), group: 'seo' },
    { name: 'focusKeyword', type: 'string', title: 'Focus Keyword', group: 'seo' },
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
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }],
      group: 'seo',
    },
    { name: 'canonicalUrl', type: 'url', title: 'Canonical URL', group: 'seo' },
    { name: 'noIndex', type: 'boolean', title: 'No Index', initialValue: false, group: 'seo' },
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'period', media: 'coverImage' },
    prepare(s: any) {
      return { title: s.title, subtitle: s.subtitle ? `Period: ${s.subtitle}` : undefined, media: s.media }
    },
  },
}
