# Phase 3 Summary: Draft Generation & Google Hand-off

## Overview
Built the review draft generation pipeline, validation engine, deterministic template fallback, editable draft card, 1-click Google review hand-off, and confidential private feedback modal. The flow strictly enforces compliance guardrails CG-1 to CG-10 with identical CTA presentation and no rating gating.

## Accomplishments
1. **Fact Sheet Builder (`src/lib/draft/fact-sheet.ts`):**
   - Maps ratings to aspect tones (`negative` 1-2, `neutral` 3, `positive` 4-5).
   - Ingests dishes from `ordered` and compliments from `liked`.
   - Sanitizes customer comment text against PII (strips URLs, emails, phone numbers).
2. **Draft Validators (`src/lib/draft/validators.ts`):**
   - Word count constraint (25 to 90 words).
   - Polarity check ensuring negative sentiments are not praised and positive sentiments are not criticized.
   - Forbidden content filter blocking star mentions ("5 star"), URLs, emails, phone numbers, staff names, discounts, coupons, and emojis.
3. **Review Draft Pipeline (`src/lib/draft/generator.ts`):**
   - Deterministic sentence bank seeded pseudo-randomly by `session_id` hash for instant, varied, anti-repetitive review drafts (CG-7).
   - Anthropic LLM generator with 8s timeout and validation retry loop.
4. **Draft API Route (`src/app/api/public/sessions/[id]/draft/route.ts`):**
   - `POST`: Generates and returns review draft, caches in `review_drafts`, emits `DRAFT_GENERATED`.
   - `PATCH`: Debounced auto-save for diner edits, emits `DRAFT_EDITED`.
5. **Customer UI Components (`src/components/quiz/`):**
   - `ReviewDraftCard.tsx`: Heading, disclaimer, editable textarea with live word count, "Share on Google" primary CTA, "Copy text" secondary CTA, "Send private feedback" link, and "No thanks, I'm done" tertiary button.
   - `PrivateFeedbackModal.tsx`: Confidential modal with category pills, message textarea, optional contact inputs with consent disclosure, and submission to `/api/public/sessions/[id]/private-feedback`.
   - `ThankYouCard.tsx`: Warm and polite closing screen without upsells or rating manipulation.
   - `QuizFlow.tsx`: State transitions from quiz completion directly into draft review, private feedback, or thank you.

## Verification
- `npx tsc --noEmit`: Passed with 0 errors.
- `npm run build`: Compiled all 13 routes and proxy middleware with 0 errors.
