import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lanework.ai'

// AI answer-engine crawlers we explicitly welcome (ChatGPT/SearchGPT, Claude,
// Perplexity, Google/Apple AI grounding). They inherit the same allow/disallow as
// everyone else; naming them makes the intent explicit. See /llms.txt and
// /llms-full.txt for the AI-optimized content corpus.
const aiUserAgents = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
]

export default function robots(): MetadataRoute.Robots {
  // Block API routes and the tokenized gated-download redirect. Paid landing
  // pages (/lp/*) are noindex via their own metadata, but keep crawlers off the
  // duplicate funnel path too.
  const disallow = ['/api/gated-content/download', '/api/', '/lp/']
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: aiUserAgents, allow: '/', disallow },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
