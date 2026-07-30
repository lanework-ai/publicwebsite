import { LegalPage, type LegalSection } from '@/components/labs/LegalPage'
import { lw } from '@/lib/labs/config'

export const metadata = { title: 'Terms & Conditions · Lanework' }

/**
 * Rewritten to describe this site as it actually exists. Two sections were removed
 * rather than edited:
 *
 *   - "Financial terms" set out fees, non-refundable billing, and price changes with
 *     notice. Nothing on this site is for sale, no fee figures are published (a
 *     deliberate positioning decision), and paid work is governed by a signed
 *     engagement agreement, which section 7 now says instead.
 *   - "Account management" covered account termination and credential security. There
 *     are no accounts: there is no login, no admin surface, and no middleware gate.
 *
 * Added instead: a research disclaimer, because the papers publish modelled dollar
 * figures; a licence for that research; and a third-party trademark notice, because
 * vendor and carrier marks appear on the field work pages.
 *
 * TODO: confirm the registered legal entity and the governing jurisdiction. The
 * inherited "Ohio law" clause is carried forward below but has not been verified.
 */
const sections: LegalSection[] = [
  {
    heading: '1. These terms',
    blocks: [
      { p: 'These terms govern your use of lanework.ai and the research we publish on it. By using the site you agree to them. If you do not agree, please do not use the site.' },
      { p: 'Lanework is an applied research lab for logistics and supply chain operations. The site exists to publish research, describe the engagements we run, and give you a way to get in touch. There is nothing to buy here and no account to create.' },
    ],
  },
  {
    heading: '2. Acceptable use',
    blocks: [
      { p: 'You agree to:' },
      {
        ul: [
          'be 18 or older',
          'give accurate information when you contact us or request a paper',
          'use the site lawfully, and not to attempt to breach or probe its security',
          'not scrape or bulk-download the site in a way that degrades it for others',
          'not misrepresent yourself or your organization',
        ],
      },
      { p: 'We may restrict access where use breaches these terms.' },
    ],
  },
  {
    heading: '3. Our research is information, not advice',
    blocks: [
      { p: 'Our papers, benchmarks, and notes contain estimates and models, including figures expressed in dollars. Those figures are derived from public data sources and from our own modelling, and they describe patterns we observed rather than results you should expect.' },
      { p: 'Nothing we publish is investment, financial, legal, tax, or other professional advice, and nothing in it is a guarantee of any outcome. We are not licensed advisers. Do not make an investment or operational decision on the basis of a published paper alone; take your own advice and test the assumptions against your own operation.' },
      { p: 'Where a paper cites a third-party source, that source is credited and we do not warrant its accuracy.' },
    ],
  },
  {
    heading: '4. Using and citing our research',
    blocks: [
      { p: 'You may read, download, and share our published research, and you may quote from it in your own work, provided you credit Lanework and, where possible, link to the original page. That permission covers internal use inside your organization as well.' },
      { p: 'You may not resell it, present it as your own work, remove attribution, put it behind your own paywall, or use it to train a model for commercial redistribution. Everything else on the site, including the Lanework name, marks, copy, and code, remains ours.' },
    ],
  },
  {
    heading: '5. Third-party names and marks',
    blocks: [
      { p: 'We name third-party systems, platforms, and carriers on this site, and we display their marks where we have their files. Those names and marks belong to their respective owners.' },
      { p: 'Their appearance indicates compatibility or an integration, not endorsement, sponsorship, or a customer relationship, and it does not imply any partnership beyond what the page says explicitly. If you own a mark shown here and would like it removed, tell us and we will action it.' },
    ],
  },
  {
    heading: '6. Email you receive from us',
    blocks: [
      { p: 'Requesting a paper or subscribing to updates means we will email you: the paper itself, a short follow-up sequence about the research behind it, and the notes you signed up for. Every one of those carries an unsubscribe link that works immediately.' },
      { p: 'How we handle the personal data behind that is set out in the Privacy Policy.' },
    ],
  },
  {
    heading: '7. Engagements are governed separately',
    blocks: [
      { p: 'These terms cover the website and the research on it. They do not govern paid work.' },
      { p: 'Where we run a study, an assessment, a diligence exercise, or an advisory engagement, the scope, fees, deliverables, confidentiality, data handling, and intellectual property are set out in a separate written agreement signed by both parties. That agreement prevails over these terms for anything it covers. Descriptions of engagements on this site are indicative and are not an offer.' },
    ],
  },
  {
    heading: '8. The site is provided as is',
    blocks: [
      { p: 'The site and its content are provided "as is" and "as available", without warranties of any kind, express or implied, including fitness for a particular purpose. We do not warrant that the site will be uninterrupted or error free, and we may change or withdraw content at any time.' },
      { p: 'To the fullest extent the law allows, Lanework is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenue, or data, arising from your use of or inability to use the site or from reliance on anything published here. Nothing in these terms excludes liability that cannot lawfully be excluded.' },
    ],
  },
  {
    heading: '9. Links out',
    blocks: [
      { p: 'We link to third-party sites, including a live product demo. We do not control them and are not responsible for their content, availability, or privacy practices. Follow those links at your own discretion.' },
    ],
  },
  {
    heading: '10. Changes to these terms',
    blocks: [
      { p: 'We may update these terms. When we do, the effective date above changes, and material changes will be flagged on the site. Continued use after a change indicates acceptance.' },
    ],
  },
  {
    heading: '11. Governing law',
    blocks: [
      { p: 'These terms are governed by the laws of the State of Ohio, and disputes are to be resolved by arbitration administered by the American Arbitration Association in Ohio, except that either party may seek injunctive relief in a court of competent jurisdiction to protect its intellectual property or confidential information.' },
    ],
  },
  {
    heading: '12. Contact',
    blocks: [
      { p: 'Questions about these terms, or a request to remove a mark or a citation, can be sent through the contact form and will reach the team directly.' },
      { p: 'Contact form:', link: { href: lw('/connect'), label: 'lanework.ai/connect' } },
    ],
  },
]

export default function LabsTerms() {
  return <LegalPage title="Terms & Conditions" effective="Effective July 30, 2026" sections={sections} />
}
