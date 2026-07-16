/**
 * Sanity Data Import Script
 *
 * This script imports authors, categories, and blog posts into your Sanity dataset.
 *
 * Usage:
 * 1. Ensure .env has your NEXT_PUBLIC_SANITY_PROJECT_ID set
 * 2. Run: node sanity-import-script.js
 *
 * Note: This uses the Sanity client WITHOUT authentication token,
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

async function importData() {
  console.log('Starting Sanity data import...\n')

  try {
    // Step 1: Import Authors
    console.log('Creating authors...')
    const authorMap = {}
    const authors = [
      { id: 'rapid-relay-team', name: 'Rapid Relay Team', bio: 'The Rapid Relay team brings together industry expertise in freight optimization, relay operations, and supply chain innovation.' },
      { id: 'compliance-team', name: 'Compliance Team', bio: 'Specialized in trucking regulations, permitting requirements, and regulatory compliance.' },
      { id: 'finance-team', name: 'Finance Team', bio: 'Expert advisors on carrier financial management, cash flow optimization, and strategic growth.' },
      { id: 'operations-team', name: 'Operations Team', bio: 'Focused on operational efficiency, cost management, and logistics optimization.' },
    ]

    for (const author of authors) {
      const doc = await client.create({
        _type: 'author',
        name: author.name,
        slug: { _type: 'slug', current: author.id },
        bio: author.bio,
      })
      authorMap[author.name] = doc._id
      console.log(`  ✓ Created author: ${author.name}`)
    }

    // Step 2: Import Categories
    console.log('\n Creating categories...')
    const categoryMap = {}
    const categories = [
      { id: 'trucking', title: 'Trucking', description: 'Industry insights and operational strategies' },
      { id: 'regulation', title: 'Regulation', description: 'Compliance requirements and regulatory guidance' },
      { id: 'logistics-news', title: 'Logistics News', description: 'Latest news and trends in logistics and freight transportation' },
      { id: 'electronic-logging-devices-eld', title: 'Electronic Logging Devices (ELD)', description: 'ELD compliance, technology, and best practices' },
      { id: 'autonomous-trucking', title: 'Autonomous Trucking', description: 'Self-driving technology and the future of trucking' },
      { id: 'transportation-management-system', title: 'Transportation Management System', description: 'TMS platforms and fleet technology solutions' },
      { id: 'internet-of-things-iot', title: 'Internet of Things (IoT)', description: 'IoT sensors, telematics, and connected vehicle technology' },
      { id: 'investment-news', title: 'Investment News', description: 'Financial news and investment trends in logistics' },
      { id: 'data-mining', title: 'Data Mining', description: 'Data analytics and business intelligence for freight' },
    ]

    for (const cat of categories) {
      const doc = await client.create({
        _type: 'category',
        title: cat.title,
        slug: { _type: 'slug', current: cat.id },
        description: cat.description,
      })
      categoryMap[cat.title] = doc._id
      console.log(`  ✓ Created category: ${cat.title}`)
    }

  } catch (error) {
    console.error('\n Error during import:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Make sure NEXT_PUBLIC_SANITY_PROJECT_ID is set in .env')
    console.error('2. You may need to add a write token (SANITY_API_WRITE_TOKEN)')
  }
}

// Run the import
importData()
