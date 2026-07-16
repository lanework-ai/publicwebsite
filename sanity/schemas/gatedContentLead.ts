export default {
  name: 'gatedContentLead',
  title: 'Gated Content Lead',
  type: 'document',
  readOnly: true,
  fields: [
    {
      name: 'postgresId',
      type: 'string',
      title: 'PostgreSQL ID',
      validation: (Rule: any) => Rule.required(),
      readOnly: true,
    },
    {
      name: 'contentType',
      type: 'string',
      title: 'Content Type',
      options: {
        list: [
          { title: 'White Paper', value: 'whitepaper' },
          { title: 'Benchmark', value: 'benchmark' },
        ],
      },
      readOnly: true,
    },
    { name: 'contentSlug', type: 'string', title: 'Content Slug', readOnly: true },
    { name: 'contentTitle', type: 'string', title: 'Content Title', readOnly: true },
    { name: 'email', type: 'string', title: 'Email', readOnly: true },
    { name: 'name', type: 'string', title: 'Name', readOnly: true },
    { name: 'company', type: 'string', title: 'Company', readOnly: true },
    { name: 'utmSource', type: 'string', title: 'UTM Source', readOnly: true },
    { name: 'utmMedium', type: 'string', title: 'UTM Medium', readOnly: true },
    { name: 'utmCampaign', type: 'string', title: 'UTM Campaign', readOnly: true },
    { name: 'utmContent', type: 'string', title: 'UTM Content', readOnly: true },
    { name: 'utmTerm', type: 'string', title: 'UTM Term', readOnly: true },
    { name: 'referrer', type: 'string', title: 'Referrer', readOnly: true },
    { name: 'landingPage', type: 'string', title: 'Landing Page', readOnly: true },
    { name: 'submittedAt', type: 'datetime', title: 'Submitted At', readOnly: true },
    { name: 'downloadedAt', type: 'datetime', title: 'Downloaded At', readOnly: true },
  ],
  preview: {
    select: {
      email: 'email',
      contentTitle: 'contentTitle',
      contentType: 'contentType',
      submittedAt: 'submittedAt',
      downloadedAt: 'downloadedAt',
    },
    prepare(s: any) {
      const date = s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'Unknown date'
      const downloaded = s.downloadedAt ? '✓ downloaded' : '⏳ not downloaded yet'
      const typeLabel = s.contentType === 'benchmark' ? '[Benchmark]' : '[White Paper]'
      return {
        title: s.email || 'Unknown email',
        subtitle: `${typeLabel} ${s.contentTitle || ''} · ${date} · ${downloaded}`,
      }
    },
  },
}
