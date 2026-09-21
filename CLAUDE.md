<!-- GSD:project-start source:PROJECT.md -->
## Project

**ReviewPulse**

ReviewPulse is a QR-based customer feedback platform for restaurants. Customers scan a QR code, complete a quick 5-question quiz, receive an optional AI-generated review draft (editable), and are handed off to the restaurant's Google review page. Business owners get a dashboard with response analytics, campaign management, and private feedback — all without manipulating who gets to review.

**Core Value:** Turn every restaurant visit into (a) structured experience data the owner can act on and (b) an easy, authentic path to leave a public Google review — without steering, incentivizing, or filtering by rating.

### Constraints

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
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
