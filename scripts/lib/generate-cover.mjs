/**
 * Abstract, text-free editorial cover art for white papers + benchmarks.
 *
 * Inspired by HBR / MIT Sloan Management Review cover treatments: conceptual,
 * abstract, no headline text baked in (the card/detail page carries the title).
 *
 *   theme 'network'   — a node/edge graph where nodes toward the right "drop out"
 *                       (a retention/churn metaphor). Used for white papers.
 *   theme 'scorecard' — a descending ranking of bars on a green→amber→red risk
 *                       scale. Used for benchmarks.
 *
 * Deterministic: same (theme, seed) always produces the same image, so re-runs
 * are stable. Seed off the slug for per-item variation.
 *
 * Returns a PNG Buffer (1200x630 by default — good for cards, detail hero, and
 * Open Graph; cropped with object-cover at each surface).
 */
import sharp from 'sharp'

const PALETTE = {
  base: '#0a0a0f',
  primary: '#235784',
  cyan: '#40a8c4',
  purple: '#a855f7',
  steel: '#5b7a99',
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

// --- color helpers ---
function hex(h) {
  const n = h.replace('#', '')
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]
}
function lerpColor(a, b, t) {
  const pa = hex(a)
  const pb = hex(b)
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t)
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t)
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t)
  return `rgb(${r},${g},${bl})`
}

// --- shared layers ---
function backgroundLayer(W, H) {
  const defs = `
    <radialGradient id="g0" cx="16%" cy="20%" r="75%">
      <stop offset="0%" stop-color="${PALETTE.primary}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${PALETTE.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g1" cx="88%" cy="82%" r="72%">
      <stop offset="0%" stop-color="${PALETTE.purple}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${PALETTE.purple}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="72%" cy="6%" r="55%">
      <stop offset="0%" stop-color="${PALETTE.cyan}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${PALETTE.cyan}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="58%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.45"/>
    </radialGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="7" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="barGloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="14%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>`
  const body = `
    <rect width="${W}" height="${H}" fill="${PALETTE.base}"/>
    <rect width="${W}" height="${H}" fill="url(#g0)"/>
    <rect width="${W}" height="${H}" fill="url(#g1)"/>
    <rect width="${W}" height="${H}" fill="url(#g2)"/>`
  return { defs, body }
}

function fineGrid(W, H, op = 0.045) {
  const step = 48
  let lines = ''
  for (let x = step; x < W; x += step)
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#ffffff" stroke-opacity="${op}" stroke-width="1"/>`
  for (let y = step; y < H; y += step)
    lines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ffffff" stroke-opacity="${op}" stroke-width="1"/>`
  return `<g>${lines}</g>`
}

// --- theme: network (retention/churn) ---
function networkTheme(W, H, rand) {
  const N = 46
  const nodes = []
  for (let i = 0; i < N; i++) {
    const x = rand() * W
    const y = 60 + rand() * (H - 120)
    // churn probability rises toward the right edge → a visual drop-off
    const churn = rand() < 0.08 + 0.62 * Math.pow(x / W, 1.8)
    nodes.push({ x, y, churn, r: churn ? 1.6 + rand() * 2 : 2.6 + rand() * 4.6 })
  }
  let edges = ''
  const maxD = 185
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const a = nodes[i]
      const b = nodes[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d < maxD) {
        const retained = !a.churn && !b.churn
        const op = retained ? 0.5 * (1 - d / maxD) + 0.05 : 0.12 * (1 - d / maxD)
        const col = retained ? PALETTE.cyan : PALETTE.steel
        edges += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${col}" stroke-opacity="${op.toFixed(3)}" stroke-width="1.1"/>`
      }
    }
  }
  let dots = ''
  for (const n of nodes) {
    if (n.churn) {
      dots += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(1)}" fill="none" stroke="${PALETTE.steel}" stroke-opacity="0.55" stroke-width="1.2"/>`
    } else {
      dots += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(1)}" fill="${PALETTE.cyan}" filter="url(#glow)"/>`
    }
  }
  return `<g>${edges}</g><g>${dots}</g>`
}

// --- theme: scorecard (risk ranking) ---
function scorecardTheme(W, H, rand) {
  const n = 12
  const margin = 120
  const gap = 22
  const bw = (W - 2 * margin - (n - 1) * gap) / n
  const baseY = H - 132
  const top = 96
  const maxH = baseY - top
  const heights = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    // descending ranking, tall (strong/low-risk) → short (high-risk), light jitter
    const h = maxH * (1.0 - 0.84 * t) + (rand() - 0.5) * maxH * 0.09
    heights.push(Math.max(0.13 * maxH, Math.min(maxH, h)))
  }
  const colorFor = (h) => {
    const t = h / maxH
    if (t > 0.5) return lerpColor('#fbbf24', '#34d399', (t - 0.5) / 0.5) // amber→green
    return lerpColor('#f87171', '#fbbf24', t / 0.5) // red→amber
  }

  // faint horizontal reference lines + baseline
  let grid = ''
  for (let g = 1; g <= 4; g++) {
    const gy = baseY - (maxH * g) / 4
    grid += `<line x1="${(margin - 24).toFixed(1)}" y1="${gy.toFixed(1)}" x2="${(W - margin + 24).toFixed(1)}" y2="${gy.toFixed(1)}" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>`
  }
  grid += `<line x1="${(margin - 24).toFixed(1)}" y1="${baseY}" x2="${(W - margin + 24).toFixed(1)}" y2="${baseY}" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.5"/>`

  // bars: solid color + gloss overlay + glow on leaders + soft reflection
  let bars = ''
  const tops = []
  for (let i = 0; i < n; i++) {
    const x = margin + i * (bw + gap)
    const h = heights[i]
    const y = baseY - h
    const col = colorFor(h)
    tops.push({ x: x + bw / 2, y })
    const glow = h > maxH * 0.82 ? ' filter="url(#glow)"' : ''
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3.5" fill="${col}" fill-opacity="0.92"${glow}/>`
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3.5" fill="url(#barGloss)"/>`
    const refl = Math.min(46, h * 0.32)
    bars += `<rect x="${x.toFixed(1)}" y="${(baseY + 2).toFixed(1)}" width="${bw.toFixed(1)}" height="${refl.toFixed(1)}" rx="3.5" fill="${col}" fill-opacity="0.10"/>`
  }

  // ranking trend line connecting the bar tops, with glowing nodes
  const pts = tops.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const trend = `<polyline points="${pts}" fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-width="2" filter="url(#glow)"/>`
  const nodes = tops
    .map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.4" fill="#ffffff" fill-opacity="0.92"/>`)
    .join('')

  return `<g>${grid}</g><g>${bars}</g><g>${trend}${nodes}</g>`
}

/**
 * @returns {Promise<Buffer>} PNG buffer
 */
export async function generateCover({ theme = 'network', seed = 'seed', width = 1200, height = 630 } = {}) {
  const rand = mulberry32(hashStr(String(seed)) ^ (theme === 'scorecard' ? 0x9e3779b9 : 0x1b873593))
  const back = backgroundLayer(width, height)
  const motif = theme === 'scorecard' ? scorecardTheme(width, height, rand) : networkTheme(width, height, rand)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>${back.defs}</defs>
    ${back.body}
    ${fineGrid(width, height)}
    ${motif}
    <rect width="${width}" height="${height}" fill="url(#vig)"/>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}
