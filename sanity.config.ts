import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { sendNewsletterAction } from './sanity/actions/sendNewsletterAction'
import { projectId, dataset } from './sanity/env'

export default defineConfig({
  name: 'default',
  title: 'Rapid Relay Admin',

  // Studio is embedded in the Next.js app at /admin/studio (see
  // app/admin/studio/[[...tool]]/page.tsx). This is the canonical Studio.
  basePath: '/admin/studio',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Blog content
            S.listItem()
              .title('Blog Posts')
              .child(S.documentTypeList('post').title('Blog Posts')),
            S.listItem()
              .title('White Papers')
              .child(S.documentTypeList('whitePaper').title('White Papers')),
            S.listItem()
              .title('Benchmarks')
              .child(S.documentTypeList('benchmark').title('Benchmarks')),
            S.listItem()
              .title('Authors')
              .child(S.documentTypeList('author').title('Authors')),
            S.listItem()
              .title('Categories')
              .child(S.documentTypeList('category').title('Categories')),
            S.divider(),
            // Read-only submissions
            S.listItem()
              .title('Contact Submissions')
              .child(
                S.documentTypeList('contact')
                  .title('Contact Submissions')
                  .menuItems([])
              ),
            S.listItem()
              .title('Newsletter Subscribers')
              .child(
                S.documentTypeList('newsletterSubscriber')
                  .title('Newsletter Subscribers')
                  .menuItems([])
              ),
            S.listItem()
              .title('Gated Content Leads')
              .child(
                S.documentTypeList('gatedContentLead')
                  .title('Gated Content Leads (White Papers + Benchmarks)')
                  .menuItems([])
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      // Add send newsletter action to post documents
      if (context.schemaType === 'post') {
        return [...prev, sendNewsletterAction]
      }

      // Keep only delete action for read-only documents (synced from PostgreSQL)
      if (
        context.schemaType === 'contact' ||
        context.schemaType === 'newsletterSubscriber' ||
        context.schemaType === 'gatedContentLead'
      ) {
        return prev.filter(
          ({ action }) => action === 'delete'
        )
      }

      return prev
    },
    badges: (prev, context) => {
      // Hide publish/draft badges for synced read-only documents
      if (
        context.schemaType === 'contact' ||
        context.schemaType === 'newsletterSubscriber' ||
        context.schemaType === 'gatedContentLead'
      ) {
        return []
      }
      return prev
    },
  },
})
