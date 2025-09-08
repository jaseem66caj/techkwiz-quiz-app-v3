import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block test pages in production
  if (process.env.NODE_ENV === 'production' && pathname.startsWith('/test-')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Block test pages if explicitly disabled
  if (process.env.NEXT_PUBLIC_ENABLE_TEST_PAGES === 'false' && pathname.startsWith('/test-')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/test-:path*',
  ],
}
