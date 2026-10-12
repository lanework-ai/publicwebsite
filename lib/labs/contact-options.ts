/**
 * Contact form options, shared by the form (app/connect/page.tsx) and the API
 * route (app/api/contact/route.ts) so the allowlists can never drift apart.
 */

export const intents = [
  { value: 'research', label: 'Support the research (data or introductions)' },
  { value: 'snapshot', label: 'Readiness snapshot (free)' },
  { value: 'assessment', label: 'Network assessment' },
  // TODO(open-q): fulfillment. Remove this option if the diagnostic is paused.
  { value: 'fulfillment', label: 'Fulfillment performance diagnostic' },
  { value: 'diligence', label: 'Operational due diligence (investors)' },
  { value: 'advisory', label: 'Fractional analytics advisory' },
  { value: 'platform', label: 'Deploy a proof (Rapid Relay / Rapid Load)' },
  { value: 'careers', label: 'Join the team' },
  { value: 'other', label: 'Something else' },
] as const

export type Intent = (typeof intents)[number]['value']

export const intentValues = intents.map((i) => i.value) as [Intent, ...Intent[]]

/** The form opens on the research-partner ask, the first option above. */
export const DEFAULT_INTENT: Intent = 'research'

export function isIntent(value: unknown): value is Intent {
  return typeof value === 'string' && (intentValues as string[]).includes(value)
}

/** Lanework engages fleets from 20 trucks up, so the smallest band starts there. */
export const fleetSizes = ['20-100', '100-250', '250-500', '500-1000', '1000+'] as const

/**
 * Typical length of haul. 550–600 mi is the band the current relay research
 * targets, so it qualifies a carrier for that work at a glance.
 */
export const lengthsOfHaul = ['Under 250 mi', '250–550 mi', '550–600 mi', 'Over 600 mi', 'Mixed'] as const
