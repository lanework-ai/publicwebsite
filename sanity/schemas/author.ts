export default {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'name',
        maxLength: 96
      }
    },
    {
      name: 'bio',
      type: 'text',
      title: 'Bio',
      validation: (Rule: any) => Rule.max(500)
    },
    {
      name: 'jobTitle',
      type: 'string',
      title: 'Job Title',
      description: 'e.g. "Head of Research". Emitted as schema.org Person.jobTitle for author authority (E-E-A-T).'
    },
    {
      name: 'image',
      type: 'image',
      title: 'Photo',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }],
    },
    {
      name: 'sameAs',
      type: 'array',
      title: 'Profile URLs (sameAs)',
      description: 'LinkedIn, Twitter/X, personal site, etc. Links this author to their real-world entity for search engines.',
      of: [{ type: 'url' }],
    },
  ],
}
