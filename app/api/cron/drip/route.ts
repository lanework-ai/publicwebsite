/**
 * Drip nurture cron endpoint. Hit by Netlify Scheduled Function (or any scheduler)
 * roughly once a day. Finds every gated_content_leads row whose dripNextSendAt is
 * due, sends the next email in the sequence, advances dripStep + schedules the next.
 *
 * Auth:
 *   - Header `Authorization: Bearer <CRON_SECRET>`, OR
 *   - Query  `?secret=<CRON_SECRET>` (for easier curl/preview testing)
 *
 * Optional query params (testing only, ignored in prod when ALLOW_DRIP_TIME_SHIM is
 * not set):
 *   - `?nowOffsetMs=<N>` — pretend "now" is N ms in the future. Lets us drive 21
 *     days of sequence in seconds during a smoke test.
 *
 * Returns a JSON summary so the caller (and human operators) can see what happened.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDripEmail } from '@/lib/email'
import { sendLaneworkDripEmail } from '@/lib/labs-email'

// Days between drip steps. Index = step we're about to send.
// step 1 (Day 2)  -> next at step 2 in 3 days  (Day 5)
// step 2 (Day 5)  -> next at step 3 in 7 days  (Day 12, final note from Ahmed)
// step 3 (Day 12) -> sequence complete, dripNextSendAt = null
const DELAYS_DAYS_AFTER_STEP: Record<number, number | null> = {
  1: 3,
  2: 7,
  3: null,
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
}

function validateSecret(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const auth = request.headers.get('authorization') || ''
  if (auth === `Bearer ${expected}`) return true
  const q = request.nextUrl.searchParams.get('secret')
  if (q && q === expected) return true
  return false
}

function resolveNow(request: NextRequest): Date {
  if (process.env.ALLOW_DRIP_TIME_SHIM === '1') {
    const offsetParam = request.nextUrl.searchParams.get('nowOffsetMs')
    if (offsetParam) {
      const offset = Number(offsetParam)
      if (Number.isFinite(offset)) return new Date(Date.now() + offset)
    }
  }
  return new Date()
}

export async function GET(request: NextRequest) {
  if (!validateSecret(request)) return unauthorized()

  const now = resolveNow(request)
  const due = await prisma.gatedContentLead.findMany({
    where: {
      dripStep: { lt: 3 },
      dripNextSendAt: { lte: now },
      dripUnsubscribedAt: null,
    },
    orderBy: { dripNextSendAt: 'asc' },
    take: 100, // cap per tick; if backlog grows we run multiple ticks
  })

  const results: Array<{
    id: string
    email: string
    step: number
    ok: boolean
    error?: string
    nextSendAt?: string | null
  }> = []

  for (const lead of due) {
    // The lead's current dripStep is the LAST step that was sent (0 = day-0 confirmation).
    // So the next step we send is dripStep + 1 (cast 1..3).
    // Unsubscribe check is enforced by the dripUnsubscribedAt filter in the
    // query above. The newsletter-unsubscribe route writes that field for
    // every GatedContentLead matching the email.
    const upcomingStep = (lead.dripStep + 1) as 1 | 2 | 3

    // Each brand has its own sequence: Lanework leads get the research-voiced
    // nurture; everything else keeps the Rapid Relay product nurture.
    const send =
      lead.brand === 'lanework'
        ? await sendLaneworkDripEmail(upcomingStep, {
            to: lead.email,
            name: lead.name,
            contentTitle: lead.contentTitle,
            contentSlug: lead.contentSlug,
          })
        : await sendDripEmail(upcomingStep, {
            to: lead.email,
            name: lead.name,
            company: lead.company,
            contentType: lead.contentType as 'whitepaper' | 'benchmark',
            contentTitle: lead.contentTitle,
            contentSlug: lead.contentSlug,
          })

    if (!send.success) {
      // Don't advance step on failure; the next tick will retry.
      results.push({
        id: lead.id,
        email: lead.email,
        step: upcomingStep,
        ok: false,
        error: send.error instanceof Error ? send.error.message : String(send.error),
      })
      continue
    }

    const delayDays = DELAYS_DAYS_AFTER_STEP[upcomingStep]
    const nextSendAt = delayDays == null ? null : new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000)

    await prisma.gatedContentLead.update({
      where: { id: lead.id },
      data: { dripStep: upcomingStep, dripNextSendAt: nextSendAt },
    })

    results.push({
      id: lead.id,
      email: lead.email,
      step: upcomingStep,
      ok: true,
      nextSendAt: nextSendAt ? nextSendAt.toISOString() : null,
    })
  }

  return NextResponse.json({
    ok: true,
    now: now.toISOString(),
    dueCount: due.length,
    sentCount: results.filter((r) => r.ok).length,
    failedCount: results.filter((r) => !r.ok).length,
    results,
  })
}

// POST is identical behavior; some schedulers prefer POST.
export const POST = GET
