import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow test pages if explicitly enabled, otherwise block them
  if (process.env.NEXT_PUBLIC_ENABLE_TEST_PAGES !== 'true' && pathname.startsWith('/test-')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/test-:path*',
  ],
}
