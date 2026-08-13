# Decisions Log — Oragrol Website

Permanent record of choices made on purpose, so Claude Code (or future-you) never "fixes" something that was already a deliberate call. Add a new entry any time a real architectural, design, tooling, or content decision is made. Don't duplicate this into PROJECT_MEMORY.md — reference the ID instead.

Format: one entry per decision, numbered sequentially, never delete — mark superseded if reversed.

---

### D-001 — Header has no max-width; background is fully caller-owned
- **Date:** 2026-08-12 (backfilled — decided during Header Fix Pass 2/3, undated in source docs)
- **Context:** Header Fix Pass 2 needed the header to blend into the full-bleed Hero image instead of sitting on a hard black bar, and to stay correctly aligned at large desktop widths. A finite `max-w-*` cap (tried at both 1280px/`max-w-7xl` and 1920px) kept breaking at whatever width was one step larger — confirmed by measuring the logo's x-position jumping from a consistent 48px to 368px once the cap engaged and centered the content instead of pinning it to the edge.
- **Decision:** `NavBar` (`app/components/ui/nav.tsx`) has no max-width constraint at all — `px-6 md:px-12` alone keeps logo/actions a constant distance from the viewport edge, matching the Hero's own edge-to-edge behavior. `NavBar` also no longer bakes in `bg-background`; background is left entirely to the caller via `className`, because `bg-background` (a `background-color`) was fighting a gradient override (`background-image`) at the CSS-property level instead of being replaced by it.
- **Alternatives considered:** A larger finite cap (e.g. `max-w-[2560px]`) — rejected, just moves the breakpoint where the same bug reappears, doesn't fix it. Verified clean at 1280/1440/1920/2560px via Playwright screenshots.
- **Status:** Active

---

### D-002 — Header logo is an inlined SVG rebuild of the source file, not a direct file import
- **Date:** 2026-08-12 (backfilled — decided during Header Fix Pass 3, undated in source docs)
- **Context:** Header Fix Pass 2 asked for the header logo to use the real `Oragrol_Logo_Final.svg` file directly rather than a hand-coded approximation. A prior pass (`OragrolRing` + separately hand-typed text in a flex column) guessed at spacing/scale and didn't match the source file's own gap/proportions.
- **Decision:** `OragrolLogo` (`app/components/brand/oragrol-logo.tsx`) inlines the source SVG's own three graphic elements (ring `<circle>` + both `<text>` nodes) with their exact source coordinates (cx/cy/r/stroke-width/dasharray/rotate, x/y/font-size/letter-spacing) untouched, cropped to a measured bounding-box `viewBox`. The only changes from the raw file: cropped viewBox, and fill/stroke swapped from the source's fixed dark-on-white values to CSS custom-property tokens (`--color-accent`, `--color-text-primary`, `--color-text-secondary` — same hex values as the source) so the mark stays legible across the dark/white/light-blue section environments. `Oragrol_Logo_Final.svg` at the project root remains the authoring source of truth; it is not imported directly at runtime.
- **Alternatives considered:** Direct `<Image>`/inline-`<img>` import of the raw SVG file — rejected because the source file's colors are fixed (dark-on-white), which would break on the dark header and any future light section without a token-based recolor.
- **Status:** Active

---

### D-003 — Pricing removed from the live site pending Solutions page (Step 6)
- **Date:** 2026-08-12 (backfilled, undated in source)
- **Context:** `PROJECT_MASTER.md` Step 6 marks package names/inclusions/pricing as unconfirmed and says not to lock/publish them yet. A standalone `/pricing` route (`app/pricing/page.tsx`) and its `pricing-card.tsx` component existed from initial scaffolding.
- **Decision:** Both were deleted. Pricing will resurface only as part of Step 6 (Solutions page), using the "This section is currently being finalized" status language — not as its own route.
- **Alternatives considered:** Keep `/pricing` live with placeholder copy — rejected, an indexed route with no real content ahead of Step 6 isn't worth the SEO/UX cost.
- **Status:** Active

---

### D-004 — Hero stays a single-pass scroll-scrub; no auto-loop, no wrap-around
- **Date:** 2026-08-12
- **Context:** All 16 planned hero frames became available (previously only 8 existed). The request to wire them in mentioned "a short crossfade transition when the sequence loops from frame-16 back to frame-01," which doesn't describe any mechanism the existing scroll-driven `hero.tsx` actually has — it's a one-pass scrub (frame-01 at scroll start, frame-16 at scroll end, then releases to the next section), never a timer-based or wrap-around loop. Asked the user to clarify rather than assume a mechanism change, since it would have meant picking between (a) a genuine auto-playing ambient loop matching `PROJECT_MASTER.md`'s original "seamless loop" language, or (b) extending the scroll range so scrolling further wraps back to frame-01.
- **Decision:** Neither. Keep the scroll-scrub exactly as it already was — frame-01 at scroll start, frame-16 at scroll end, normal release, reverse-scroll just plays the same envelopes backward. No timer, no wrap-around, no crossfade added, because the sequence never cuts from frame-16 directly to frame-01 in this mechanism — the visual mismatch between those two frames (confirmed: frame-01 is a calm dark-blue night sky, frame-16 is a warm orange sky with a teal network overlay) never becomes visible.
- **Alternatives considered:** Auto-playing ambient loop (would match the original brief's language but is a real architecture change to a scroll-scrub that was already tuned and shipped); scroll wrap-around (would mean continuing to scroll down replays the hero instead of advancing to the next section — likely to read as broken/confusing). Both explicitly declined by the user.
- **Status:** Active

---

### D-005 — Hero's `scrollYProgress` forces off framer-motion's ViewTimeline acceleration
- **Date:** 2026-08-12
- **Context:** User reported a visible flicker right at the start of the Hero's scroll range — frame-02 would briefly show, then "correct back" to frame-01. Root-caused (not guessed — verified with a Playwright script sweeping `window.scrollTo` across the full pinned range and reading `getComputedStyle` opacity on every frame's wrapper) to framer-motion's automatic hardware acceleration: `useScroll({ target: sectionRef, offset: ["start start", "end end"] })` — that exact offset normalizes to the library's "contain"/`ScrollOffset.All` preset (see `presets`/`offsetToViewTimelineRange`/`canAccelerateScroll` in `node_modules/framer-motion/dist/cjs/index.js`), which makes `useScroll` set a private `.accelerate` config on the returned `scrollYProgress` MotionValue and hand this Hero's ~32 concurrent derived opacity/scale transforms off to the browser's native `ViewTimeline`. That path desyncs badly with this many concurrent derived transforms sharing one source: measured frame-01 opacity going non-monotonic — correctly declining through ~0-300px of scroll, then climbing back to a stuck `1.0` for any scrollY beyond ~2250px, simultaneously with frame-16 also reading `1.0`. The hand-derived math in `frameEnvelope`/`frameOpacityStops` was proven correct throughout (verified against framer-motion's own `interpolate()` clamp/per-segment-easing source) — the bug is entirely in the acceleration path, not the project's own formula.
- **Decision:** Immediately after the `useScroll()` call in `Hero()`, delete `scrollYProgress.accelerate` (same property the library itself conditionally sets — not a private field invented here) to force the MotionValue onto framer-motion's plain JS/rAF-driven update path. Verified via the same Playwright sweep that this restores exact agreement with the hand-calculated breakpoints (e.g. frame-02 now peaks at scrollY≈210px, matching `center = 0.09375 × 2250px ≈ 211px`) and eliminates the non-monotonic behavior at every scroll depth tested, including well past the pinned section's end. Must be done synchronously in the render body at that exact point, not in an effect — framer-motion sets `.accelerate` synchronously during `useScroll`'s own render pass, before any of its internal effects run; a `useLayoutEffect` on our side would fire after useScroll's internal one and could race the attachment. `react-hooks/immutability` is disabled for that one line with an inline justification (MotionValue is a mutable, ref-like object owned by framer-motion, not React-tracked state).
- **Alternatives considered:** Changing the `offset` to avoid the preset match — rejected: `normaliseOffset` compares the *normalized* semantic range, so any offset expressing the same "full target scroll-through" (`[[0,0],[1,1]]`) matches "contain" regardless of string vs. array syntax; avoiding the match would require a different, slightly-wrong range (e.g. an epsilon-offset hack) rather than a clean fix. No public `useScroll` option to disable acceleration was found in the library's exports.
- **Watch for:** This is a project-wide gotcha, not Hero-specific — any future `useScroll({ target, offset })` call whose offset normalizes to one of the four named presets (`entry`/`exit`/`cover`/`contain`) will silently get the same acceleration, and with it the same risk of desync if it drives more than a couple of simultaneous derived transforms. Apply the same `.accelerate = undefined` pattern if that happens again.
- **Status:** Active

---

### D-006 — Hero motion (16-frame sequence) frozen as-is; known quality limitations intentionally accepted for now
- **Date:** 2026-08-12
- **Context:** After D-004 (all 16 frames wired in) and D-005 (scroll-mapping bug fixed and verified monotonic), the Hero motion is now mechanically correct but still has known limitations in visual quality, smoothness, 3D depth, cinematic presentation, cybersecurity connection, and overall premium/modern feel relative to the brand bar set in `PROJECT_MASTER.md` (Bell/CrowdStrike/Apple-level restraint and polish).
- **Decision:** Explicitly stop here. This is a deliberate decision to unblock the rest of the website, not an oversight or something left unfinished by accident. Do NOT attempt to fix, regenerate, replace, or further iterate on the hero frames or motion approach unless explicitly instructed by Mohammad. The hero will be revisited later, likely via a fundamentally different approach — e.g. a single strong hero image with code-driven motion, true video generation, or another higher-quality motion technique — rather than incremental polish of the current 16-frame scroll-crossfade.
- **Alternatives considered:** N/A — this is a scope/sequencing decision (defer non-blocking polish to keep moving through the build sequence), not a technical alternatives comparison.
- **Status:** Active — supersedes the framing in D-004's/PROJECT_MEMORY's earlier "hero frame resolution" open question; that question is now closed under this broader decision, not still pending.

---

### D-007 — Services page: Lucide icons (not custom), hub page only for this pass
- **Date:** 2026-08-12
- **Context:** Step 5 (Services Page) inspection found no custom iconography prepared anywhere in the project — every icon used site-wide so far (Home teaser, Approach, Trust, Solutions) is a stock Lucide icon via the shared `Icon` wrapper, even though `PROJECT_MASTER.md` names "custom iconography" as a design goal for this page. Also found `PROJECT_MASTER.md` describing two distinct layers of scope: the main `/services` hub page, and a separate 8-page "individual service page template" (Hero/Problem/What Oragrol Does/What You Get/How It Works/Who It's For/Related Services/CTA) — a much larger, separately-reviewable body of work.
- **Decision:** (1) Ship the hub page with refined Lucide icons, consistent with the rest of the site — same pattern as [[D-006]] (accept a known gap now, revisit deliberately later rather than block progress on an unavailable asset). (2) Scope this pass to the `/services` hub page only. The 8 individual service detail pages are explicitly deferred to a separate future step, not built or stubbed as part of this pass.
- **Alternatives considered:** Commissioning/generating custom icons before building the page — rejected for now, matches the hero precedent of not letting a visual-polish gap block forward progress through the build sequence. Building the hub page + all 8 detail pages together — rejected as too large a unit to review in one pass; user explicitly chose to defer detail pages.
- **Status:** Active — superseded in part by [[D-008]] on the icon question specifically: Services' schematic-linework treatment is the intended direction going forward, Lucide icons remain the stopgap until that's built.

---

### D-008 — Per-page visual identity system: distinct motif per page, code-generated, same shared material
- **Date:** 2026-08-12
- **Context:** After Home + Services were both built, the user flagged a real design-direction problem: the two pages were differentiated mostly by `Section` background color (dark/white/light-blue) and icon choice, not by actual distinct visual content — a pattern that, if repeated across all 9 pages, would make the site feel like "one template, nine colors" rather than nine purposeful pages. Asked for a proposed visual direction per page before any Step 6 work, explicitly not asking for final art yet.
- **Decision:** Each of the 9 pages gets its own content-specific visual metaphor, expressed as code-generated SVG/CSS (not commissioned imagery, not stock photography) for now, while all pages continue sharing one underlying "material" — the already-locked color tokens, typography, spacing, line-weight/corner-radius language, and `Reveal` motion restraint. Approved per-page directions:
  - **Home** — ring + city skyline, scroll-driven (built; reserved to Home, not reused elsewhere per the existing "never invent a similar ring" rule).
  - **Services** — systems/schematic linework (connector lines + nodes, blueprint-like). Not yet retrofitted onto the already-built hub page — current icon-only treatment (D-007) is the interim state.
  - **Solutions** — ascending stacked planes / strata, conveying escalating protection levels spatially.
  - **Cyber Health** — instrument-panel data visuals: segmented arcs/gauges (deliberately not closed rings, to keep the ring motif reserved to Home) and bar-based score meters, leaning on JetBrains Mono.
  - **How We Work** — a path/route motif that visually resolves from chaotic to ordered across the 4 stages, literalizing "security clarity."
  - **Industries** — a distinct abstract line-motif per sector, revealed via in-page interaction/selection (not 9 separate pages, per the existing brief constraint).
  - **Resources/Insights** — editorial/publication layout, typography-led, minimal signal/waveform accents.
  - **Company** — architectural/material-study abstractions (structural cross-sections, light studies) — no fabricated people/office photography, since none exists.
  - **Contact** — a single minimal wayfinding line resolving to one point — deliberately the quietest page.
- **Alternatives considered:** Commissioned/generated imagery for every page (like the Hero's 16 frames) — rejected for now as too slow across 9 pages; user chose code-generated for speed and full editability. Photographic treatment for Company/Industries specifically was raised as having a real ceiling code can't reach — user explicitly deferred that as a **separate future decision**, not blocking, same pattern as [[D-006]]'s hero deferral.
- **Status:** Active. Not yet applied to Services (built before this decision). Build order decided: Step 6 (Solutions) first, built with its direction from the start; Services' schematic-linework retrofit comes after, as its own separate pass — not an oversight if Solutions ships first without Services having been touched yet. Superseded in part by [[D-009]]: the retrofit's design direction is now governed by the full Visual Redesign Blueprint, not just this entry's original per-page table, though the per-page motifs listed above (strata, gauge, schematic linework, etc.) remain the approved starting points the blueprint builds on.

---

### D-009 — Visual Redesign Blueprint: approval-gated, Services-first rollout
- **Date:** 2026-08-13
- **Context:** With Home, Services, Solutions, and Cyber Health all built, Mohammad requested a full visual/UX audit of the live site (explicitly AUDIT ONLY — no code changes) to diagnose why the site still reads as "text + flat backgrounds + simple UI" rather than a premium, art-directed cybersecurity site, ahead of any further page work. The audit was scoped to the actual rendered site (Playwright screenshots across 4 pages × 3 breakpoints, interactive-element checks, computed WCAG contrast from locked tokens), not source code alone and not a formatting-reference image supplied alongside the brief (that image was explicitly style-only — no finding from it was used). The brief also introduced a new hero concept, "Aperture O," named as the intended successor to the 16-frame sequence frozen under [[D-006]].
- **Decision:** The audit's output — the **Oragrol Visual Redesign Blueprint** (executive summary, prioritized findings, page-by-page audit, visual-system-gap analysis, three highest-impact changes, three recommended prototypes, full strategy blueprint) — is delivered as a private Claude artifact and requires Mohammad's explicit review/approval before any implementation begins. Once approved, the new visual system is built on **`/services` only** first — chosen as the proving ground because it already has a queued retrofit ([[D-007]]/[[D-008]]) and was independently confirmed by this audit to have the clearest version of the site-wide "generic card grid" problem. The system must not extend to Home, Solutions, Cyber Health, or any unbuilt page (Industries, Resources, Company, Contact, How We Work) until Services is explicitly reviewed and approved against the blueprint. Expansion after that is page-by-page, not all at once.
- **Key audit findings worth preserving here** (full detail in the artifact, not duplicated in `PROJECT_MEMORY.md` per this file's own rule): the closing-CTA section is pixel-identical across Home/Services/Solutions; Solutions' strata and Cyber Health's gauge motifs each appear once in their hero and never again on the same page; two computed WCAG AA contrast failures (primary-CTA white-on-accent text at 3.90:1, `text-muted` on dark backgrounds at 4.09:1); a real mobile-nav overlay defect (menu panel doesn't cover the full viewport, hero content bleeds through). The contrast and mobile-nav findings are independent defects, fixable at any time, not gated behind blueprint approval.
- **Alternatives considered:** Rolling the new system out to all pages at once once approved — rejected, matches this project's repeated pattern (hero, then Solutions/Services build order) of proving a direction on one small surface before wider investment, explicitly to avoid a third costly regeneration cycle after the hero and the initial Services/Solutions "plain" builds.
- **Status:** Active. Blocking: no implementation of the blueprint on any page until Mohammad approves it.
