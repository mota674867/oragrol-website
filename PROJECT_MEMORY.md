# Project Memory — Oragrol Website

Rolling log, most recent session at the top. Keep to last ~10 sessions — older entries move to `PROJECT_MEMORY_ARCHIVE.md`. Durable design/architecture decisions go in `DECISIONS.md`, not here — this file is session history, not a decision record.

## Session: Applications live on the dashboard, OCS door set up, Business setup built for the web, 2026-11-03 (later)

**Done:** PRs #43 (forms, security upgrade of next 16.4.1 and zod 4.6.6, lint fix), #44 (log why a link cannot open) merged; OCS and dashboard Applications merged. Live OCS: migrations 031 + grants run, revision `apply2` live, website settings added; a test invitation reached a real inbox and the link opened (the draft gate said "not open yet", as intended). Then, on branches (NOT pushed until Mohammad says; not merged): the name ORAGROL Automation, setup PDF fixes, and the whole Business setup build: OCS migration 032 + `basedOn` (branch `setup-link`), dashboard reference field (branch `setup-link`), website setup forms (branch `setup-web`, on top of `apply-concept-name` = PR #45).
- **Verified:** OCS 327/327 in `ocs/` (applications 25), dashboard 194/194, website applications 53/53, tsc clean in all three. Browser flow in a real browser against `next dev` + real OCS code + throwaway Postgres (`scratch/bt_all4.py`): all four forms walked and submitted, setups invited from their applications, refusals checked, 8 checks, no page errors.
- **Test-setup notes:** throwaway Postgres data is in `/tmp/pgtest` (start as user `claude` with TLS); the daily invitation cap (50 per staff) and the website submit limit (12 per 10 min) block repeated runs: age `application_emails.sent_at` and restart `next dev`.
- **NEEDS VERIFICATION:** `npm run build` on Vercel; migration 032 on the live database (Mohammad runs it); Redis-backed limits; the dashboard New invitation window with a setup choice in a browser (covered by tests only).
- **Not done / blocking go-live:** counsel wording; item descriptions, limits, defaults review; drawn signature decision; vendor round 2; filled client-copy PDF email; Services forms.

## Session: Forms rebuilt to the approved PDFs, one-tick start, ticked-only content, browser test, 2026-11-03

**Done (branch `applications-slice-3`, local commits only, NOT pushed; also OCS `applications-slice-1` and dashboard `applications-slice-2` test changes, local):** OR ONE and BA application forms rebuilt from the approved PDFs (`app/lib/apply/forms/or-one-application.ts`, `ba-application.ts`), Business Setup builders (`forms/setup.ts`, not registered yet), real 77-item OR ONE catalogue (533 points, 11 locked) in `catalogue.ts`. Decisions in D-127. The browser gets category names only and fetches a ticked category's details (`/api/apply/details`).
- **Verified:** tsc and eslint clean; `node --test tests/apply-engine.test.mjs` 47/47. Browser run with Playwright against `next dev`, the real OCS code and a throwaway PostgreSQL 16: 26 checks (bad links 404; one agree tick; terms collapsed; gating; silent caps; no category data before a tick; ticked-only items, software, size, rules and approvers; reload restores; locked items offer no Automatic; submit stores only ticked sections; new-style reference OR-APP-xxxxxxxx; phone width). The test script lives outside the repo.
- **Test-setup notes:** open the dev server as `localhost`, not `127.0.0.1` (Next blocks dev resources for other origins, which blanks the 404 screen); the open-page rate limit is 60 per 10 minutes per address, so restart the dev server between repeated runs; the throwaway DB superuser is `admin`.
- **NEEDS VERIFICATION:** `npm run build` (Vercel preview only); Redis-backed rate limits; an invitation email arriving.
- **Not done:** filled client-copy PDF at runtime and its email (needs the sender info@orgro.ca); Business setup wiring; paper-application entry screen; vendor round 2; counsel wording; the concept name.

## Session: Private application forms /apply/<code> (Applications slice 3), 2026-11-02

**Done (branch `applications-slice-3`, committed, NOT pushed):** invite-only form engine at `app/apply/[code]` (own root layout, no site chrome), save/submit API `app/api/apply/[action]`, engine and data in `app/lib/apply/` (types, engine, catalogue, fixture, forms/or-one-application, registry, ocs, handler). See D-126. Config: `next.config.ts` headers for `/apply/*`, `proxy.ts` matcher excludes `apply`, `robots.ts` disallows `/apply/` and `/api/apply/`, `tsconfig.json` allows `.ts` imports (so the engine can be tested with plain Node), `.env.local.example` has `OCS_APPLY_URL`, `OCS_APPLY_SECRET`, `APPLY_ALLOW_DRAFT_FORMS`, `APPLY_FIXTURE_CATALOGUE`.
- Verified: `tsc --noEmit` clean; `eslint` clean on the new files; `node --test tests/apply-engine.test.mjs` 28/28 (gating, formats, None option, meeting boxes, generated pages, save/read-back round trip, server checks, link privacy). Browser run with Playwright against `next dev`, the real OCS code (slice 1) and a throwaway PostgreSQL 16: bad/switched-off/expired/malformed links = 404; page gate; formats; item picker and points; meeting box on a blank field; reload mid-form restores answers and page; walk of all generated pages; submit refused with a legal box unticked; submit stores readable answers, signature, meeting request and events; link then says "submitted"; forged save refused; phone width has no sideways scroll; the submission reads correctly on the staff Applications page.
- **Look changed same day (Mohammad):** the form now uses the dashboard's font (Inter, self-hosted) and its light/dark palettes with the same switch; `app/apply` no longer imports `globals.css` or `next/font/google`. Checked: page background equals the dashboard's (#F4F2ED light, #5d6063 dark), Inter loads, the switch persists after reload, no Google font requests.
- **NEEDS VERIFICATION:** `npm run build` (only the Vercel preview can confirm it; the sandbox blocks Google Fonts for the rest of the site); Redis-backed rate limits (the sandbox used the in-memory fallback); an invitation email actually arriving (needs the sender domain).
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

---

## Session: Forms v2 build, 2026-11-04

**Request:** after Mohammad's live test, rewrite all four forms (ranges and pick lists, one discuss option, caps, clearer questions), make submissions readable for ZM77, add confirmation email and PDF copy, regenerate the PDFs, give him one before/after table.

**Done (branch `forms-v2`, commits 3000f98, feffa48, 0b40460 plus docs):** engine and forms rewritten; ZM77 record; confirmation email and PDF copy; four PDFs, field kit and client copy regenerated from the new forms; all four forms walked in a real browser (OR ONE and BA applications, both setups) against real OCS code and a throwaway database, record stored for all four.

**Verified:** 58 tests pass, `npx tsc --noEmit` clean, browser run 8 checks, no page errors. NEEDS VERIFICATION: email sending live (RESEND_API_KEY, sender domain), `npm run build` cannot run here (Google Fonts fetch is blocked in this sandbox), so the Vercel build is the check; lint has 0 errors.

**Next:** Mohammad reviews the before/after table; then push, PR, merge, live check. No real invitations before that.

---

---

## Session: caps on the 12 individual services, 2026-11-09

**Request:** Mohammad approved the caps and extra charges for the 12 individual services and asked to push and merge them.

**Done (branch `services-alacarte-caps`):** `capEn`/`extraPrice` added to `INDIVIDUAL_SERVICES`; cap and extra lines shown on each card (EN and FR, messages `individual.list.<code>.cap` and `.extra`); chat knowledge mentions the caps; styles `.os-cap`. Decision logged as D-133.

**Verified:** `npx tsc --noEmit` clean; `npm run lint` 0 errors (39 warnings, none in changed files); browser check on dev server in EN and FR: 10 cap lines on each page, no page errors, layout looked right.

**Next:** legal package V6 (SOW-001 v4.0 Schedule 4) carries the same caps; open items there still marked TO CONFIRM.
