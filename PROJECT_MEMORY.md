# Project Memory — Oragrol Website

Rolling log, most recent session at the top. Keep to last ~10 sessions — older entries move to `PROJECT_MEMORY_ARCHIVE.md`. Durable design/architecture decisions go in `DECISIONS.md`, not here — this file is session history, not a decision record.

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

## Session: home photos, 2026-10-19 to 2026-10-20
- 2026-10-21 additions (all pushed, Vercel success): FR overflow at 1280-1440 fixed (D-106, pre-footer CTA secondary link wraps); chat greeting popup removed (D-107); Business Automation photo replaced with the woman-at-laptop-by-window photo (D-108); Industries hero now has a B&W meeting photo behind the headline, pushed at Mohammad's request against my advice (D-109, licence and six model releases unverified); Cyber Health tablet layout 721-1100px (D-110) and phone layout, both people visible and 77 top-left (D-112), Mohammad approved; home header overflow at 1051-1300px fixed (D-111).
- Open: photo licences and model releases for the three new photos; the Industries photo implies a bigger team than a solo founder (see D-109 to revert); catalogue back cover, contact details, 16-page count.
- Business Automation: desk photo on the right half of "Your tools stay" (D-105). Verified EN at 1920/1440/1024/390, FR at 1440; pre-existing FR overflow noted.
- How We Work page deleted with redirects to home (D-104). Verified: tsc clean, search tests pass, /how-we-work and /fr/how-we-work return 308, sitemap no longer lists it.
- Cyber Health section: night review photo on the right, score on the photo with no card (D-103). Verified at 1920, 1440, 1024, 390; no horizontal overflow.
- Hero photo column pushed then reverted (D-101). "The business reality" band now has a black and white night-office background photo (D-102). Files: homepage-v3.css (block at end), public/images/home/reality-office-night.jpg.
- Verified: tsc clean; playwright-core at 1920, 1440, 1024, 390: photo loads, text readable, no horizontal overflow; /fr returns 200. Pushed to main at Mohammad's request.

---
## Session: ODO and Cyber Health PDFs rebuilt to the approved dashboard style, 2026-10-19
- Mohammad approved both mockups and asked for push. See D-098. Files: `app/lib/odo-report-pdf.tsx` (rewritten, same props), `app/[locale]/cyber-health/pdf-report.tsx` (rewritten, same props), `app/lib/pdf-brand.tsx` (new: logo and watermark), `app/components/brand/logo.tsx` (geometry constants exported, no visual change).
- Verified: tsc clean; eslint 0 errors (2 existing-type alt-text warnings on Image, the same as before). Sample ODO renders 4 pages with the QR on page 4; sample Cyber Health renders 5 pages with the QR on page 5. Renders checked by eye at 70 dpi.
- Not verified: a live `/api/odo/scan/report?format=pdf` run against a real session (no live session was used).

## Session: site search icon live on every public page (branch add-public-search), 2026-10-16
- Search dialog (PublicSiteSearch, mounted in SiteChrome) now answers every aria-label Search/Recherche/Rechercher button. Keyword-only, no AI, index of 102 public pages/articles/services (excludes scan, ops/outbound, chat, admin, API).
- header-search.tsx reduced to a plain trigger (its own dead dialog removed). FAQ header gained a search icon. Escape closes in one press (was two: first press cleared the text).
- FAQ header fits at 360/390/430 phone widths: logo margin removed under 760px, gap 8px under 400px (gpt-pages.css). Pre-existing: /resources/[slug] article page overflows horizontally on phones (its own nav), not caused by search, not fixed here.
- Verified: 12 search unit tests pass; tsc clean; browser check on 18 public page families at 390px and 1440px: icon opens dialog, "mfa" returns results, Escape closes. npm run build fails only because sandbox cannot reach Google Fonts (next/font), not a code error.
- Open: careers, talent, partnerships and cyber-health have no search icon. They are standalone pages by decision (see D-096); awaiting Mohammad's call. Not pushed.

---
## Session: founder section on Company page (photo + dark + new content), 2026-10-09
- Branch `founder-section` (preview only). See D-095. Files: company-client.tsx, gpt-pages.css (founder rules), messages/en.json + fr.json (Company.founder), public/images/company/founder-mohammad-chelouy-tabrizi.jpg.
- Verified: tsc clean; /company at 1440 and 375 and /fr/company render correctly (screenshots via playwright-core).

## Session: header logo spacing fix + website go-live, 2026-10-09
- Mohammad approved the website ("all approved") and asked for push; PDFs NOT approved, so the PDF logo commit was reverted (pdf-brand.tsx removed) before merging.
- Header grid first column 112px -> max-content in gpt-pages.css + homepage-v3.css; HeaderLogo margin-inline-end 48px; 40px logo at 1024-1440px. Measured gap logo->menu >= 74px at 1280-1920 on /, /services, /contact; header heights unchanged; no horizontal overflow.

## Session: logo rollout v3 (horizontal header logo, grey footer icon, share image, 404, chat icon), 2026-10-09
- Branch `brand-logo-replacement` (preview only, not merged). See D-094.
- `logo.tsx`: added `variant="horizontal"` and `tone="watermark"`. `HeaderLogo` now renders the horizontal lockup (48/40px). Footer icon grey #282828 bottom-right, hidden on phones. Shared footer now on old-chrome routes; `site-footer.tsx` and `oragrol-ring.tsx` deleted.
- `SHARE_IMAGE` on every page's openGraph + layout; `public/og/oragrol-share.png`. Branded 404 (`not-found.tsx` + `[...rest]`). Chat launcher shows the brand icon.
- Verified: tsc clean; lint no new issues (pre-existing ChatWidget setState-in-effect error and two warnings remain); 23 routes + 2 bad URLs checked at 1440 and 375 via playwright-core: logo 167x48 / 140x40 everywhere, header heights unchanged, footer 622/743 unchanged, 404 returns 404 with header+footer; og:image + twitter:card summary_large_image on all checked pages. `npm run build` can't run in this sandbox (Google Fonts blocked) — Vercel preview build is the build check. NEEDS VERIFICATION on the preview: real fonts, LinkedIn Post Inspector.

