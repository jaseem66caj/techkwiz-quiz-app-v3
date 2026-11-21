import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decideHomeVariant } from '@/lib/homeAb'

const HOME_AB_COOKIE = 'tk_home_v'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow test pages if explicitly enabled, otherwise block them
  if (process.env.NEXT_PUBLIC_ENABLE_TEST_PAGES !== 'true' && pathname.startsWith('/test-')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Homepage A/B test. Off unless NEXT_PUBLIC_HOME_AB=on (set only when Jaseem says go).
  if (pathname === '/') {
    const decision = decideHomeVariant({
      enabled: process.env.NEXT_PUBLIC_HOME_AB === 'on',
      country: request.headers.get('x-vercel-ip-country'),
      userAgent: request.headers.get('user-agent'),
      cookie: request.cookies.get(HOME_AB_COOKIE)?.value,
      random: Math.random,
    })
    if (decision.kind === 'assigned') {
      const res =
        decision.variant === 'game_first'
          ? NextResponse.rewrite(new URL('/home-game-first', request.url))
          : NextResponse.next()
      if (decision.setCookie) {
        res.cookies.set(HOME_AB_COOKIE, decision.variant === 'game_first' ? 'gf' : 'ct', {
          maxAge: 60 * 60 * 24 * 90,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      }
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/test-:path*'],
}
