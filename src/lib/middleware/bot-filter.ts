import { isbot } from 'isbot'
import { NextResponse, type NextRequest } from 'next/server'

export function botFilterMiddleware(request: NextRequest): NextResponse | null {
  // Never block requests in development, localhost, or internal testing
  const host = request.nextUrl.hostname
  if (
    process.env.NODE_ENV !== 'production' ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.startsWith('172.')
  ) {
    return null
  }

  // Never filter active quiz participation (answers, submit, telemetry)
  const pathname = request.nextUrl.pathname
  if (
    pathname.includes('/answers') ||
    pathname.includes('/submit') ||
    pathname.includes('/draft') ||
    pathname.includes('/events')
  ) {
    return null
  }

  const userAgent = request.headers.get('user-agent')
  if (userAgent && isbot(userAgent)) {
    // Return 204 No Content for search crawlers/scrapers landing on QR links
    return new NextResponse(null, { status: 204 })
  }

  return null // Allow through
}
