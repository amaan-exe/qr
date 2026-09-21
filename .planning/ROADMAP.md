# ReviewPulse — Roadmap (v1)

> Coarse granularity: 5 phases, sequential execution.

---

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|-------------|-----------------|
| 1 | Foundation & Data Layer | Database schema, auth, Supabase RLS, project scaffold | DATA-01..04, SEC-01..06, AUTH-01..04, API-01..08 | 4 |
| 2 | Customer Quiz Flow | QR scan → landing → quiz → submit with session management | CUST-01..21, QUIZ-01..04, EVNT-01..03 | 5 |
| 3 | Draft Generation & Google Hand-off | LLM draft pipeline, validators, fallback, Google CTA, private feedback | DRAFT-01..14, GOOG-01..06, PRIV-01..04 | 5 |
| 4 | Business Dashboard | Owner dashboard: campaigns, QR, analytics, responses, feedback, settings | CAMP-01..04, ANAL-01..13, RESP-01..03 | 4 |
| 5 | Polish, Performance & Compliance | Performance optimization, accessibility audit, compliance verification, observability | PERF-01..02, A11Y-01..02, CONN-01, BROW-01, OBSV-01 | 4 |

---

## Phase Details

### Phase 1: Foundation & Data Layer
**Goal:** Set up the Next.js project scaffold, Supabase database with all tables/RLS policies, authentication, and the public API route structure.

**UI hint:** no

**Requirements:** DATA-01, DATA-02, DATA-03, DATA-04, SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, AUTH-01, AUTH-02, AUTH-03, AUTH-04, API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08

**Success criteria:**
1. Next.js project scaffolded with TypeScript, Tailwind, shadcn/ui; Supabase connected and types generated
2. All 10 tables created with correct constraints, RLS policies enforce tenant isolation (pgTAP tests pass)
3. Owner can sign up, log in, create a business — auth flow works end-to-end
4. All 8 public API route stubs exist and return appropriate status codes; session cookie signing works

---

### Phase 2: Customer Quiz Flow
**Goal:** Build the complete customer-facing experience from QR scan through quiz completion, including session management, question rendering, and answer persistence.

**UI hint:** yes

**Requirements:** CUST-01, CUST-02, CUST-03, CUST-04, CUST-05, CUST-06, CUST-07, CUST-08, CUST-09, CUST-10, CUST-11, CUST-12, CUST-13, CUST-14, CUST-15, CUST-16, CUST-17, CUST-18, CUST-19, CUST-20, CUST-21, QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, EVNT-01, EVNT-02, EVNT-03

**Success criteria:**
1. Scanning a valid QR opens branded landing; invalid/inactive QR shows Fallback; bot UAs create no session
2. Customer completes Q1-Q5 quiz with per-question answer persistence; refresh restores progress
3. Q1-Q3 are required (server validates), Q4-Q5 skippable; Q5 hidden when no menu items exist
4. Submit is idempotent, sets status=completed, fires QUIZ_COMPLETED with duration
5. All event types fire correctly with idempotent client_event_id

---

### Phase 3: Draft Generation & Google Hand-off
**Goal:** Implement the AI draft pipeline (LLM + validators + fallback), editable draft screen, Google CTA, clipboard copy, and private feedback form.

**UI hint:** yes

**Requirements:** DRAFT-01, DRAFT-02, DRAFT-03, DRAFT-04, DRAFT-05, DRAFT-06, DRAFT-07, DRAFT-08, DRAFT-09, DRAFT-10, DRAFT-11, DRAFT-12, DRAFT-13, DRAFT-14, GOOG-01, GOOG-02, GOOG-03, GOOG-04, GOOG-05, GOOG-06, PRIV-01, PRIV-02, PRIV-03, PRIV-04

**Success criteria:**
1. After quiz completion, draft screen shows AI-generated review (or fallback) with identical CTAs for all ratings
2. Draft validators catch: wrong length, hallucinated facts, polarity mismatches, forbidden content
3. LLM failure/timeout gracefully falls back to deterministic template; empty textarea if all fails; Google CTA never blocked
4. "Share on Google" copies text, opens Google URL, records GOOGLE_CLICKED; "No thanks" goes to ThankYou
5. Private feedback form works with category, message, optional contact + consent line

---

### Phase 4: Business Dashboard
**Goal:** Build the owner-facing dashboard with campaign management, QR generation, quiz builder, menu items, analytics, response list, and private feedback view.

**UI hint:** yes

**Requirements:** CAMP-01, CAMP-02, CAMP-03, CAMP-04, ANAL-01, ANAL-02, ANAL-03, ANAL-04, ANAL-05, ANAL-06, ANAL-07, ANAL-08, ANAL-09, ANAL-10, ANAL-11, ANAL-12, ANAL-13, RESP-01, RESP-02, RESP-03

**Success criteria:**
1. Owner can create campaigns with auto-generated slugs, download PNG/SVG QR codes, deactivate campaigns
2. Analytics page shows all 13 metrics computed from events/sessions/answers (verified against seeded dataset)
3. Response list with date/campaign/rating filters; detail view shows answers, events timeline, draft texts
4. Private feedback list visible to owner; all times in business timezone

---

### Phase 5: Polish, Performance & Compliance
**Goal:** Performance optimization, accessibility audit, compliance guardrail verification, error handling, observability setup, and end-to-end acceptance testing.

**UI hint:** no

**Requirements:** PERF-01, PERF-02, A11Y-01, A11Y-02, CONN-01, BROW-01, OBSV-01

**Success criteria:**
1. Landing page Lighthouse mobile performance score meets <2s load target
2. axe-core audit has zero critical accessibility violations on all customer screens
3. All 10 compliance guardrails (CG-1 through CG-10) verified via automated snapshot and behavior tests
4. Structured logging with session_id/business_id; Sentry error tracking; connection-loss UI with retry

---

## Requirement Coverage

All 89 v1 requirements mapped:

| Category | Count | Phase |
|----------|-------|-------|
| CUST (1-21) | 21 | Phase 2 |
| DRAFT (1-14) | 14 | Phase 3 |
| GOOG (1-6) | 6 | Phase 3 |
| PRIV (1-4) | 4 | Phase 3 |
| AUTH (1-4) | 4 | Phase 1 |
| CAMP (1-4) | 4 | Phase 4 |
| QUIZ (1-4) | 4 | Phase 2 |
| ANAL (1-13) | 13 | Phase 4 |
| RESP (1-3) | 3 | Phase 4 |
| EVNT (1-3) | 3 | Phase 2 |
| DATA (1-4) | 4 | Phase 1 |
| SEC (1-6) | 6 | Phase 1 |
| API (1-8) | 8 | Phase 1 |
| PERF (1-2) | 2 | Phase 5 |
| A11Y (1-2) | 2 | Phase 5 |
| CONN-01 | 1 | Phase 5 |
| BROW-01 | 1 | Phase 5 |
| OBSV-01 | 1 | Phase 5 |
| **Total** | **89** | |
