/**
 * In-house anti-spam / anti-bot helpers for public form endpoints.
 *
 * Strategy (no third-party CAPTCHA): every signal here is used to SILENTLY drop a
 * submission (the caller returns the normal success response) so bots get no
 * feedback. Legit submissions are unaffected. DB-backed so it actually works on
 * serverless (unlike the old in-memory limiter in lib/rateLimit.ts).
 */
import { createHash } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * IPv4 is a small keyspace, so a hash salted with a value anyone can read is
 * reversible by brute force. The Privacy Policy states that we keep only a salted
 * hash and never the raw IP, and that claim is only true if RATE_LIMIT_SALT is
 * actually set in the runtime environment. Warn loudly outside development rather
 * than falling back silently.
 */
const SALT = process.env.RATE_LIMIT_SALT || 'lanework-dev-fallback-salt'
if (!process.env.RATE_LIMIT_SALT && process.env.NODE_ENV === 'production') {
  console.error(
    '[spam] RATE_LIMIT_SALT is not set. IP hashes are using a public fallback salt and ' +
      'are effectively reversible. Set it in the Netlify site environment.'
  )
}

// Tunables
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_MAX = 3 // max submissions per IP per window
const DUP_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/** Privacy-preserving IP identifier — the raw IP is never stored. */
export function hashIp(request: NextRequest): string {
  return createHash('sha256').update(`${getClientIp(request)}:${SALT}`).digest('hex')
}

export type AbuseReason = 'rate' | 'duplicate' | null

/**
 * Returns a reason if this contact submission should be silently dropped:
 *  - 'rate'      — more than RATE_MAX from the same IP within the window
 *  - 'duplicate' — an identical message from the same IP or email within 24h
 * Fails OPEN (returns null) on any DB error so real users are never blocked.
 */
export async function checkContactAbuse(opts: {
  ipHash: string
  email: string
  message?: string | null
}): Promise<AbuseReason> {
  const { ipHash, email } = opts
  const now = Date.now()
  const rateSince = new Date(now - RATE_WINDOW_MS)
  const dupSince = new Date(now - DUP_WINDOW_MS)
  const normEmail = email.trim().toLowerCase()
  const trimmedMsg = opts.message?.trim() || null

  try {
    const recentFromIp = await prisma.contact.count({
      where: { ipHash, createdAt: { gt: rateSince } },
    })
    if (recentFromIp >= RATE_MAX) return 'rate'

    const dup = await prisma.contact.findFirst({
      where: {
        createdAt: { gt: dupSince },
        OR: [{ ipHash }, { email: normEmail }],
        // Identical message (or both empty) counts as a repeat.
        message: trimmedMsg,
      },
      select: { id: true },
    })
    if (dup) return 'duplicate'
  } catch (e) {
    console.error('[spam] abuse check failed, allowing submission:', e)
    return null
  }
  return null
}

const SPAM_PATTERNS: RegExp[] = [
  /\bwww\.[a-z0-9-]+\.[a-z]{2,}/i,
  /\[url[=\]]/i,
  /\b(viagra|casino|crypto\s?airdrop|forex\s?signals|seo\s?services|buy\s?backlinks|loan\s?offer)\b/i,
]

/**
 * Soft spam heuristic. When true, the caller should still store the lead (for
 * audit) but skip the admin email/CRM sync so the inbox stays clean. Deliberately
 * conservative to avoid false positives on legitimate messages.
 */
export function looksLikeSpam(message?: string | null): boolean {
  const msg = message ?? ''
  if (!msg.trim()) return false
  const linkCount = (msg.match(/https?:\/\//gi) || []).length
  if (linkCount >= 1) return true
  return SPAM_PATTERNS.some((re) => re.test(msg))
}
