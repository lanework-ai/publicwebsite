/**
 * Base path for Lanework links. Empty on the standalone lanework.ai site, where
 * the tree lives at the domain root. (It was '/labs' while Lanework ran as a
 * gated preview inside the Rapid Relay app.)
 */
export const LANEWORK_BASE = ''

/** Build a Lanework-internal href, e.g. lw('/research') → '/labs/research'. */
export const lw = (path = '') => `${LANEWORK_BASE}${path}`
