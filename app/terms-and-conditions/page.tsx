import { LegalPage, type LegalSection } from '@/components/labs/LegalPage'
import { lw } from '@/lib/labs/config'

export const metadata = { title: 'Terms & Conditions · Lanework' }

const sections: LegalSection[] = [
  {
    heading: 'Terms of service',
    blocks: [
      { p: "These Terms of Service govern your access to and use of Lanework's website, research, and platforms. By accessing or using our services, you agree to be bound by these terms." },
    ],
  },
  {
    heading: 'Service definition',
    blocks: [
      { p: 'Lanework is an applied research lab for logistics. We publish research and operate software products that prove that research in production. The website provides research, product information, and ways to work with us.' },
    ],
  },
  {
    heading: 'User obligations',
    blocks: [
      { p: 'Users must:' },
      {
        ul: [
          'Be 18 years of age or older',
          'Provide truthful and accurate information',
          'Maintain the security and confidentiality of any account credentials',
          'Refrain from illegal activity, hacking attempts, harassment, or content theft',
        ],
      },
    ],
  },
  {
    heading: 'Content ownership',
    blocks: [
      { p: 'All content, trademarks, features, and functionality on the site are the exclusive property of Lanework and its partners, with only limited personal use permitted. Research we publish may be shared with attribution.' },
    ],
  },
  {
    heading: 'Financial terms',
    blocks: [
      { p: 'Where products or services carry fees, those fees are billed as agreed and are generally non-refundable. We reserve the right to modify pricing with advance notice.' },
    ],
  },
  {
    heading: 'Liability limitations',
    blocks: [
      { p: 'The site and research are offered "as is" without guarantees. We disclaim responsibility for third-party data accuracy and disclaim liability for damages arising from use of, or inability to use, the site.' },
    ],
  },
  {
    heading: 'Account management',
    blocks: [
      { p: 'Users may request account termination through our contact form. Lanework retains the right to suspend or terminate access for policy violations.' },
    ],
  },
  {
    heading: 'Legal framework',
    blocks: [{ p: 'Ohio law governs these terms, with dispute resolution through American Arbitration Association proceedings in Ohio.' }],
  },
  {
    heading: 'Contact',
    blocks: [{ p: 'For questions regarding these Terms of Service, reach us through our contact form:', link: { href: lw('/connect'), label: 'Contact us' } }],
  },
]

export default function LabsTerms() {
  return <LegalPage title="Terms & Conditions" effective="Effective January 27, 2025" sections={sections} />
}
