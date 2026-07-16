/**
 * Seeds the production Sanity dataset with the first white paper and benchmark:
 *   - "Driver Retention is a Data Problem"  (whitePaper)
 *   - "Carrier Retention Risk Scorecards, Q2 2026"  (benchmark)
 *
 * Run with:
 *   node scripts/seed-content.mjs
 *
 * Reads SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_* from .env.local.
 *
 * Idempotent: uses fixed _id values so re-running updates existing docs in place.
 */

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@sanity/client'
import { generateCover } from './lib/generate-cover.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const desktop = 'C:/Users/a_alm/Desktop'

// --- env ---
function loadEnv() {
  try {
    const content = readFileSync(join(repoRoot, '.env.local'), 'utf8')
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
    }
  } catch {}
}
loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-30'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// --- helpers ---
async function uploadFile(filepath, contentType, filename) {
  const buf = readFileSync(filepath)
  console.log(`  Uploading ${filename} (${(buf.length / 1024).toFixed(0)} KB)...`)
  const asset = await client.assets.upload('file', buf, { filename, contentType })
  return asset
}

async function uploadImage(buffer, filename) {
  console.log(`  Uploading image ${filename} (${(buffer.length / 1024).toFixed(0)} KB)...`)
  const asset = await client.assets.upload('image', buffer, { filename })
  return asset
}

// Upload the local PDF if present; otherwise reuse the existing doc's pdfFile asset.
// Lets the seed run even when a source PDF has been moved off the Desktop.
async function resolvePdfRef(filepath, filename, existingDocId) {
  if (existsSync(filepath)) {
    const asset = await uploadFile(filepath, 'application/pdf', filename)
    return asset._id
  }
  console.log(`  Local PDF missing (${filepath}); reusing existing asset on ${existingDocId}...`)
  const existing = await client.getDocument(existingDocId).catch(() => null)
  const ref = existing?.pdfFile?.asset?._ref
  if (!ref) throw new Error(`No local PDF and no existing pdfFile to reuse for ${existingDocId}`)
  return ref
}

async function ensureAuthor() {
  const _id = 'author-rapid-relay-analytics'
  console.log(`Creating/updating author ${_id}...`)
  await client.createOrReplace({
    _id,
    _type: 'author',
    name: 'Rapid Relay Research Team',
    slug: { _type: 'slug', current: 'rapid-relay-research-team' },
    bio: 'The Rapid Relay Research Team is the in-house industry research group at Rapid Relay Technologies, producing data-driven analysis, benchmarking, and operational research on freight, driver retention, and relay networks for carriers, shippers, investors, and policymakers.',
  })
  return _id
}

// --- White paper ---
async function seedWhitePaper(authorId) {
  console.log('\n=== White Paper: Driver Retention is a Data Problem ===')
  const _id = 'whitepaper-driver-retention-is-a-data-problem'

  const coverBuf = await generateCover({ theme: 'network', seed: 'driver-retention-is-a-data-problem' })
  const coverAsset = await uploadImage(coverBuf, 'driver-retention-cover.png')
  const pdfRef = await resolvePdfRef(
    `${desktop}/Final Edit - Driver Retention is a Data Problem.pdf`,
    'driver-retention-is-a-data-problem.pdf',
    _id
  )

  const doc = {
    _id,
    _type: 'whitePaper',
    title: 'Driver Retention is a Data Problem',
    slug: { _type: 'slug', current: 'driver-retention-is-a-data-problem' },
    author: { _type: 'reference', _ref: authorId },
    coverImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: coverAsset._id },
      alt: 'Driver Retention is a Data Problem, a Rapid Relay Technologies industry research white paper.',
    },
    publishedAt: '2026-06-12T12:00:00Z',
    description:
      "Why the trucking industry's most expensive operational failure is hiding in plain sight, and what it would take to finally fix it.",
    funnelStage: 'mid',
    readTime: '20 min read',
    pdfFile: {
      _type: 'file',
      asset: { _type: 'reference', _ref: pdfRef },
    },
    tldr:
      'Driver turnover at large long-haul carriers averages 94% a year, costing the industry an estimated $18.7 billion. The paper shows these exits are operational rather than a pay problem, and predictable from data carriers already collect.',
    keyFindings: [
      'Large long-haul carriers lose roughly 94% of their drivers every year, a churn rate the industry has quietly accepted as a cost of doing business rather than a crisis to solve.',
      'Replacing a single driver costs about $12,799, and the industry spends an estimated $18.7 billion a year on departures that were largely preventable.',
      'Route length, home time frequency, and asset utilization explain more of the variation in turnover than pay raises do, which makes turnover an operational problem rather than a compensation problem.',
      'Most turnover is drivers switching carriers, not leaving trucking, so the real failure is competitive: carriers are losing drivers to operators who run better lanes.',
      'Relay networks restructure the three variables that most reliably predict driver exits, the structural fix the paper builds toward, which is why short-haul, regional, and dedicated operations retain drivers far better than long-haul OTR.',
    ],
    stats: [
      {
        _key: 's1',
        value: '94%',
        label: 'Long-haul driver turnover at large carriers',
        source: 'ATRI, Evolving Truck Driver Demographics (Aug. 2025); ATA historical avg 1996–2023',
      },
      {
        _key: 's2',
        value: '48%',
        label: 'Industry-average driver turnover, 2024',
        source: 'ATRI, Operational Costs of Trucking (July 2025)',
      },
      {
        _key: 's3',
        value: '$12,799',
        label: 'Estimated cost of replacing a single driver',
        source: 'PDA / Conversion Interactive Agency Snapshot, Feb. 2025',
      },
      {
        _key: 's4',
        value: '$18.7B',
        label: 'Estimated annual industry cost of driver replacement',
        source: 'Rapid Relay Technologies calculation (BLS + ATRI data)',
      },
      {
        _key: 's5',
        value: '~80%',
        label: 'Of sub-500-mile-LOH fleets report turnover below 50%',
        source: 'TMW Systems / FleetOwner carrier survey',
      },
      {
        _key: 's6',
        value: '49.1%',
        label: 'Of job-seeking drivers cite the need for consistent miles',
        source: 'PDA, Fall 2024 Driver Survey',
      },
    ],
    methodology: [
      {
        _type: 'block',
        _key: 'm1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'm1s1',
            text:
              'Every figure is drawn from public sources, including ATRI, the ATA, PDA / Conversion Interactive Agency, UGPTI, TMW Systems via FleetOwner, the National Academies, and the BLS, and each is cited in full in the paper. The analysis can be checked independently.',
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'm2',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'm2s1',
            text:
              'The headline $18.7 billion estimate scales the problem against broad BLS employment. Narrowed to the roughly 2.2 million heavy and tractor-trailer drivers the BLS tracks, the annual cost is closer to $13.6 billion, where a 10-point improvement in retention would save about $1.4 billion. Both are order-of-magnitude estimates rather than forecasts.',
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
    faqs: [
      {
        _key: 'q1',
        question: "Isn't driver turnover a pay problem? Why isn't paying drivers more the answer?",
        answer:
          "Industry survey data says otherwise. In the PDA Fall 2024 Driver Survey, 81.9% of job-seeking drivers cited predictable pay as a reason for switching, but critically, the 2024 PDA Snapshot found that 60% of drivers who complained about compensation specifically cited lack of miles (not the per-mile rate) as the root cause. Drivers aren't leaving for higher per-mile pay; they're leaving because their carrier's operations aren't generating consistent mileage. The problem is operational performance, not compensation design, and the paper walks through the survey data behind that conclusion.",
      },
      {
        _key: 'q2',
        question: "Is the 94% turnover rate a typo? That can't be right.",
        answer:
          "It's not a typo. The American Trucking Associations has tracked turnover at large truckload carriers (those earning $30M+ in annual revenue) at an average of 92.7% from 1996 to 2023. ATRI's August 2025 report places long-haul OTR turnover at 94% at large carriers. For every ten drivers a major long-haul carrier employs at the start of the year, nine are typically gone before it ends.",
      },
      {
        _key: 'q3',
        question: "If retention is predictable, why isn't every carrier doing this?",
        answer:
          'The data exists in every mid-to-large carrier\'s TMS and ELD systems: miles driven vs. expected, days from home, load acceptance rates, communication patterns. What\'s missing is the synthesis layer that connects those signals into a continuously-updated retention risk score at the driver and lane level. The industry has been measuring retention with annual fleet-wide rates (a lagging indicator) rather than continuous lane-level analytics. Carriers that move first will have a structural information advantage.',
      },
      {
        _key: 'q4',
        question: "Doesn't fixing this require expensive infrastructure (relay points, terminals, depots)?",
        answer:
          "Not necessarily. Asset-light relay orchestration (coordinating handoffs across existing terminals, drop yards, customer sites, and neutral relay points) achieves the same structural retention outcomes (shorter hauls, more frequent home time, higher utilization) without new capital investment. The operational redesign should precede any asset decision. Carriers that first identify which lanes have retention-degrading profiles, then model the relay configuration, often find the required handoff infrastructure already exists in their network. The report works through this objection in detail.",
      },
      {
        _key: 'q5',
        question: 'How does this paper define the difference between an industry shortage and a retention problem?',
        answer:
          "The ATA itself has been explicit on this point: the turnover figure measures churn within the industry, not attrition from it. The majority of drivers who register as 'turnover' are not leaving trucking; they're leaving one carrier for another. An industry framing this as a shortage will try to recruit its way out. An industry framing it as a competitive retention failure will look for the operational conditions that drive exits and address them. The two framings lead to very different interventions.",
      },
    ],
    featuredVoices: [
      {
        _key: 'v1',
        quote:
          "They leave when the job doesn't match what they were told, when no one checks in, when the money isn't there, and when they feel like just another seat to fill.",
        name: 'Leah Shaver',
        title: 'President & CEO',
        org: 'National Transportation Institute',
        source: 'FleetOwner, March 2026',
      },
      {
        _key: 'v2',
        quote:
          "If you think there's a shortage, explain to me why there's 400,000-plus new CDLs issued in this country every single year. We have a driver turnover problem, with over 90% turnover in the long-haul trucking industry.",
        name: 'Lewie Pugh',
        title: 'Executive Vice President',
        org: 'OOIDA',
        source: 'FreightWaves F3 Festival, November 2024',
      },
      {
        _key: 'v3',
        quote:
          'Retention is about more than just pay rates. It is about ensuring drivers can actually earn the money they were promised.',
        name: 'Scott Dismuke',
        title: 'VP of Operations',
        org: 'PDA / Conversion Interactive Agency',
        source: 'TheTrucker.com, February 2025',
      },
      {
        _key: 'v4',
        quote:
          "There's a very good chance in 2025 and 2026 that we'll get the economy rolling again. Freight will start to pick up, at which point the big carriers, as they have in the past, struggle to recruit and retain drivers.",
        name: 'John Larkin',
        title: 'Strategic Adviser',
        org: 'Clarendon Capital',
        source: 'FreightWaves F3 Festival, November 2024',
      },
    ],
    seoTitle: 'Driver Retention is a Data Problem | Rapid Relay Technologies',
    seoDescription:
      'Why 94% trucking driver turnover persists, what it really costs carriers, and how relay networks fix the operational variables that drive drivers away.',
    focusKeyword: 'driver retention',
    keywords: [
      'driver retention',
      'truck driver turnover',
      'trucking workforce analytics',
      'carrier retention analytics',
      'fleet operations',
      'driver retention benchmarks',
      'truck driver replacement cost',
      'OTR turnover',
      'relay trucking',
      'Leah Shaver',
      'Lewie Pugh',
      'Scott Dismuke',
      'OOIDA driver turnover',
      'National Transportation Institute',
    ],
    noIndex: false,
    // Keep reading: three blog posts relevant to the retention / relay / data thesis.
    relatedPosts: [
      { _type: 'reference', _key: 'rp1', _ref: 'YHmk6oGwB8vI6jHijL3zzl' }, // Introduction of Truck Relaying in North America
      { _type: 'reference', _key: 'rp2', _ref: '4mxkFmP8ahw0J0O2HAlONw' }, // Harnessing ELD Data for Efficiency and Safety
      { _type: 'reference', _key: 'rp3', _ref: '4mxkFmP8ahw0J0O2HAlQcK' }, // What Makes a Lane Profitable?
    ],
  }

  await client.createOrReplace(doc)
  console.log(`✓ White paper published: /white-papers/driver-retention-is-a-data-problem`)
  return _id
}

// --- Benchmark ---
async function seedBenchmark(authorId, whitePaperId) {
  console.log('\n=== Benchmark: Carrier Retention Risk Scorecards, Q2 2026 ===')
  const _id = 'benchmark-carrier-retention-index-q2-2026'

  const coverBuf = await generateCover({ theme: 'scorecard', seed: 'carrier-retention-index-q2-2026' })
  const coverAsset = await uploadImage(coverBuf, 'carrier-retention-scorecards-cover.png')
  const pdfRef = await resolvePdfRef(
    `${desktop}/carrier_scorecards.pdf`,
    'carrier-retention-risk-scorecards-q2-2026.pdf',
    _id
  )

  const doc = {
    _id,
    _type: 'benchmark',
    title: 'Carrier Retention Risk Scorecards, Q2 2026',
    slug: { _type: 'slug', current: 'carrier-retention-index-q2-2026' },
    series: 'Carrier Retention Index',
    period: 'Q2 2026',
    author: { _type: 'reference', _ref: authorId },
    coverImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: coverAsset._id },
      alt: 'Carrier Retention Risk Scorecards Q2 2026 cover',
    },
    publishedAt: '2026-05-14T12:00:00Z',
    description:
      'A raw scorecard analysis of seven major U.S. carriers (ODFL, JBHT, SNDR, WERN, HTLD, KNX, TFI) scored on six structural retention dimensions derived from public 2025 data.',
    funnelStage: 'mid',
    pdfFile: { _type: 'file', asset: { _type: 'reference', _ref: pdfRef } },
    headlineMetrics: [
      {
        _key: 'h1',
        label: 'Highest score (ODFL, LTL)',
        value: '78 / 100',
        change: 'LOW RISK',
        changeDirection: 'flat',
        source: 'Rapid Relay Technologies, Q2 2026',
      },
      {
        _key: 'h2',
        label: 'Lowest score (KNX, TL)',
        value: '38 / 100',
        change: 'HIGH RISK',
        changeDirection: 'flat',
        source: 'Rapid Relay Technologies, Q2 2026',
      },
      {
        _key: 'h3',
        label: 'Score spread (highest minus lowest)',
        value: '40 pts',
        change: 'Operation type, not size, explains the gap',
        changeDirection: 'flat',
        source: 'Rapid Relay Technologies, Q2 2026',
      },
      {
        _key: 'h4',
        label: 'Carriers scored LOW RISK (70+)',
        value: '1 of 7',
        change: 'ODFL only',
        changeDirection: 'flat',
        source: 'Rapid Relay Technologies, Q2 2026',
      },
      {
        _key: 'h5',
        label: 'Carriers scored HIGH RISK (< 45)',
        value: '3 of 7',
        change: 'KNX, TFI, HTLD',
        changeDirection: 'flat',
        source: 'Rapid Relay Technologies, Q2 2026',
      },
      {
        _key: 'h6',
        label: 'Median score across cohort',
        value: '55 / 100',
        change: 'Moderate risk: SNDR',
        changeDirection: 'flat',
        source: 'Rapid Relay Technologies, Q2 2026',
      },
    ],
    dataTables: [
      {
        _key: 't1',
        caption: 'Summary Rankings, Q2 2026 Carrier Retention Risk Scorecards',
        columns: ['Rank', 'Carrier', 'Ticker', 'Primary Operation', 'Score', 'Risk Category'],
        rows: [
          { _key: 'r1', cells: ['1', 'Old Dominion Freight Line', 'ODFL', 'LTL', '78', 'LOW RISK'] },
          { _key: 'r2', cells: ['2', 'J.B. Hunt Transport', 'JBHT', 'Intermodal / Dedicated', '63', 'MODERATE RISK'] },
          { _key: 'r3', cells: ['3', 'Werner Enterprises', 'WERN', 'Dedicated / One-Way TL', '57', 'MODERATE RISK'] },
          { _key: 'r4', cells: ['4', 'Schneider National', 'SNDR', 'Dedicated / Intermodal / TL', '55', 'MODERATE RISK'] },
          { _key: 'r5', cells: ['5', 'Heartland Express', 'HTLD', 'Full Truckload OTR', '44', 'HIGH RISK'] },
          { _key: 'r6', cells: ['6', 'Daseke (TFI)', 'TFI', 'Flatbed / Specialized', '41', 'HIGH RISK'] },
          { _key: 'r7', cells: ['7', 'Knight-Swift Holdings', 'KNX', 'Truckload / LTL', '38', 'HIGH RISK'] },
        ],
      },
      {
        _key: 't2',
        caption: 'Scoring Dimensions (each scored 0–100, weighted)',
        columns: ['Dimension', 'Weight', 'What it measures'],
        rows: [
          { _key: 'd1', cells: ['Est. Driver Turnover Rate', '30%', 'Disclosed rate or proxy from headcount delta + job postings + earnings commentary'] },
          { _key: 'd2', cells: ['Average Length of Haul', '20%', 'Disclosed or estimated avg LOH by primary operating segment'] },
          { _key: 'd3', cells: ['Fleet Mix: Dedicated %', '15%', 'Share of fleet under multi-year dedicated contracts'] },
          { _key: 'd4', cells: ['Asset Utilization', '15%', 'Revenue miles per tractor per week, OR efficiency, load volume trends'] },
          { _key: 'd5', cells: ['Mile Predictability', '10%', 'Driver income consistency, contract vs. spot exposure, schedule patterns'] },
          { _key: 'd6', cells: ['Home Time Structure', '10%', 'Structural home time frequency by operation type'] },
        ],
      },
      {
        _key: 't3',
        caption: 'Score Interpretation',
        columns: ['Score Range', 'Risk Category', 'Interpretation'],
        rows: [
          { _key: 'i1', cells: ['70 – 100', 'LOW RISK', 'Structural retention advantages; turnover likely well below industry average'] },
          { _key: 'i2', cells: ['45 – 69', 'MODERATE RISK', 'Mixed profile; dedicated/intermodal share offsets OTR exposure'] },
          { _key: 'i3', cells: ['0 – 44', 'HIGH RISK', 'OTR-dominant or structurally high-churn; turnover likely at or above 80–90%'] },
        ],
      },
    ],
    tldr:
      "Seven of the largest publicly-tracked U.S. truckload and LTL carriers, scored on six retention-relevant operational dimensions, range from 38 (Knight-Swift) to 78 (Old Dominion). The score spread maps almost entirely to operation type, not carrier size or quality of management.",
    keyFindings: [
      'Old Dominion (LTL) leads at 78/100, functioning as the industry\'s closest public analog to the low-turnover archetype: short hauls, daily home time, network-anchored scheduling.',
      'Knight-Swift, the largest U.S. truckload carrier, scores lowest at 38/100, driven by its OTR-dominant mix and the high-churn driver population added through the U.S. Xpress integration.',
      'J.B. Hunt scores second-highest (63) on the strength of intermodal drayage: short regional moves with daily home time anchor a structurally favorable retention profile.',
      'Schneider (55) and Werner (57) sit in the moderate band thanks to dedicated mix shifts: Werner is now ~67% dedicated; Schneider has grown its dedicated/intermodal share to ~55%.',
      'No carrier in the cohort discloses a fleet-wide turnover rate publicly. Every score relies on proxies derived from 10-Ks, earnings calls, and trade press.',
    ],
    methodology: [
      {
        _type: 'block',
        _key: 'bm1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'bm1s1',
            text:
              'All scores are derived exclusively from publicly available sources: SEC 10-K filings (FY2025), quarterly earnings releases and calls, investor presentations, and published trade press. No proprietary carrier data was used. Each carrier is scored across six dimensions, weighted as follows: Estimated Driver Turnover Rate (30%), Average Length of Haul (20%), Fleet Mix Dedicated Percentage (15%), Asset Utilization (15%), Mile Predictability (10%), and Home Time Structure (10%).',
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'bm2',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'bm2s1',
            text:
              "Where carriers do not disclose driver turnover (none in this cohort do at the fleet level), proxies were estimated from headcount delta, job-posting volume, and earnings-call commentary, calibrated against ATRI segment benchmarks. These scorecards reflect structural retention risk derivable from public data; they are not investment recommendations and do not constitute a complete operational assessment. Carrier-specific lane-level analysis would require proprietary data not available in public filings.",
            marks: [],
          },
        ],
        markDefs: [],
      },
    ],
    faqs: [
      {
        _key: 'bq1',
        question: "Why doesn't this scorecard use actual driver turnover rates?",
        answer:
          'Because none of the seven carriers in the cohort publicly disclose a fleet-wide driver turnover rate. The 30%-weighted "Estimated Driver Turnover Rate" dimension uses proxies derived from headcount changes in 10-Ks, job-posting volume, earnings-call commentary about retention pressure, and ATRI segment benchmarks. This is a limitation of public-data analysis. Carrier-specific lane-level analysis would require proprietary data.',
      },
      {
        _key: 'bq2',
        question: 'Why is Knight-Swift (the largest U.S. truckload carrier) rated highest-risk?',
        answer:
          'Score correlates with operation type, not size. Knight-Swift\'s 26,200-driver fleet remains heavily weighted toward OTR truckload, which structurally produces longer LOH, less predictable home time, and higher churn. The U.S. Xpress acquisition added significant volume but also a high-churn driver population that has pressured retention metrics. By contrast, Old Dominion (LTL) and J.B. Hunt (intermodal drayage) have operational structures that are inherently retention-favorable.',
      },
      {
        _key: 'bq3',
        question: 'Is a LOW RISK score the same as a buy recommendation?',
        answer:
          "No. These scorecards reflect structural and operational retention risk derived from public data. They are not investment recommendations. Retention is one input among many that affects carrier economics; valuation also depends on rate environment, fleet age, capital structure, customer concentration, and many other factors not addressed here.",
      },
      {
        _key: 'bq4',
        question: 'How often is this index updated?',
        answer:
          "Quarterly. Each release re-scores the cohort using the most recent SEC filings, earnings releases, and trade press coverage. Cohort composition may evolve over time as new public carriers warrant inclusion or as private carriers list.",
      },
      {
        _key: 'bq5',
        question: 'Can I see the underlying calculations for each carrier?',
        answer:
          "Yes. The full scorecard for each of the seven carriers, including all six dimension scores with analyst notes and source citations, is in the downloadable PDF. The dimension-by-dimension detail is what allows a reader to apply the same scoring framework to other carriers or to their own operation.",
      },
    ],
    seoTitle: 'Carrier Retention Risk Scorecards, Q2 2026 | Rapid Relay Technologies',
    seoDescription:
      'Seven major U.S. carriers scored on six structural retention dimensions using only public 2025 data. ODFL leads at 78; KNX lowest at 38.',
    focusKeyword: 'carrier retention index',
    keywords: [
      'carrier retention index',
      'trucking benchmarks',
      'truck driver turnover',
      'carrier scorecard',
      'fleet retention analytics',
      'OTR turnover',
      'LTL retention',
      'intermodal retention',
      'KNX',
      'JBHT',
      'ODFL',
      'SNDR',
      'WERN',
      'HTLD',
      'TFI',
    ],
    noIndex: false,
    relatedWhitePapers: [{ _type: 'reference', _ref: whitePaperId, _key: 'rel-wp-1' }],
  }

  await client.createOrReplace(doc)
  console.log(`✓ Benchmark published: /benchmarks/carrier-retention-index-q2-2026`)
  return _id
}

// --- back-link white paper -> benchmark ---
async function linkWhitePaperToBenchmark(whitePaperId, benchmarkId) {
  console.log('\nBack-linking white paper -> benchmark...')
  await client
    .patch(whitePaperId)
    .set({ relatedBenchmarks: [{ _type: 'reference', _ref: benchmarkId, _key: 'rel-bm-1' }] })
    .commit()
  console.log('✓ Linked')
}

// --- run ---
async function main() {
  console.log(`Connecting to Sanity: project=${projectId} dataset=${dataset}`)
  const authorId = await ensureAuthor()
  const wpId = await seedWhitePaper(authorId)
  const bmId = await seedBenchmark(authorId, wpId)
  await linkWhitePaperToBenchmark(wpId, bmId)
  console.log('\n✅ Seed complete.')
}

main().catch((e) => {
  console.error('\n✗ Seed failed:', e?.message || e)
  if (e?.response?.body) console.error('Response:', JSON.stringify(e.response.body, null, 2))
  process.exit(1)
})
