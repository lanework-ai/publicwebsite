import { NextRequest, NextResponse } from 'next/server'

/**
 * Basic-Auth gate over /admin/*, which hosts the embedded Sanity Studio.
 *
 * Ported from the Rapid Relay app, minus its /labs preview gate: /labs was the
 * private staging area for this rebrand and Lanework is now the site itself, so
 * only the admin area still needs gating. Studio has its own Sanity login as
 * well; this is the first line of defense in front of it.
 *
 * Fail behavior:
 *   - creds set         -> enforce Basic Auth
 *   - creds unset, dev  -> allow through (local convenience)
 *   - creds unset, prod -> block (503), so the area is never accidentally public
 */
export const config = {
  matcher: ['/admin/:path*'],
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

const REALM = 'Lanework Admin'

const UNAUTHORIZED = () =>
  new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  })

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASSWORD

  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('This area is not configured. Set ADMIN_USER and ADMIN_PASSWORD.', {
        status: 503,
      })
    }
    return NextResponse.next() // local dev convenience
  }

  const auth = req.headers.get('authorization')
  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      let decoded = ''
      try {
        decoded = atob(encoded)
      } catch {
        return UNAUTHORIZED()
      }
      const idx = decoded.indexOf(':')
      const u = decoded.slice(0, idx)
      const p = decoded.slice(idx + 1)
      if (safeEqual(u, user) && safeEqual(p, pass)) {
        return NextResponse.next()
      }
    }
  }

  return UNAUTHORIZED()
}
