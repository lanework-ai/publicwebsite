'use client'

import { useState } from 'react'
import { useHoneypot } from '@/lib/hooks/useHoneypot'
import { useApiRequest } from '@/lib/hooks/useApiRequest'

interface NewsletterPayload {
  email: string
  _honeypot: string
  brand: string
}

/**
 * Lanework research subscribe form — posts to the shared /api/newsletter
 * (subscription + welcome + drip infra). Dark, monospace, on-brand.
 */
export default function LabsNewsletter() {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const { honeypotField, isBot, reset: resetHoneypot } = useHoneypot()
  const { isLoading, isSuccess, error: apiError, execute, reset: resetApi } = useApiRequest<NewsletterPayload>({
    onSuccess: () => setTimeout(() => { setEmail(''); resetHoneypot(); resetApi() }, 6000),
    onError: () => setTimeout(() => resetApi(), 4000),
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBot) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr('Enter a valid email address')
      return
    }
    setErr('')
    await execute('/api/newsletter', { email: email.trim(), _honeypot: honeypotField.value, brand: 'lanework' })
  }

  return (
    <div style={{ border: '1px solid rgba(127,149,255,0.3)', borderRadius: 12, padding: '26px 24px', background: 'var(--lw-panel-accent)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lw-accent-soft)', marginBottom: 10 }}>
        Subscribe
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', margin: '0 0 8px', color: 'var(--lw-fg)' }}>
        New research in your inbox
      </h2>
      <p style={{ fontSize: 14, color: 'var(--lw-muted)', lineHeight: 1.6, margin: '0 0 18px', maxWidth: 460 }}>
        White papers and benchmarks as they ship. One or two emails a month, no sales pitch.
      </p>
      <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: 460 }}>
        <input {...honeypotField.props} value={honeypotField.value} onChange={honeypotField.onChange} tabIndex={-1} aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Email address"
          style={{ flex: 1, minWidth: 200, background: 'var(--lw-panel)', border: '1px solid var(--lw-line-2)', borderRadius: 6, padding: '11px 13px', color: 'var(--lw-fg)', fontSize: 14, fontFamily: 'inherit' }}
        />
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em', background: 'var(--lw-fg)', color: 'var(--lw-bg)', padding: '11px 18px', borderRadius: 6, border: 'none', cursor: isLoading || isSuccess ? 'default' : 'pointer', whiteSpace: 'nowrap', opacity: isLoading ? 0.6 : 1 }}
        >
          {isSuccess ? 'Subscribed ✓' : isLoading ? 'Subscribing…' : 'Subscribe →'}
        </button>
      </form>
      {(err || apiError) && !isSuccess && (
        <p style={{ fontSize: 12.5, color: '#ff8585', margin: '10px 0 0' }}>{err || 'Something went wrong. Please try again.'}</p>
      )}
    </div>
  )
}
