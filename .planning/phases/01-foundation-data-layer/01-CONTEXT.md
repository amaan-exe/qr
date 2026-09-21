# Phase 1: Foundation & Data Layer - Context

**Gathered:** 2026-09-22
**Status:** Ready for planning
**Source:** PRD v1.1 + tech.md (express path — all decisions derived from existing docs)

<domain>
## Phase Boundary

This phase delivers the technical foundation for ReviewPulse:
1. Next.js project scaffold with TypeScript, Tailwind CSS, shadcn/ui
2. Supabase database with all 10 tables, constraints, and RLS policies
3. Supabase Auth integration (email+password) with business onboarding flow
4. Public API route stubs (`/api/public/*`) with session cookie signing
5. Supabase client setup (server + browser), generated types
6. Zod validation schemas shared between client and server
7. Rate limiting middleware (Upstash Redis)
8. Bot detection middleware (isbot)

Does NOT include: customer-facing UI (Phase 2), draft generation (Phase 3), dashboard UI (Phase 4), or performance/a11y polish (Phase 5).
</domain>

<decisions>
## Implementation Decisions

### Project Structure
- Next.js App Router with `src/` directory
- TypeScript strict mode
- Tailwind CSS + shadcn/ui (Radix primitives) installed via `npx shadcn@latest init`
- Path aliases: `@/` → `src/`
- `supabase/` directory for migrations and seed data

### Database Schema (all from PRD Section 12 — locked)
- 10 tables: `businesses`, `campaigns`, `menu_items`, `questions`, `sessions`, `answers`, `review_drafts`, `private_feedback`, `events`, `session_flags`
- All tables: `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`
- RLS enabled on every table
- `business_id` is the tenant boundary everywhere
- Session status enum: `landed`, `in_progress`, `completed` (check constraint)
- Campaign slug: unique globally, lowercase a-z0-9-, 6-40 chars
- Answers value: `jsonb` (int | string | array per question type)
- Events: append-only, unique on `(session_id, client_event_id)`
- Questions: unique on `(business_id, key)`

### Authentication (locked)
- Supabase Auth email+password only (Google OAuth is P1, skip)
- One owner per business in MVP
- `businesses.owner_id` references `auth.users`

### RLS Policies (locked)
- Owner policies: row readable/writable only if `businesses.owner_id = auth.uid()`
- Customer-facing writes: service-role key only — anon Supabase client has NO direct table access
- Public API routes use service-role key server-side
- Dashboard uses authenticated Supabase client with owner RLS

### Session Cookie (locked)
- Name: `rp_session`
- Library: `jose` (signed JWT)
- httpOnly, signed, 24-hour expiry
- Contains: `session_id`, `campaign_id`, `business_id`
- Every customer endpoint verifies session_id matches cookie

### API Routes (all under `/api/public/`, locked)
- `POST /sessions` — create/restore session for `{slug}`; returns landing config
- `PUT /sessions/{id}/answers/{question_key}` — upsert one answer
- `POST /sessions/{id}/start` — mark started, fire QUIZ_STARTED
- `POST /sessions/{id}/submit` — validate + complete (idempotent)
- `POST /sessions/{id}/draft` — generate draft (idempotent)
- `PATCH /sessions/{id}/draft` — save final_text
- `POST /sessions/{id}/events` — client events (GOOGLE_CLICKED, DRAFT_EDITED)
- `POST /sessions/{id}/private-feedback` — submit private feedback

### Rate Limiting
- Upstash Redis + `@upstash/ratelimit`
- 60 req/min/IP on public endpoints
- Return 429 with retry-safe idempotency

### Bot Detection
- `isbot` package to filter known bots/link-preview user agents
- Bots MUST NOT create sessions

### Supabase Client Setup
- `@supabase/supabase-js` + `@supabase/ssr`
- Server client (service-role key) for customer writes
- Browser client (anon key) for authenticated dashboard queries
- Generated types from `supabase gen types typescript`
- No ORM

### Validation
- Zod schemas for all API inputs
- Shared between client forms and server endpoints
- Rating validation: integer 1-5
- Slug validation: lowercase a-z0-9-, 6-40 chars
- Google URL validation: https + allowed hosts (google.com, search.google.com, g.page, maps.app.goo.gl, goo.gl)

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (client-side)
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only)
- `APP_DOMAIN` — production domain for QR URLs
- `SESSION_COOKIE_SECRET` — cookie signing secret
- `HASH_SALT` — salt for IP/UA hashing
- `UPSTASH_REDIS_REST_URL` — Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis token
- `ANTHROPIC_API_KEY` — LLM key (used in Phase 3 but env var defined now)

### Claude's Discretion
- Exact middleware implementation pattern (Next.js middleware vs per-route)
- Error response format for API routes
- Logging format and library choice (structured JSON)
- Exact shadcn/ui component selection during init
- Database migration file naming convention
- Seed data structure for testing

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Requirements
- `prd.md` — Full PRD v1.1, Section 12 (data model), Section 13 (security), Section 15 (API)

### Tech Stack
- `tech.md` — Stack decisions, hosting, cost estimates

### Project Context
- `.planning/PROJECT.md` — Living project context
- `.planning/REQUIREMENTS.md` — All 89 requirements with IDs
- `.planning/brain/CONTEXT.md` — Single-file brain context for agents

### Data Flow
- `flow.png` — Visual user flow diagram

</canonical_refs>

<specifics>
## Specific Ideas

### Default Quiz Questions (seed data for `questions` table)
Per PRD Section 7.2, these core questions must be seeded when a business is created:

| Position | Key | Type | Required | Enabled |
|----------|-----|------|----------|---------|
| 1 | `overall_rating` | rating | Yes | Yes |
| 2 | `food_rating` | rating | Yes | Yes |
| 3 | `service_rating` | rating | Yes | Yes |
| 4 | `liked` | multi_choice | No | Yes |
| 5 | `ordered` | multi_choice | No | Yes |
| 6 | `comment` | text | No | No |
| 7 | `return_intent` | single_choice | No | No |

### Business Defaults
- `category`: 'restaurant' (only option in MVP, check constraint)
- `timezone`: 'Asia/Kolkata'
- `default_language`: 'en'
- `welcome_message`: `{"en": "Thanks for visiting! We'd love to hear about your experience today."}`

### Campaign Slug Generation
- Auto-generate random 8-char slug (lowercase a-z0-9)
- Must be globally unique
- Immutable in P0

</specifics>

<deferred>
## Deferred Ideas

- Google OAuth for business login (P1)
- Hindi language support / i18n (P1)
- Custom questions (P1)
- Campaign-level Google URL override (P1)
- Question reordering (P1)
- Anomaly detection / session_flags logic (P1 — table created but flagging logic deferred)
- Retention purge jobs (not MVP-critical, table structure supports it)

</deferred>

---

*Phase: 01-foundation-data-layer*
*Context gathered: 2026-09-22 via PRD Express Path*
