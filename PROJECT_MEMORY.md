# Project Memory — Oragrol Website

Rolling log, most recent session at the top. Keep to last ~10 sessions — older entries move to `PROJECT_MEMORY_ARCHIVE.md`. Durable design/architecture decisions go in `DECISIONS.md`, not here — this file is session history, not a decision record.

---

## Current Status
Home page (Step 4) fully implemented — all 11 sections (Hero → Security Challenge → Approach → Services → Solutions → Cyber Health → Trust → How We Work → Insights → FAQ → Final CTA) plus global SiteHeader/SiteFooter wired into `layout.tsx`. Header Fix Passes 1-3 complete (search icon, spacing, transparent/gradient background, no-max-width layout, real-logo-geometry inline SVG). Standalone `/pricing` route removed (see D-003). Typecheck/lint/build all clean; visually verified at 375/768/1280/1440/1920/2560px with no console errors.

## Next Steps
1. Step 5 — Services Page (per `PROJECT_MASTER.md`). Inspect current page/design system/content first; report before coding.
2. Hero motion (16-frame sequence) integration remains a separate, non-blocking track — `public/hero/` currently has 8 of the planned 16 scroll-sequence PNGs (`hero-01-initial.png` through `hero-08-scroll7.png`), all correctly wired into `HERO_IMAGES` in `hero.tsx` and crossfading via scroll-driven opacity/scale (a deliberate pivot from live Three.js/R3F rendering to locked offline-rendered reference frames — see file header comment). Frames 9-16 don't exist yet.

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
- Hero motion sequence incomplete (8 of 16 frames present in `public/hero/`, all wired into `hero.tsx`'s crossfade sequence — see Next Steps for the correction from an earlier miscount).
- Nav-link color contrast against the Hero image was checked visually only (screenshots), not with an automated contrast tool.

**Next recommended step:**
- Step 5 — Services Page.

---
*(New sessions get added above this line, newest first. When this file passes ~10 sessions, move the oldest ones into PROJECT_MEMORY_ARCHIVE.md.)*
