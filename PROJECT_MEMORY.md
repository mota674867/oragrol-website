# Project Memory — Oragrol Website

Rolling log, most recent session at the top. Keep to last ~10 sessions — older entries move to `PROJECT_MEMORY_ARCHIVE.md`. Durable design/architecture decisions go in `DECISIONS.md`, not here — this file is session history, not a decision record.

---

## Current Status
Home page (Step 4) fully implemented — all 11 sections plus global SiteHeader/SiteFooter. Header Fix Passes 1-3 complete. Standalone `/pricing` route removed (D-003). Hero has all 16 frames, scroll-mapping bug fixed (D-005), visual-quality gap intentionally frozen (D-006) — not an open item. **Step 5 — Services hub page (`/services`) is now built and verified** (typecheck/lint/build clean, scroll-verified screenshots desktop+mobile, zero console errors) — see D-007 for scope (hub only, Lucide icons, detail pages deferred). The per-service problem/what-we-do/what-you-get/outcome breakdown is draft copy, not yet reviewed by Mohammad.

## Next Steps
1. Mohammad to review Step 5's new draft copy (the expanded 4-field breakdown per live service — the one-liners themselves were already locked/confirmed).
2. Step 6 — Solutions Page, after Step 5 copy review. Pricing/package names/inclusions remain UNCONFIRMED — do not invent, keep the "currently being finalized" status language (already used consistently in Solutions.tsx and Faq.tsx).
3. Hero frame resolution/quality is NOT an open item — see D-006. Do not raise again unless the user brings it up.

---

## Session Log

### 2026-08-12
**Completed:**
- Read `PROJECT_MASTER.md` (new source-of-truth merge doc) at session start.
- Found substantial uncommitted work already in the tree from prior session(s): full Step 4 Home page build-out, Header Fix Pass 2/3, `/pricing` removal. Verified rather than re-done, per Core Rule ("do not redo approved work without a real defect").
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded (3 static routes: `/`, `/_not-found`, `/style-guide`).
- Visual verification via a local Playwright script (no `chromium-cli` in this environment) against `npm run dev`: screenshotted header/hero at 375, 768, 1280, 1440, 1920, 2560px. Confirmed no hard black header bar, logo pinned at a consistent left margin at every width (incl. 2560px, the specific width the nav.tsx comments call out as previously broken), mobile/tablet correctly swap to hamburger + search icons, no console/page errors at any width.
- Backfilled `CLAUDE.md` Section 7 with real verified commands (was still `[TODO]` placeholders).
- Logged D-001 (header no-max-width, caller-owned background), D-002 (logo inlined from source SVG geometry), D-003 (pricing route removed) in `DECISIONS.md` — all three were undocumented deliberate decisions found already implemented in the diff.

**Files changed:**
- This session: `CLAUDE.md`, `DECISIONS.md`, `PROJECT_MEMORY.md` only (docs/logging).
- Already in the working tree from prior session(s), verified not re-done: `app/layout.tsx`, `app/page.tsx`, `app/components/ui/nav.tsx`, `app/components/ui/section.tsx`, `app/components/ui/typography.tsx`, new `app/components/{brand,motion,sections,site}/`, new `public/brand/`, `public/hero/`, `Oragrol_Logo_Final.svg`; deleted `app/pricing/page.tsx`, `app/components/pricing-card.tsx`; `package.json`/`package-lock.json` (added `motion` dependency).

**Problems found:**
- `PROJECT_MEMORY.md` and `DECISIONS.md` had never been filled in despite Steps 1-4 and two header-fix passes already having happened — no session history existed to check against `CLAUDE.md`'s "read last 3-5 entries" step.
- Stray duplicate `app/CLAUDE.md`, `app/DECISIONS.md`, `app/PROJECT_MEMORY.md` exist (mirroring the root files, also blank) — not cleaned up this session, flagged to Mohammad, left in place pending a decision.

**Problems solved:**
- Verified the uncommitted Step 4 + header-fix work is sound (typecheck/lint/build/visual all clean) rather than leaving it unverified or redoing it.

**Still open / needs verification:**
- Stray `app/CLAUDE.md` / `app/DECISIONS.md` / `app/PROJECT_MEMORY.md` duplicates — not yet resolved.
- Nav-link color contrast against the Hero image was checked visually only (screenshots), not with an automated contrast tool.
- Hero frames are 1672×941, not the 3840×2160 spec in `PROJECT_MASTER.md` — flagged, needs a call from Mohammad on whether to re-render.

**Next recommended step:**
- Step 5 — Services Page.

---

### 2026-08-12 (later same day) — Hero: wire in all 16 frames
**Completed:**
- User supplied the full 16-frame set as `public/hero/hero-frames-final.zip` (not loose files as described — extracted it to `public/hero/frame-01.png` … `frame-16.png`, then deleted the zip). Old 8-file set (`hero-01-initial.png` etc.) no longer present on disk.
- Clarified with the user before building anything: confirmed the Hero stays purely scroll-scrubbed (frame-01 at scroll start, frame-16 at scroll end, releases normally, no timer auto-loop, no wrap-around) — the earlier "crossfade when it loops from 16 back to 1" phrasing in the request didn't describe an actual mechanism in the code, since a one-pass scroll-scrub never cuts from frame-16 directly to frame-01. No crossfade-on-loop was built, by design — see the request/response exchange, not a separate D-00x entry (no durable decision was made, just a clarification of existing behavior).
- Updated `HERO_IMAGES` in `hero.tsx` to all 16 frames in order; `frameEnvelope`/`frameOpacityStops` needed no changes (already generic on array length). Updated the file's header comment (frame count, explicit note on no-loop behavior) and simplified-path comment (`hero-01` → `frame-01`).

**Files changed:**
- `app/components/sections/home/hero.tsx` (HERO_IMAGES array + comments)
- `public/hero/`: added `frame-01.png` … `frame-16.png`; removed old 8-file set and the intermediate zip.

**Problems found:**
- Hero frames are 1672×941 px, not the 3840×2160 4K called for in `PROJECT_MASTER.md` Step 4. Not blocking (aspect ratio is correct, ~16:9), but flagged as an open question, not silently accepted as final.

**Problems solved:**
- N/A — straightforward swap once frames were extracted and the loop-mechanism question was resolved.

**Still open / needs verification:**
- Nav contrast (visual check only), hero frame resolution (see Next Steps).

**Next recommended step:**
- Step 5 — Services Page.

---

### 2026-08-12 (later same day) — Remove stray app/ duplicate files
**Completed:**
- Deleted `app/CLAUDE.md`, `app/DECISIONS.md`, `app/PROJECT_MEMORY.md` — untracked, blank/duplicate copies of the root files (confirmed unchanged since being read in full earlier this session before deleting). `app/` directory itself untouched, all real component/route files still present.

**Files changed:**
- Removed: `app/CLAUDE.md`, `app/DECISIONS.md`, `app/PROJECT_MEMORY.md` (were never tracked in git, so no commit diff for the deletion itself — nothing to `git rm`).

**Still open / needs verification:**
- Nav contrast (visual check only), hero frame resolution (3840x2160 spec vs. actual 1672x941 — needs a call from Mohammad).

**Next recommended step:**
- Step 5 — Services Page.

---

### 2026-08-12 (later same day) — Diagnose and fix hero scroll flicker (frame-02/frame-01)
**Completed:**
- User reported a visible flicker at the very start of the Hero's scroll range (frame-02 briefly showing, then correcting back to frame-01) and asked for the exact scrollYProgress→frame-index mapping code plus a root cause.
- Proved `frameEnvelope`/`frameOpacityStops`' math correct by hand (traced against framer-motion's own `interpolate()` clamp/per-segment-easing source in `node_modules`), then verified empirically with Playwright: rest-state and SSR markup were both correct, but a live scroll sweep revealed the real bug — framer-motion's automatic ViewTimeline hardware acceleration (triggered because `useScroll`'s `offset: ["start start", "end end"]` matches the library's "contain" preset) desyncing badly across the Hero's ~32 concurrent scroll-linked transforms. Confirmed via `getAnimations()` that a native WAAPI Animation (not plain JS) was driving opacity, and via a full-range scroll sweep that frame-01 went non-monotonic (declining correctly, then climbing back to a stuck opacity 1 for any scrollY past ~2250px, simultaneous with frame-16 also at 1).
- Fixed by deleting `scrollYProgress.accelerate` synchronously right after the `useScroll()` call in `Hero()`, forcing framer-motion onto its plain JS/rAF path. Re-verified with the same Playwright sweeps: perfectly monotonic frame progression at every scrollY tested, frame-02 now peaks at scrollY≈210px (matches hand-calculated center≈211px almost exactly), frame-16 reached exactly at scrollY=2250 (matches hand-calculated p=1).
- Logged the full root-cause chain and fix as DECISIONS.md D-005, including a "watch for" note since this is a project-wide framer-motion gotcha (any future `useScroll({ target, offset })` matching a named preset gets the same silent acceleration), not Hero-specific.
- User then logged a separate, explicit decision (D-006): Hero motion quality/depth/cinematic feel is intentionally left as-is for now to unblock the rest of the site — not to be touched again without explicit instruction. Session moved on to inspecting Step 5 (Services Page) — read-only inspection, no changes made pending the user's review of a proposed structure.

**Files changed:**
- `app/components/sections/home/hero.tsx` (added the `.accelerate = undefined` line + explanatory comment, no other logic changed)
- `DECISIONS.md` (D-005, D-006)

**Problems found:**
- Third-party library behavior (framer-motion's automatic scroll acceleration), not a bug in this project's own code — but required deep source-diving into `node_modules/framer-motion` to root-cause rather than guess.

**Problems solved:**
- Hero scroll sequence is now provably monotonic and correct end-to-end (frame-01 through frame-16), verified against hand-calculated math, not just "looks right."

**Still open / needs verification:**
- Nav contrast (visual check only). Hero frame resolution/visual-quality question is now explicitly closed per D-006 — not open, intentionally deferred, do not revisit without explicit instruction.

**Next recommended step:**
- Step 5 — Services Page (inspection phase; awaiting user review of proposed structure before any changes).

---

### 2026-08-12 (later same day) — Build Services hub page (Step 5)
**Completed:**
- Inspected before coding, per process: no `/services` route existed (only a Home-page teaser section with the 8 confirmed service one-liners + icons); catalogued the full `app/components/ui/` design system and the asymmetric-layout patterns already established in other Home sections (Approach's connected spine, How We Work's alternating stepper, Solutions' 3+1 layout).
- Reported findings + a proposed 5-section hub-page structure; got explicit approval with two clarifications: (1) Lucide icons for now, not custom — logged as D-007, same pattern as D-006; (2) hub page only, individual per-service detail pages explicitly deferred.
- Built `/services`: `ServicesHero` (dark environment — deliberately matches Home's opening section so SiteHeader's current dark-entry-section assumption still holds, avoiding an out-of-scope SiteHeader change), `LiveServices` (4 full-width alternating feature rows, each with Challenge/What Oragrol Does/What You Get/Outcome + a CTA — new draft copy, flagged in the component's own comment, not yet reviewed), `AdditionalCapabilities` (4 condensed cards reusing the exact locked one-liners + status badge from the Home teaser), `SolutionsBridge` (reuses Faq.tsx's existing Services-vs-Solutions copy verbatim rather than inventing new phrasing), and reused the existing `FinalCta` component directly rather than duplicating it.
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean (one real error caught and fixed — an unescaped apostrophe), `npm run build` succeeded (new static `/services` route). Visual verification caught a real methodology mistake worth remembering: a `fullPage: true` Playwright screenshot showed most sections as empty/blank — traced to `Reveal`'s `whileInView` needing genuine scroll events to fire, which Playwright's single-shot fullPage capture doesn't reliably provide. Re-verified correctly via the same incremental real-scroll methodology already used for the Hero (scrollTo + wait + screenshot per step) — page renders completely correctly; the blank sections were a screenshot-method artifact, not a real bug.
- Updated `PROJECT_MASTER.md` (Step 5 status, Current Position) to reflect the build and the still-open copy-review item.

**Files changed:**
- New: `app/services/page.tsx`, `app/components/sections/services/{hero,live-services,additional-capabilities,solutions-bridge}.tsx`
- `DECISIONS.md` (D-007), `PROJECT_MASTER.md` (Step 5 + Current Position)

**Problems found:**
- `fullPage` Playwright screenshots are unreliable for verifying `whileInView`-based reveal animations — worth remembering for future page verifications on this project (Solutions, Cyber Health, etc. will use the same `Reveal` component).

**Problems solved:**
- Correctly distinguished a screenshot-methodology artifact from a real rendering bug before reporting anything as broken.

**Still open / needs verification:**
- Mohammad's review of the new draft copy (problem/what-we-do/what-you-get/outcome per live service).
- Nav contrast (visual check only, carried over from earlier sessions).

**Next recommended step:**
- Review Step 5 copy, then Step 6 — Solutions Page.

---
*(New sessions get added above this line, newest first. When this file passes ~10 sessions, move the oldest ones into PROJECT_MEMORY_ARCHIVE.md.)*
