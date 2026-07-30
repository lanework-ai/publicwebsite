'use client'

import { useState } from 'react'

const intents = [
  { value: 'snapshot', label: 'Readiness snapshot (free)' },
  { value: 'assessment', label: 'Network assessment' },
  { value: 'fulfillment', label: 'Fulfillment performance diagnostic' },
  { value: 'diligence', label: 'Operational due diligence (investors)' },
  { value: 'advisory', label: 'Fractional analytics advisory' },
  { value: 'platform', label: 'Deploy a proof (Rapid Relay / Rapid Load)' },
  { value: 'careers', label: 'Join the team' },
  { value: 'other', label: 'Something else' },
]

const fleetSizes = ['20-100', '100-250', '250-500', '500-1000', '1000+']

/** Intents where the fleet-size question is worth asking. */
const CARRIER_INTENTS = new Set(['snapshot', 'assessment', 'advisory', 'platform'])

export default function LabsConnect() {
  // fleetSize starts blank: the field is optional, so nobody is defaulted into a
  // band that does not describe their operation.
  const [form, setForm] = useState({ name: '', email: '', company: '', intent: 'snapshot', fleetSize: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [honeypot, setHoneypot] = useState('')
  // Mount timestamp for the API's submit-timing gate. Without it the route reads
  // NaN elapsed and silently drops the submission, so this is required, not extra.
  const [formLoadedAt] = useState(() => Date.now())

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const intentLabel = intents.find((i) => i.value === form.intent)?.label ?? form.intent
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // fleetSize is sent only when the field was shown AND answered. An investor,
          // fulfillment, or careers enquiry records no truck count instead of a
          // misleading default, and an unanswered field must be omitted rather than
          // sent as '' which would fail the API's band allowlist. It renders as its
          // own row in the admin notification, so it is not repeated in the message.
          name: form.name,
          email: form.email,
          company: form.company,
          ...(CARRIER_INTENTS.has(form.intent) && form.fleetSize ? { fleetSize: form.fleetSize } : {}),
          message: `Intent: ${intentLabel}\n\n${form.message || '(no message)'}`,
          _honeypot: honeypot,
          formLoadedAt,
        }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--lw-panel)',
    border: '1px solid var(--lw-line-2)',
    borderRadius: 6,
    padding: '11px 13px',
    color: 'var(--lw-fg)',
    fontSize: 16,
    fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 14, color: 'var(--lw-muted)', marginBottom: 7 }

  return (
    <section className="ll-section" style={{ paddingTop: 60, paddingBottom: 56, maxWidth: 640 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, letterSpacing: '0.22em', color: 'var(--lw-accent-soft)', marginBottom: 20 }}>
        WORK WITH US
      </div>
      <h1 style={{ fontSize: 'clamp(32px, 4.4vw, 43px)', lineHeight: 1.12, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
        Start with a study.
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--lw-muted)', margin: '0 0 36px' }}>
        The easiest way in is a question. Bring us one, or your data, and we forward-deploy a small
        team on one bounded problem: we work it alongside your operators, improve the process, and show
        you the result. Platform deployments and roles too. No sales pitch, and we typically reply
        within one business day.
      </p>

      {status === 'sent' ? (
        <div style={{ border: '1px solid rgba(127,149,255,0.35)', borderRadius: 10, padding: 28, background: 'var(--lw-panel-accent)' }}>
          <div style={{ fontWeight: 500, fontSize: 17, marginBottom: 8 }}>Thanks, message received.</div>
          <p style={{ fontSize: 16, color: 'var(--lw-muted)', margin: 0 }}>We read every note and will be in touch shortly.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 18 }}>
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
          />
          <div>
            <label style={labelStyle} htmlFor="ll-name">Full name</label>
            <input id="ll-name" required style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jane Smith" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="ll-email">Work email</label>
            <input id="ll-email" type="email" required style={inputStyle} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@company.com" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="ll-company">Company / organization</label>
            <input id="ll-company" required style={inputStyle} value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Your organization" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="ll-intent">I&rsquo;d like to</label>
            <select id="ll-intent" style={inputStyle} value={form.intent} onChange={(e) => set('intent', e.target.value)}>
              {intents.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
          {CARRIER_INTENTS.has(form.intent) && (
            <div>
              <label style={labelStyle} htmlFor="ll-fleet">Fleet size (optional)</label>
              <select id="ll-fleet" style={inputStyle} value={form.fleetSize} onChange={(e) => set('fleetSize', e.target.value)}>
                {/* Blank default so nobody is forced into a band that does not describe
                    them. The API treats fleetSize as optional and stores null. */}
                <option value="">Prefer not to say</option>
                {fleetSizes.map((s) => <option key={s} value={s}>{s} trucks</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={labelStyle} htmlFor="ll-msg">What&rsquo;s on your mind?</label>
            <textarea id="ll-msg" rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="A research question, a network you're thinking about, a role you're curious about." />
          </div>
          {status === 'error' && (
            <p style={{ fontSize: 15, color: '#ff8585', margin: 0 }}>Something went wrong. Please try again, or email us directly.</p>
          )}
          <button
            type="submit"
            disabled={status === 'sending'}
            style={{ justifySelf: 'start', fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.06em', background: 'var(--lw-fg)', color: 'var(--lw-bg)', padding: '12px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', opacity: status === 'sending' ? 0.6 : 1 }}
          >
            {status === 'sending' ? 'SENDING…' : 'SEND MESSAGE →'}
          </button>
        </form>
      )}
    </section>
  )
}
