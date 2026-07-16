/**
 * Sanity Full Content Import Script
 *
 * This script imports all blog posts with complete content converted to Portable Text format.
 *
 * Usage:
 * 1. Ensure .env has SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_PROJECT_ID
 * 2. Run: node sanity-import-full-content.js
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// Helper to create Portable Text blocks
function createPortableTextBlock(text, style = 'normal') {
  return {
    _type: 'block',
    _key: Math.random().toString(36).substring(7),
    style: style,
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).substring(7),
        text: text,
        marks: []
      }
    ],
    markDefs: []
  }
}

// Helper to create Portable Text block with marks (bold, etc.)
function createPortableTextWithMarks(text) {
  const children = []
  const parts = text.split(/(\*\*.*?\*\*)/)

  parts.forEach(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Bold text
      children.push({
        _type: 'span',
        _key: Math.random().toString(36).substring(7),
        text: part.replace(/\*\*/g, ''),
        marks: ['strong']
      })
    } else if (part.trim()) {
      // Normal text
      children.push({
        _type: 'span',
        _key: Math.random().toString(36).substring(7),
        text: part,
        marks: []
      })
    }
  })

  return {
    _type: 'block',
    _key: Math.random().toString(36).substring(7),
    style: 'normal',
    children: children,
    markDefs: []
  }
}

// Parse content array to Portable Text
function parseContentToPortableText(contentArray) {
  const portableTextBlocks = []

  contentArray.forEach(item => {
    const trimmed = item.trim()

    if (!trimmed) {
      // Skip empty strings
      return
    }

    if (trimmed.startsWith('### ')) {
      // H3 heading
      portableTextBlocks.push(createPortableTextBlock(trimmed.replace('### ', ''), 'h3'))
    } else if (trimmed.startsWith('## ')) {
      // H2 heading
      portableTextBlocks.push(createPortableTextBlock(trimmed.replace('## ', ''), 'h2'))
    } else if (trimmed.includes('**')) {
      // Text with bold formatting
      portableTextBlocks.push(createPortableTextWithMarks(trimmed))
    } else {
      // Normal paragraph
      portableTextBlocks.push(createPortableTextBlock(trimmed))
    }
  })

  return portableTextBlocks
}

// Full blog posts data with content and SEO fields
const fullBlogPosts = {
  'freight-lane-profitability': {
    title: 'A Complete Breakdown of What Makes a Freight Lane Truly Profitable, Beyond RPM',
    excerpt: 'Understanding freight profitability requires looking beyond revenue per mile. Discover the key metrics that determine whether a lane is truly worth running.',
    category: 'Trucking',
    date: '2025-03-31',
    author: 'Rapid Relay Team',
    readTime: '8 min read',
    keywords: ['Freight Lane Profitability', 'Revenue Per Mile', 'Cost Per Mile', 'Trucking Economics', 'Backhaul Optimization', 'Lane Selection', 'Deadhead Miles', 'Relay Operations'],
    seoTitle: 'Freight Lane Profitability Guide: Beyond RPM Analysis',
    seoDescription: 'Master freight lane profitability with cost per mile, backhaul optimization, and velocity metrics. Learn what truly drives profitability beyond RPM.',
    relatedSlugs: ['managing-trucking-costs', 'powerloop-drop-hook-impact', 'financial-strategies-carriers'],
    content: [
      'Revenue per mile (RPM) has long been the go-to metric for evaluating freight lanes. While it provides a quick snapshot of potential earnings, relying solely on RPM can lead carriers to accept lanes that look profitable on paper but drain resources in practice.',
      'True lane profitability requires a comprehensive analysis that accounts for all operational costs, time investments, and opportunity costs. Let\'s break down the critical factors that determine whether a lane is actually worth running.',
      '## The Problem with RPM-Only Analysis',
      'RPM tells you how much you earn per mile, but it doesn\'t account for deadhead miles, detention time, loading delays, or the hidden costs of returning empty. A $2.50/mile lane might seem attractive until you factor in a 200-mile deadhead to pick up the load and a 45% chance of returning empty.',
      '## Key Profitability Metrics Beyond RPM',
      '**Total Cost Per Mile (CPM):** This includes fuel, maintenance, insurance, driver wages, and equipment depreciation. Your true cost per mile varies by route, season, and equipment type. Industry averages hover around $1.60-$1.85/mile for dry van operations, but your specific CPM determines your actual margin.',
      '**Loaded Mile Percentage:** This measures what percentage of your total miles are revenue-generating. A lane with 80% loaded miles at $2.00/mile is often more profitable than a lane with 60% loaded miles at $2.40/mile.',
      '**Backhaul Opportunities:** The ability to find return freight dramatically impacts lane profitability. Lanes with strong backhaul markets can turn a mediocre outbound rate into an exceptional round-trip opportunity.',
      '**Dwell Time and Velocity:** How quickly can you turn that truck around? A lane that generates $3,000 but takes 4 days might be less profitable than a lane generating $2,200 that takes 2 days, because velocity compounds.',
      '## Real-World Example: Comparing Two Lanes',
      'Consider two lanes from Los Angeles:',
      'Lane A: LA to Dallas, 1,440 miles at $2.50/mile = $3,600 revenue. Sounds great. But factor in 180 deadhead miles to pickup, 3 days transit time, and a 40% chance of deadhead return. True profitability: ~$1,200 after costs.',
      'Lane B: LA to Phoenix (relay segment), 240 miles at $2.10/mile = $504 revenue. Lower rate, but with 25-mile deadhead, same-day turnaround, and 95% backhaul fill rate. True profitability: ~$380 per segment, but you run 3x more frequently.',
      '## The Relay Advantage',
      'This is where relay operations fundamentally change the profitability equation. By breaking long hauls into regional segments, carriers achieve higher loaded percentages, better backhaul matches, and faster asset turns, often making lower RPM lanes more profitable overall.',
      '## Actionable Takeaways',
      '1. Calculate your true all-in cost per mile for different equipment types and seasons',
      '2. Track loaded vs empty miles on every lane over time',
      '3. Measure average dwell time and identify bottlenecks',
      '4. Build relationships with shippers on lanes with strong two-way freight',
      '5. Use technology to optimize routing and reduce deadhead',
      'Understanding what truly drives lane profitability, beyond just RPM, enables carriers to make strategic decisions about which freight to pursue, which lanes to prioritize, and where relay operations can unlock hidden value.',
    ],
  },
  'trucking-permits-compliance': {
    title: 'The Costs and Compliance of Permits in Trucking Operations',
    excerpt: 'Navigating the complex landscape of trucking permits and understanding their impact on operational costs and compliance requirements.',
    category: 'Regulation',
    date: '2024-06-11',
    author: 'Compliance Team',
    readTime: '6 min read',
    keywords: ['Trucking Permits', 'Compliance', 'Operating Authority', 'IFTA', 'Oversize Permits', 'DOT Regulations', 'Permit Costs', 'Carrier Compliance'],
    seoTitle: 'Trucking Permits & Compliance: Complete Cost Guide 2024',
    seoDescription: 'Navigate trucking permits, IFTA, DOT regulations, and compliance costs. Essential guide for carriers on permits, violations, and technology solutions.',
    relatedSlugs: ['freight-lane-profitability', 'managing-trucking-costs', 'financial-strategies-carriers'],
    content: [
      'Permits and compliance represent a significant operational cost for trucking companies, one that\'s often underestimated until carriers expand their operational footprint or take on specialized freight.',
      '## Understanding Permit Categories',
      'Trucking permits fall into several categories, each with distinct costs and compliance requirements:',
      '**Operating Authority Permits:** Your MC number and DOT number are foundational. The FMCSA filing fee is relatively modest ($300), but the insurance requirements (minimum $75,000 cargo, $750,000-$1M liability) represent the real cost.',
      '**IFTA and IRP:** The International Fuel Tax Agreement and International Registration Plan allow you to operate across state lines with quarterly fuel tax reporting. Setup costs are minimal, but administrative burden is real.',
      '**Oversize/Overweight Permits:** These vary dramatically by state. A single-trip oversize permit might cost $20-$120, while annual blanket permits can range from $200-$2,000 depending on the state and weight limits.',
      '## Hidden Compliance Costs',
      'Beyond permit fees, compliance carries hidden costs that impact profitability:',
      'Administrative time for permit applications, renewals, and quarterly reporting easily consumes 10-20 hours monthly for a mid-sized fleet. Route planning becomes more complex when managing permit restrictions.',
      'Many carriers underestimate the cost of violations. An expired permit or missed weight restriction can result in fines ranging from $150 to $10,000, plus potential out-of-service orders that halt revenue generation.',
      '## State-Specific Variations',
      'Permit requirements and costs vary significantly by state. Some states like Oregon charge mileage-based fees, while others have flat rates. New York and California have particularly complex permitting regimes for oversize loads.',
      '## Technology Solutions',
      'Modern permit management platforms can reduce administrative burden by 60-70% through automated renewals, integrated routing that accounts for permit restrictions, and digital permit books that reduce violation risk.',
      '## Best Practices for Compliance',
      '1. Centralize permit management with one person or team responsible for tracking renewals',
      '2. Build permit costs into customer quotes, especially for oversize loads',
      '3. Maintain a 90-day advance renewal calendar',
      '4. Use permit management software for multi-state operations',
      '5. Train drivers on permit requirements and violation consequences',
      'Effective permit management isn\'t just about avoiding fines, it\'s about operational efficiency, customer service, and strategic growth into new markets.',
    ],
  },
  'financial-strategies-carriers': {
    title: 'Essential Financial Strategies for Small and Startup Carriers',
    excerpt: 'A friendly guide to managing cash flow, accessing capital, and building a sustainable financial foundation for your carrier business.',
    category: 'Trucking',
    date: '2024-05-21',
    author: 'Finance Team',
    readTime: '10 min read',
    keywords: ['Cash Flow Management', 'Financial Strategies', 'Carrier Finance', 'Operating Ratio', 'Invoice Factoring', 'Equipment Financing', 'Fleet Funding', 'Financial Planning'],
    seoTitle: 'Financial Strategies for Carriers: Cash Flow & Growth',
    seoDescription: 'Essential financial strategies for small carriers: cash flow management, factoring, equipment financing, and growth funding. Build a sustainable carrier business.',
    relatedSlugs: ['freight-lane-profitability', 'managing-trucking-costs', 'trucking-permits-compliance'],
    content: [
      'Starting and growing a carrier business requires more than just good driving and customer service, it demands sound financial strategy. Let\'s explore the financial foundations that separate thriving carriers from those that struggle.',
      '## Cash Flow: Your Lifeblood',
      'Cash flow challenges kill more trucking companies than competition. The fundamental problem: you pay for fuel, maintenance, and drivers today, but customers pay you 30-60 days later.',
      '**Factoring:** Freight factoring advances 90-97% of invoice value within 24 hours, in exchange for a 2-5% fee. For startups, factoring isn\'t just financing, it\'s survival. Quick Pay programs from brokers offer similar benefits with smaller fees.',
      '**Working Capital Reserves:** Aim for 60-90 days of operating expenses in reserves. This cushion covers seasonal dips, unexpected repairs, and customer payment delays without forcing you into bad freight decisions.',
      '## Smart Equipment Financing',
      'Purchasing vs leasing decisions impact cash flow for years:',
      '**Owner Financing:** Traditional loans require 10-20% down and carry 6-12% interest. Ownership builds equity but ties up capital.',
      '**Leasing Options:** Operating leases reduce upfront costs and keep you in newer equipment. Finance leases build toward ownership. The right choice depends on your capital position and growth plans.',
      '**The 3-Year vs 5-Year Decision:** Shorter loan terms mean higher payments but lower total interest and faster equity building. Longer terms improve cash flow but increase total cost.',
      '## Building Credit and Relationships',
      'Your business credit score impacts insurance rates, equipment financing terms, and even customer willingness to extend credit. Build credit by:',
      '- Maintaining vendor relationships with consistent on-time payments',
      '- Establishing a business credit card and using it responsibly',
      '- Working with factoring companies and lenders who report to commercial bureaus',
      '## Cost Control Without Cutting Corners',
      'Profitable carriers control costs without compromising safety or service:',
      'Fuel management goes beyond finding cheap diesel. Route optimization, idle time reduction, and spec\'ing equipment for fuel efficiency can save $0.08-$0.15 per mile.',
      'Preventive maintenance costs less than breakdowns. A $500 scheduled service beats a $5,000 roadside failure every time.',
      '## Strategic Growth Funding',
      'When you\'re ready to scale, consider:',
      '**Equipment Financing Lines:** Pre-approved lines of credit for equipment purchases give you flexibility to act on opportunities.',
      '**SBA Loans:** The 7(a) and 504 programs offer favorable terms for qualified carriers expanding operations.',
      '**Private Equity and Partnerships:** For significant growth, outside capital can accelerate expansion, but comes with ownership dilution and performance expectations.',
      '## Financial Metrics to Track Weekly',
      '- Operating Ratio (expenses/revenue): Healthy carriers run 88-95%',
      '- Revenue per truck per week: Benchmark against your market',
      '- Days sales outstanding: How long customers take to pay',
      '- Cost per mile by category: Identify cost creep early',
      'Financial discipline separates sustainable carriers from those chasing the next load just to make payroll. Build systems, track metrics, and make data-driven decisions about which freight to run and how to grow.',
    ],
  },
  'managing-trucking-costs': {
    title: 'Comprehensive Guide to Managing Trucking Costs',
    excerpt: 'From fuel to maintenance to insurance, learn how to track, analyze, and optimize every cost component in your trucking operation.',
    category: 'Logistics News',
    date: '2024-05-20',
    author: 'Operations Team',
    readTime: '12 min read',
    keywords: ['Trucking Costs', 'Cost Control', 'Fuel Management', 'Maintenance Costs', 'Insurance Costs', 'Cost Per Mile', 'Operational Efficiency', 'Cost Tracking'],
    seoTitle: 'Managing Trucking Costs: Complete Guide to Cost Per Mile',
    seoDescription: 'Optimize trucking costs with fuel management, maintenance strategies, and cost tracking systems. Reduce expenses and improve operational efficiency.',
    relatedSlugs: ['freight-lane-profitability', 'powerloop-drop-hook-impact', 'financial-strategies-carriers'],
    content: [
      'Effective cost management is the difference between thriving and barely surviving in trucking. With operating margins typically between 5-12%, small inefficiencies compound into significant profit loss.',
      '## The True Cost Per Mile Framework',
      'Understanding your all-in cost per mile is foundational. Let\'s break down the major categories:',
      '**Fuel Costs (35-40% of operating costs):**',
      'National average diesel prices fluctuate, but fuel typically runs $0.60-$0.85 per mile depending on fuel economy and route. Key levers for optimization:',
      '- MPG improvements through driver training and equipment spec',
      '- Route optimization to reduce deadhead and avoid congestion',
      '- Fuel card programs that offer 3-8 cents per gallon discounts',
      '- APU usage to eliminate idling',
      '**Driver Compensation (25-35% of costs):**',
      'Competitive driver pay is essential for retention, but structure matters. Per-mile pay, percentage of revenue, and hourly rates each have implications for different operation types. Don\'t forget to factor in benefits, deadhead pay, and detention compensation.',
      '**Equipment Costs (15-25%):**',
      'This includes truck payments or lease costs, trailer payments, and depreciation. New equipment costs more upfront but offers better fuel economy, lower maintenance, and improved driver satisfaction.',
      '**Maintenance and Repairs (8-12%):**',
      'Preventive maintenance programs cost $0.12-$0.18 per mile but prevent catastrophic failures. Track maintenance by truck age, mileage, and route to identify patterns.',
      '**Insurance (4-8%):**',
      'Liability, cargo, physical damage, and occupational accident policies are mandatory. Rates vary based on safety record, experience, and cargo type. A clean CSA score can save 15-30% on premiums.',
      '## Cost Tracking Systems',
      'Manually tracking costs in spreadsheets works for small fleets, but growth requires systems:',
      '**TMS Integration:** Modern Transportation Management Systems automatically capture trip costs, link invoices to loads, and generate per-lane profitability reports.',
      '**Fuel Card Data:** Automated fuel transaction imports eliminate manual entry and provide real-time MPG tracking by truck and driver.',
      '**Maintenance Management Software:** Track work orders, parts inventory, and maintenance schedules to identify recurring issues and predict upcoming needs.',
      '## Hidden Costs That Erode Margins',
      'Many carriers don\'t track these effectively:',
      '**Detention and Dwell Time:** Industry average detention is 3-4 hours per load. At $40/hour driver cost, that\'s $120-$160 in lost productivity. Fight for detention pay or avoid chronic offenders.',
      '**Deadhead Miles:** Every empty mile costs just as much to run but generates zero revenue. Industry average is 18-20% deadhead, but efficient operations achieve 8-12%.',
      '**Turnover Costs:** Replacing a driver costs $5,000-$12,000 in recruiting, training, and lost productivity. Driver retention directly impacts profitability.',
      '## Actionable Cost Reduction Strategies',
      '1. **Benchmark Against Your Own Data:** Track cost trends month-over-month to identify seasonal patterns and catch increases early',
      '2. **Driver Scorecards:** Publish fuel economy, idle time, and safety metrics by driver. Peer competition drives improvement',
      '3. **Negotiate Everything:** Fuel discounts, tire programs, maintenance contracts, suppliers want your business',
      '4. **Right-Size Your Fleet:** Underutilized trucks destroy profitability. Better to run 8 trucks at 92% utilization than 10 trucks at 75%',
      '5. **Embrace Technology:** Routing optimization, fuel tax automation, and digital maintenance logs save hours of administrative time',
      '## The Relay Cost Advantage',
      'Relay operations fundamentally shift the cost equation by:',
      '- Reducing deadhead through better backhaul matching',
      '- Lowering driver turnover via home-daily schedules',
      '- Increasing equipment utilization through faster turns',
      '- Minimizing detention through optimized handoff timing',
      'Cost management isn\'t about cutting corners, it\'s about understanding where every dollar goes and making strategic decisions to improve efficiency without compromising safety or service.',
    ],
  },
  'powerloop-drop-hook-impact': {
    title: 'The Transformative Impact of Powerloop and Drop-and-Hook Models',
    excerpt: 'How relay-based operations and drop-and-hook models are revolutionizing long-haul freight and improving driver quality of life.',
    category: 'Trucking',
    date: '2024-05-13',
    author: 'Rapid Relay Team',
    readTime: '9 min read',
    keywords: ['Relay Operations', 'Powerloop', 'Drop and Hook', 'Driver Retention', 'Long Haul Freight', 'Shuttle Operations', 'Freight Efficiency', 'Carrier Operations'],
    seoTitle: 'Powerloop & Drop-and-Hook: Transform Freight Operations',
    seoDescription: 'Discover how powerloop relay networks and drop-and-hook operations improve driver retention, reduce costs, and increase freight efficiency.',
    relatedSlugs: ['freight-lane-profitability', 'managing-trucking-costs', 'financial-strategies-carriers'],
    content: [
      'The trucking industry is experiencing a fundamental shift in how long-haul freight moves. Powerloop relay networks and drop-and-hook operations are replacing traditional over-the-road models, with profound implications for efficiency, driver retention, and environmental impact.',
      '## What Is a Powerloop?',
      'A powerloop (also called a relay loop or shuttle run) is a closed circuit where drivers run the same route continuously, handing off trailers to other drivers at relay points instead of completing the entire long-haul journey.',
      'For example: Driver A runs LA to Phoenix (240 miles), hands off to Driver B who runs Phoenix to Tucson (290 miles), who hands off to Driver C, and so on until the freight reaches Dallas. Then each driver runs the same route in reverse with backhaul freight.',
      '## The Drop-and-Hook Advantage',
      'Traditional live loading/unloading keeps drivers waiting 2-4 hours on average, unpaid time that kills productivity and driver satisfaction. Drop-and-hook operations eliminate this waste:',
      '- Driver drops loaded trailer at destination',
      '- Picks up pre-loaded trailer immediately',
      '- No waiting for forklifts or warehouse personnel',
      '- Predictable schedules enable better planning',
      'The result: Drivers complete 20-30% more revenue miles per week, and shippers enjoy more reliable transit times.',
      '## Driver Quality of Life Impact',
      'Driver retention is trucking\'s biggest challenge. Annual turnover exceeds 90% at many large carriers. Powerloop models fundamentally change the driver value proposition:',
      '**Home Daily:** Drivers on 200-300 mile relay loops return home every night instead of spending weeks on the road',
      '**Predictable Schedules:** Same route, same timing, same home arrival time creates work-life balance comparable to local delivery jobs',
      '**Familiar Territory:** Driving the same route daily means knowing every rest stop, fuel station, and congestion pattern',
      'Carriers running powerloop operations report turnover rates of 15-30%, a dramatic improvement that saves millions in recruiting and training costs.',
      '## Operational Efficiency Gains',
      'The efficiency benefits go beyond driver satisfaction:',
      '**Higher Asset Utilization:** Trailers keep moving 24/7 instead of sitting during driver rest periods. Equipment utilization can exceed 95% on well-designed loops.',
      '**Reduced Deadhead:** Shorter segments make backhaul matching easier. Instead of finding a 1,400-mile return load, you find four 300-mile loads, significantly easier.',
      '**Faster Transit Times:** Freight moves continuously. A trailer that takes 30 hours with a single driver might complete the journey in 22 hours via relay handoffs.',
      '**Improved Safety:** Well-rested drivers running familiar routes have lower accident rates. CSA scores improve, reducing insurance costs.',
      '## Real-World Implementation',
      'Several major carriers have built entire divisions around powerloop models:',
      'One large carrier converted 20% of their long-haul fleet to relay operations and saw:',
      '- 28% reduction in driver turnover',
      '- 12% increase in revenue per truck',
      '- 8% improvement in on-time delivery',
      '- 15% decrease in fuel costs per mile',
      '## Challenges and Solutions',
      'Implementing powerloops isn\'t without challenges:',
      '**Relay Point Infrastructure:** You need safe, accessible locations for trailer swaps. Solutions include existing terminals, drop yards, truck stops with reserved parking, and third-party logistics facilities.',
      '**Coordination Complexity:** Multiple drivers, multiple handoffs, weather delays, things can go wrong. Modern TMS platforms with real-time tracking and automated dispatch solve this.',
      '**Customer Education:** Shippers accustomed to single-driver, white-glove service may resist multi-driver relay models. Demonstrating improved on-time performance and reduced damage rates wins them over.',
      '## The Future of Freight',
      'Powerloop and drop-and-hook models aren\'t just operational improvements, they\'re the future of sustainable freight transportation. As the industry faces driver shortages, environmental pressure, and demand for faster delivery, relay operations provide a path forward that benefits carriers, drivers, shippers, and the environment.',
      'The question isn\'t whether relay models will expand, it\'s how quickly carriers will adapt to capture the advantages they offer.',
    ],
  },
  'eld-compliance-guide': {
    title: 'Electronic Logging Devices: Compliance and Best Practices',
    excerpt: 'Everything carriers need to know about ELD compliance, choosing the right device, and maximizing the benefits of digital logging.',
    category: 'Electronic Logging Devices (ELD)',
    date: '2024-04-15',
    author: 'Rapid Relay Team',
    readTime: '7 min read',
    keywords: ['ELD Compliance', 'Electronic Logging', 'Hours of Service', 'FMCSA', 'Fleet Tracking', 'Driver Monitoring', 'Compliance Tools', 'Trucking Technology'],
    seoTitle: 'ELD Compliance Guide: Requirements & Best Practices 2024',
    seoDescription: 'Complete ELD compliance guide for carriers. Learn FMCSA requirements, device selection, and how to maximize ELD data for operational efficiency.',
    relatedSlugs: ['managing-trucking-costs', 'powerloop-drop-hook-impact', 'freight-lane-profitability'],
    content: [
      'Electronic Logging Devices (ELDs) have become mandatory for most commercial carriers, fundamentally changing how the industry manages compliance and records driver hours.',
      'This comprehensive guide covers everything you need to know about ELD implementation, compliance requirements, and how to leverage them for operational insights.',
      '## Understanding ELD Requirements',
      'The Federal Motor Carrier Safety Administration (FMCSA) mandated ELDs for most carriers effective December 18, 2017. Carriers must use FMCSA-certified devices that automatically record duty status.',
      '## Key ELD Features to Consider',
      '**Real-Time Compliance Monitoring:** Modern ELDs provide alerts when drivers approach violations, preventing hours-of-service infractions before they happen.',
      '**Integration Capabilities:** Choose devices that integrate with your TMS, payroll systems, and other fleet management tools for seamless data flow.',
      '**Driver Experience:** Drivers spend hours with these systems, select devices with intuitive interfaces that reduce resistance and improve adoption.',
      '## Cost Considerations',
      'ELD costs typically range from $30-$80 per vehicle monthly for subscription-based systems. While this represents an ongoing expense, savings from reduced violations and improved efficiency often exceed the cost.',
      '## Maximizing ELD Data',
      'Modern ELDs collect far more than just hours-of-service data. Leverage this information to:',
      '- Identify idle time and optimize driver behavior',
      '- Plan maintenance based on actual usage patterns',
      '- Improve dispatching efficiency with real-time location data',
      '- Analyze fuel consumption and identify improvement opportunities',
      'ELDs are no longer just compliance tools, they\'re data sources for operational optimization and driver safety improvement.',
    ],
  },
  'autonomous-trucking-future': {
    title: 'The Future of Autonomous Trucking: Timeline and Impact',
    excerpt: 'An objective look at where autonomous trucking technology stands today and what carriers should expect in the next 5-10 years.',
    category: 'Autonomous Trucking',
    date: '2024-03-28',
    author: 'Rapid Relay Team',
    readTime: '11 min read',
    keywords: ['Autonomous Trucking', 'Self-Driving Trucks', 'AV Technology', 'Future of Trucking', 'Autonomous Vehicles', 'Trucking Innovation', 'Waymo', 'Trucking Automation'],
    seoTitle: 'Autonomous Trucking Future: Timeline & Carrier Impact',
    seoDescription: 'Realistic autonomous trucking timeline for 2024-2033. Understand regulatory challenges, technology progress, and impact on carrier operations.',
    relatedSlugs: ['powerloop-drop-hook-impact', 'managing-trucking-costs', 'freight-lane-profitability'],
    content: [
      'Autonomous trucking technology has moved from science fiction to active development and testing. Understanding the realistic timeline and implications is crucial for carriers planning their future.',
      'This article provides an objective assessment of autonomous trucking progress, regulatory landscape, and practical considerations for carriers.',
      '## Current State of Autonomous Trucking',
      'As of 2024, multiple companies are testing autonomous trucks in limited environments. Waymo, Uber, TuSimple, and others have deployed vehicles on specific routes with varying levels of autonomy.',
      '## Realistic Timeline Expectations',
      '**2024-2025:** Limited deployment on specific, well-mapped routes with safety operators. Primarily highway segments with favorable conditions.',
      '**2026-2028:** Expanded geographic coverage, potential removal of safety operators on certain routes, integration with freight networks.',
      '**2029-2032:** Significant adoption on major corridors, potential regulatory approval for unsupervised operation on highways.',
      '**2033+:** Mainstream adoption with ongoing improvements and adaptation to new regulatory requirements.',
      '## Regulatory Challenges',
      'Federal and state regulations are evolving to address autonomous vehicles. Key considerations include:',
      '- Safety certification standards',
      '- Liability frameworks for autonomous operations',
      '- Insurance models for self-driving trucks',
      '- Interstate commerce and reciprocal regulations',
      '## Impact on Carriers and Drivers',
      'Autonomous trucking won\'t eliminate trucking jobs, it will transform them. Expect shifts toward remote monitoring, maintenance, and specialized routes where human intervention remains necessary.',
      'Carriers should view autonomous trucking as a complement to existing operations, not an immediate replacement.',
    ],
  },
  'tms-selection-guide': {
    title: 'TMS Selection Guide: Finding the Right Platform for Your Fleet',
    excerpt: 'Key features to evaluate when choosing a Transportation Management System, from integration capabilities to reporting tools.',
    category: 'Transportation Management System',
    date: '2024-02-14',
    author: 'Operations Team',
    readTime: '9 min read',
    keywords: ['Transportation Management System', 'TMS Software', 'Fleet Management', 'Load Optimization', 'Dispatch Software', 'Freight Management', 'TMS Selection', 'Fleet Operations'],
    seoTitle: 'TMS Selection Guide: Choose the Right Fleet Platform 2024',
    seoDescription: 'Select the best TMS for your fleet. Evaluate features, integration, scalability, and costs. Complete guide for carriers choosing transportation software.',
    relatedSlugs: ['managing-trucking-costs', 'powerloop-drop-hook-impact', 'freight-lane-profitability'],
    content: [
      'Selecting the right Transportation Management System (TMS) is one of the most important technology decisions a carrier can make. The right platform can transform operations; the wrong one creates frustration and wasted investment.',
      'This guide helps you evaluate TMS options systematically and select a platform that aligns with your operational needs.',
      '## Understanding TMS Core Functions',
      'A TMS should handle load planning, dispatch, tracking, invoicing, and reporting. Beyond basics, look for platforms offering:',
      '**Advanced Optimization:** Automatic load matching, route optimization, and backhaul suggestions.',
      '**Real-Time Visibility:** Live tracking of shipments and driver status.',
      '**Integration Ecosystem:** APIs connecting to brokers, shippers, and service providers.',
      '## Key Evaluation Criteria',
      '**Scalability:** Will the system grow with your operation? Can it handle seasonal fluctuations and future expansion?',
      '**Ease of Use:** Driver adoption is critical. Complex systems face resistance and reduced effectiveness.',
      '**Mobile Capabilities:** Drivers need access to critical information on smartphones, not just desktop systems.',
      '**Customer Support:** Implementation challenges are inevitable. Responsive support is essential.',
      '## Implementation Considerations',
      'Successful TMS implementation requires:',
      '- Proper data migration and cleansing',
      '- Staff training and change management',
      '- Integration testing with existing systems',
      '- Phased rollout to identify issues early',
      '## Cost Models',
      'TMS platforms use various pricing models:',
      '- Per-truck monthly subscription ($30-$150/truck)',
      '- Per-load transaction fees',
      '- Percentage of revenue',
      'Evaluate total cost of ownership, not just monthly fees, including implementation and customization costs.',
      'Choosing the right TMS isn\'t just about features, it\'s about finding a partner that understands your business and can evolve with your needs.',
    ],
  },
  'iot-trucking-visibility': {
    title: 'IoT in Trucking: Real-Time Visibility and Predictive Maintenance',
    excerpt: 'How Internet of Things sensors and connectivity are enabling smarter fleet management and reducing unexpected breakdowns.',
    category: 'Internet of Things (IoT)',
    date: '2024-01-22',
    author: 'Operations Team',
    readTime: '8 min read',
    keywords: ['IoT Trucking', 'Fleet Sensors', 'Predictive Maintenance', 'Vehicle Monitoring', 'Real-Time Visibility', 'Fleet Telematics', 'Truck Technology', 'Connected Fleet'],
    seoTitle: 'IoT in Trucking: Fleet Visibility & Predictive Maintenance',
    seoDescription: 'Leverage IoT sensors for fleet management. Real-time visibility, predictive maintenance, and data-driven decisions reduce breakdowns and improve efficiency.',
    relatedSlugs: ['managing-trucking-costs', 'tms-selection-guide', 'powerloop-drop-hook-impact'],
    content: [
      'Internet of Things (IoT) technology is revolutionizing fleet management by providing unprecedented visibility into vehicle health, driver behavior, and operational efficiency.',
      'IoT sensors deployed across fleets generate actionable insights that drive profitability and safety improvements.',
      '## IoT Sensor Technology in Trucking',
      'Modern IoT solutions include sensors for:',
      '**Engine and Powertrain:** Real-time diagnostics, fuel consumption, temperature, and pressure monitoring.',
      '**Driver Behavior:** Acceleration, braking, harsh cornering detection, and seatbelt compliance.',
      '**Vehicle Condition:** Tire pressure, brake wear, coolant levels, and oil quality.',
      '**Environmental:** Temperature, humidity for refrigerated units, and door open/close events.',
      '## Predictive Maintenance Applications',
      'Rather than reactive maintenance, IoT enables predictive approaches:',
      '**Early Problem Detection:** Identify issues before they cause failures or safety hazards.',
      '**Planned Service Windows:** Schedule maintenance during low-utilization periods rather than emergency roadside repairs.',
      '**Component Lifespan Optimization:** Track actual wear patterns to replace components at optimal times.',
      '## Real-Time Visibility Benefits',
      '**Customer Service:** Accurate delivery estimates and proactive communication about delays.',
      '**Route Optimization:** Real-time traffic data and vehicle location enable dynamic routing decisions.',
      '**Safety Management:** Identify coaching opportunities and recognize safe drivers.',
      '## Data Privacy and Security',
      'As with all digital systems, IoT implementations require robust security:',
      '- Data encryption for sensitive information',
      '- Secure authentication for system access',
      '- Regular security audits and compliance checks',
      '- Driver privacy protection for monitoring data',
      'IoT in trucking isn\'t about surveillance, it\'s about creating a safer, more efficient operation through data-driven decision making.',
    ],
  },
}

async function importFullContent() {
  console.log('Starting full content import to Sanity...\n')

  try {
    // Step 1: Get author and category references
    console.log('Fetching existing authors and categories...')

    const authors = await client.fetch('*[_type == "author"]{ _id, name }')
    const categories = await client.fetch('*[_type == "category"]{ _id, title }')

    const authorMap = {}
    authors.forEach(author => {
      authorMap[author.name] = author._id
    })

    const categoryMap = {}
    categories.forEach(cat => {
      categoryMap[cat.title] = cat._id
    })

    console.log(`  ✓ Found ${authors.length} authors and ${categories.length} categories\n`)

    // Step 2: Import blog posts with full content
    console.log('Importing blog posts with full content and SEO fields...\n')
    let postCount = 0
    const postIdMap = {} // Track post IDs for related posts

    // First pass: Create all posts without related posts
    for (const [slug, data] of Object.entries(fullBlogPosts)) {
      const body = parseContentToPortableText(data.content)

      const post = {
        _type: 'post',
        title: data.title,
        slug: { _type: 'slug', current: slug },
        author: { _type: 'reference', _ref: authorMap[data.author] },
        categories: [{ _type: 'reference', _ref: categoryMap[data.category] }],
        publishedAt: new Date(data.date).toISOString(),
        excerpt: data.excerpt,
        body: body,
        readTime: data.readTime,
        keywords: data.keywords || [],
        focusKeyword: data.keywords ? data.keywords[0] : '',
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.excerpt,
      }

      const createdPost = await client.create(post)
      postIdMap[slug] = createdPost._id
      postCount++
      console.log(`  ✓ Created: ${data.title.substring(0, 60)}...`)
    }

    console.log(`\n Imported ${postCount} blog posts with full content and SEO!\n`)

    // Second pass: Update posts with related post references
    console.log('Adding related post references...\n')

    for (const [slug, data] of Object.entries(fullBlogPosts)) {
      if (data.relatedSlugs && data.relatedSlugs.length > 0) {
        const relatedPosts = data.relatedSlugs
          .filter(relatedSlug => postIdMap[relatedSlug])
          .map(relatedSlug => ({
            _type: 'reference',
            _ref: postIdMap[relatedSlug],
            _key: Math.random().toString(36).substring(7)
          }))

        if (relatedPosts.length > 0) {
          await client
            .patch(postIdMap[slug])
            .set({ relatedPosts: relatedPosts })
            .commit()

          console.log(`  ✓ Linked ${relatedPosts.length} related posts to: ${data.title.substring(0, 50)}...`)
        }
      }
    }

    console.log(`\n Import complete!`)
    console.log(`   ${postCount} blog posts imported with full content`)
    console.log(`   All SEO fields populated (seoTitle, seoDescription, keywords)`)
    console.log(`   All related post references added`)
    console.log(`\n Next steps:`)
    console.log(`   1. Check Sanity Studio to verify content and SEO fields`)
    console.log(`   2. Upload images for posts`)
    console.log(`   3. Review and publish posts`)

  } catch (error) {
    console.error('\n Error during import:', error.message)
    console.error('\n Full error:', error)
    console.error('\n Troubleshooting:')
    console.error('1. Ensure SANITY_API_WRITE_TOKEN is set in .env')
    console.error('2. Verify that authors and categories already exist in Sanity')
    console.error('3. Check that your Sanity project ID and dataset are correct')
  }
}

// Run the import
importFullContent()
