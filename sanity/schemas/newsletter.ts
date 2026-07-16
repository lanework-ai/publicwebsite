export default {
  name: 'newsletterSubscriber',
  title: 'Newsletter Subscriber',
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
      name: 'email',
      type: 'string',
      title: 'Email',
      readOnly: true,
    },
    {
      name: 'subscribedAt',
      type: 'datetime',
      title: 'Subscribed At',
      readOnly: true,
    },
    {
      name: 'isActive',
      type: 'boolean',
      title: 'Active Subscription',
      description: 'Whether this subscriber should receive newsletters',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'subscribedAt',
      isActive: 'isActive',
    },
    prepare(selection: any) {
      const { title, subtitle, isActive } = selection
      const date = subtitle ? new Date(subtitle).toLocaleDateString() : 'Unknown Date'
      const status = isActive ? '✓' : '✗'
      return {
        title: title || 'Unknown Email',
        subtitle: `${status} ${date}`,
      }
    },
  },
}
