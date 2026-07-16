import { LegalPage, type LegalSection } from '@/components/labs/LegalPage'

export const metadata = { title: 'Privacy Policy · Lanework' }

const sections: LegalSection[] = [
  {
    heading: '1. Information we collect',
    blocks: [
      { p: 'Lanework gathers several categories of data from users of its website and research platform:' },
      { p: 'Personal information includes names, email addresses, company details, and any information you submit through our contact and subscription forms.' },
      { p: 'Usage data encompasses device specifications, IP addresses, and activity logs with timestamps, collected through privacy-respecting analytics.' },
      { p: 'Third-party data may come from operators and partners who share operational data with us for research.' },
    ],
  },
  {
    heading: '2. How we use your information',
    blocks: [
      { p: 'We use collected data for:' },
      {
        ul: [
          'Responding to inquiries and delivering requested research',
          'Understanding how the site is used and improving it',
          'Sending research updates you have subscribed to',
          'Security, fraud detection, and abuse prevention',
        ],
      },
    ],
  },
  {
    heading: '3. How we share your information',
    blocks: [
      { p: 'Information may be disclosed to:' },
      {
        ul: [
          'Service vendors that help us operate the site and send email',
          'Government agencies when legally required',
          'Acquiring companies during a merger or acquisition',
          'Third parties with your explicit permission',
        ],
      },
      { p: 'We do not sell your personal information.' },
    ],
  },
  {
    heading: '4. Your privacy choices',
    blocks: [
      { p: 'You can:' },
      {
        ul: [
          'Update the information you have shared with us',
          'Unsubscribe from research and marketing emails at any time',
          'Disable location and analytics through your device or browser settings',
          'Request deletion of your data via support@rapidrelay.ai',
        ],
      },
    ],
  },
  {
    heading: '5. Data security',
    blocks: [
      { p: 'We implement industry-standard measures to protect your data from unauthorized access, though complete security cannot be guaranteed.' },
    ],
  },
  {
    heading: '6. Cookies and tracking technologies',
    blocks: [
      { p: 'The site uses cookies and similar technologies for essential functionality and analytics, manageable through your browser settings.' },
    ],
  },
  {
    heading: "7. Children's privacy",
    blocks: [{ p: 'The service is intended for users 18 and older; we do not knowingly collect data from minors.' }],
  },
  {
    heading: '8. International users',
    blocks: [{ p: 'Data may be transferred to and processed in the United States; using the site constitutes consent to this arrangement.' }],
  },
  {
    heading: '9. Policy changes',
    blocks: [{ p: 'Updates to this policy will be communicated via email or a notice on the site; continued use indicates acceptance.' }],
  },
  {
    heading: '10. Contact',
    blocks: [{ p: 'Email: support@rapidrelay.ai' }],
  },
]

export default function LabsPrivacyPolicy() {
  return <LegalPage title="Privacy Policy" effective="Effective January 27, 2025" sections={sections} />
}
