# Phase 1: Foundation & Data Layer — Research

**Researched:** 2026-09-22
**Confidence:** High — all patterns well-documented, production-proven

---

## 1. Next.js 16 Project Scaffold

### Setup Commands
```bash
npx create-next-app@latest ./ --typescript --tailwind --app --src-dir --import-alias "@/*" --use-npm
npx shadcn@latest init --style default --base-color slate --css-variables
```

### Key Facts (2026)
- **Next.js 16.3.x** is current stable/LTS (shipped Aug 3 2026)
- Next.js 16 introduced `proxy.ts` replacing legacy `middleware.ts` — but traditional `middleware.ts` still works
- Pin exact version for security (`16.3.x` latest patch)
- App Router is default; `src/` directory recommended for cleaner structure
- shadcn/ui components land in `src/components/ui/` with full code ownership

### Project Structure
```
src/
├── app/
│   ├── (auth)/                    # Auth routes group (login, signup)
│   ├── (dashboard)/               # Protected dashboard routes
│   ├── r/[slug]/                  # Customer-facing QR landing
│   ├── api/public/                # Public API routes
│   │   └── sessions/
│   │       ├── route.ts           # POST /sessions
│   │       └── [id]/
│   │           ├── start/route.ts
│   │           ├── submit/route.ts
│   │           ├── draft/route.ts
│   │           ├── events/route.ts
│   │           ├── private-feedback/route.ts
│   │           └── answers/[question_key]/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client (createBrowserClient)
│   │   ├── server.ts              # Server client (createServerClient, anon key)
│   │   └── admin.ts               # Admin client (service-role key, for customer writes)
│   ├── session/
│   │   └── cookie.ts              # jose sign/verify for rp_session
│   ├── validation/
│   │   └── schemas.ts             # Zod schemas shared client/server
│   ├── middleware/
│   │   ├── rate-limit.ts          # Upstash rate limiter
│   │   └── bot-filter.ts          # isbot detection
│   └── types/
│       └── database.ts            # Generated Supabase types
└── middleware.ts                   # Next.js middleware
```

---

## 2. Supabase RLS & Tenant Isolation

### Pattern: Shared Schema + RLS (Recommended)
- All tenants share same tables, isolated by `business_id`
- RLS policies reference `auth.uid()` for owner operations
- Service-role key bypasses RLS (used for customer writes)

### RLS Policy Patterns

**Owner policies (dashboard):**
```sql
-- businesses: owner can read/write their own business
CREATE POLICY "owner_read" ON businesses
  FOR SELECT USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "owner_write" ON businesses
  FOR ALL USING (owner_id = (SELECT auth.uid()));

-- campaigns: owner can manage campaigns for their business
CREATE POLICY "owner_campaigns" ON campaigns
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = (SELECT auth.uid())
    )
  );
```

**Customer policies (service-role only):**
```sql
-- No anon policies on sessions, answers, events etc.
-- All customer writes go through server endpoints using service-role key
-- This means: ZERO select/insert/update/delete policies for anon role
```

### Performance Best Practices
- Use `(SELECT auth.uid())` wrapper (not bare `auth.uid()`) — helps query planner
- Index `business_id` on every table (composite: `(business_id, created_at)`)
- Index `campaign_id` on sessions
- Index `session_id` on answers, events, review_drafts

---

## 3. Session Cookie (jose)

### Implementation Pattern
```typescript
import { SignJWT, jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(process.env.SESSION_COOKIE_SECRET);

// Sign session
async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

// Verify session
async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
```

### Cookie Settings
```typescript
{
  name: 'rp_session',
  httpOnly: true,
  secure: true,           // HTTPS only
  sameSite: 'lax',        // CSRF protection
  path: '/',
  maxAge: 24 * 60 * 60,   // 24 hours
}
```

### Session Payload
```typescript
interface SessionPayload {
  session_id: string;      // UUID
  campaign_id: string;     // UUID
  business_id: string;     // UUID
  iat: number;             // issued at
  exp: number;             // expires at
}
```

---

## 4. Supabase Client Setup (@supabase/ssr)

### Three Client Types

1. **Browser client** (`createBrowserClient`) — used in client components for authenticated dashboard
2. **Server client** (`createServerClient` with anon key) — used in server components for authenticated queries
3. **Admin client** (`createClient` with service-role key) — used in API routes for customer writes (bypasses RLS)

### Important: Middleware for Auth Refresh
```typescript
// middleware.ts — refresh Supabase auth session
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(URL, ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      ),
    },
  });
  await supabase.auth.getUser();
  return response;
}
```

---

## 5. Rate Limiting (Upstash)

### Setup
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'),  // 60 req/min
  analytics: true,
  prefix: 'reviewpulse:ratelimit',
});
```

### Usage in API Routes
```typescript
const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
const { success, remaining, reset } = await ratelimit.limit(ip);
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, {
    status: 429,
    headers: {
      'X-RateLimit-Remaining': remaining.toString(),
      'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
    },
  });
}
```

---

## 6. Database Migration Strategy

### Supabase CLI
```bash
npx supabase init               # Creates supabase/ directory
npx supabase migration new init  # Creates timestamped migration file
```

### Migration Order (for foreign key dependencies)
1. `businesses` (root tenant table)
2. `campaigns` (FK → businesses)
3. `menu_items` (FK → businesses)
4. `questions` (FK → businesses)
5. `sessions` (FK → campaigns, businesses)
6. `answers` (FK → sessions, questions)
7. `review_drafts` (FK → sessions)
8. `private_feedback` (FK → sessions, businesses)
9. `events` (FK → sessions)
10. `session_flags` (FK → sessions)
11. RLS policies (all tables)
12. Indexes

### Seed Data
- When a business is created, auto-seed 7 default questions (Q1-Q7) via a database function or application logic

---

## 7. Zod Validation Schemas

### Shared Schema Pattern
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const ratingSchema = z.number().int().min(1).max(5);

export const slugSchema = z.string()
  .min(6).max(40)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens');

export const googleUrlSchema = z.string().url().refine(
  (url) => {
    const host = new URL(url).hostname;
    return ['google.com', 'search.google.com', 'g.page', 'maps.app.goo.gl', 'goo.gl']
      .some(allowed => host === allowed || host.endsWith('.' + allowed));
  },
  'Must be a Google review URL'
);

export const sessionSubmitSchema = z.object({
  overall_rating: ratingSchema,
  food_rating: ratingSchema,
  service_rating: ratingSchema,
});
```

---

## 8. Bot Detection

### isbot Usage
```typescript
import { isbot } from 'isbot';

function isBotRequest(userAgent: string | null): boolean {
  return userAgent ? isbot(userAgent) : false;
}
```

Apply in session creation endpoint — return 204 or 403 for bots, never create a session.

---

## 9. Environment Variables (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
APP_DOMAIN=
NEXT_PUBLIC_APP_URL=

# Session
SESSION_COOKIE_SECRET=         # 32+ char random string

# Security
HASH_SALT=                     # For IP/UA hashing

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# LLM (Phase 3, defined now)
ANTHROPIC_API_KEY=
```

---

## 10. Pitfalls & Gotchas

1. **Next.js 16 security**: Monthly security releases patching high/medium vulns. Pin exact versions, enable Dependabot.
2. **Supabase anon key exposure**: The anon key is public (in `NEXT_PUBLIC_*`). Security comes from RLS, not key secrecy. But the anon key must have ZERO policies allowing direct table access for customer data.
3. **Service-role key in client bundle**: NEVER. Only in server-side code (`'use server'`, Route Handlers, Server Actions).
4. **Cookie SameSite**: `lax` is correct for our use case (QR scan opens a new navigation, which works with `lax`).
5. **Supabase types generation**: Run `supabase gen types typescript` after every migration change. Commit the generated file.
6. **Middleware ordering**: If combining Supabase auth refresh + rate limiting + bot detection in middleware, order matters: bot check first (cheapest), then rate limit, then auth refresh.
