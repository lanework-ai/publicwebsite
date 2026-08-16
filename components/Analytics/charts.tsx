/**
 * Dependency-free SVG/CSS chart primitives for the admin analytics dashboard.
 *
 * All pure server components (no client JS, no charting library) so they add zero
 * weight to the public bundle. Styled with the Lanework design tokens from
 * app/labs-theme.css (--lw-*) rather than the Tailwind "glass" utilities the
 * Rapid Relay original used, which this project doesn't define.
 */
import type { LabelValue, TimeseriesPoint, FunnelStage, Totals, RangeKey } from '@/lib/posthog-query'
import { RANGE_KEYS } from '@/lib/posthog-query'

const fmt = (v: number) => new Intl.NumberFormat('en-US').format(v)

const PANEL: React.CSSProperties = {
  border: '1px solid var(--lw-line-2)',
  borderRadius: 12,
  padding: 22,
  background: 'var(--lw-panel)',
}

const PANEL_TITLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: 'var(--tracking-mono)',
  textTransform: 'uppercase',
  color: 'var(--lw-faint)',
  margin: '0 0 16px',
  fontWeight: 400,
}

const EMPTY: React.CSSProperties = { fontSize: 14, color: 'var(--lw-dim)', margin: 0 }

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={PANEL}>
      <h2 style={PANEL_TITLE}>{title}</h2>
      {children}
    </div>
  )
}

/** Renders a settled-promise rejection inside a panel without killing the page. */
export function WidgetError({ title, message }: { title: string; message: string }) {
  return (
    <Panel title={title}>
      <p style={{ fontSize: 14, color: '#ff8585', lineHeight: 1.6, margin: 0 }}>{message}</p>
    </Panel>
  )
}

export function StatCards({ totals, rangeLabel }: { totals: Totals; rangeLabel: string }) {
  const conversion = totals.visitors > 0 ? (totals.leads / totals.visitors) * 100 : 0
  const cards = [
    { label: 'Pageviews', value: fmt(totals.pageviews) },
    { label: 'Unique visitors', value: fmt(totals.visitors) },
    { label: 'Leads', value: fmt(totals.leads) },
    { label: 'Visitor → lead', value: `${conversion.toFixed(conversion < 10 ? 1 : 0)}%` },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
      {cards.map((c) => (
        <div key={c.label} style={PANEL}>
          <div className="ll-label" style={{ fontSize: 12 }}>{c.label}</div>
          <div
            style={{
              fontSize: 'var(--text-stat)',
              fontWeight: 500,
              letterSpacing: 'var(--tracking-tight)',
              margin: '10px 0 4px',
            }}
          >
            {c.value}
          </div>
          <div style={{ fontSize: 12, color: 'var(--lw-dim)' }}>last {rangeLabel}</div>
        </div>
      ))}
    </div>
  )
}

export function RangeToggle({ active }: { active: RangeKey }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        border: '1px solid var(--lw-line-2)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {RANGE_KEYS.map((r) => (
        <a
          key={r}
          href={`/admin/analytics?range=${r}`}
          aria-current={r === active ? 'page' : undefined}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            letterSpacing: 'var(--tracking-mono)',
            padding: '8px 16px',
            textDecoration: 'none',
            background: r === active ? 'var(--lw-panel-accent)' : 'transparent',
            color: r === active ? 'var(--lw-accent-faint)' : 'var(--lw-faint)',
          }}
        >
          {r}
        </a>
      ))}
    </div>
  )
}

/** Area + line chart for the pageviews timeseries. Pure SVG, viewBox-scaled. */
export function AreaLineChart({ data }: { data: TimeseriesPoint[] }) {
  const W = 760
  const H = 220
  const pad = { top: 16, right: 12, bottom: 26, left: 12 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  if (data.length === 0) {
    return (
      <Panel title="Pageviews over time">
        <p style={EMPTY}>No pageviews in this window yet.</p>
      </Panel>
    )
  }

  const max = Math.max(...data.map((d) => d.views), 1)
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0
  const x = (i: number) => pad.left + i * stepX
  const y = (v: number) => pad.top + innerH - (v / max) * innerH

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.views).toFixed(1)}`).join(' ')
  const area =
    `M ${x(0).toFixed(1)} ${(pad.top + innerH).toFixed(1)} ` +
    data.map((d, i) => `L ${x(i).toFixed(1)} ${y(d.views).toFixed(1)}`).join(' ') +
    ` L ${x(data.length - 1).toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`

  const first = data[0]?.day ?? ''
  const last = data[data.length - 1]?.day ?? ''

  return (
    <Panel title="Pageviews over time">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Pageviews over time">
        <defs>
          <linearGradient id="ph-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lw-accent-soft)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--lw-accent-soft)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#ph-area)" />
        <path d={line} fill="none" stroke="var(--lw-accent-soft)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <text x={pad.left} y={H - 8} fontSize="11" fill="var(--lw-dim)" fontFamily="var(--font-mono)">{first}</text>
        <text x={W - pad.right} y={H - 8} fontSize="11" fill="var(--lw-dim)" fontFamily="var(--font-mono)" textAnchor="end">{last}</text>
        <text x={pad.left} y={pad.top - 2} fontSize="11" fill="var(--lw-dim)" fontFamily="var(--font-mono)">peak {fmt(max)}</text>
      </svg>
    </Panel>
  )
}

/** Horizontal bar list — reused for channels, sources, pages, UTM, device, geo. */
export function BarList({ title, items }: { title: string; items: LabelValue[] }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <p style={EMPTY}>No data in this window.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {items.map((it) => (
            <li key={it.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: 'var(--lw-fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={it.label}>
                  {it.label}
                </span>
                <span style={{ color: 'var(--lw-faint)', fontFamily: 'var(--font-mono)', fontSize: 13, flexShrink: 0 }}>
                  {fmt(it.value)}
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: 'var(--lw-line)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    background: 'var(--lw-accent)',
                    width: `${Math.max((it.value / max) * 100, 2)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/**
 * Plain table for row-level data the bar charts can't express — a lead's name,
 * company and whether they downloaded, rather than one number per label.
 *
 * Numeric columns right-align so digits line up; the whole table scrolls
 * horizontally inside the panel rather than forcing the page to.
 */
export function DataTable({
  title,
  columns,
  rows,
  empty = 'Nothing recorded yet.',
}: {
  title: string
  columns: { key: string; label: string; numeric?: boolean }[]
  rows: Record<string, React.ReactNode>[]
  empty?: string
}) {
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <p style={EMPTY}>{empty}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      textAlign: c.numeric ? 'right' : 'left',
                      padding: '0 12px 8px 0',
                      borderBottom: '1px solid var(--lw-line-2)',
                      color: 'var(--lw-faint)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      letterSpacing: 'var(--tracking-mono)',
                      textTransform: 'uppercase',
                      fontWeight: 400,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      style={{
                        textAlign: c.numeric ? 'right' : 'left',
                        padding: '9px 12px 9px 0',
                        borderBottom: '1px solid var(--lw-line)',
                        color: 'var(--lw-fg-2)',
                        fontFamily: c.numeric ? 'var(--font-mono)' : 'inherit',
                        fontSize: c.numeric ? 13 : 14,
                        verticalAlign: 'top',
                      }}
                    >
                      {r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

/** Compact label/value list for small summaries that don't warrant a bar chart. */
export function StatList({ title, items }: { title: string; items: LabelValue[] }) {
  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <p style={EMPTY}>No data yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {items.map((it) => (
            <li
              key={it.label}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}
            >
              <span style={{ color: 'var(--lw-fg-2)' }}>{it.label}</span>
              <span style={{ color: 'var(--lw-fg)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {fmt(it.value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/** Headline counts for the Postgres-backed section. */
export function ConversionCards({
  totals,
}: {
  totals: { leads: number; downloaded: number; downloadRate: number; contacts: number }
}) {
  const cards = [
    { label: 'Gated leads', value: fmt(totals.leads), note: 'all time' },
    { label: 'Downloaded', value: fmt(totals.downloaded), note: 'all time' },
    {
      label: 'Download rate',
      value: `${totals.downloadRate.toFixed(totals.downloadRate < 10 ? 1 : 0)}%`,
      note: 'of leads',
    },
    { label: 'Enquiries', value: fmt(totals.contacts), note: 'all time' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
      {cards.map((c) => (
        <div key={c.label} style={PANEL}>
          <div className="ll-label" style={{ fontSize: 12 }}>{c.label}</div>
          <div
            style={{
              fontSize: 'var(--text-stat)',
              fontWeight: 500,
              letterSpacing: 'var(--tracking-tight)',
              margin: '10px 0 4px',
            }}
          >
            {c.value}
          </div>
          <div style={{ fontSize: 12, color: 'var(--lw-dim)' }}>{c.note}</div>
        </div>
      ))}
    </div>
  )
}

/** Conversion funnel — stacked bars with step-to-step conversion %. */
export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.value ?? 0
  return (
    <Panel title="Gated-content conversion funnel">
      {top === 0 ? (
        <p style={EMPTY}>No funnel events in this window yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
          {stages.map((stage, i) => {
            const pctOfTop = top > 0 ? (stage.value / top) * 100 : 0
            const prev = stages[i - 1]?.value
            const stepPct = i > 0 && prev ? (stage.value / prev) * 100 : null
            return (
              <li key={stage.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, marginBottom: 6 }}>
                  <span style={{ color: 'var(--lw-fg-2)' }}>
                    {i + 1}. {stage.label}
                  </span>
                  <span style={{ color: 'var(--lw-faint)', fontFamily: 'var(--font-mono)', fontSize: 13, flexShrink: 0 }}>
                    {fmt(stage.value)}
                    {stepPct != null && <span style={{ color: 'var(--lw-dim)' }}> · {stepPct.toFixed(0)}% of prev</span>}
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: 'var(--lw-line)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 5,
                      background: 'linear-gradient(90deg, var(--lw-accent), var(--lw-accent-soft))',
                      width: `${Math.max(pctOfTop, 2)}%`,
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
