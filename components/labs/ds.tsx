/**
 * Lanework Design System — typed React ports of the DS component specs
 * (project b8311aad "Lanework Design System"). Presentational + tokenized
 * (var(--lw-*)); all are server components. Import these instead of repeating
 * raw inline styles across /labs pages.
 */
import type { CSSProperties, ElementType, ReactNode } from 'react'

type Extra = Record<string, unknown>
const FONT_MONO = 'var(--font-mono)'

/* ---- Button ------------------------------------------------------------- */
const BTN_SIZES = {
  sm: { padding: '8px 13px', fontSize: 11 },
  md: { padding: '11px 18px', fontSize: 12 },
  lg: { padding: '13px 22px', fontSize: 13 },
} as const

const BTN_VARIANTS = {
  solid: { background: 'var(--btn-solid-bg)', color: 'var(--btn-solid-fg)' },
  outline: { background: 'transparent', color: 'var(--lw-fg)', borderColor: 'var(--lw-line-3)' },
  ghost: { background: 'transparent', color: 'var(--lw-muted)', borderColor: 'transparent' },
  accent: { background: 'var(--lw-accent)', color: 'var(--on-accent)' },
} as const

export function Button({
  variant = 'solid',
  size = 'md',
  as,
  href,
  children,
  arrow = false,
  disabled = false,
  className,
  style,
  ...rest
}: {
  variant?: keyof typeof BTN_VARIANTS
  size?: keyof typeof BTN_SIZES
  as?: ElementType
  href?: string
  children: ReactNode
  arrow?: boolean
  disabled?: boolean
  className?: string
  style?: CSSProperties
} & Extra) {
  const s = BTN_SIZES[size] ?? BTN_SIZES.md
  const Tag: ElementType = as || (href ? 'a' : 'button')
  return (
    <Tag
      href={href}
      disabled={Tag === 'button' ? disabled : undefined}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: FONT_MONO,
        fontSize: s.fontSize,
        letterSpacing: 'var(--tracking-mono-tight)',
        padding: s.padding,
        borderRadius: 'var(--radius-sm)',
        border: '1px solid transparent',
        textDecoration: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'opacity var(--dur-fast) var(--ease-standard), background var(--dur-fast), border-color var(--dur-fast)',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...BTN_VARIANTS[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
      {arrow && <span aria-hidden="true">→</span>}
    </Tag>
  )
}

/* ---- Badge -------------------------------------------------------------- */
const BADGE_TONES = {
  live: 'var(--lw-muted)',
  pilot: 'var(--lw-accent-soft)',
  paper: 'var(--lw-accent-soft)',
  neutral: 'var(--lw-muted)',
} as const

export function Badge({
  tone = 'neutral',
  dot = false,
  children,
  className,
  style,
  ...rest
}: {
  tone?: keyof typeof BADGE_TONES
  dot?: boolean
  children: ReactNode
  className?: string
  style?: CSSProperties
} & Extra) {
  const color = BADGE_TONES[tone] ?? BADGE_TONES.neutral
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: 'var(--tracking-mono-tight)',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      )}
      {children}
    </span>
  )
}

/* ---- Card --------------------------------------------------------------- */
export function Card({
  accent = false,
  padding = 22,
  radius = 10,
  as = 'div',
  children,
  className,
  style,
  ...rest
}: {
  accent?: boolean
  padding?: number | string
  radius?: number | string
  as?: ElementType
  children: ReactNode
  className?: string
  style?: CSSProperties
} & Extra) {
  const Tag: ElementType = as
  return (
    <Tag
      className={className}
      style={{
        border: accent ? '1px solid rgba(127,149,255,0.3)' : '1px solid var(--lw-line-2)',
        borderRadius: radius,
        padding,
        background: accent ? 'var(--lw-panel-accent)' : 'transparent',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ---- Eyebrow ------------------------------------------------------------ */
export function Eyebrow({
  emphasis = 'label',
  as = 'div',
  children,
  className,
  style,
  ...rest
}: {
  emphasis?: 'hero' | 'label'
  as?: ElementType
  children: ReactNode
  className?: string
  style?: CSSProperties
} & Extra) {
  const Tag: ElementType = as
  const emphasisStyle =
    emphasis === 'hero'
      ? { fontSize: 13, letterSpacing: 'var(--tracking-eyebrow)', color: 'var(--lw-accent-soft)' }
      : { fontSize: 13, letterSpacing: 'var(--tracking-label)', color: 'var(--lw-muted)' }
  return (
    <Tag
      className={className}
      style={{ fontFamily: FONT_MONO, textTransform: 'uppercase', ...emphasisStyle, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ---- SectionHeader ------------------------------------------------------ */
export function SectionHeader({
  index,
  label,
  className,
  style,
  ...rest
}: {
  index?: string
  label: ReactNode
  className?: string
  style?: CSSProperties
} & Extra) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'baseline', gap: 14, ...style }} {...rest}>
      {index != null && (
        <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: 'var(--lw-accent-soft)', letterSpacing: '0.1em' }}>
          {index}
        </span>
      )}
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 13,
          letterSpacing: 'var(--tracking-label)',
          color: 'var(--lw-muted)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  )
}

/* ---- Stat --------------------------------------------------------------- */
export function Stat({
  value,
  label,
  size = 28,
  className,
  style,
  ...rest
}: {
  value: ReactNode
  label: ReactNode
  size?: number
  className?: string
  style?: CSSProperties
} & Extra) {
  return (
    <div className={className} style={style} {...rest}>
      <div style={{ fontFamily: FONT_MONO, fontSize: size, color: 'var(--lw-fg)', letterSpacing: '-0.01em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--lw-faint)', marginTop: 5 }}>{label}</div>
    </div>
  )
}

/* ---- StatCard ----------------------------------------------------------- */
export function StatCard({
  value,
  label,
  source,
  className,
  style,
  ...rest
}: {
  value: ReactNode
  label: ReactNode
  source?: ReactNode
  className?: string
  style?: CSSProperties
} & Extra) {
  return (
    <div className={className} style={{ border: '1px solid var(--lw-line-2)', borderRadius: 10, padding: 18, ...style }} {...rest}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: 'var(--lw-fg)' }}>{value}</div>
      <div style={{ fontSize: 12.5, color: 'var(--lw-fg-2)', margin: '6px 0 4px', lineHeight: 1.5 }}>{label}</div>
      {source && <div style={{ fontSize: 11, color: 'var(--lw-dim)', lineHeight: 1.5 }}>Source: {source}</div>}
    </div>
  )
}

/* ---- DomainRow ---------------------------------------------------------- */
export function DomainRow({
  index,
  title,
  description,
  href,
  className,
  style,
  ...rest
}: {
  index?: string
  title: ReactNode
  description: ReactNode
  href?: string
  className?: string
  style?: CSSProperties
} & Extra) {
  const Tag: ElementType = href ? 'a' : 'div'
  return (
    <Tag
      href={href}
      className={className}
      style={{
        background: 'var(--lw-panel)',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        textDecoration: 'none',
        ...style,
      }}
      {...rest}
    >
      {index != null && (
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: 'var(--lw-muted)', width: 26, flexShrink: 0 }}>{index}</span>
      )}
      <span style={{ fontWeight: 500, fontSize: 14, width: 180, flexShrink: 0, color: 'var(--lw-fg)' }}>{title}</span>
      <span style={{ fontSize: 13, color: 'var(--lw-faint)', flex: 1 }}>{description}</span>
    </Tag>
  )
}

/* ---- Callout ------------------------------------------------------------ */
export function Callout({
  label = 'TL;DR',
  children,
  className,
  style,
  ...rest
}: {
  label?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties
} & Extra) {
  return (
    <div
      className={className}
      style={{ border: '1px solid rgba(127,149,255,0.3)', borderRadius: 12, padding: '20px 22px', background: 'var(--lw-panel-accent)', ...style }}
      {...rest}
    >
      {label && (
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10.5,
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--lw-accent-soft)',
            marginBottom: 10,
          }}
        >
          {label}
        </div>
      )}
      <div style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--lw-fg)' }}>{children}</div>
    </div>
  )
}

/* ---- Quote -------------------------------------------------------------- */
export function Quote({
  children,
  name,
  role,
  org,
  cite,
  href,
  className,
  style,
  ...rest
}: {
  children: ReactNode
  name?: ReactNode
  role?: ReactNode
  org?: ReactNode
  cite?: ReactNode
  href?: string
  className?: string
  style?: CSSProperties
} & Extra) {
  return (
    <figure className={className} style={{ border: '1px solid var(--lw-line-2)', borderRadius: 10, padding: '20px 22px', margin: 0, ...style }} {...rest}>
      <blockquote style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: 'var(--lw-fg-2)', borderLeft: '2px solid var(--lw-accent)', paddingLeft: 16 }}>
        {children}
      </blockquote>
      {(name || role || cite) && (
        <figcaption style={{ marginTop: 14, paddingLeft: 18, fontSize: 13 }}>
          {name &&
            (href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lw-fg)', fontWeight: 500 }}>
                {name}
              </a>
            ) : (
              <span style={{ color: 'var(--lw-fg)', fontWeight: 500 }}>{name}</span>
            ))}
          {role && <span style={{ color: 'var(--lw-muted)' }}>, {role}</span>}
          {org && <span style={{ color: 'var(--lw-muted)' }}> · {org}</span>}
          {cite && (
            <cite style={{ display: 'block', fontStyle: 'normal', fontSize: 11.5, color: 'var(--lw-dim)', marginTop: 4 }}>{cite}</cite>
          )}
        </figcaption>
      )}
    </figure>
  )
}

/* ---- BulletList --------------------------------------------------------- */
export function BulletList({
  items = [],
  className,
  style,
  ...rest
}: {
  items?: ReactNode[]
  className?: string
  style?: CSSProperties
} & Extra) {
  return (
    <ul className={className} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12, ...style }} {...rest}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 12, fontSize: 15.5, lineHeight: 1.6, color: 'var(--lw-fg-2)' }}>
          <span aria-hidden="true" style={{ marginTop: 9, width: 5, height: 5, borderRadius: '50%', background: 'var(--lw-accent)', flexShrink: 0 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/* ---- FAQItem ------------------------------------------------------------ */
export function FAQItem({
  question,
  children,
  open = false,
  className,
  style,
  ...rest
}: {
  question: ReactNode
  children: ReactNode
  open?: boolean
  className?: string
  style?: CSSProperties
} & Extra) {
  return (
    <details open={open} className={className} style={{ border: '1px solid var(--lw-line-2)', borderRadius: 10, padding: '16px 18px', ...style }} {...rest}>
      <summary style={{ cursor: 'pointer', fontWeight: 500, fontSize: 14.5, color: 'var(--lw-fg)' }}>{question}</summary>
      <div style={{ fontSize: 13.5, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '10px 0 0' }}>{children}</div>
    </details>
  )
}
