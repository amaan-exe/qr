import { isbot } from 'isbot'
import { NextResponse, type NextRequest } from 'next/server'

export function botFilterMiddleware(request: NextRequest): NextResponse | null {
  const userAgent = request.headers.get('user-agent')
  if (userAgent && isbot(userAgent)) {
    // Return 204 No Content for bots — prevents session creation
    return new NextResponse(null, { status: 204 })
  }
  return null // Not a bot, allow through
}
