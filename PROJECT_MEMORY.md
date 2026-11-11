# Project Memory — Oragrol Website

Rolling log, most recent session at the top. Keep to last ~10 sessions — older entries move to `PROJECT_MEMORY_ARCHIVE.md`. Durable design/architecture decisions go in `DECISIONS.md`, not here — this file is session history, not a decision record.

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

---

## Session: Services web forms, 2026-11-09

**Request:** Mohammad asked for the Services application and Business setup as web forms, like the BA and OR ONE ones.

**Done (branch `services-forms`):** `forms/services-application.ts` (9 pages, 11 legal ticks) and `forms/services-setup.ts` (5 pages, built from the application's answers) added; registered in `registry.ts` (draft status, opens only with `APPLY_ALLOW_DRAFT_FORMS=1`); `handler.ts` `setupFromOpen` accepts product services; engine tests updated and extended. OCS and the dashboard already handled product services, no change there.

**Verified:** 67 engine tests pass, `npx tsc --noEmit` clean, eslint 0 errors. Local browser run (fictional data, real OCS code, throwaway Postgres): application and setup submitted, setup linked to its application, BA setup on a Services application refused, no page errors. NEEDS VERIFICATION: Vercel preview, live check, `npm run build`. NOT BUILT: ZM77 brief/proposal step for Services.

**Next:** Mohammad checks the preview; the forms stay draft (closed) until he says open; vendor round 2 and counsel review before any real invitation.

---

## Session: Services forms published, 2026-11-09

**Request:** Mohammad's test invitation showed "This form is not open yet" on orgro.ca; he asked for the Services forms to be live.

**Done (branch `services-forms-live`):** `services-application.ts` and `services-setup.ts` set to `status: "published"`, version 1.0; tests updated (67 pass, tsc clean).

**Next:** after merge, Mohammad re-sends a Services invitation and checks it opens. Counsel review and vendor round 2 still apply before real clients. NOT BUILT: ZM77 Services proposal step.

---

## Session: Lead Finder pilot built (offline-tested), 2026-11-09

**Request:** Mohammad asked for the building part of the Lead Finder pilot to be finished before any test. The pilot finds, for a list of businesses, the owner or manager email each business published on its own site and proves it. Plan and approval brief are in the Claude project (Lead Finder design and pilot build brief notes).

**Done (branch `lead-finder-pilot`):** isolated module `app/lib/lead-finder/` (`text.ts`, `emails.ts`, `pages.ts`, `grade.ts`, `ai.ts`, `run.ts`, `cost.ts`), runner `scripts/lead-finder-pilot.ts`, rule tests `scripts/test-lead-finder.ts` (31 checks), `docs/LEAD_FINDER_PILOT.md`. Rule: the AI picks a NUMBER from a list of addresses the code found; code proves the name is on the site. Generic, missing or no-solicitation sites never reach the AI. Grades A (name and email on same page), B (different pages), C (reject, with a reason). Hard limits: cost cap (default USD 7), valid-lead target, scan cap. Results go to a git-ignored `pilot-results/` folder. Sends nothing, no HubSpot, no change to ODO, the dashboard or the approval gate. D-136.

**Verified:** `npx tsx scripts/test-lead-finder.ts` 31 pass; `npx tsc --noEmit` clean; eslint on the new files 0 errors; runner dry run with no network and no key behaves (all unreadable, files written, missing-key message, exit 1). NEEDS VERIFICATION: everything live. This sandbox has no internet and no `ANTHROPIC_API_KEY`, so real page fetching, the Haiku call (model id `claude-haiku-5-5`, reply shape, real token cost) and real yield are untested. Run on a machine with internet and the key.

**Next:** Mohammad approves the 50 businesses (proposed: GTA, 10 each in dental, accounting, law, physio and health, trades offices), where it runs and the CAD 10 cap; run the pilot; check 20 results by hand; then decide step 2 (ODO outbound changes). robots.txt handling NEEDS DECISION. CASL lawyer review before any send. D-136 does not change the 21 Oct outbound rule; the reminder and daily-batch change is still to be logged.

---

---

## Session: Outbound engine built (sending off), 2026-11-10

**Request:** Mohammad approved the ODO outbound build checklist (Claude project note "ODO Outbound Build Checklist") and asked to build the engine. Everything stays paused until he lands in Canada; domains and mailboxes come then.

**Done (branch `lead-finder-pilot`, on top of the pilot):** `app/lib/outbound/` — `config.ts` (limits: 70 valid, 60 per batch, 400 sites, CAD 25 a day, CAD 550 a month (confirmed); `SENDING_ENABLED` fixed false), `plan.ts` (default plan: 17 areas GTA, Ontario, Canada; 8 sectors), `source-geoapify.ts`, `dedupe.ts`, `robots.ts`, `first-look.ts` (SPF and DMARC only), `writer.ts` (Sonnet, code checks, footer), `store.ts` (MemoryStore and RedisStore, keys `outbound:*`), `engine.ts` (resumable slices, stop rules, batch, `approveBatch`), `report.ts`, `hubspot-sync.ts` (off), `live.ts`. Routes `app/api/outbound/cron` (locked, not scheduled) and `app/api/outbound/report` (locked). Local runner `scripts/outbound-run.ts` (state in git-ignored `outbound-local/`). Tests `scripts/test-outbound-engine.ts` (27). Lead Finder result now carries `roleType`. D-137.

**Verified:** 27 engine tests and 31 Lead Finder tests pass; `npx tsc --noEmit` clean; eslint 0 errors on changed files; runner refuses without keys. `npm run build` could not finish here: the sandbox cannot reach Google Fonts (unrelated to this change), so NEEDS VERIFICATION on a Vercel preview. NOT verified live: Geoapify categories and response fields, Haiku and Sonnet model ids and real cost, real yield, HubSpot write, Redis store against Upstash.

**Next:** (pilot run PENDING by Mohammad, 2026-11-10: test later) run the local pilot on Mohammad's computer (`npx tsx --env-file=.env.local scripts/outbound-run.ts --max-scan 50 --max-cost-cad 10 --write-limit 10`), check about 20 results by hand; then the staff Outbound page in the dashboard (design shown 2026-11-10, needs dashboard master update after v28), with approval through the existing gate; schedule only when he switches it on. After landing: domains, mailboxes, warm-up, CASL review, sending build.
## Session: Industries hero speed fix, 2026-11-11

**Request:** Mohammad asked to work on SEO and site speed. I ran Google PageSpeed (mobile) on six pages in his Chrome: Home 99, Services 92, Business Automation 89, OR ONE 92, Industries 69, Contact 100; SEO 92 on all six. Industries was slow because its hero photo (D-109) is a CSS background, discovered late, and 614 KB (LCP 15.5 s).

**Done (branch `industries-hero-speed`, local only, not pushed):** two WebP files (`hero-meeting-rings.webp` 240 KB for desktop, `hero-meeting-rings-mobile.webp` 43 KB for phones), the two D-109 CSS rules in `app/gpt-pages.css` now point to them, and `app/[locale]/industries/page.tsx` adds two media-matched preload links (hoisted to head). Original JPG kept for revert. D-138.

**Verified:** `npx tsc --noEmit` clean; eslint on the page 0 errors; dev server: both preload tags in the HTML, each viewport (1440 and 390) requests only its own file once, no page errors, screenshots look unchanged. NEEDS VERIFICATION: `npm run build` (sandbox cannot reach Google Fonts) and the real PageSpeed score on a Vercel preview.

**Also done (same branch):** the SEO 92 on every page (PageSpeed: canonical points to another hreflang location) came from `SITE_URL` being `https://orgro.ca` while the live site redirects to `https://www.orgro.ca` (confirmed in Chrome). `app/lib/site-config.ts` now `https://www.orgro.ca` (SITE_DOMAIN stays `orgro.ca`). Dev check: canonical, en/fr/x-default links, sitemap and robots all use www; English is x-default. D-139. NEEDS VERIFICATION: the SEO score on a Vercel preview.

**Open:** Cyber Health page images are 2.5 and 2.8 MB (not tested). Business Automation 89 (unused JS/CSS).

**Next:** push the branch for a preview only when Mohammad says, re-run PageSpeed on Industries, then merge on his yes.

---

