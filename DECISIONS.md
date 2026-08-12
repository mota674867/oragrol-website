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
