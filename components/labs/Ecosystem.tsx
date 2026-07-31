/**
 * Ecosystem band — "Runs with the stack you already have." The five integration
 * categories from the Rapid Relay site, restated in the Lanework voice, with
 * partner marks.
 *
 * Logos are AUTO-DETECTED at build time: this is a server component, so it reads
 * public/labs/partners/ and renders the real mark for any partner whose id has a
 * matching file. Everyone else falls back to a monospace wordmark chip, per the
 * near-iconless design system. Dropping `<id>.svg` (or .png) into that folder is
 * therefore the only step needed to upgrade a chip to a logo, with no code change
 * and no risk of a broken image pointing at a file that was never added.
 *
 * Marks render at 65% opacity, full on hover (`.ll-partner`), which is what keeps a
 * row of full-colour third-party logos from overwhelming the austere palette.
 */
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { SectionHeader } from './ds'
import { bindWidow } from '@/lib/labs/typography'

interface Partner {
  id: string
  name: string
}

interface Category {
  title: string
  desc: string
  partners: Partner[]
}

/**
 * Filenames present in public/labs/partners/, keyed by id (basename without the
 * extension). Read once at module load. Wrapped because the folder is allowed not
 * to exist, and a missing folder must degrade to "all chips" rather than fail the
 * build.
 */
const AVAILABLE_LOGOS: Record<string, string> = (() => {
  try {
    const dir = join(process.cwd(), 'public', 'labs', 'partners')
    const found: Record<string, string> = {}
    for (const file of readdirSync(dir)) {
      const m = file.match(/^(.+)\.(svg|png|webp)$/i)
      if (m) found[m[1].toLowerCase()] = `/labs/partners/${file}`
    }
    return found
  } catch {
    return {}
  }
})()

/**
 * Render height per mark. Wordmark-shaped logos (a word set in type) need less
 * height than square icon marks to carry the same visual weight, so anything not
 * listed falls back to a conservative default.
 */
const LOGO_HEIGHTS: Record<string, number> = {
  repowr: 14,
  truckstop: 15,
  dat: 18,
  landstar: 26,
  werner: 18,
  knx: 22,
  nfi: 16,
  schneider: 22,
  spot: 22,
  ntg: 24,
  echo: 22,
  loadsmart: 22,
  chrobinson: 22,
}
const DEFAULT_LOGO_HEIGHT = 20

/**
 * Marks whose artwork is dark and has no background of its own, so it disappears
 * against this canvas. These get a light plate behind them, which is how a dark
 * wordmark is normally placed on a dark page.
 *
 * Measured mean luminance against the #08090a background (~9): knx 22,
 * truckstop 40, shipcars 52. Everything else sits at 72 or above and is left alone,
 * because most of these marks are badge icons that carry their own coloured disc
 * and already read fine. Do not turn this into a global rule: knocking every mark
 * out to white flattened those discs into featureless circles.
 */
const NEEDS_LIGHT_PLATE = new Set(['knx', 'truckstop', 'shipcars'])

const CATEGORIES: Category[] = [
  {
    title: 'Transportation management',
    desc: 'Lane structures and execution history in; optimized relay plans back out.',
    partners: [
      { id: 'mcleod', name: 'McLeod' },
      { id: 'trimble', name: 'Trimble' },
      { id: 'mercurygate', name: 'MercuryGate' },
      { id: 'roserocket', name: 'Rose Rocket' },
    ],
  },
  {
    title: 'ELD & telematics',
    desc: 'Driver availability, HOS constraints, and real execution signals.',
    partners: [
      { id: 'motive', name: 'Motive' },
      { id: 'samsara', name: 'Samsara' },
      { id: 'omnitracs', name: 'Omnitracs' },
      { id: 'geotab', name: 'Geotab' },
    ],
  },
  {
    title: 'Visibility & data',
    desc: 'Timing validation, congestion patterns, and relay-node reliability.',
    partners: [
      { id: 'project44', name: 'project44' },
      { id: 'fourkites', name: 'FourKites' },
      { id: 'macropoint', name: 'MacroPoint' },
      { id: 'transporeon', name: 'Transporeon' },
    ],
  },
  {
    title: 'Trailer pools',
    desc: 'On-demand trailer access; fewer empty miles, higher utilization.',
    partners: [{ id: 'repowr', name: 'REPOWR' }],
  },
  {
    title: 'Spot market',
    desc: 'Backhaul and gap-filling evaluated inside the relay plan.',
    partners: [
      { id: 'dat', name: 'DAT' },
      { id: 'truckstop', name: 'Truckstop' },
      { id: 'chrobinson', name: 'C.H. Robinson' },
      { id: 'schneider', name: 'Schneider' },
    ],
  },
]

/**
 * One partner, as a fixed-footprint labelled cell.
 *
 * Matching logo heights does not produce a uniform row, because these marks have
 * wildly different aspect ratios: DAT and Werner are wide wordmarks, most of the
 * carriers are square badge icons, Landstar is a tall star. Setting a common height
 * makes the wordmarks enormous and the icons tiny.
 *
 * So every mark instead gets an identical box and is scaled to fit inside it with
 * object-fit: contain. The footprint is uniform even though the artwork is not, and
 * the name sits underneath so a mark nobody recognises is still readable. A brand
 * with no file yet shows its name in the mark slot, so it occupies the same cell as
 * everything else rather than looking like a different kind of thing.
 */
export function PartnerBadge({ partner }: { partner: Partner }) {
  const src = AVAILABLE_LOGOS[partner.id]
  return (
    <span className="ll-partner-cell" title={partner.name}>
      <span className={['ll-partner', NEEDS_LIGHT_PLATE.has(partner.id) ? 'll-partner-plate' : ''].filter(Boolean).join(' ')}>
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src} alt="" />
        ) : (
          <span className="ll-partner-fallback">{partner.name}</span>
        )}
      </span>
      {/* The label names the mark. A brand without a logo file already shows its name
          in the slot above, so repeating it underneath would just say it twice. */}
      {src && <span className="ll-partner-label">{partner.name}</span>}
    </span>
  )
}

/**
 * A flat row of marks for a single deployment, headed "Connects with".
 *
 * Deliberately worded as integrations rather than partners or customers: these are
 * systems and networks a deployment can connect to, and presenting a carrier's mark
 * without that qualifier would imply an endorsement or an account we have not
 * claimed. The Terms carry the matching third-party trademark notice.
 */
export function IntegrationRow({
  partners,
  label = 'Connects with',
  note,
}: {
  partners: Partner[]
  label?: string
  note?: string
}) {
  if (!partners.length) return null
  return (
    <div style={{ marginTop: 30 }}>
      <div className="ll-label" style={{ fontSize: 13, marginBottom: 14 }}>{label}</div>
      {note && (
        <p style={{ fontSize: 15, color: 'var(--lw-faint)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 620 }}>
          {bindWidow(note)}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '22px 16px', flexWrap: 'wrap' }}>
        {partners.map((p) => (
          <PartnerBadge key={p.id} partner={p} />
        ))}
      </div>
    </div>
  )
}

export default function Ecosystem({
  index = '05',
  variant = 'full',
}: {
  index?: string
  variant?: 'full' | 'slim'
}) {
  if (variant === 'slim') {
    const all = CATEGORIES.flatMap((c) => c.partners)
    return (
      <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 8 }}>
        <SectionHeader index={index} label="Runs with your stack" style={{ marginBottom: 18 }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '22px 16px', flexWrap: 'wrap' }}>
          {all.map((p) => (
            <PartnerBadge key={p.id} partner={p} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="ll-section" style={{ paddingTop: 44, paddingBottom: 8 }}>
      <SectionHeader index={index} label="We sit above the stack you already run" style={{ marginBottom: 14 }} />
      <p style={{ fontSize: 17, color: 'var(--lw-muted)', lineHeight: 1.6, maxWidth: 620, margin: '0 0 24px' }}>
        Your TMS and your telematics tell you what happened. We tell you what to do about it, and what
        it is worth. That means we plug into the systems you already run rather than replacing them,
        and we work from data you already own.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--lw-line)', border: '1px solid var(--lw-line)', borderRadius: 8, overflow: 'hidden' }}>
        {CATEGORIES.map((c) => (
          <div
            key={c.title}
            style={{ background: 'var(--lw-panel)', padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            <div style={{ width: 210, flexShrink: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 16, color: 'var(--lw-fg)' }}>{c.title}</div>
              <div style={{ fontSize: 14, color: 'var(--lw-faint)', lineHeight: 1.5, marginTop: 3 }}>{bindWidow(c.desc)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px 12px', flexWrap: 'wrap', flex: 1 }}>
              {c.partners.map((p) => (
                <PartnerBadge key={p.id} partner={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
