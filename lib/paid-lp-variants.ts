/**
 * Per-campaign copy variants for `/lp/[slug]?variant=<name>`.
 *
 * Each variant defines the visible headline, subhead, social-proof line, and
 * primary CTA label. The form, content, and download flow are identical across
 * variants — only the messaging at the top of the page changes.
 *
 * Defaults come from the underlying Sanity doc when no `?variant=` is given.
 *
 * Add new variants by adding a key under the appropriate slug. Marketing can
 * edit copy here without touching layout code.
 */

export interface LpVariant {
  /** Eyebrow above the headline (e.g. "FREE WHITE PAPER") */
  eyebrow?: string
  /** Headline rendered with a gradient. Keep <= 12 words. */
  headline: string
  /** Subhead paragraph. Keep <= 30 words. */
  subhead: string
  /** Optional override of the form-card eyebrow ("Get the full report" etc.) */
  formEyebrow?: string
  /** Single sentence shown above the form, in the call-out style. */
  ctaCalloutHtml?: string
}

type VariantMap = Record<string, LpVariant>

const driverRetention: VariantMap = {
  default: {
    eyebrow: 'FREE WHITE PAPER',
    headline: 'Driver Retention is a Data Problem',
    subhead:
      "Why 94% turnover persists, what $18.7B in industry replacement costs really pays for, and the operational data that actually predicts driver exits.",
  },
  linkedin_a: {
    eyebrow: 'FREE FOR FLEET LEADERS',
    headline: '94% driver turnover. Here is the real reason.',
    subhead:
      "It is not pay. It is route length, home time, and mile predictability, and your TMS already has every data point you need to fix it.",
  },
  linkedin_b: {
    eyebrow: 'NEW RESEARCH',
    headline: 'The $18.7B problem hiding in your operations',
    subhead:
      "The industry treats driver replacement as a recruiting line item. The data says it is an operations problem. Free 22-page playbook on what to do about it.",
  },
  google_a: {
    eyebrow: 'FREE DOWNLOAD',
    headline: 'Stop losing drivers to your operations design',
    subhead:
      "Route length, home time, and asset utilization explain more turnover variance than pay alone. We show you which lanes in your network are the worst offenders.",
  },
}

const carrierRetentionIndex: VariantMap = {
  default: {
    eyebrow: 'FREE SCORECARD',
    headline: 'Carrier Retention Risk Scorecards, Q2 2026',
    subhead:
      "Seven major U.S. carriers (ODFL, JBHT, WERN, SNDR, HTLD, TFI, KNX) scored on six structural retention dimensions using public 2025 data. ODFL leads, KNX trails.",
  },
  linkedin_a: {
    eyebrow: 'BENCHMARKS FOR FLEET OPERATIONS',
    headline: 'How does your fleet stack up against ODFL?',
    subhead:
      "The Q2 2026 Carrier Retention Index scores seven major carriers on six retention dimensions. See the full scorecard, plus how to score your own operation.",
  },
  google_a: {
    eyebrow: 'NEW: Q2 2026 EDITION',
    headline: 'Carrier retention risk, scored',
    subhead:
      "Seven public truckload and LTL carriers. Six structural retention dimensions. Public 2025 data only. The full PDF includes per-carrier scorecards with analyst notes.",
  },
}

const variantsBySlug: Record<string, VariantMap> = {
  'driver-retention-is-a-data-problem': driverRetention,
  'carrier-retention-index-q2-2026': carrierRetentionIndex,
}

/**
 * Resolve a variant for a given slug + name. Falls back to the slug's default,
 * then to a generic fallback derived from the Sanity doc.
 */
export function resolveLpVariant(
  slug: string,
  variantName: string | null | undefined,
  fallback: { eyebrow?: string; headline: string; subhead: string }
): LpVariant {
  const map = variantsBySlug[slug]
  if (!map) return fallback
  if (variantName && map[variantName]) return map[variantName]
  return map.default ?? fallback
}
