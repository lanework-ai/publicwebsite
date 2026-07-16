/**
 * Dependency-free SVG/CSS chart primitives for the admin analytics dashboard.
 *
 * All pure server components (no client JS, no charting library) so they add zero
 * weight to the public bundle and inherit the site's dark "glass" admin styling
 * (glass-effect, accent-cyan, gradient-text, border-white/10).
 */
import type { LabelValue, TimeseriesPoint, FunnelStage, Totals } from '@/lib/posthog-query'
import type { RangeKey } from '@/lib/posthog-query'
import { RANGE_KEYS } from '@/lib/posthog-query'

const fmt = (v: number) => new Intl.NumberFormat('en-US').format(v)

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-effect rounded-2xl p-5 sm:p-6 border border-white/10">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">{title}</h2>
      {children}
    </div>
  )
}

/** Renders a settled-promise rejection inside a panel without killing the page. */
export function WidgetError({ title, message }: { title: string; message: string }) {
  return (
    <Panel title={title}>
      <p className="text-sm text-red-300/80 leading-relaxed">{message}</p>
    </Panel>
  )
}

export function StatCards({
  totals,
  rangeLabel,
}: {
  totals: Totals
  rangeLabel: string
}) {
  const conversion = totals.visitors > 0 ? (totals.leads / totals.visitors) * 100 : 0
  const cards = [
    { label: 'Pageviews', value: fmt(totals.pageviews) },
    { label: 'Unique visitors', value: fmt(totals.visitors) },
    { label: 'Leads', value: fmt(totals.leads) },
    { label: 'Visitor → lead', value: `${conversion.toFixed(conversion < 10 ? 1 : 0)}%` },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="glass-effect rounded-2xl p-5 border border-white/10">
          <div className="text-xs uppercase tracking-wide text-gray-400">{c.label}</div>
          <div className="text-3xl font-bold mt-2 gradient-text">{c.value}</div>
          <div className="text-[11px] text-gray-500 mt-1">last {rangeLabel}</div>
        </div>
      ))}
    </div>
  )
}

export function RangeToggle({ active }: { active: RangeKey }) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 overflow-hidden glass-effect text-sm">
      {RANGE_KEYS.map((r) => (
        <a
          key={r}
          href={`/admin/analytics?range=${r}`}
          aria-current={r === active ? 'page' : undefined}
          className={`px-4 py-2 font-semibold transition-colors ${
            r === active
              ? 'bg-accent-cyan/20 text-accent-cyan'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
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
        <p className="text-sm text-gray-500">No pageviews in this window yet.</p>
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
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Pageviews over time">
        <defs>
          <linearGradient id="ph-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#ph-area)" />
        <path d={line} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <text x={pad.left} y={H - 8} fontSize="11" fill="#6b7280">{first}</text>
        <text x={W - pad.right} y={H - 8} fontSize="11" fill="#6b7280" textAnchor="end">{last}</text>
        <text x={pad.left} y={pad.top - 2} fontSize="11" fill="#6b7280">peak {fmt(max)}</text>
      </svg>
    </Panel>
  )
}

/** Horizontal bar list — reused for sources, pages, UTM, device, geo. */
export function BarList({ title, items }: { title: string; items: LabelValue[] }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No data in this window.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((it) => (
            <li key={it.label}>
              <div className="flex items-center justify-between gap-3 text-sm mb-1">
                <span className="text-gray-300 truncate" title={it.label}>{it.label}</span>
                <span className="text-gray-400 tabular-nums shrink-0">{fmt(it.value)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-cyan/60"
                  style={{ width: `${Math.max((it.value / max) * 100, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/** Conversion funnel — stacked bars with step-to-step conversion %. */
export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.value ?? 0
  return (
    <Panel title="Gated-content conversion funnel">
      {top === 0 ? (
        <p className="text-sm text-gray-500">No funnel events in this window yet.</p>
      ) : (
        <ul className="space-y-3">
          {stages.map((stage, i) => {
            const pctOfTop = top > 0 ? (stage.value / top) * 100 : 0
            const prev = stages[i - 1]?.value
            const stepPct = i > 0 && prev ? (stage.value / prev) * 100 : null
            return (
              <li key={stage.label}>
                <div className="flex items-center justify-between gap-3 text-sm mb-1">
                  <span className="text-gray-300">
                    {i + 1}. {stage.label}
                  </span>
                  <span className="text-gray-400 tabular-nums shrink-0">
                    {fmt(stage.value)}
                    {stepPct != null && (
                      <span className="text-gray-500"> · {stepPct.toFixed(0)}% of prev</span>
                    )}
                  </span>
                </div>
                <div className="h-3 rounded-md bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-accent-cyan/70 to-accent-cyan/30"
                    style={{ width: `${Math.max(pctOfTop, 2)}%` }}
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
