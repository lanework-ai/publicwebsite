import { DocumentActionComponent } from 'sanity'
import { EnvelopeIcon } from '@sanity/icons'
import { siteUrl, newsletterApiKey } from '../env'

interface PostDocument {
  _id: string
  _type: string
  slug?: {
    current: string
  }
  title?: string
  excerpt?: string
  readTime?: string
  publishedAt?: string
  noIndex?: boolean
  mainImage?: {
    asset?: {
      _id: string
      url: string
    }
    alt?: string
  }
  categories?: Array<{
    _ref: string
    _type: string
  }>
}

export const sendNewsletterAction: DocumentActionComponent = (props) => {
  const { type, draft, published } = props

  // Only show for post documents
  if (type !== 'post') {
    return null
  }

  // Use the published document or draft
  const doc = (published || draft) as PostDocument | undefined

  // Only show if post is published and not marked as noIndex
  const isPublished = doc?.publishedAt
  const isNoIndex = doc?.noIndex

  if (!isPublished || isNoIndex) {
    return null
  }

  return {
    label: 'Send Newsletter',
    icon: EnvelopeIcon,
    onHandle: async () => {
      const slug = doc?.slug?.current
      const title = doc?.title

      if (!slug || !title) {
        return
      }

      // Check if already sent
      try {
        const checkResponse = await fetch(
          `${siteUrl}/api/newsletter/check?slug=${slug}`
        )

        if (!checkResponse.ok) {
          console.error('Check response status:', checkResponse.status)
          const text = await checkResponse.text()
          console.error('Check response body:', text)
        } else {
          const checkData = await checkResponse.json()

          if (checkData.alreadySent) {
            // Show info dialog
            const confirmed = window.confirm(
              `Newsletter for "${title}" has already been sent to ${checkData.recipientCount} subscribers on ${new Date(
                checkData.sentAt
              ).toLocaleDateString()}.\n\nDo you want to send it again?`
            )

            if (!confirmed) {
              return
            }
          }
        }
      } catch (error) {
        console.error('Error checking newsletter status:', error)
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Send newsletter for "${title}" to all subscribers?\n\nThis will send an email to everyone subscribed to your newsletter.`
      )

      if (!confirmed) {
        return
      }

      // Send newsletter
      try {
        // console.log('Sending newsletter request to:', `${siteUrl}/api/newsletter/send`)
        // console.log('Using API key:', newsletterApiKey ? 'Set' : 'Not set')

        const response = await fetch(
          `${siteUrl}/api/newsletter/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': newsletterApiKey,
            },
            body: JSON.stringify({
              postId: doc._id,
              slug: slug,
              title: title,
              excerpt: doc.excerpt || '',
              readTime: doc.readTime,
              mainImageUrl: doc.mainImage?.asset?.url,
            }),
          }
        )

        // console.log('Response status:', response.status)
        // console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const text = await response.text()
          console.error('Error response body:', text)
          alert(`Failed to send newsletter: Server returned ${response.status}\n\nCheck browser console for details.`)
          return
        }

        const data = await response.json()

        if (data.success) {
          if (data.alreadySent) {
            // Newsletter was already sent previously
            alert(`Newsletter for "${title}" has already been sent.`)
          } else if (data.results) {
            // Newsletter sent successfully
            alert(
              `Newsletter sent successfully!\n\n✓ Sent to: ${data.results.sent} subscribers\n${
                data.results.failed > 0 ? `✗ Failed: ${data.results.failed}` : ''
              }`
            )
          } else {
            // Success but no results (unexpected)
            alert('Newsletter sent successfully!')
          }
        } else {
          alert(`Failed to send newsletter: ${data.message}`)
        }
      } catch (error) {
        console.error('Error sending newsletter:', error)
        alert(`Failed to send newsletter: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck browser console for details.`)
      }
    },
  }
}
