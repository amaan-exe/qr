# ReviewPulse

## What This Is

ReviewPulse is a QR-based customer feedback platform for restaurants. Customers scan a QR code, complete a quick 5-question quiz, receive an optional AI-generated review draft (editable), and are handed off to the restaurant's Google review page. Business owners get a dashboard with response analytics, campaign management, and private feedback — all without manipulating who gets to review.

## Core Value

Turn every restaurant visit into (a) structured experience data the owner can act on and (b) an easy, authentic path to leave a public Google review — without steering, incentivizing, or filtering by rating.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet - ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Customer Flow (Anonymous, No Account)**
- [ ] QR scan → landing page with business branding
- [ ] 5-question default quiz (Q1-Q3 required ratings, Q4-Q5 optional multi-choice)
- [ ] Session management via signed cookie (`rp_session`, httpOnly, 24h)
- [ ] Partial answer persistence (save per question as customer advances)
- [ ] AI-generated review draft from answers (LLM with deterministic fallback)
- [ ] Editable draft with "Share on Google" (copy + open Google URL)
- [ ] Private feedback form (category, message, optional contact)
- [ ] Thank-you screen — no pressure, no upsell
- [ ] Fallback screen for invalid/inactive QR codes
- [ ] Bot/link-preview detection (no fake sessions)

**Compliance Guardrails (CG-1 through CG-10)**
- [ ] Equal access: identical Google CTA for all ratings (CG-1)
- [ ] No rating-based routing (CG-2)
- [ ] No incentives (CG-3)
- [ ] Draft is optional, customer-owned, labeled correctly (CG-4)
- [ ] No content steering, no staff names, no promo language (CG-5)
- [ ] Truthful drafts preserving sentiment polarity (CG-6)
- [ ] Non-repetitive drafts across sessions (CG-7)
- [ ] No pressure copy (CG-8)
- [ ] Honest metrics: click ≠ review (CG-9)
- [ ] No data suppression in dashboards (CG-10)

**Draft Generation Pipeline**
- [ ] Fact sheet from answers → LLM prompt → candidate → validators → show/fallback
- [ ] Validators: length (25-90 words), fact allow-list, polarity check, forbidden content, language match
- [ ] Retry once on validation failure, then deterministic template fallback
- [ ] 8-second timeout, empty textarea fallback if all else fails
- [ ] Anti-repetition: hash-based duplicate detection with anomaly flagging

**Business Dashboard**
- [ ] Auth: email+password via Supabase Auth
- [ ] Onboarding: account → business info → Google URL → campaign → quiz config → menu items → QR
- [ ] Campaign CRUD (name, slug, active/inactive)
- [ ] QR generation (PNG, SVG) encoding `https://{APP_DOMAIN}/r/{slug}`
- [ ] Quiz builder (enable/disable questions)
- [ ] Menu items management
- [ ] Analytics: scans, starts, completions, rates, Google clicks, avg ratings, distributions, liked breakdown, low-rating share, campaign table, item table
- [ ] Responses list with filters + detail view
- [ ] Private feedback view
- [ ] Settings

**Event Tracking (Append-Only)**
- [ ] QR_SCANNED, LANDING_VIEWED, QUIZ_STARTED, QUESTION_ANSWERED, QUIZ_COMPLETED, DRAFT_GENERATED, DRAFT_EDITED, GOOGLE_CLICKED, PRIVATE_FEEDBACK_SUBMITTED
- [ ] Idempotency via `client_event_id` unique per session
- [ ] Denormalized `campaign_id` and `business_id` on every event

**Security & Privacy**
- [ ] RLS on every table, `business_id` as tenant boundary
- [ ] Customer writes only through server endpoints (service-role key)
- [ ] No direct table access for anonymous Supabase client
- [ ] IP/UA stored as salted hashes only
- [ ] Session cookie signed and verified on every customer endpoint
- [ ] Rate limiting (60 req/min/IP)

**Non-Functional**
- [ ] Landing page < 2s load (Lighthouse mobile throttling)
- [ ] WCAG 2.1 AA: 44×44px touch targets, screen-reader labels, keyboard nav, contrast
- [ ] Idempotent endpoints, connection-loss UI with retry
- [ ] Structured server logs with session_id/business_id

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Auto-posting or scraping Google reviews — violates Google policy
- Customer accounts/login — anonymous is core value
- Native apps — mobile web only for MVP
- Incentives/rewards — CG-3 violation
- Rating-based routing — CG-2 violation
- Staff analytics — no data source in MVP
- Ticketing/recovery workflows — post-MVP
- WhatsApp/SMS/email campaigns — post-MVP
- Multi-location/multi-user roles — post-MVP
- POS integrations — post-MVP
- Google Business Profile API — post-MVP
- Advanced AI insights/sentiment — post-MVP
- Non-restaurant templates — post-MVP
- Google OAuth for business login — P1
- Language support (Hindi) — P1
- Custom questions — P1
- Campaign-level Google URL override — P1
- Question reordering — P1
- CSV export — P1
- Trends and time-of-day analytics — P1

## Context

**Domain:** Restaurant customer feedback and Google review facilitation. The gap is that restaurant owners see a Google rating but not *why* — which dish, which service issue, what time of day. ReviewPulse structures that data while giving customers an easy path to review.

**Regulatory:** Google Maps UGC policy prohibits merchants from discouraging negative reviews, selectively soliciting positive ones, offering incentives, or requesting specific review content. India's DPDP Act obligations commence ~May 2027 — design for compliance now.

**User Profile:**
- *Customer:* Restaurant guest with a smartphone, no account, expects ≤30 seconds.
- *Business owner:* Single owner account per business in MVP, manages via dashboard.

**Data Flow:** (see `flow.png`)
```
Customer: Scan QR → Campaign active? → Landing → Q1-Q3 (required) → Q4-Q5 (optional) → Submit → Draft screen (editable, same for all ratings) → Share on Google / Private feedback / No thanks → Thank-you
Owner: Sign up → Business info + Google URL → Create campaign → Set quiz + menu items → Download QR → Dashboard (responses, analytics, private feedback)
```

## Constraints

- **Tech stack (fixed):** Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui (Radix) + Supabase (Postgres, Auth, Storage, RLS) — no separate backend
- **Styling:** Tailwind CSS + shadcn/ui with Radix primitives for accessibility
- **DB access:** `@supabase/supabase-js` + `@supabase/ssr`, generated types from Supabase CLI, no ORM
- **Validation:** Zod (shared client/server schemas)
- **Session:** `jose` for signed `rp_session` cookie
- **Bot filter:** `isbot` package
- **LLM:** Anthropic SDK behind `DraftGenerator` interface, `claude-haiku-4-5` default (swappable via config)
- **QR:** `qrcode` npm package, server-side PNG/SVG
- **i18n (P1):** `next-intl` + Noto Sans Devanagari
- **Charts:** Recharts (dashboard only, not in customer bundle)
- **Rate limiting:** Upstash Redis + `@upstash/ratelimit`
- **Testing:** Vitest (unit), Playwright + axe-core (E2E + a11y), Supabase CLI/pgTAP (RLS), Lighthouse CI
- **Observability:** Sentry + structured logs
- **CI/CD:** GitHub Actions, Supabase CLI migrations
- **Hosting:** Vercel Pro ($20/mo) + Supabase Pro ($25/mo) — no free tier for production (QR can't point to paused DB)
- **Budget:** ~$45/mo baseline hosting + ~$0.0015/draft LLM cost
- **Performance:** < 2s landing load, server components, minimal client JS, inlined critical CSS
- **Security:** RLS everywhere, service-role key for customer writes, signed cookies, rate limiting

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js only (no FastAPI) | PRD fixed; fewer moving parts for MVP | — Pending |
| shadcn/ui + Radix | Accessible components help AC-N2 (WCAG), free, composable | — Pending |
| Supabase (not raw Postgres) | Auth + RLS + Storage in one service, matches PRD | — Pending |
| claude-haiku-4-5 for drafts | Cheap (~$0.0015/draft), fast, behind interface so swappable | — Pending |
| No ORM | RLS is the security layer; Supabase client goes through RLS | — Pending |
| Vercel Pro + Supabase Pro | Free tiers unsuitable (commercial use, DB pausing) | — Pending |
| Zod for validation | One schema shared between client form and server endpoint | — Pending |
| Anonymous sessions only | Core value is frictionless; no account = more feedback | — Pending |

## Assumptions (from PRD, awaiting owner confirmation)

| # | Assumption | Default Used |
|---|-----------|-------------|
| A1 | Active session window | 30 minutes |
| A2 | Retention: sessions/answers 24mo, drafts 12mo, contact 90d, hashes 30d | As listed |
| A3 | Default quiz: Q1-Q5 on, Q6-Q7 off | Q1-Q5 on |
| A4 | Max custom questions | 3 |
| A5 | Google URL host allow-list | google.com, search.google.com, g.page, maps.app.goo.gl, goo.gl |
| A6 | Anomaly thresholds | burst >5/10min, too_fast <5s, repeat_identical ≥3/1hr |
| A7 | Minimum sample for trends | 30 sessions |
| A8 | Rate limit | 60 req/min/IP |
| A9 | Business timezone default | Asia/Kolkata |
| A10 | LLM provider/model | claude-haiku-4-5 (configurable) |

---
*Last updated: 2026-09-22 after project initialization*
