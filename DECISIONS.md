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
