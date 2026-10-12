/**
 * Base path for Lanework links. Empty on the standalone lanework.ai site, where
 * the tree lives at the domain root. (It was '/labs' while Lanework ran as a
 * gated preview inside the Rapid Relay app.)
 */
export const LANEWORK_BASE = ''

/** Build a Lanework-internal href, e.g. lw('/research') → '/labs/research'. */
export const lw = (path = '') => `${LANEWORK_BASE}${path}`

/**
 * How Lanework describes itself, used wherever the one-line descriptor appears
 * (home hero, footer, About H1, root metadata, llms.txt). Kept in one place
 * because the wording is still being settled.
 * TODO(open-q): "applied AI research lab for logistics" vs "...for freight".
 */
export const LAB_DESCRIPTOR = 'applied AI research lab for logistics'

/** Contact form preselected on the research-partner intent; every partner CTA uses it. */
export const RESEARCH_PARTNER_HREF = lw('/connect?intent=research')
