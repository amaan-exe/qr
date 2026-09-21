The PRD already fixes the core (Next.js, React, TypeScript, Tailwind, Supabase). This fills in the rest, and the research changed two decisions.

## Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router), TypeScript, React | Fixed in the PRD. Pin to a patched 16.x. |
| Styling / UI | Tailwind + shadcn/ui (Radix primitives) | Radix gives accessible components, which helps AC-N2. |
| Database, auth, storage | Supabase (Postgres, RLS, Auth, Storage) | Fixed in the PRD. |
| DB access | `@supabase/supabase-js` + `@supabase/ssr`, generated types from the Supabase CLI. No ORM. | Fewer moving parts. RLS is the security layer, so the client must go through Supabase. |
| Validation | Zod | One schema shared by the customer form and the server endpoint. |
| Session cookie | `jose` (signed token) | Matches the PRD's signed `rp_session` cookie. |
| Bot filter | `isbot` | Stops link previews and crawlers from creating fake scans. |
| Draft LLM | Anthropic SDK behind the `DraftGenerator` interface, `claude-haiku-4-5` | Cheap and fast, and swappable through config. |
| QR | `qrcode` (npm), server-side | Produces PNG and SVG. |
| i18n | `next-intl`, plus Noto Sans Devanagari via `next/font` | Hindi UI. |
| Charts | Recharts (or shadcn charts) | Dashboard only, so keep it out of the customer bundle. |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | Serverless-friendly. I did not verify its free tier. |
| Testing | Vitest (unit), Playwright + `@axe-core/playwright` (E2E and accessibility), Supabase CLI/pgTAP (RLS tests), Lighthouse CI | Maps directly to AC-B5, AC-B6, AC-N1 and AC-N2. |
| Observability | Sentry + structured logs | Log draft method, latency and `session_id`. |
| CI/CD | GitHub Actions, Supabase CLI migrations | Migrations live in the repo. |
| Hosting | Vercel **Pro**, with Supabase in the closest region | See below. |

## Two decisions the research changed

**1. Don't use Vercel's free plan for a paying client.** Vercel's fair-use guidelines restrict the Hobby plan to non-commercial personal use only, with all commercial use requiring Pro or Enterprise. Pro is $20 a month plus $20 per additional seat, with usage charged on top. Use Hobby only for development and demos. The sources also disagree on Hobby function limits (100K vs 1M invocations), so don't plan around either number.

**2. Don't put a live QR on Supabase's free plan.** Free-tier projects are paused after one week of inactivity and are unreachable until restored. A printed QR on a table pointing at a paused database is a dead product. Pro is $25/month, with no inactivity pausing. Pro includes a $10 monthly compute credit covering one Micro instance, and compute does not scale to zero. The free plan is fine for development.

## Cost estimate for one live client

- **Baseline:** Vercel Pro $20 + Supabase Pro $25 = about **$45/month**. That is one seat and one project, before overages.
- **LLM:** Haiku 4.5 costs $1 per million input tokens and $5 per million output tokens. My estimate is about 700 input and 150 output tokens per draft, roughly $0.0015 each, so around $15 per 10,000 drafts. Even with retries this is small next to hosting. It's my arithmetic, not a measured figure.
- **Conflict of interest:** I'm an Anthropic model recommending an Anthropic model. That's why the LLM sits behind an interface. Test one or two alternatives on your Hindi and English fact sheets before committing, especially for Hindi quality.

## Operational points

- **Next.js security:** Vercel moved to scheduled monthly security releases. The July release patched 4 high and 5 medium severity vulnerabilities in 16.2.11 (Active LTS), and another was scheduled for August 26 for 16.3 and 15.5. Pin exact versions, enable Dependabot or Renovate, and apply patches promptly. Next.js 16.3 shipped on August 3, 2026. Pick a supported line and check the current patch level when you scaffold.
- **Region:** The PRD's under-2-second load target depends on the database and functions being near your users. Put them in the same region, Mumbai if available. I didn't verify region availability on either dashboard.
- **Keep it boring:** No microservices, no separate backend, no ORM, and no Redis until rate limiting needs it. That fits the PRD's Next.js-only rule.

## Not verified

- Upstash's free-tier limits.
- Supabase and Vercel region names.
- The current Node LTS version.
- Whether Supabase's default email sender is fit for production. You will likely need custom SMTP for auth emails, so check before launch.
- Pricing figures come from third-party pricing pages dated May to September 2026, not the vendors' own pricing pages. Confirm on the vendor sites before quoting a client.

If you want, I can add this as a stack section to the PRD (v1.2) and update the fixed technology table.

**Sources**
- Vercel Hobby non-commercial restriction and Pro pricing: https://thesearchsherpa.com/?p=2188
- Vercel Hobby limits (figures conflict between sources): https://deploywise.dev/blog/vercel-free-tier-limits-2026 and https://costbench.com/software/developer-tools/vercel/
- Supabase plans, free-tier pausing and Pro details: https://automationatlas.io/answers/supabase-free-tier-limits-2026/, https://makerkit.dev/blog/saas/supabase-pricing and https://www.costbench.com/software/database-as-service/supabase/
- Claude Haiku 4.5 pricing: https://anotherwrapper.com/llm-pricing/claude-haiku-4-5-20251001 (citing platform.claude.com/docs/en/about-claude/pricing) and https://www.g2.com/articles/claude-api-pricing
- Next.js releases and security schedule: https://nextjs.org/blog?page=1