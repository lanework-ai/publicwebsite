'use client'

import { useState } from 'react'
import { useApiRequest } from '@/lib/hooks/useApiRequest'
import { trackLeadSubmit } from '@/lib/analytics'

interface GatedPayload {
  name: string
  email: string
  company: string
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  brand: string
}

/**
 * Lanework gated-download form. Posts to the shared /api/gated-content endpoint
 * (emails a tokenized PDF link), then routes to the thank-you page. DS-styled.
 */
export default function LabsGatedForm({
  contentType,
  contentSlug,
  contentTitle,
  thankYouPath,
}: {
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
  thankYouPath: string
}) {
  const [form, setForm] = useState({ name: '', email: '', company: '' })
  const [err, setErr] = useState('')
  const { isLoading, isSuccess, error: apiError, execute } = useApiRequest<GatedPayload>({
    onSuccess: () => {
      trackLeadSubmit({ contentType, contentSlug, contentTitle })
      window.location.href = thankYouPath
    },
  })

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.company.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErr('Please fill in every field with a valid work email.')
      return
    }
    setErr('')
    await execute('/api/gated-content', {
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      contentType,
      contentSlug,
      brand: 'lanework',
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--lw-panel)',
    border: '1px solid var(--lw-line-2)',
    borderRadius: 6,
    padding: '10px 12px',
    color: 'var(--lw-fg)',
    fontSize: 13.5,
    fontFamily: 'inherit',
  }

  return (
    <div style={{ border: '1px solid var(--lw-line-2)', borderRadius: 12, padding: 22 }}>
      <div className="ll-label" style={{ fontSize: 10.5, marginBottom: 12 }}>Get the full paper</div>
      <p style={{ fontSize: 13, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 16px' }}>
        The complete PDF, emailed to you. No spam.
      </p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <input style={inputStyle} placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} aria-label="Full name" />
        <input style={inputStyle} type="email" placeholder="Work email" value={form.email} onChange={(e) => set('email', e.target.value)} aria-label="Work email" />
        <input style={inputStyle} placeholder="Company" value={form.company} onChange={(e) => set('company', e.target.value)} aria-label="Company" />
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.06em', background: 'var(--lw-fg)', color: 'var(--lw-bg)', padding: '11px 14px', borderRadius: 6, border: 'none', cursor: isLoading || isSuccess ? 'default' : 'pointer', marginTop: 2, opacity: isLoading ? 0.6 : 1 }}
        >
          {isSuccess ? 'Sent ✓' : isLoading ? 'Sending…' : 'Email me the paper →'}
        </button>
      </form>
      {(err || apiError) && !isSuccess && (
        <p style={{ fontSize: 12, color: '#ff8585', margin: '10px 0 0' }}>{err || 'Something went wrong. Please try again.'}</p>
      )}
    </div>
  )
}
