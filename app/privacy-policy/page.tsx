import { LegalPage, type LegalSection } from '@/components/labs/LegalPage'
import { lw } from '@/lib/labs/config'

export const metadata = { title: 'Privacy Policy · Lanework' }

/**
 * Written against what this site actually does rather than a generic template: the
 * named processors are the services really in the request path (Netlify, Supabase via
 * Prisma, Sanity, Resend, PostHog), and the disclosures cover the two things the code
 * does that a reader would not guess, namely hashing client IPs for contact-form abuse
 * limiting (lib/spam.ts) and enrolling white-paper downloads in a short email sequence
 * (lib/labs-email.ts).
 *
 * TODO: replace "Lanework" with the registered legal entity and its address once
 * confirmed. A named controller is expected under GDPR and CCPA.
 */
const sections: LegalSection[] = [
  {
    heading: '1. Who we are',
    blocks: [
      { p: 'Lanework is an applied research lab for logistics and supply chain operations. This policy covers lanework.ai and the research, engagement, and subscription forms on it. Lanework is the controller of the personal data described below.' },
      { p: 'We are not a consumer service and we do not run advertising. The personal data we hold is almost entirely what an operator or investor chose to send us in order to start a conversation or receive a paper.' },
    ],
  },
  {
    heading: '2. Information we collect',
    blocks: [
      { p: 'Information you give us. When you use the contact form, request a white paper, or subscribe to research updates, we collect your name, work email, company, an optional fleet size, and whatever you write in the message field.' },
      { p: 'Information collected automatically. Server logs from our host record requests, including a truncated technical footprint of your browser and network. Product analytics record which pages were viewed and which links were used.' },
      { p: 'A hashed identifier derived from your IP address. To stop repeated automated submissions, the contact form stores a one-way SHA-256 hash of your IP address combined with a secret salt. The raw IP address is not written to our database, and the hash is used only to count recent submissions and detect duplicates.' },
      { p: 'Operational data from research partners. Where an operator engages us, we work with data drawn from their own systems under the terms of that engagement. That data is governed by the agreement with them, not by this policy, and it is not used to build profiles of individuals.' },
    ],
  },
  {
    heading: '3. Why we process it, and on what basis',
    blocks: [
      { p: 'We process personal data to:' },
      {
        ul: [
          'reply to an enquiry and scope work with you, which is necessary to take steps at your request',
          'deliver a paper you asked for and, where you opted in, a short follow-up sequence about the research behind it',
          'send research updates you subscribed to, on the basis of your consent',
          'keep the site secure and prevent automated abuse, which is our legitimate interest',
          'understand how the site is used so we can improve it',
          'meet legal and accounting obligations',
        ],
      },
      { p: 'We do not sell personal information, we do not share it for cross-context behavioural advertising, and we do not make automated decisions about you.' },
    ],
  },
  {
    heading: '4. The services that process data for us',
    blocks: [
      { p: 'We keep the list of processors short and name them rather than describing them vaguely:' },
      {
        ul: [
          'Netlify, which hosts the site and produces request logs',
          'Supabase, which hosts the PostgreSQL database holding form submissions and subscriptions',
          'Sanity, our content platform, which also holds a mirror of submissions so the team can work them',
          'Resend, which delivers transactional email, gated download links, and research updates',
          'PostHog, which provides product analytics',
        ],
      },
      { p: 'Each acts on our instructions under a data processing agreement. Beyond these, we disclose personal data only where the law requires it, to professional advisers under a duty of confidence, or to an acquirer in the event of a merger or acquisition.' },
    ],
  },
  {
    heading: '5. Email, consent, and unsubscribing',
    blocks: [
      { p: 'Requesting a gated white paper enrols you in a short sequence of follow-up emails about that research. Subscribing to research updates adds you to the notes list. These are separate from any correspondence about an active engagement.' },
      { p: 'Every marketing and research email carries a one-click unsubscribe header and a visible unsubscribe link. Using either removes you from the newsletter and stops any follow-up sequence immediately, and it also suppresses the address against future sends.' },
      { p: 'You do not need to email anyone to unsubscribe, but if a link ever fails, tell us and we will action it by hand.' },
    ],
  },
  {
    heading: '6. How long we keep it',
    blocks: [
      { p: 'Enquiries and the correspondence attached to them are kept for as long as there is a live commercial relationship and for a reasonable period afterwards, so that we can pick up a conversation where it left off.' },
      { p: 'Subscription records are kept until you unsubscribe, after which we retain a suppression record so we do not contact you again by mistake. The hashed IP identifier is stored alongside the enquiry it came with and is only ever read within a short rolling window, one hour for rate limiting and 24 hours for duplicate detection. Analytics data is retained on our provider’s standard schedule.' },
      { p: 'Where we no longer need personal data, we delete it or reduce it to a form that no longer identifies you.' },
    ],
  },
  {
    heading: '7. Your rights',
    blocks: [
      { p: 'Depending on where you live, you may have the right to:' },
      {
        ul: [
          'ask what personal data we hold about you and get a copy',
          'have inaccurate data corrected',
          'have your data deleted',
          'object to or restrict processing, including profiling',
          'withdraw consent at any time, which for email is the unsubscribe link',
          'ask us to transfer your data to you or another provider',
          'complain to your data protection authority',
        ],
      },
      { p: 'Exercising any of these rights is free and will not result in worse treatment. We aim to respond within 30 days, and we will tell you if we need longer. We may need to verify your identity first.' },
    ],
  },
  {
    heading: '8. Cookies and analytics',
    blocks: [
      { p: 'The site uses cookies for essential functionality and for product analytics. We do not use advertising cookies and we do not run third-party ad trackers.' },
      { p: 'You can block or delete cookies in your browser. We honour Global Privacy Control and Do Not Track signals where your browser sends them.' },
    ],
  },
  {
    heading: '9. Security',
    blocks: [
      { p: 'Data is encrypted in transit, access to production systems is limited to the people who need it, and secrets are held in the hosting environment rather than in our code. We store a salted hash instead of a raw IP address wherever an identifier is all we need.' },
      { p: 'No system is perfectly secure, and we will not pretend otherwise. If a breach affects your personal data we will notify you and the relevant regulator as required.' },
    ],
  },
  {
    heading: '10. International transfers',
    blocks: [
      { p: 'We are based in North America and our processors are largely United States based, so your data may be transferred to and processed in the United States. Where data moves out of the UK or the European Economic Area, we rely on the appropriate safeguards, including standard contractual clauses.' },
    ],
  },
  {
    heading: '11. Children',
    blocks: [
      { p: 'This is a business-to-business site intended for people aged 18 and over. We do not knowingly collect personal data from children, and we will delete it if we discover we have.' },
    ],
  },
  {
    heading: '12. Changes to this policy',
    blocks: [
      { p: 'If we change this policy we will update the effective date above, and we will give notice on the site or by email where the change is significant. Continued use of the site after a change indicates acceptance of the updated policy.' },
    ],
  },
  {
    heading: '13. Contact and data requests',
    blocks: [
      { p: 'To ask a question about this policy, exercise any of the rights in section 7, or report a concern, use the contact form and say what you need. Requests about your data are handled by the team directly and we aim to reply within 30 days.' },
      { p: 'Contact form:', link: { href: lw('/connect'), label: 'lanework.ai/connect' } },
    ],
  },
]

export default function LabsPrivacyPolicy() {
  return <LegalPage title="Privacy Policy" effective="Effective July 30, 2026" sections={sections} />
}
