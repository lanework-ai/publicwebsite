/**
 * Abstract, text-free editorial cover art for white papers + benchmarks.
 *
 * Built from the Lanework brand's own visual language: the logo is three
 * graduated horizontal "lane" bars (long white, medium graphite, short indigo),
 * and these covers scale that motif into a full composition.
 *
 * Follows the design system's rules rather than typical SaaS cover art:
 * flat and SHADOWLESS, no gradients, no glows, hairline structure, greyscale
 * carrying the field with a single indigo accent doing the signalling.
 *
 *   theme 'lanes'   — a graduated lane field. Lengths taper top to bottom like
 *                     the mark; a few lanes break mid-run (the empty mile, the
 *                     driver who leaves); three indigo lanes carry the signal.
 *                     Used for white papers. ('network' is kept as an alias.)
 *   theme 'ranking' — lanes ordered longest to shortest, indigo on the leader.
 *                     Used for benchmarks/scorecards. ('scorecard' aliases it.)
 *
 * Deterministic: same (theme, seed) always produces the same image, so re-runs
 * are stable. Seed off the slug for per-item variation.
 *
 * Returns a PNG Buffer (1200x630 by default — good for cards, detail hero, and
 * Open Graph; cropped with object-cover at each surface).
 */
import sharp from 'sharp'

// Lanework tokens (app/labs-theme.css)
const PALETTE = {
  base: '#08090a',
  fg: '#f4f5f6',
  fg2: '#cfd2d6',
  graphite: '#868d97',
  accent: '#4f6bff',
  accentSoft: '#7e95ff',
}

// --- deterministic RNG ---
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Pill-capped lane bar, matching the logo's rx = height/2 proportion. */
function lane(x, y, w, h, fill, opacity) {
  if (w <= 0.5) return ''
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="${(h / 2).toFixed(2)}" fill="${fill}" fill-opacity="${opacity.toFixed(3)}"/>`
}

/** Hairline structure: a left rule and one off-centre rule. No grid noise. */
function structure(W, H, marginX) {
  const yTop = 64
  const yBot = H - 64
  const xA = marginX - 28
  const xB = Math.round(W * 0.618)
  return (
    `<line x1="${xA}" y1="${yTop}" x2="${xA}" y2="${yBot}" stroke="${PALETTE.fg}" stroke-opacity="0.10" stroke-width="1"/>` +
    `<line x1="${xB}" y1="${yTop}" x2="${xB}" y2="${yBot}" stroke="${PALETTE.fg}" stroke-opacity="0.05" stroke-width="1"/>`
  )
}

// --- theme: lanes (white papers) ---
// Each row is one route, staggered in start and split into relay legs with a
// handoff gap between them. Reads as a relay schedule rather than a bar chart,
// and avoids the left-aligned uniform look of skeleton placeholders.
function lanesTheme(W, H, rand) {
  const rows = 22
  const marginX = 96
  const top = 88
  const bottom = H - 88
  const pitch = (bottom - top) / (rows - 1)
  const barH = 7
  const usable = W - marginX * 2

  let out = ''
  let ticks = ''
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1)
    const y = top + i * pitch - barH / 2

    // Staggered origin, graduated run length (longest toward the top).
    const start = marginX + usable * (rand() * 0.24)
    const runFactor = 0.3 + 0.6 * Math.pow(1 - t, 1.1) + (rand() - 0.5) * 0.12
    const end = Math.min(marginX + usable, start + usable * Math.max(0.16, runFactor))
    const span = end - start
    if (span < 40) continue

    // Split the route into 2 to 4 legs with handoff gaps.
    const legs = 2 + Math.floor(rand() * 3)
    const gap = 13 + rand() * 8
    const legSpan = (span - gap * (legs - 1)) / legs
    if (legSpan < 18) continue

    // About a fifth of routes carry one indigo leg: the proven segment. Kept
    // sparse so the accent stays a signal rather than a pattern.
    const accentLeg = rand() < 0.2 ? Math.floor(rand() * legs) : -1
    // Occasionally a route simply stops early: the empty mile.
    const dropAfter = rand() < 0.16 ? 1 + Math.floor(rand() * (legs - 1)) : legs

    for (let s = 0; s < legs; s++) {
      if (s >= dropAfter) break
      const x = start + s * (legSpan + gap)
      const isAccent = s === accentLeg
      const fill = isAccent ? PALETTE.accent : rand() < 0.16 ? PALETTE.fg2 : PALETTE.graphite
      const opacity = isAccent ? 0.95 : 0.22 + 0.32 * (1 - t)
      out += lane(x, y, legSpan, barH, fill, opacity)
      // Handoff marker between consecutive legs.
      if (s < legs - 1 && s + 1 < dropAfter) {
        const tx = x + legSpan + gap / 2
        ticks += `<line x1="${tx.toFixed(1)}" y1="${(y - 4).toFixed(1)}" x2="${tx.toFixed(1)}" y2="${(y + barH + 4).toFixed(1)}" stroke="${PALETTE.fg}" stroke-opacity="0.16" stroke-width="1"/>`
      }
    }
  }
  return `<g>${structure(W, H, marginX)}</g><g>${ticks}</g><g>${out}</g>`
}

// --- theme: ranking (benchmarks / scorecards) ---
function rankingTheme(W, H, rand) {
  const rows = 14
  const marginX = 104
  const top = 96
  const bottom = H - 96
  const pitch = (bottom - top) / (rows - 1)
  const barH = 9
  const maxW = W - marginX * 2

  let out = ''
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1)
    // Strictly descending ranking with light deterministic jitter.
    const w = maxW * Math.max(0.14, 1 - 0.82 * t + (rand() - 0.5) * 0.05)
    const y = top + i * pitch - barH / 2
    const leader = i === 0
    const fill = leader ? PALETTE.accent : i < 3 ? PALETTE.fg2 : PALETTE.graphite
    const opacity = leader ? 0.95 : 0.2 + 0.4 * (w / maxW)
    out += lane(marginX, y, w, barH, fill, opacity)
    // Tick at each lane end: a measured, scorecard read.
    out += `<line x1="${(marginX + w + 12).toFixed(1)}" y1="${(y - 3).toFixed(1)}" x2="${(marginX + w + 12).toFixed(1)}" y2="${(y + barH + 3).toFixed(1)}" stroke="${PALETTE.fg}" stroke-opacity="${leader ? 0.35 : 0.12}" stroke-width="1"/>`
  }
  return `<g>${structure(W, H, marginX)}</g><g>${out}</g>`
}

/**
 * @returns {Promise<Buffer>} PNG buffer
 */
export async function generateCover({ theme = 'lanes', seed = 'seed', width = 1200, height = 630 } = {}) {
  const isRanking = theme === 'ranking' || theme === 'scorecard'
  const rand = mulberry32(hashStr(String(seed)) ^ (isRanking ? 0x9e3779b9 : 0x1b873593))
  const motif = isRanking ? rankingTheme(width, height, rand) : lanesTheme(width, height, rand)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="${PALETTE.base}"/>
    ${motif}
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}
