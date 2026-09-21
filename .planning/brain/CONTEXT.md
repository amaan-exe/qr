# ReviewPulse — Brain Context (Single-File Reference)

> **Purpose:** This file is the single-file context for any AI agent working on ReviewPulse.
> Read this FIRST instead of searching through prd.md, tech.md, flow.md, etc.
> Last synced: 2026-09-22

---

## 1. What Is ReviewPulse?

A QR-based customer feedback platform for restaurants. Customers scan a QR code on their phone, complete a 5-question quiz (~30 seconds), get an optional AI-generated review draft they can edit, and are handed off to the restaurant's Google review page. Restaurant owners get a dashboard with analytics. No customer accounts. No incentives. No rating-based routing.

**Core value:** Structured experience data + easy authentic Google review path — without manipulating who reviews.

---

## 2. Tech Stack (Fixed — Do Not Change)

| Layer | Choice |
|-------|--------|
| **Framework** | Next.js (App Router) + React + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui (Radix primitives) |
| **Database/Auth/Storage** | Supabase (PostgreSQL + Auth + Storage + RLS on all tables) |
| **DB access** | `@supabase/supabase-js` + `@supabase/ssr` + generated types. No ORM. |
| **Validation** | Zod (shared client/server schemas) |
| **Session cookie** | `jose` (signed `rp_session` cookie, httpOnly, 24h) |
| **Bot filter** | `isbot` |
| **Draft LLM** | Anthropic SDK behind `DraftGenerator` interface, default `claude-haiku-4-5` |
| **QR** | `qrcode` (npm), server-side PNG/SVG |
| **Charts** | Recharts (dashboard only, NOT in customer bundle) |
| **Rate limiting** | Upstash Redis + `@upstash/ratelimit` |
| **Testing** | Vitest (unit), Playwright + axe-core (E2E + a11y), pgTAP (RLS), Lighthouse CI |
| **Observability** | Sentry + structured logs |
| **Hosting** | Vercel Pro + Supabase Pro (no free tier for production) |

---

## 3. Data Model (PostgreSQL via Supabase)

### Tables

```
businesses       — tenant root (one per restaurant)
  ├── campaigns      — QR placements (e.g., "Tables"), has unique slug
  ├── menu_items     — food items for Q5
  ├── questions      — quiz config (core + custom)
  ├── sessions       — one per customer scan
  │     ├── answers          — one per question per session
  │     ├── review_drafts    — AI-generated + customer-edited text
  │     ├── private_feedback — optional customer → owner message
  │     ├── events           — append-only event log
  │     └── session_flags    — anomaly detection flags
```

### Key Constraints
- `business_id` is the tenant boundary everywhere
- RLS on every table: owner sees only their business's data
- Customer writes go through server endpoints (service-role key) — no direct anon access
- All IDs are UUID, all timestamps are `timestamptz`

### Session States
- `landed` → `in_progress` → `completed` (irreversible)
- "Abandoned" = not completed + inactive > 30 minutes (derived, not stored)

---

## 4. Customer Flow

```
Scan QR → /r/{slug}
  ├── Campaign inactive? → Fallback screen (no session)
  └── Campaign active? → Landing page (create session, set cookie)
        → Start (fire QUIZ_STARTED)
        → Q1: overall_rating (5 stars, required, int 1-5)
        → Q2: food_rating (5 emoji faces, required, int 1-5)
        → Q3: service_rating (5 labeled buttons, required, int 1-5)
        → Q4: liked (multi-choice chips, optional)
        → Q5: ordered (menu items + "Other", optional, hidden if no items)
        → Submit (validate Q1-Q3, status=completed, fire QUIZ_COMPLETED)
        → Draft screen (identical for ALL ratings):
            ├── AI-generated editable draft
            ├── "Share on Google" (primary) — copy + open URL + GOOGLE_CLICKED
            ├── "Copy text" (secondary)
            ├── "Send private feedback" (link)
            └── "No thanks, I'm done" → Thank-you
```

### Critical Rules
- Answers saved per-question (partial persistence on refresh/exit)
- Submit is idempotent (second submit returns stored result)
- Rescan active session → reuse; rescan after complete/30min → new session
- Bot user agents never create sessions

---

## 5. Draft Generation Pipeline

```
Answers → Fact sheet (JSON) → LLM prompt → Candidate draft
  → Validators (length 25-90 words, fact allow-list, polarity, forbidden content, language)
  → Pass → Show customer
  → Fail → Retry once with failure reason
  → Fail again → Deterministic template fallback (seeded by session_id)
  → All fail → Empty textarea + "Write your own review"
```

- LLM timeout: 8 seconds
- Google CTA is NEVER blocked on draft generation
- `DraftGenerator` interface: model/provider is config, not hardcoded
- Anti-repetition: hash original_text, flag if >3 identical per business in 24h

### Fact Sheet Example
```json
{
  "language": "en",
  "overall": {"rating": 5, "tone": "positive"},
  "food": {"rating": 5, "tone": "positive"},
  "service": {"rating": 5, "tone": "positive"},
  "liked": ["food", "service"],
  "ordered": ["Chicken Biryani"],
  "return_intent": "definitely",
  "comment": null
}
```
Tone mapping: 1-2 = negative, 3 = neutral, 4-5 = positive.

---

## 6. Compliance Guardrails (NON-NEGOTIABLE)

| ID | Rule |
|----|------|
| CG-1 | Equal access: same Google CTA for all ratings, same prominence |
| CG-2 | No rating-based routing: private feedback shown identically to all |
| CG-3 | No incentives |
| CG-4 | Draft is optional, customer-owned, labeled "edit or replace it" |
| CG-5 | No steering: no staff names, promo language, star claims in drafts |
| CG-6 | Truthful: drafts preserve sentiment from answers |
| CG-7 | Non-repetitive: no identical template drafts |
| CG-8 | No pressure: "feedback and review are optional" |
| CG-9 | Honest metrics: click ≠ review, never call it a "review" |
| CG-10 | No data suppression: dashboards include ALL sessions |

---

## 7. Event Types (Append-Only)

| Event | When | Metadata |
|-------|------|----------|
| `QR_SCANNED` | New session created | `user_agent_class` |
| `LANDING_VIEWED` | Landing rendered | — |
| `QUIZ_STARTED` | Customer presses Start (once) | — |
| `QUESTION_ANSWERED` | Answer saved | `question_key` |
| `QUIZ_COMPLETED` | Submit succeeds (once) | `duration_ms` |
| `DRAFT_GENERATED` | Draft created | `method`, `attempts` |
| `DRAFT_EDITED` | First edit of draft | — |
| `GOOGLE_CLICKED` | Google CTA pressed | — |
| `PRIVATE_FEEDBACK_SUBMITTED` | Feedback form submitted | `category` |

Idempotency: unique on `(session_id, client_event_id)`.

---

## 8. API Surface (Public, under `/api/public`)

| Method + Path | Purpose |
|---------------|---------|
| `POST /sessions` | Create/restore session for `{slug}` |
| `PUT /sessions/{id}/answers/{question_key}` | Upsert one answer |
| `POST /sessions/{id}/start` | Mark started, fire QUIZ_STARTED |
| `POST /sessions/{id}/submit` | Validate + complete (idempotent) |
| `POST /sessions/{id}/draft` | Generate draft (idempotent) |
| `PATCH /sessions/{id}/draft` | Save final_text |
| `POST /sessions/{id}/events` | Client events |
| `POST /sessions/{id}/private-feedback` | Submit private feedback |

Dashboard uses authenticated Supabase queries/server actions under owner RLS.

---

## 9. Analytics Metrics (Dashboard)

| Metric | Definition |
|--------|-----------|
| Scans | count of QR_SCANNED |
| Starts | count of QUIZ_STARTED |
| Completions | count of QUIZ_COMPLETED |
| Start rate | Starts ÷ Scans |
| Completion rate | Completions ÷ Starts |
| Scan-to-completion | Completions ÷ Scans |
| Google click rate | sessions with GOOGLE_CLICKED ÷ Completions |
| Private feedback rate | sessions with PRIVATE_FEEDBACK_SUBMITTED ÷ Completions |
| Avg ratings | mean of int ratings over completed sessions (per dimension) |
| Rating distribution | count per value 1-5 |
| "What customers liked" | liked value selection rate among Q4 respondents |
| Low-rating share | rating ≤2 share per dimension |
| Campaign table | per-campaign scans, completions, Google clicks, rates |
| Item table | mentions, avg food rating, positive share (≥4) |

All computed from events/sessions/answers. Never manual counters. Include ALL sessions (CG-10).

---

## 10. Business Onboarding Steps

1. Create account (email + password)
2. Business info: name, category (restaurant), location, timezone (default Asia/Kolkata), logo, primary_color
3. Google review URL (validated: https, allowed hosts)
4. First campaign (name + auto-generated slug)
5. Quiz config (defaults preloaded)
6. Menu items (optional)
7. Generate/download QR

Steps 3, 5, 6 may be skipped.

---

## 11. Project Structure (Target)

```
d:\qr\
├── .planning/           # GSD project management
│   ├── PROJECT.md       # Living project context
│   ├── REQUIREMENTS.md  # All v1 requirements with IDs
│   ├── ROADMAP.md       # 5-phase roadmap
│   ├── STATE.md         # Current phase + memory
│   ├── config.json      # GSD workflow config
│   └── brain/           # This folder — single-file AI context
│       └── CONTEXT.md   # ← YOU ARE HERE
├── prd.md               # Original PRD v1.1 (reference)
├── tech.md              # Original tech stack research (reference)
├── flow.md / flow.png   # Original data flow diagram (reference)
├── CLAUDE.md            # GSD project guide
├── src/                 # Next.js app source (created in Phase 1)
│   ├── app/             # App Router pages and API routes
│   ├── components/      # React components
│   ├── lib/             # Utilities, Supabase client, types
│   └── ...
├── supabase/            # Supabase config and migrations
└── ...
```

---

## 12. Roadmap Summary

| # | Phase | Status |
|---|-------|--------|
| 1 | Foundation & Data Layer | ⬜ Not started |
| 2 | Customer Quiz Flow | ⬜ Not started |
| 3 | Draft Generation & Google Hand-off | ⬜ Not started |
| 4 | Business Dashboard | ⬜ Not started |
| 5 | Polish, Performance & Compliance | ⬜ Not started |

**89 requirements** | **5 phases** | **Sequential execution**

---

## 13. Quick Reference — What NOT To Do

- ❌ Don't use an ORM — Supabase client + RLS is the security layer
- ❌ Don't add a separate backend (no FastAPI, no Express)
- ❌ Don't build customer accounts/login
- ❌ Don't build incentives or rewards
- ❌ Don't route customers differently based on rating
- ❌ Don't call a Google click a "review"
- ❌ Don't filter negative responses from dashboards
- ❌ Don't use Vercel/Supabase free tier for production
- ❌ Don't hardcode the LLM provider — use DraftGenerator interface
- ❌ Don't put Recharts in the customer bundle
- ❌ Don't add features marked P2 or Out of Scope
- ❌ Don't rename canonical event names (e.g., QR_SCANNED, not SCAN_STARTED)
