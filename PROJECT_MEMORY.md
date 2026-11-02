# Project Memory — Oragrol Website

Rolling log, most recent session at the top. Keep to last ~10 sessions — older entries move to `PROJECT_MEMORY_ARCHIVE.md`. Durable design/architecture decisions go in `DECISIONS.md`, not here — this file is session history, not a decision record.

## Session: Private application forms /apply/<code> (Applications slice 3), 2026-11-02

**Done (branch `applications-slice-3`, committed, NOT pushed):** invite-only form engine at `app/apply/[code]` (own root layout, no site chrome), save/submit API `app/api/apply/[action]`, engine and data in `app/lib/apply/` (types, engine, catalogue, fixture, forms/or-one-application, registry, ocs, handler). See D-126. Config: `next.config.ts` headers for `/apply/*`, `proxy.ts` matcher excludes `apply`, `robots.ts` disallows `/apply/` and `/api/apply/`, `tsconfig.json` allows `.ts` imports (so the engine can be tested with plain Node), `.env.local.example` has `OCS_APPLY_URL`, `OCS_APPLY_SECRET`, `APPLY_ALLOW_DRAFT_FORMS`, `APPLY_FIXTURE_CATALOGUE`.
- Verified: `tsc --noEmit` clean; `eslint` clean on the new files; `node --test tests/apply-engine.test.mjs` 28/28 (gating, formats, None option, meeting boxes, generated pages, save/read-back round trip, server checks, link privacy). Browser run with Playwright against `next dev`, the real OCS code (slice 1) and a throwaway PostgreSQL 16: bad/switched-off/expired/malformed links = 404; page gate; formats; item picker and points; meeting box on a blank field; reload mid-form restores answers and page; walk of all generated pages; submit refused with a legal box unticked; submit stores readable answers, signature, meeting request and events; link then says "submitted"; forged save refused; phone width has no sideways scroll; the submission reads correctly on the staff Applications page.
- **NEEDS VERIFICATION:** `npm run build` (the sandbox blocks Google Fonts, so only the Vercel preview can confirm it); real fonts (the screenshots used fallback serif); Redis-backed rate limits (the sandbox used the in-memory fallback); an invitation email actually arriving (needs the sender domain).
- **Not built, on purpose:** the 77 real items, tools and vendors (waiting for the 10 handling-table reviews and vendor verification); BA application form, Business setups, PDF copy (slice 4). The OR ONE form stays `draft`, so it does not open for clients in Production.
- **Next:** push and Vercel preview only on Mohammad's word; set `OCS_APPLY_URL`/`OCS_APPLY_SECRET` (same secret as OCS) and, in Preview only, `APPLY_ALLOW_DRAFT_FORMS=1`.

## Session: OR ONE launch fees, 2026-11-02

**Done (branch `or-one-fees-launch`, committed, NOT pushed):** build fees 16,999 / 39,999 / 79,999 / 139,999; OR ONE 100 monthly 4,499 (D-125). File: `app/lib/or-one-fees.ts` only (single source for the OR ONE page cards and the live chat). No other copy mentions these prices (grep EN and FR).
- Verified: tsc clean. Not browser-checked (Google Fonts blocked in the sandbox); Vercel preview is the build check.
- **Next:** push and merge only on Mohammad's word.

## Session: OR ONE STARTER monthly fee to $1,599, 2026-11-02

**Done (branch `starter-osf-1599`):** `app/lib/or-one-fees.ts` STARTER monthly 999 -> 1599 (OR ONE page card and live chat both read this file). See D-124. No other copy mentions the STARTER fee or term.
- Verified: tsc clean. Not checked in a browser (the page reads the one fee constant; the sandbox cannot build the site because Google Fonts is blocked). Term (12 months) and early-cancel (3 months OSF) are contract terms, not shown on the public pages.

## Session: BA public pages "From" prices, 2026-10-30

**Done (branch `ba-amend-2026-10-30`, local commit e82f0e9, NOT pushed):** "From" / "À partir de" before monthly fees on the BA page (EN+FR); price note reworded (D-123). Bands, add-ons, vendors and exit terms deliberately NOT on the site.

**Verified:** tsc clean; playwright at 1440 and 390, EN and FR: new text shows, no horizontal overflow. Not run: lint, build (Google Fonts blocked in sandbox).

**Open:** Mohammad to confirm dropping the API/subscription sentence from the price note; push only on his word. The branch also carries older local commit 2ce9fcb (country dropdown), unpushed before this session.

## Session: Country dropdown on the careers/talent/partnerships form, 2026-10-28

**Done (branch `form-country-picker`, pushed, not merged):** after PR #35 merged (commit 1ddc61b), Mohammad asked for Country to be a pick-list as well. Country is now a dropdown of the 243 regions (D-122 follow-up); picking it pre-selects the phone code. Server accepts only listed English names.

**Verified:** tsc clean, eslint 0 errors on changed files; tests: all 243 names pass the server check, free-typed country refused, French names sorted. NOT verified: look on the preview.

**Next:** Mohammad checks the preview, then approves merge.

---

## Session: shared rate limits + bot check on careers/talent/partnerships, 2026-10-28

**Done (branch `security-shared-limits`, pushed, not merged):** `app/lib/rate-limit-shared.ts` (Redis-backed, hashed keys, timeout, in-memory fallback) now backs the limits on chat, contact, newsletter, Cyber Health, My Scope and opportunity. `/api/opportunity` runs the Turnstile check; `oragrol-opportunity-page.tsx` shows the widget and the submit button waits for the token. ODO popup cookie is Secure on https. Decision D-121.

**Found, not changed:** chat already had a shared daily per-IP cap, a $5/day ceiling and strike blocking; dashboard cookies were already httpOnly + Secure + SameSite=Lax. My first read of the chat as "only in-memory" was wrong.

**Verified:** tsc clean, eslint 0 errors on changed files; limiter logic tested against a stand-in Redis (limit, expiry, hashed keys, error, unset, 4 s hang all behave). **NEEDS VERIFICATION on the preview:** real Upstash accepts `PEXPIRE ... NX`; careers/talent/partnerships submit works end to end with the widget; the preview hostname is added to the Cloudflare widget or the check refuses.

**Preview test:** Mohammad submitted the careers form on the preview ("Your submission has been received"), so the bot check and shared limit work there. He then asked for fixed choices: phone country code dropdown and certification tick-boxes (D-122), added to the same branch. Verified: tsc clean, eslint 0 errors, list and validator tests pass (243 countries named in EN and FR, 47 codes spot-checked, schema refuses free-typed values). NOT verified: how the form looks on the preview (no dev server or preview access from the sandbox).

**Next:** Mohammad checks the updated preview (country dropdown, certification boxes, then a submit), then approves merge.

---

## Session: Industries page body redesign, 2026-10-22

**Done (branch `industries-redesign`):** new visuals for the three sections between hero and CTA (select an industry, one coordinated path + evidence bar, what leaders need to know). A first version merged them into one section; Mohammad rejected that, so they are separate again. Same content and keys, plus `journey.unifyCta`. Decision D-120.

**Verified:** tsc clean, lint 0 errors; screenshots at 390, 1440, 1920; no horizontal overflow at 360 to 2560; tab click, arrow keys, focus, deep link, French page, mobile rail (page does not jump); no page errors.

**Card version:** Mohammad asked for premium cards and less scroll; sections now use cards, phone step cards swipe, accordion closed. Heights 1765 (1440), 1961 (1920), 2150 (phone).

**Next:** Mohammad reviews the preview; old ind-* CSS cleanup later.
---

## Session: Security Checks fixed and lint errors cleared, 2026-10-22

**Done (branch `fix-security-check-lint`):** the workflow failed at `npm audit` because of a dev-tool-only advisory with no patch (`braces`); it now audits production packages only (0 vulnerabilities). 8 lint errors cleared with no behaviour change. Decision D-119.

**Verified:** lint 0 errors, tsc clean, browser test of popup link, scan resume and chat dismissed-restore, no page errors. Full build left to the Vercel preview.

**Next:** Mohammad checks the preview, then "merge".

---

## Session: Batch C cleanup (README, env example, prettier), 2026-10-22

**Done (branch `cleanup-batch-c`):** real README; `.env.local.example` now lists all settings the code reads (23 added, names only); unused `prettier` removed (package.json + lockfile, `npm ci --dry-run` clean). Decision D-118.

**Kept on purpose:** `tests/example.spec.ts`: the Playwright GitHub workflow passes only because it exists.

**Found, not fixed:** "Security Checks" workflow fails on every push to main; `npm run lint` has 8 errors (ChatWidget.tsx, odo-scan.tsx) that were there before.

**Verified:** typecheck clean for source files; lint identical to main (36 problems, 8 errors, none new).

---

## Session: Batch B cleanup of instruction and planning documents, 2026-10-22

**Request:** Mohammad approved Batch B of the repository audit (branch `cleanup-batch-b`, not pushed).

**Done:** CLAUDE.md section 12 corrected (next-intl is wired, no react-hook-form, real route list, 26 API routes, real fonts, no Solutions or How We Work). PROJECT_MASTER.md archived to `docs/archive/` with a SUPERSEDED banner; new `docs/CURRENT_SOURCES.md`. This file cut to the last 10 sessions, older ones moved to the archive. DECISIONS.md: current-decisions index added, replaced decisions marked superseded, D-117 added. `ORAGROL_RESOURCES_ALL_ARTICLES_FINAL.md` removed (all 6 articles are in `articles-data.ts`; recoverable from git history). sitemap.ts comment corrected.

**Verified:** facts checked against the code three times; typecheck and lint recorded below.

**Next:** Mohammad checks the branch preview, then approves merge and push.

---
