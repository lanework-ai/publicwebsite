export default {
  name: 'contact',
  title: 'Contact Submission',
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
      name: 'name',
      type: 'string',
      title: 'Name',
      readOnly: true,
    },
    {
      name: 'email',
      type: 'string',
      title: 'Email',
      readOnly: true,
    },
    {
      name: 'company',
      type: 'string',
      title: 'Company',
      readOnly: true,
    },
    {
      name: 'fleetSize',
      type: 'string',
      title: 'Fleet Size',
      readOnly: true,
    },
    {
      name: 'message',
      type: 'text',
      title: 'Message',
      readOnly: true,
    },
    {
      name: 'submittedAt',
      type: 'datetime',
      title: 'Submitted At',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'company',
      description: 'email',
    },
    prepare(selection: any) {
      const { title, subtitle, description } = selection
      return {
        title: title || 'Unknown',
        subtitle: `${subtitle} - ${description}`,
      }
    },
  },
}
