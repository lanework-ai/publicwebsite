// Generates public/og-image.png and public/twitter-image.png (1200x630) from an
// on-brand SVG, rasterized with sharp. Re-run if branding/copy changes.
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pub = resolve(__dirname, '../public')

// Embed the logo as a base64 data URI so sharp's SVG rasterizer can render it.
const logo = readFileSync(resolve(pub, 'rapid-relay-logo.png')).toString('base64')

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="50%" stop-color="#0d1b2a"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="22%" r="55%">
      <stop offset="0%" stop-color="#235784" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#235784" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2a6f9e"/>
      <stop offset="100%" stop-color="#40a8c4"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <image x="80" y="70" width="430" height="110" preserveAspectRatio="xMinYMid meet"
         xlink:href="data:image/png;base64,${logo}"/>

  <text x="80" y="330" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="800" fill="#ffffff">
    Relay as a Service
  </text>
  <text x="80" y="420" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="800" fill="url(#accent)">
    for Modern Trucking
  </text>

  <text x="80" y="500" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="400" fill="#9fb3c8">
    Faster transit. Higher asset utilization. Stable driver schedules.
  </text>

  <rect x="80" y="540" width="120" height="6" rx="3" fill="url(#accent)"/>
</svg>`

const buf = Buffer.from(svg)

await sharp(buf).png().toFile(resolve(pub, 'og-image.png'))
await sharp(buf).png().toFile(resolve(pub, 'twitter-image.png'))

console.log('Wrote public/og-image.png and public/twitter-image.png (1200x630)')
