import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse, type NextRequest } from 'next/server'

let ratelimit: Ratelimit | null = null

function isPlaceholderOrInvalid(val?: string): boolean {
  if (!val) return true
  const lower = val.toLowerCase()
  return (
    lower.includes('placeholder') ||
    lower.includes('your-redis') ||
    lower.includes('your-upstash') ||
    lower.includes('example.com')
  )
}

function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (isPlaceholderOrInvalid(url) || isPlaceholderOrInvalid(token)) {
    return null // Skip rate limiting if not configured (dev mode / placeholder)
  }

  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: false,
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
    // 600ms timeout to prevent hanging user requests if Redis is unreachable
    const timeoutPromise = new Promise<{ success: boolean; remaining: number; reset: number }>((_, reject) =>
      setTimeout(() => reject(new Error('Rate limit timeout')), 600)
    )

    const { success, remaining, reset } = await Promise.race([
      limiter.limit(ip),
      timeoutPromise,
    ])

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
    // If Redis fails or times out, fail open to avoid slowing down user requests
    return null
  }
  return null // Allow through
}
