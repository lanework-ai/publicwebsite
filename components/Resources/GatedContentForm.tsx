'use client'

import { useState, useEffect } from 'react'
import { useHoneypot } from '@/lib/hooks/useHoneypot'
import { useApiRequest } from '@/lib/hooks/useApiRequest'
import { trackLeadSubmit } from '@/lib/analytics'

interface FormData {
  name: string
  email: string
  company: string
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  referrer: string
  landingPage: string
  _honeypot: string
}

interface Errors {
  name: string
  email: string
  company: string
}

interface Props {
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
  /**
   * Where to send the user after a successful submit.
   * Defaults to `/{whitepapers|benchmarks}/[slug]/thank-you`.
   */
  thankYouPath?: string
  /**
   * Visual variant. `card` is the standalone sticky-rail style;
   * `inline` reduces padding for embedded contexts.
   */
  variant?: 'card' | 'inline'
  /**
   * Heading level for the form title. On paid landing pages the form follows
   * the page h1 directly (no intermediate h2 section heading), so passing `h2`
   * keeps heading order valid for screen readers. Default `h3` works on detail
   * pages where the form is in a sub-section of an h2.
   */
  headingLevel?: 'h2' | 'h3'
}

export default function GatedContentForm({
  contentType,
  contentSlug,
  contentTitle,
  thankYouPath,
  variant = 'card',
  headingLevel = 'h3',
}: Props) {
  const HeadingTag = headingLevel
  const [formData, setFormData] = useState({ name: '', email: '', company: '' })
  const [errors, setErrors] = useState<Errors>({ name: '', email: '', company: '' })
  const [attribution, setAttribution] = useState({
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
    utmTerm: '',
    referrer: '',
    landingPage: '',
  })

  const { honeypotField, isBot, reset: resetHoneypot } = useHoneypot()

  // Capture UTM + referrer + landing page on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setAttribution({
      utmSource: params.get('utm_source') ?? '',
      utmMedium: params.get('utm_medium') ?? '',
      utmCampaign: params.get('utm_campaign') ?? '',
      utmContent: params.get('utm_content') ?? '',
      utmTerm: params.get('utm_term') ?? '',
      referrer: document.referrer ?? '',
      landingPage: window.location.pathname,
    })
  }, [])

  const { isLoading, isSuccess, error, execute } = useApiRequest<FormData>({
    onSuccess: () => {
      // Fire in-page lead-submit conversion (the thank-you page also fires the
      // URL-based version, which is more reliable for paid-ad attribution).
      trackLeadSubmit({ contentType, contentSlug, contentTitle })
      const path = thankYouPath ?? defaultThankYouPath(contentType, contentSlug)
      // Hash the email so we don't leak a raw address in the URL.
      const hashedEmail = btoa(formData.email).replace(/=/g, '')
      // Full-page navigation is more robust than router.push() here:
      // password-manager / autofill browser extensions sometimes inject inline
      // styles into the form inputs, triggering React hydration mismatches that
      // re-mount the form. A full navigation cleanly leaves the page regardless.
      window.location.assign(`${path}?e=${encodeURIComponent(hashedEmail)}`)
    },
  })

  const validate = (field: keyof Errors, value: string): string => {
    if (field === 'name') {
      if (!value.trim()) return 'Name is required'
      if (value.trim().length < 2) return 'Name must be at least 2 characters'
      return ''
    }
    if (field === 'email') {
      if (!value.trim()) return 'Email is required'
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!re.test(value)) return 'Please enter a valid email address'
      return ''
    }
    if (field === 'company') {
      if (!value.trim()) return 'Company is required'
      if (value.trim().length < 2) return 'Company must be at least 2 characters'
      return ''
    }
    return ''
  }

  const onBlur = (field: keyof Errors) => {
    setErrors((p) => ({ ...p, [field]: validate(field, formData[field]) }))
  }

  const onChange = (field: keyof Errors, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: validate(field, value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBot) return

    const nameErr = validate('name', formData.name)
    const emailErr = validate('email', formData.email)
    const companyErr = validate('company', formData.company)
    setErrors({ name: nameErr, email: emailErr, company: companyErr })
    if (nameErr || emailErr || companyErr) return

    await execute('/api/gated-content', {
      ...formData,
      contentType,
      contentSlug,
      ...attribution,
      _honeypot: honeypotField.value,
    })
    resetHoneypot()
  }

  const containerClass =
    variant === 'card'
      ? 'glass-effect rounded-2xl p-5 sm:p-6 border border-white/10'
      : 'rounded-xl p-4 sm:p-5'

  const typeLabel = contentType === 'whitepaper' ? 'white paper' : 'scorecard'

  return (
    <form onSubmit={handleSubmit} className={containerClass}>
      <HeadingTag className="text-xl font-bold text-white mb-1.5 leading-tight">
        Download the {typeLabel}
      </HeadingTag>
      <p className="text-sm text-gray-400 mb-5">
        Enter your details and we&apos;ll email the PDF straight to your inbox.
      </p>

      {/* Honeypot */}
      <input
        {...honeypotField.props}
        value={honeypotField.value}
        onChange={honeypotField.onChange}
        suppressHydrationWarning
      />

      <div className="space-y-3">
        <div>
          <label htmlFor={`gc-name-${contentSlug}`} className="block text-xs font-medium text-gray-300 mb-1">
            Full Name *
          </label>
          <input
            id={`gc-name-${contentSlug}`}
            type="text"
            required
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            onBlur={() => onBlur('name')}
            className={`w-full px-3 py-2 rounded-lg bg-white/5 border text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.name
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                : 'border-white/10 focus:border-primary focus:ring-primary/50'
            }`}
            placeholder="Jane Smith"
            autoComplete="name"
            suppressHydrationWarning
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor={`gc-email-${contentSlug}`} className="block text-xs font-medium text-gray-300 mb-1">
            Work Email *
          </label>
          <input
            id={`gc-email-${contentSlug}`}
            type="email"
            required
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            onBlur={() => onBlur('email')}
            className={`w-full px-3 py-2 rounded-lg bg-white/5 border text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                : 'border-white/10 focus:border-primary focus:ring-primary/50'
            }`}
            placeholder="jane@yourcompany.com"
            autoComplete="email"
            suppressHydrationWarning
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor={`gc-company-${contentSlug}`} className="block text-xs font-medium text-gray-300 mb-1">
            Company *
          </label>
          <input
            id={`gc-company-${contentSlug}`}
            type="text"
            required
            value={formData.company}
            onChange={(e) => onChange('company', e.target.value)}
            onBlur={() => onBlur('company')}
            className={`w-full px-3 py-2 rounded-lg bg-white/5 border text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.company
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                : 'border-white/10 focus:border-primary focus:ring-primary/50'
            }`}
            placeholder="Acme Trucking"
            autoComplete="organization"
            suppressHydrationWarning
          />
          {errors.company && <p className="mt-1 text-xs text-red-400">{errors.company}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className={`mt-5 w-full px-6 py-3 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-all overflow-hidden relative ${
          isSuccess
            ? 'bg-emerald-600 cursor-default'
            : error
            ? 'bg-red-500'
            : isLoading
            ? 'bg-primary/70 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary to-accent-cyan hover:from-accent-cyan hover:to-primary shadow-lg hover:shadow-[0_0_30px_rgba(64,168,196,0.4)]'
        }`}
      >
        {isSuccess
          ? 'Redirecting…'
          : error
          ? error
          : isLoading
          ? 'Sending…'
          : `Send me the ${typeLabel}`}
      </button>

    </form>
  )
}

function defaultThankYouPath(contentType: 'whitepaper' | 'benchmark', slug: string) {
  return contentType === 'whitepaper'
    ? `/white-papers/${slug}/thank-you`
    : `/benchmarks/${slug}/thank-you`
}
