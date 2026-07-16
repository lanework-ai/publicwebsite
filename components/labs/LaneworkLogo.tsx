'use client'

/**
 * Lanework brand mark + wordmark — the design-system primary "lanes" mark: three
 * left-aligned bars stepping shorter top→bottom (top white longest, middle graphite
 * medium, indigo accent shortest at the base). Interactive by default: on hover the
 * lanes RESOLVE to a full, aligned stack (fragmented → in focus), settling back on
 * leave. Static under prefers-reduced-motion. Ported from the Lanework Design System
 * (components/core/Logo.jsx).
 */
import { useEffect, useState, type CSSProperties } from 'react'

const BARS = [
  { x: 6, w: 26 },
  { x: 6, w: 18 },
  { x: 6, w: 12 },
]
const Y = [11.2, 18.4, 25.6]
const H = 3.6
const RX = 1.8
const EO = 'cubic-bezier(.22,.61,.36,1)'

export function Logo({
  wordmark = true,
  mono = false,
  size = 34,
  color,
  interaction = 'resolve',
  progress,
  className,
  style,
  ...rest
}: {
  wordmark?: boolean
  mono?: boolean
  size?: number
  color?: string
  interaction?: 'resolve' | 'lead' | 'none'
  progress?: number
  className?: string
  style?: CSSProperties
} & Record<string, unknown>) {
  const [hover, setHover] = useState(false)
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(mq.matches)
    const on = () => setReduce(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])

  const fills = mono
    ? ['currentColor', 'currentColor', 'currentColor']
    : ['#f4f5f6', '#868d97', 'var(--lw-accent, #4f6bff)']
  const ops = mono ? [1, 0.55, 0.3] : [1, 1, 1]
  const active = interaction !== 'none' && hover && !reduce
  const hasWork = progress != null

  const barStyle = (i: number, b: { x: number; w: number }): CSSProperties => {
    const base: CSSProperties = {
      transition: reduce ? 'none' : `transform .5s ${EO}, filter .3s ease`,
      transformBox: 'fill-box',
      transformOrigin: 'left center',
    }
    if (!active) return base
    if (interaction === 'resolve' && !(hasWork && i === 2)) {
      return { ...base, transform: `translateX(${6 - b.x}px) scaleX(${28 / b.w})` }
    }
    if (interaction === 'lead' && i === 2 && !hasWork) {
      return { ...base, transform: `scaleX(${(34 - b.x) / b.w})`, filter: 'drop-shadow(0 0 3px rgba(79,107,255,.55))' }
    }
    return base
  }

  const accent = mono ? 'currentColor' : 'var(--lw-accent, #4f6bff)'
  const b3 = BARS[2]
  const workFill = hasWork ? Math.max(0, Math.min(1, active ? 1 : (progress as number))) : 1

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden={wordmark ? 'true' : undefined}
      role={wordmark ? undefined : 'img'}
      aria-label={wordmark ? undefined : 'Lanework'}
      style={{ display: 'block', flexShrink: 0, color: mono ? color || 'var(--lw-fg)' : undefined }}
    >
      {BARS.map((b, i) => {
        if (hasWork && i === 2) return null
        return <rect key={i} x={b.x} y={Y[i]} width={b.w} height={H} rx={RX} fill={fills[i]} opacity={ops[i]} style={barStyle(i, b)} />
      })}
      {hasWork && (
        <g>
          <line
            x1={b3.x + 2}
            y1={Y[2] + H / 2}
            x2={b3.x + b3.w}
            y2={Y[2] + H / 2}
            stroke={accent}
            strokeOpacity="0.3"
            strokeWidth={H}
            strokeLinecap="round"
            strokeDasharray="0.4 4"
          />
          <rect
            x={b3.x}
            y={Y[2]}
            width={Math.max(H, b3.w * workFill)}
            height={H}
            rx={RX}
            fill={accent}
            style={{ transition: reduce ? 'none' : `width .5s ${EO}` }}
          />
        </g>
      )}
    </svg>
  )

  const interactive = interaction !== 'none' || hasWork

  return (
    <span
      className={className}
      onMouseEnter={interactive ? () => setHover(true) : undefined}
      onMouseLeave={interactive ? () => setHover(false) : undefined}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 11, ...style }}
      {...rest}
    >
      {mark}
      {wordmark && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--weight-medium, 500)' as CSSProperties['fontWeight'],
            letterSpacing: 'var(--tracking-label, 0.16em)',
            fontSize: Math.round(size * 0.53),
            color: color || 'var(--lw-fg)',
            whiteSpace: 'nowrap',
          }}
        >
          LANEWORK
        </span>
      )}
    </span>
  )
}
