# ReviewPulse — v1 Requirements

> All requirements are P0 (MVP) unless marked otherwise. Derived from PRD v1.1.

---

## Customer Flow

- [ ] **CUST-01**: Scanning a valid campaign QR (`/r/{slug}`) opens the branded landing page, creates exactly one session, sets `rp_session` cookie, fires `QR_SCANNED` then `LANDING_VIEWED`
- [ ] **CUST-02**: Invalid or inactive slug shows Fallback screen ("This QR code is no longer active"), creates no session
- [ ] **CUST-03**: Bot/link-preview user agents do NOT create sessions (`isbot` filter)
- [ ] **CUST-04**: Landing shows: business logo (optional), name, welcome message, "Start" button, "Takes about 30 seconds" copy
- [ ] **CUST-05**: Business-configurable landing: logo, name, primary color, welcome message (with defaults)
- [ ] **CUST-06**: Pressing Start fires `QUIZ_STARTED` (once per session), advances to Q1
- [ ] **CUST-07**: Q1 (`overall_rating`) — 5 stars, required, int 1-5
- [ ] **CUST-08**: Q2 (`food_rating`) — 5 emoji faces, required, int 1-5
- [ ] **CUST-09**: Q3 (`service_rating`) — 5 labeled buttons (Poor…Excellent), required, int 1-5
- [ ] **CUST-10**: Q4 (`liked`) — multi-choice chips, optional, array of enum values
- [ ] **CUST-11**: Q5 (`ordered`) — multi-choice chips from menu_items + "Other", optional, hidden if 0 active menu items
- [ ] **CUST-12**: Each question on its own screen with Back control, progress indicator, large touch targets (≥44×44px)
- [ ] **CUST-13**: Optional questions have "Skip" control
- [ ] **CUST-14**: Answers saved per-question as customer advances (partial persistence)
- [ ] **CUST-15**: `QUESTION_ANSWERED` event fired per answer save with `question_key`
- [ ] **CUST-16**: Submit validates Q1-Q3 present and int 1-5 server-side; sets `status=completed`, `completed_at=now()`, fires `QUIZ_COMPLETED`
- [ ] **CUST-17**: Submit is idempotent — second submit returns stored result (HTTP 200), no duplicate
- [ ] **CUST-18**: After completed, answers are read-only for the customer
- [ ] **CUST-19**: Refresh mid-quiz restores progress from cookie, resumes at first unanswered required question
- [ ] **CUST-20**: Rescan while session active reuses session (no new `QR_SCANNED`)
- [ ] **CUST-21**: Rescan after completed or >30min inactivity creates new session

## Draft & Review

- [ ] **DRAFT-01**: Draft screen shown for every completed session, identical CTAs/order/prominence for all ratings (CG-1, CG-2)
- [ ] **DRAFT-02**: Draft screen order: heading + disclaimer → editable textarea → "Share on Google" (primary) → "Copy text" → "Send private feedback" link → "No thanks, I'm done"
- [ ] **DRAFT-03**: Heading: "Your review draft" + "Draft based on your answers — edit or replace it. Posting a review is optional."
- [ ] **DRAFT-04**: Fact sheet built server-side from stored answers (tone mapping: 1-2=negative, 3=neutral, 4-5=positive)
- [ ] **DRAFT-05**: LLM prompt contract: first person, 25-90 words, match aspect tones, no invented facts, no staff names, no promo, vary structure, text only
- [ ] **DRAFT-06**: `comment` field treated as untrusted data (delimited block in prompt, strip URLs/phones/emails/names)
- [ ] **DRAFT-07**: DraftGenerator interface — model/provider set via env config, not hard-coded
- [ ] **DRAFT-08**: Validators run on every candidate: length (25-90 words), fact allow-list, polarity, forbidden content, language match
- [ ] **DRAFT-09**: Validation fail → retry once with failure reason → fail again → deterministic template fallback (pseudo-random seed by session_id)
- [ ] **DRAFT-10**: LLM timeout 8s → fallback; if fallback fails → empty textarea with "Write your own review"
- [ ] **DRAFT-11**: Google CTA never blocked on draft generation; skeleton up to 8s then fallback
- [ ] **DRAFT-12**: `DRAFT_GENERATED` event with `{method, attempts}` metadata
- [ ] **DRAFT-13**: Customer edits → debounce 1s, save `final_text`, fire `DRAFT_EDITED` (first edit only per session)
- [ ] **DRAFT-14**: Anti-repetition: hash `original_text`, flag if >3 identical hashes per business in 24h, force fallback variation

## Google Hand-off

- [ ] **GOOG-01**: "Share on Google" → save `final_text` → copy to clipboard → show "Copied" toast → record `GOOGLE_CLICKED` → open Google URL in new tab → show ThankYou
- [ ] **GOOG-02**: Google URL stored on `businesses.google_review_url`, validated (https, allowed hosts)
- [ ] **GOOG-03**: If Google URL missing: hide Google CTA, keep "Copy text", owner sees dashboard warning
- [ ] **GOOG-04**: If new tab blocked: show URL + "Copy text"
- [ ] **GOOG-05**: No UI anywhere claims a review was posted (CG-9)
- [ ] **GOOG-06**: "No thanks, I'm done" → ThankYou screen ("Thanks for your feedback." — no further prompts)

## Private Feedback

- [ ] **PRIV-01**: Form: category (enum), message (required, ≤1000 chars), optional contact_name, optional contact_value
- [ ] **PRIV-02**: If contact given, show consent line: "The restaurant may use this to reply to you."
- [ ] **PRIV-03**: Fire `PRIVATE_FEEDBACK_SUBMITTED` with `category` metadata
- [ ] **PRIV-04**: Same position/text for all customers regardless of rating (CG-2)

## Business Auth & Onboarding

- [ ] **AUTH-01**: Email+password sign up and login via Supabase Auth
- [ ] **AUTH-02**: Onboarding flow: account → business info (name, category=restaurant, location, timezone, logo, primary_color) → Google review URL → first campaign → quiz config → menu items → QR
- [ ] **AUTH-03**: Steps 3, 5, 6 may be skipped and completed later
- [ ] **AUTH-04**: One owner per business in MVP

## Campaign & QR Management

- [ ] **CAMP-01**: Campaign CRUD: name, slug (unique globally, lowercase a-z0-9-, 6-40 chars, auto-generated 8-char default), active boolean
- [ ] **CAMP-02**: QR encodes `https://{APP_DOMAIN}/r/{slug}`, generates PNG and SVG (server-side)
- [ ] **CAMP-03**: Deactivating a campaign immediately makes its QR show Fallback; data retained
- [ ] **CAMP-04**: Slug immutable in P0 (editing is P1)

## Quiz & Menu Configuration

- [ ] **QUIZ-01**: Enable/disable quiz questions (P0); Q1-Q3 required flags cannot be turned off
- [ ] **QUIZ-02**: Default quiz = Q1-Q5 enabled; Q6 (comment) and Q7 (return_intent) off by default
- [ ] **QUIZ-03**: Menu items CRUD: name (i18n JSON), active, position
- [ ] **QUIZ-04**: Q5 hidden when business has 0 active menu items

## Analytics Dashboard

- [ ] **ANAL-01**: Scans = count of `QR_SCANNED` events
- [ ] **ANAL-02**: Starts = count of `QUIZ_STARTED`; Start rate = Starts ÷ Scans
- [ ] **ANAL-03**: Completions = count of `QUIZ_COMPLETED`; Completion rate = Completions ÷ Starts; Scan-to-completion = Completions ÷ Scans
- [ ] **ANAL-04**: Google click rate = distinct sessions with `GOOGLE_CLICKED` ÷ Completions (label: "Google clicks", never "reviews")
- [ ] **ANAL-05**: Private feedback rate = sessions with `PRIVATE_FEEDBACK_SUBMITTED` ÷ Completions
- [ ] **ANAL-06**: Average overall/food/service ratings over completed sessions; show n
- [ ] **ANAL-07**: Rating distribution: count per value 1-5
- [ ] **ANAL-08**: "What customers liked": for each `liked` value, sessions selecting it ÷ completed sessions answering Q4
- [ ] **ANAL-09**: Low-rating share: sessions with rating ≤2 ÷ completed, per dimension
- [ ] **ANAL-10**: Campaign table: Scans, Completions, Google clicks, rates per campaign
- [ ] **ANAL-11**: Item table: mentions, avg food rating in sessions mentioning item, positive share (food_rating ≥4)
- [ ] **ANAL-12**: All metrics computed from events/sessions/answers (never manual counters), include ALL completed sessions (CG-10)
- [ ] **ANAL-13**: Times displayed in business timezone

## Responses & Feedback Views

- [ ] **RESP-01**: Response list with filters: date range, campaign, overall rating
- [ ] **RESP-02**: Response detail: answers, private-feedback link, event timeline, original_text/final_text
- [ ] **RESP-03**: Private feedback list view for owner

## Event Tracking

- [ ] **EVNT-01**: Events append-only, one row per event, with `session_id`, `campaign_id`, `business_id` (denormalized)
- [ ] **EVNT-02**: Idempotency via unique `(session_id, client_event_id)`
- [ ] **EVNT-03**: All 9 event types as specified in PRD Section 11

## Data Model

- [ ] **DATA-01**: All tables with `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`
- [ ] **DATA-02**: RLS enabled on every table
- [ ] **DATA-03**: Tables: businesses, campaigns, menu_items, questions, sessions, answers, review_drafts, private_feedback, events, session_flags
- [ ] **DATA-04**: Constraints and checks as specified in PRD Section 12

## Security & Privacy

- [ ] **SEC-01**: Owner RLS: rows readable/writable only if business's `owner_id = auth.uid()`
- [ ] **SEC-02**: Customer writes only through server endpoints (service-role key); anon Supabase client has no direct table access
- [ ] **SEC-03**: Session cookie signed; every customer endpoint verifies session_id matches cookie
- [ ] **SEC-04**: IP and UA stored as salted hashes only (never raw)
- [ ] **SEC-05**: Rate limiting on public endpoints (60 req/min/IP, 429 response)
- [ ] **SEC-06**: Cross-tenant: Owner A cannot read/write any row of Business B

## Non-Functional

- [ ] **PERF-01**: Landing page < 2s load (Lighthouse mobile throttling)
- [ ] **PERF-02**: Server components, minimal client JS, optimized/inlined critical CSS, cached static assets
- [ ] **A11Y-01**: WCAG 2.1 AA: touch targets ≥44×44px, screen-reader labels, keyboard nav, visible focus, sufficient contrast
- [ ] **A11Y-02**: No color-only meaning (rating UIs show numbers/labels too)
- [ ] **CONN-01**: Network failure: "Connection lost" with Retry button; retries idempotent
- [ ] **BROW-01**: Latest 2 versions Chrome/Safari mobile; latest Chrome/Edge/Safari/Firefox desktop
- [ ] **OBSV-01**: Structured server logs with session_id/business_id; draft method and latency logged

## API Surface

- [ ] **API-01**: `POST /api/public/sessions` — create/restore session for slug
- [ ] **API-02**: `PUT /api/public/sessions/{id}/answers/{question_key}` — upsert one answer
- [ ] **API-03**: `POST /api/public/sessions/{id}/start` — mark started, fire QUIZ_STARTED
- [ ] **API-04**: `POST /api/public/sessions/{id}/submit` — validate + complete (idempotent)
- [ ] **API-05**: `POST /api/public/sessions/{id}/draft` — generate draft (idempotent)
- [ ] **API-06**: `PATCH /api/public/sessions/{id}/draft` — save final_text
- [ ] **API-07**: `POST /api/public/sessions/{id}/events` — client events
- [ ] **API-08**: `POST /api/public/sessions/{id}/private-feedback` — submit private feedback

---

**Total: 89 requirements** | **Priority: All P0 (MVP)**
