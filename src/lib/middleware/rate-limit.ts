import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse, type NextRequest } from 'next/server'

let ratelimit: Ratelimit | null = null

function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null // Skip rate limiting if not configured (dev mode)
  }
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: 'reviewpulse:ratelimit',
    })
    return ratelimit
  } catch {
    return null
  }
}

export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const limiter = getRateLimiter()
  if (!limiter) return null // No rate limiting configured

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  try {
    const { success, remaining, reset } = await limiter.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': remaining.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }
  } catch {
    // If Redis fails, fail open to avoid downtime
    return null
  }
  return null // Allow through
}
