# Oragrol Visual Redesign Blueprint

**Status:** Audit only — no site code, copy, or components were changed to produce this document.
**Date:** 2026-08-13
**Scope:** Full visual/UX audit of the 4 built pages of the live Oragrol Global website (Home, Services, Solutions, Cyber Health — Company/Industries/How We Work/Resources/Contact don't exist yet), plus a redesign blueprint pending approval.
**Also published as:** an interactive Claude artifact with embedded screenshot evidence (link shared separately in-session). This file is the same content in plain markdown for reading/sharing outside that viewer — no images embedded here; see the artifact for visual exhibits.
**Logged as:** [[D-009]] in `DECISIONS.md`.

---

## Method — what was actually inspected

Per the audit's own rule, every finding below comes from opening the live, rendered site in a real browser — not source code alone, and not the formatting-reference image supplied alongside the original brief (that image was a layout reference only; no finding, number, or wording from it was used, per the addendum agreed before this audit started).

- **4 built pages inspected** — Home, Services, Solutions, Cyber Health.
- **48 full-page scroll screenshots** across desktop (1440px), tablet (834px), and mobile (390px), captured with real incremental scroll (`window.scrollTo` + wait + screenshot per viewport-height step) — not `fullPage`/resize-based capture, which is known unreliable for `whileInView` content on this site.
- **0 console or network errors** across all 12 page × viewport combinations tested.
- **0 horizontal-overflow issues** at 1440 / 834 / 390 / 320px on any built page.
- Interactive elements exercised directly: mobile hamburger nav, desktop search modal, FAQ accordion, CTA hover state, keyboard Tab focus order.
- Contrast figures below are computed directly from the hex values locked in `app/styles/tokens.css` using the WCAG relative-luminance formula — not estimated by eye.

---

## A. Executive Summary

The site's differentiation currently lives in two isolated hero graphics. Almost everything else — across all four built pages — converges on one repeating pattern: eyebrow, headline, paragraph, then a grid of bordered grey cards holding a small circular icon.

The clearest single piece of evidence: the closing call-to-action section — ring decoration bottom-right, centered headline "Know where you stand. Know what to do next.", two buttons — is **pixel-identical** across Home, Services, and Solutions. Same copy, same layout, same decoration, at the single most memorable position on the page, the last thing seen before the footer. That is the "one template, nine colors" problem this project already named in `DECISIONS.md` D-008 — still present, one page later, exactly where a visitor would notice it most.

A second, related problem: a meaningful share of the page is honest placeholder language — `CAPABILITY CURRENTLY BEING FINALIZED` appears four times each on Home and Services, `COMING SOON` appears five times on Home's Insights teaser, and Solutions states its package details are "currently being finalized." The governance behind that language is correct — nothing is invented — but visually those states currently carry the exact same weight as finished content instead of being subordinated, so the page reads as under-construction in more places than the copy alone would suggest.

Third: the two real visual assets that do exist — Solutions' isometric strata and Cyber Health's arc gauge — are well executed and genuinely distinctive, but each is a single hero graphic bolted onto an otherwise generic page. Neither motif continues past the fold.

**What is preventing "professional designer level":** not a shortage of content or a broken design system (the token/type/spacing foundation is solid and consistent) — it's that one UI pattern (bordered card + circle icon) is currently the answer to six different kinds of content across four pages, and the one section every page shares verbatim is the one section that should differ the most.

---

## B. Top 10 Design Problems

Priority key: **CRITICAL** — must change · **HIGH** — strongly affects professional perception · **MEDIUM** — meaningful, not fundamental · **LOW** — polish/refinement.

### 1. Closing CTA is identical across 3 of 4 pages — `CRITICAL`
Same headline, layout, and ring decoration on Home, Services, and Solutions (confirmed via direct comparison at matched scroll depth). Cyber Health is the one exception, with different copy — proof the pattern can vary and simply hasn't, yet, everywhere else.
- **Evidence:** Live capture, side-by-side, both pages at the identical scroll depth.
- **Direction:** Give each page a closer built from its own motif once that motif exists — see Highest-Impact Change #1.
- **Tool:** Existing pattern (code-generated SVG/CSS) — no new tool.

### 2. Bordered-grey-card-with-circle-icon is the default answer to everything — `CRITICAL`
The same card shape carries Home's approach steps, services teaser, insights teaser, and trust points; Services' eight capability rows; and Solutions' three levels plus its add-on. One shape doing the work of six different kinds of content is the single biggest reason every page reads the same.
- **Evidence:** Counted directly across all four pages' full-scroll captures.
- **Direction:** Replace with content-specific layouts per page — see Highest-Impact Change #3.
- **Tool:** Frontend Design skill for composition; code-generated SVG for motif work.

### 3. Distinctive motifs stop at the hero — `HIGH`
Solutions' strata and Cyber Health's gauge are both genuinely strong — then never appear again on their own page. The Level cards directly below the strata hero flatten straight back into the generic grey-card pattern, undercutting the "escalating depth" idea the hero just established.
- **Evidence:** Full-scroll capture of both pages; motif present in the first screenshot, absent from all others.
- **Direction:** Extend each motif's material past the hero — isometric planes into the Level cards, arc/bar language into the Flow and Reassurance sections.
- **Tool:** Existing D-008 production method — no new tool.

### 4. Services is the most text-dense, least differentiated page — `HIGH`
Eight capability rows, each ~90% prose across three text columns (Challenge / What Oragrol Does / What You Get / Outcome) broken up only by a small circle icon and a number. The D-008 schematic-linework treatment was scoped for this page and explicitly deferred (D-007) — this audit reconfirms it as the single most urgent build.
- **Evidence:** `services-desktop` screenshots 01–03; identical structure repeats 8 times.
- **Direction:** Build the schematic-linework system — the agreed proving-ground page for the whole blueprint (see Rollout).
- **Tool:** Frontend Design skill + code-generated SVG.

### 5. Mobile nav overlay does not fill the viewport — `HIGH`
Opening the hamburger menu on mobile shows a menu panel that stops roughly 55% down the screen — the hero content underneath, including a second "Get Your Cyber Health Score" button, is visible through the gap. Two instances of the same CTA are on screen simultaneously.
- **Evidence:** Live capture, iPhone-width viewport, menu open state.
- **Direction:** Give the mobile nav overlay a solid full-height background/scrim covering the entire viewport, independent of this blueprint's visual-identity work.
- **Tool:** Direct component fix — `SiteHeader`/mobile nav, no design-system change needed.

### 6. Primary CTA button text fails WCAG AA contrast — `MEDIUM`
White text (`#FFFFFF`) on the primary accent (`#018ABE`) computes to **3.90:1** — below the 4.5:1 AA threshold for normal text (it clears the looser 3:1 threshold for large text / UI components). This is the button used as the primary action on every page.
- **Evidence:** Computed via the WCAG relative-luminance formula from the locked hex values in `tokens.css`.
- **Direction:** Darken the accent slightly for this specific text-on-fill use, or increase button label weight/size — flagging for Mohammad's call, not prescribing a new token value here.
- **Tool:** Token-level fix in `tokens.css` — no new tool.

### 7. Muted text fails WCAG AA contrast on dark sections — `MEDIUM`
`--color-text-muted` (`#6B7280`) on the dark background (`#0A0A0A`) computes to **4.09:1** — also below 4.5:1 for normal text. Used for ambient reads like "SCROLL TO EXPLORE" and footer legal copy — low-stakes text, but still below the standard for its size.
- **Evidence:** Same computation method as #6.
- **Direction:** Lighten `text-muted` by a few points, or reserve it for large/decorative text only.
- **Tool:** Token-level fix — no new tool.

### 8. Empty negative space inside content cards — `MEDIUM`
Home's "Virtual CISO" feature card is sized to match its three siblings but has no icon or image filling roughly 70% of its area — it reads as an unfinished or broken layout, not a deliberate void.
- **Evidence:** `home-desktop` screenshot 05.
- **Direction:** Either fill the space with page-appropriate visual content, or resize the card to its actual content — covered by Highest-Impact Change #3.
- **Tool:** Layout fix within existing component.

### 9. "How We Work" step timeline reads ambiguous, not intentional — `LOW`
The four approach steps alternate left/right position with a vertical divider that only runs under half the row width. It may be an intentional zig-zag timeline, but nothing in the surrounding treatment marks it as deliberate — on first glance it reads like a misaligned grid.
- **Evidence:** `home-desktop` screenshot 10.
- **Direction:** Either commit to the zig-zag with a connecting line that visibly ties all four steps together, or return to a single aligned column.
- **Tool:** Layout fix within existing component.

### 10. Hero is mechanically correct but visually thin — noted, not new — `LOW`
The 16-frame scroll hero is accurate to its own math (D-005) and intentionally frozen (D-006). Included here only because Aperture O is explicitly framed as its successor — see the Hero section under Part D below — not as a new defect on top of an already-logged, deliberate decision.
- **Evidence:** `DECISIONS.md` D-004 through D-006.
- **Direction:** Prototype Aperture O before touching the current hero further — see Prototype 1.
- **Tool:** TBD at prototype stage — image/video vs. code-driven motion is an open decision, not this audit's to make.

---

## C. Page-by-Page Audit

### `/` (Home) — priority: `HIGH`
| | |
|---|---|
| **Strength** | Hero composition (ring + skyline) is the one place scale and atmosphere land. FAQ accordion, search modal, and keyboard focus states are all clean, functional, and accessible — confirmed by direct interaction, not assumption. |
| **Weakness** | Everything after the hero reverts to the bordered-card pattern six separate times in one scroll: approach steps, services teaser, trust points, insights teaser (100% "Coming Soon" placeholders), FAQ. |
| **Visual problem** | Empty "Virtual CISO" card (#8); shared closing CTA (#1); mobile nav overlay defect (#5) originates from this page's header. |
| **Recommended** | No changes yet — per the agreed rollout order, Home is touched only after the new visual system is proven on Services and explicitly approved. |

### `/services` — priority: `CRITICAL` (proving ground)
| | |
|---|---|
| **Strength** | Content structure is genuinely clear and scannable — Challenge / What Oragrol Does / What You Get / Outcome is a good information architecture, independent of how it looks. |
| **Weakness** | Most text-dense page in the set. Zero page-specific visual motif — the D-008 "schematic linework" direction was approved for this page and explicitly deferred; this page still shows the pre-D-008 icon-only treatment. |
| **Visual problem** | Eight near-identical rows of prose (#4); shared closing CTA (#1). |
| **Recommended** | First and only page to receive the new visual system in this pass, per the explicit rollout plan — build here, bring to full satisfaction against the approved blueprint, then stop for review before any other page is touched. |

### `/solutions` — priority: `MEDIUM`
| | |
|---|---|
| **Strength** | The isometric strata visual is the strongest single piece of original visual language on the site today — real overlapping geometry, on-brand color-mix progression, correctly conveys "escalating levels" spatially. |
| **Weakness** | Strata appears once, in the hero, and never again. The three Level cards directly beneath it flatten straight back to the generic grey-card pattern used everywhere else on the site. |
| **Visual problem** | Motif stops at the hero (#3); shared closing CTA (#1). |
| **Recommended** | After Services is proven and approved, extend the strata's material — isometric planes, color-mix progression — into the Level cards themselves. |

### `/cyber-health` — priority: `MEDIUM`
| | |
|---|---|
| **Strength** | Arc gauge is a strong, on-brand second distinctive moment; functional use of the locked risk-tier color tokens; the report-preview card with score bars is the closest thing on the site to a real "instrument panel" moment. |
| **Weakness** | Same drop-off as Solutions — gauge in the hero, then the 7-step flow and reassurance strip both revert to circle-icon rows. |
| **Visual problem** | Motif stops at the hero (#3); this page's closing CTA is at least copy-distinct from the other three, but still shares their layout and decoration. |
| **Recommended** | After Services, extend the gauge/instrument-panel language into the Flow and Reassurance sections — the report-preview bars already show the right idea, just isolated to one card. |

---

## D. Visual System Gap

### Hero — and where Aperture O fits
Current composition: full-bleed photographic ring-and-skyline background, headline in the left ~40% column at every breakpoint, dual CTA, "scroll to explore" cue, pinned and scroll-scrubbed across 16 frames (D-004/D-005), frozen as-is under D-006. It is mechanically correct — the scroll math is verified monotonic — and visually thin relative to the Bell/CrowdStrike/Apple bar the brief sets.

One legibility seam worth carrying into whatever replaces it: on mobile, the body paragraph crosses directly over the ring's stroke line at the exact scroll position where they overlap (`home-mobile-00`), a genuine readability soft spot independent of which visual fills the space.

Removing the logo/wordmark test: the ring currently reads as generic architectural-abstract rather than a proprietary Oragrol mark — it needs the headline next to it to register as "Oragrol" rather than any premium tech brand.

> **How Aperture O could fit:** the current hero's scaffolding — pinned section, headline column, dual CTA, scroll cue — is direction-agnostic and can likely be kept; what changes is the visual content filling the canvas. D-006 already anticipated "a fundamentally different approach" superseding the 16-frame method — this may be that moment. Whether Aperture O keeps the scroll-scrub mechanism or introduces new motion is a decision to make *after* prototyping (Prototype 1), not before.

### Service visuals
None exist yet. Services is still on the pre-D-008 icon-only treatment (D-007's interim state). This is the single largest visual-system gap on the live site today, and the agreed first build.

### Supporting visuals
Two strong, isolated pieces (strata, gauge) with no system connecting them to the rest of their own pages, let alone to each other.

### Backgrounds
Three flat environment colors (dark / white / light-blue) do 100% of the section-separation work. That's not itself the problem — flat, confident color blocking is consistent with the "matte, not glossy" brief — the gap is that nothing besides color currently signals depth or page identity within a section.

### Motion
`Reveal` (fade + drift on scroll-into-view) is the only motion primitive anywhere on the site, applied uniformly regardless of content type. That restraint is correct per the Apple-reference brief and should not be abandoned — but it's also part of why every section feels interchangeable: nothing in the motion differs by page either.

### 3D / interaction
Only the strata visual uses real isometric construction (hand-built SVG geometry, not a 3D engine); the gauge is 2D polar-coordinate arc math. Both are appropriately lightweight for their payoff. Search modal, FAQ accordion, mobile nav, and hover states are all functional utility interactions — none rise to the level of a designed "moment."

### Typography & composition
The type system (Space Grotesk / Inter / JetBrains Mono) is the strongest asset already locked and is currently underused as a differentiator — Cyber Health's mono score display is the only place really leaning on it for personality. Composition-wise, "eyebrow → H2 → paragraph → card grid" repeats near-verbatim on all four pages; none yet breaks the single-column vertical stack.

---

## E. Three Highest-Impact Changes

### 1. Retire the shared closing-CTA as a literal copy-pasted section
Keep `FinalCta` as Home's own closer; give Services, Solutions, and Cyber Health page-specific closers built from their own motif once it exists (schematic linework / strata / gauge) — the way Cyber Health's copy already diverges from the other two, just not yet its visual treatment.
- **Problem:** Identical section on 3 of 4 pages, at the highest-visibility position.
- **Why high-impact:** It's the last thing seen on most pages — currently erases whatever identity the page just built.
- **Tool:** Existing code-generated SVG/CSS pattern — no new tool.

### 2. Build the Services schematic-linework system
Already queued (D-008/D-007). Use it as the proof that "material continues past the hero" — connector-line/node motifs behind or beside each of the eight capability rows, not a single hero graphic. Prototype on one row first (Prototype 2) before committing to all eight.
- **Problem:** Most text-dense, least differentiated page in the set.
- **Why high-impact:** Agreed proving-ground page — this is the pass that has to work before anything else moves.
- **Tool:** Frontend Design skill for composition; code-generated SVG for the motif, per D-008's production method.

### 3. Replace the generic card grid with content-specific layouts
Home's approach steps become a real connected process diagram (leaning into the spine-line the current timeline half-attempts); the Insights teaser is redesigned around its actual current state — five "coming soon" categories — instead of pretending to be five live cards at equal visual weight to finished content.
- **Problem:** One card shape currently answers six different kinds of content.
- **Why high-impact:** Fixes the empty-card defect (#8) and the placeholder-weight problem (Executive Summary) in the same pass.
- **Tool:** Frontend Design skill; no 3D or new dependency required.

---

## F. Three Prototypes

Recommended before any page-wide redesign, in this order.

### Prototype 1 — Hero / Aperture O
Build the new hero concept in isolation (a single route or static export), testing: text legibility over the new visual at all three breakpoints, CTA placement, and whether it should keep the existing pinned scroll-scrub mechanism (D-004) or introduce new motion. Resolves whether Aperture O is a new image/video asset inside the current mechanism, or a mechanism change too — a decision for Mohammad once the prototype is visible, not one to guess at now.

### Prototype 2 — One service section
Take exactly one of the eight Services capability rows (e.g. Risk Assessment & Compliance) and build its schematic-linework treatment in full, side-by-side with the current version. Validates the D-008 direction actually reads as premium before committing to all eight rows — the same "prove it small, then roll out" discipline the site itself is now following.

### Prototype 3 — One supporting/content section
Prototype a non-shared, motif-specific closing CTA for Services, built from the schematic-linework material from Prototype 2. Validates that Highest-Impact Change #1 (retire the shared closer) actually produces something better — not just different — before it's applied to Solutions and Cyber Health.

---

## G. Final Visual Redesign Blueprint

| Area | Direction |
|---|---|
| **Visual language** | Per-page code-generated SVG/CSS motifs (D-008, already locked) — the fix is extending each motif past its hero into supporting sections, not choosing a new production method. |
| **Background strategy** | Keep the three flat environments as the base layer — they're not the problem. Depth comes from motif-derived elements (isometric planes, arc segments, schematic lines), not new background colors. |
| **Typography strategy** | Lean harder into the already-locked JetBrains Mono for data/score moments (Cyber Health does this well today) and Space Grotesk for headline personality. No new typefaces needed. |
| **Service visual strategy** | Schematic-linework system per D-008, proven on one row first (Prototype 2) before all eight. |
| **Hero strategy** | Aperture O supersedes the 16-frame sequence, per this session's brief. Prototype first (Prototype 1); D-006's freeze on the current hero stays in force until Aperture O is approved to replace it. |
| **Motion strategy** | `Reveal` stays as the one restrained primitive. No new motion technique without a specific reason tied to a specific section. |
| **3D strategy** | Reserve for where it already earns its keep — Solutions' isometric strata justifies itself. Don't extend 3D to sections where 2D schematic linework (Services) or arc/bar data viz (Cyber Health) already fits the content. |
| **Supporting graphics** | Extend each page's motif down through its full length instead of stopping at the hero — the single change with the widest effect across the whole gap analysis in Part D. |
| **Interaction strategy** | No change needed to search, FAQ, or hover patterns — all functional and accessible today. Fix the mobile nav overlay defect (#5) as part of whichever pass next touches the header, independent of the visual-identity work. |
| **Responsive strategy** | No horizontal-overflow issues found at any tested width — the responsive foundation is solid. Design new motifs mobile-first from the start, unlike the current desktop-first hero graphics, to avoid a repeat of the mobile-nav class of defect. |

### Tool recommendations
- **Playwright** — already in use for this audit; continue for pre/post-change verification per `CLAUDE.md` Section 7.
- **Frontend Design skill** — right fit for composing the schematic-linework system and any new content-specific layouts (not the Hero — that's a fixed-canvas creative visual).
- **Code-generated SVG/CSS** — correct existing default for every per-page motif; no reason to switch.
- **Figma / Adobe visual tools** — not necessary for how this codebase has been built so far (everything authored directly as code); worth a real decision point specifically for Aperture O if it turns out to need art-directed imagery or video rather than code-driven motion — flag when Prototype 1 starts, not before.
- **Three.js / React Three Fiber** — not warranted anywhere inspected; the one place with 3D-like depth (strata) is hand-built isometric SVG and holds up fine at this scale. Don't introduce a 3D engine dependency unless a future motif needs true perspective or interaction that flat isometric can't fake.

### Accessibility & performance, briefly
Two concrete WCAG AA contrast failures were found and are computed above (#6, #7) — both fixable at the token level. Keyboard focus states are present and visible (confirmed via Tab-cycle capture); FAQ accordion and search modal both operate through real accessible triggers, not click-handlers on bare `div`s (confirmed by successful accessible-role interaction in this audit). On performance: zero console or network errors across every page/viewport combination tested; current assets are either the already-flagged PNG hero frames or cheap inline SVG/CSS — no video or WebGL anywhere yet, and everything this blueprint recommends (schematic SVG, extended existing motifs) stays in that same lightweight category.

---

## Rollout — confirmed before this audit began

1. This blueprint stops here for review and approval. No implementation begins automatically.
2. Once approved, the new visual system is implemented on **Services only** — chosen because it's already been directly inspected, confirmed to have exactly the problem this audit addresses, and already has a retrofit queued (D-007/D-008).
3. Services is brought to full satisfaction against this blueprint before any other page is touched.
4. The system does **not** roll out to Home, Solutions, Cyber Health, or any unbuilt page (Industries, Resources, Company, Contact, How We Work) until Services is explicitly reviewed and approved.
5. Only after that approval does expansion continue — page by page, not all at once.

---

*Prepared by inspecting the live site directly in a rendered browser (Playwright / Chromium) at 1440 / 834 / 390 / 320px, plus interactive verification of navigation, search, FAQ, hover, and focus states. Colors and type referenced above are the locked values in `app/styles/tokens.css`; no code, copy, or component in the live site was changed to produce this report.*
