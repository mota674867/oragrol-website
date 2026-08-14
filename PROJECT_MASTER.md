# PROJECT_MASTER.md — Oragrol Global Website
Merged master (v2) — replaces the standalone Roadmap and Implementation Brief as the single source of truth. Combines the Roadmap's confirmed build status and locked colors with the Brief's full scope. Confirmed: **9-page sitemap**, How We Work and Contact restored.

**Superseded by this file — do not read as authoritative going forward:**
- `ORAGROL_MASTER_WEBSITE_ROADMAP.md`
- `Oragrol_Global_Website_Final_Implementation_Brief.md`

## Core rules
- Work step by step. Inspect before every step. Do not redo approved work without a real defect.
- Never invent: pricing, package names/inclusions, operational readiness, partners, customer claims, certifications, statistics, detailed company history.
- Preserve the approved brand direction. Keep changes scoped to the current step.
- Verify build, runtime, responsive behavior, console, accessibility, visual consistency before marking a step done.
- Do not automatically continue to the next step — stop for review.
- Hero motion may be completed separately without blocking other page work.

---

## 1. Locked Brand & Design System

**Visual direction:** premium, elegant, enterprise-grade, cinematic, confident, clear. Reference qualities only (never copy): Bell (typography/spacing/nav discipline), CrowdStrike (enterprise clarity), Apple (cinematic, restrained motion).

**Visual character:** matte and refined, not glossy. Architectural/abstract visual language. Strong typography, generous whitespace, editorial compositions, subtle depth, controlled reflections.
**Explicitly avoid:** gaming aesthetic, neon cyberpunk, generic cybersecurity stock imagery, hooded hackers, green code screens, generic padlocks.

**Colors (locked, confirmed live in `tokens.css`):**
| Token | Value |
|---|---|
| Background | `#0A0A0A` |
| Surface | `#141414` |
| Border | `#262626` |
| Primary accent | `#018ABE` |
| Light tint | `#97CADB` |
| Text primary | `#FFFFFF` |
| Text secondary | `#9CA3AF` |
| Text muted | `#6B7280` |
| Critical risk | `#E24B4A` |

Do not force every section dark — dark, white, and light-blue environments are all in use; each section picks based on content/hierarchy/readability.

**Typography (implemented baseline):** Space Grotesk (headings), Inter (body/UI), JetBrains Mono (scores/data/technical), Epilogue (logo/brand). Quality bar: elegant, Bell Business-level sophistication — ongoing refinement target, not a blocker.

**Primary logo asset:** `Oragrol_Icon_Transparent (1).png`. For the hero specifically, use only the confirmed ring geometry from the logo — never invent a similar ring.
**Known issue:** logo tagline has a typo ("PESILIENCE" vs "RESILIENCE") — flagged, not yet patched.

---

## 2. Website Structure — 9 Pages (confirmed)
1. Home
2. Services
3. Solutions
4. Cyber Health
5. How We Work
6. Industries
7. Resources / Insights
8. Company / About
9. Contact

**Not standalone pages — cross-cutting features instead:**
- FAQ — contextual sections distributed across relevant pages + footer link, not a main-nav item. Dedicated page only if content volume later justifies it.
- Live AI Chat — persistent widget, not a page.
- EN | FR — global language switcher, preserves current page on switch.

**Global/shared systems:** Header, Navigation, Search overlay (icon-only, opens modal — no inline search input), EN/FR control, Primary CTA ("Get Your Cyber Health Score"), Footer, Responsive system, Accessibility, Motion system.

**Header — right side:** Search icon, EN | FR, AI Chat, Get Your Cyber Health Score CTA. Sticky, may reduce height on scroll, Bell-inspired simplicity, minimal icons, subtle hover states.

---

## 3. Build Sequence

### Step 1 — Design Tokens — COMPLETE
Colors, typography foundations, spacing, borders, radius, shadows. Do not redesign without a real defect.

### Step 2 — Typography Preview — COMPLETE
Heading hierarchy, body, nav, button, supporting text. Do not replace the approved direction during page work.

### Step 3 — Global UI Component System — COMPLETE
Header, nav, buttons, container/layout, footer, responsive foundations. Real logo asset used in header at correct proportions.

### Step 4 — Home Page — IMPLEMENTED, hero motion pending
Confirmed hero copy:
- Eyebrow: `CYBERSECURITY FOR MODERN BUSINESSES`
- Headline: `Security clarity for what comes next.`
- Body: `Oragrol helps businesses understand risk, prioritize what matters, and build practical protection that moves with the business.`
- Primary CTA: `Get Your Cyber Health Score` / Secondary: `Talk to Oragrol`

Full home flow (verify all sections exist): Hero, Security Challenge, Oragrol Approach, Services, Solutions, Cyber Health, Trust/Evidence, How We Work, Insights, Contextual FAQ, Final CTA, Footer.

**Hero motion (in progress, separate track, not blocking):** 16 frames, 16:9, 4K (3840x2160), PNG. Continuous rotating sweep, progressive city/network resolution, seamless loop. Do not block other steps waiting on this.

### Step 5 — Services Page — SIGNED OFF, COMPLETE (hub page only)
Inspected current page, design system, and content first; reported before coding, per process. Hub page (`/services`) built, verified, reviewed by Mohammad in-browser, and approved — structure and copy both signed off. One spacing defect found in review (excessive gap before Additional Capabilities) was fixed and re-verified. Individual per-service detail pages (Hero/Problem/What Oragrol Does/What You Get/How It Works/Who It's For/Related Services/CTA) are explicitly deferred to a future step — see DECISIONS.md D-007.

**Visual Design Correction (D-013 through D-034) — SIGNED OFF 2026-08-14.** The hub page's visual system went through a full multi-round redesign after D-009's audit: schematic-linework prototype (D-011, superseded), the glow-orb Design Correction shipped to all 8 capabilities (D-013/D-014), container/typography/sidebar/footer/CTA-alignment fixes (D-015-D-020), then Capabilities 02/04-08 were each individually researched (via `ui-ux-pro-max` + `21st.dev`/Magic MCP) and given their own distinct visual treatment — no two capabilities share a repeated formula. Final state: 01 orb, 02/03 score card, 04 training checklist+ring, 05 activity feed, 06 ranked findings, 07 device pictogram, 08 connected phase sequence. See DECISIONS.md D-034 for the full closing record. No further Services visual/structural work is authorized without a new explicit instruction — the D-015 "item 5" capability-regrouping question remains separately held, not reopened by this sign-off.

Confirmed/live services (1-4): Virtual CISO, Risk Assessment & Compliance, Vulnerability Assessment & Management, Security Awareness Training.
Additional (5-8, design but don't claim operational): Managed Security Services/24-7 MDR, Penetration Testing, Endpoint Protection/EDR, Incident Response. Status language: "Capability currently being finalized."

Design: no 8 identical cards. Asymmetric layouts, varied scale, custom iconography, subtle motion. Each service: business problem, what Oragrol does, what client receives, business outcome, CTA.

Individual service page template: Hero, Problem, What Oragrol Does, What You Get, How It Works, Who It's For, Related Services, CTA.

### Step 6 — Solutions Page — IMPLEMENTED
Services = individual capabilities. Solutions = packaged protection levels — keep distinct.
3 core tiers plus pentest as add-on, distinctive branded names, clear progression.

Built at `/solutions`: Hero (with `StrataVisual`, D-008's "ascending stacked planes" page-specific motif — 3 plates sharing a baseline, increasing height/accent intensity, first use of the `--color-accent-light` token) → 3 generic Level 01/02/03 tier cards (no branded names — still unconfirmed, see pricing table below) → Pentest add-on (visually a "satellite," dashed border + a `+` badge, not a 4th rung in the stack) + status disclaimer → shared `FinalCta`. Verified: typecheck/lint/build clean, scroll-verified screenshots desktop+mobile, zero console errors.

Pricing — UNCONFIRMED, internal reference only, do not publish:
| Tier | Includes | 12-mo | Month-to-month |
|---|---|---|---|
| Essential | Assessments + Training + Basic Monitoring | $800-1,200/mo | $960-1,440/mo |
| Growth | + MDR/EDR + Vuln Mgmt | $1,800-2,500/mo | $2,160-3,000/mo |
| Complete | + vCISO + IR Retainer | $2,800-3,500/mo | $3,360-4,200/mo |
| Pentest | Annual project add-on | - | $3,500-8,000 one-time |

Site copy: "This section is currently being finalized. Details will be available soon." Do not lock names/inclusions/prices on the live site yet.

### Step 7 — Cyber Health Page — IMPLEMENTED
Flagship diagnostic product. Existing MVP flow (Tally-based) stays live underneath while the product-facing experience evolves: Landing, Assessment, Submit, Score Calculation, AI Analysis, Report, Email, CRM Lead, Sales Follow-up.
Output: Score 0-100, Critical/High/Medium/Low tier, Executive Summary, Top Risks, Recommended Package, Next Steps. One focused question/group at a time, progress indicator, mobile-optimized.

Built at `/cyber-health` as the "product-facing experience" (Landing) layer described above — the actual Assessment/Submit/Score/AI Analysis/Report/Email/CRM Lead pipeline is NOT rebuilt here; it runs on the real, live, already-in-production Tally MVP confirmed by Mohammad: `https://tally.so/r/2EzROb`. Every on-page CTA links there directly (new tab), not an embed — no way to confirm this specific form permits iframing, and it's already proven working with real submissions. Hero (`GaugeVisual`, D-008's "instrument-panel" motif — a 4-segment arc gauge using the risk-tier tokens functionally, not decoratively) → Flow (the locked 7-step sequence, full page-level weight) → Output Shape (the locked 6-item output list + an illustrative report preview, same governance as the Home teaser's mock score) → Reassurance (facts confirmed directly from the live form) → page-specific Closing CTA (not the reused `FinalCta`, which points *to* this page). Verified: typecheck/lint/build clean, scroll-verified screenshots desktop+mobile, zero console errors.

### Step 8 — How We Work Page — IN PROGRESS: hero visual prototyped, page copy BLOCKED
4-stage methodology as an evolving visual system, not 4 generic cards: 01 Understand, 02 Prioritize, 03 Protect, 04 Improve.

**D-035 (2026-08-14):** Mohammad's build instruction referenced a copy block that did not actually arrive (the message contained the literal placeholder `[PASTE THE FULL COPY ABOVE HERE]`). No page copy was invented — flagged directly instead. The requested primary hero visual (`HowWeWorkCycleVisual` — 4 nodes on a closed, directional loop, Improve connecting back to Understand, referencing Capability 08's connected-phase spirit at hero scale) was researched (`ui-ux-pro-max` + `21st.dev`, neither surfaced a literal closed-loop match, built natively reusing `GaugeVisual`'s polar-math and `HeroSchematicVisual`'s node/connector techniques) and prototyped at `/how-we-work` (noindex), using only the already-locked stage labels/one-liners from `home/how-we-work.tsx`.

**D-036 (2026-08-14) — PAGE COMPLETE:** Mohammad supplied the real copy. Full page built: Hero (headline/subhead + the D-035 visual, unchanged) → Stage Sequence (4 full-paragraph stages, a page-level scale-up of the same vertical spine+circle pattern `home/how-we-work.tsx`'s teaser and Cyber Health's `Flow` both already use) → Closing CTA (page-specific, single "Talk to Oragrol" button, same ring/dark visual family as `FinalCta`). Verified byte-for-byte against the supplied copy via a Playwright string-equality check (all 12 pieces of content passed exactly) — not just a visual glance. A screenshot-methodology false alarm (mobile Stage Sequence appeared blank due to an under-waited scroll capture, not a real bug) was caught, correctly diagnosed via computed-style query, and re-verified with a longer wait. `noindex` removed — page is content-complete.

**D-037 (2026-08-14) — CONNECTOR-LINE BUG FIXED:** Mohammad reported the spine doesn't pass through the alternating circles, citing `home/how-we-work.tsx`'s teaser as a correct reference. Measured the reference directly before assuming it was right — it has the identical bug (circles at x=340/1100, spine at x=720, confirmed via DOM + screenshot). Root cause: a fixed-position spine plus `flex-row-reverse` alternation never actually centers the circle on the spine. Real fix: circle now explicitly placed in a CSS Grid center column the spine targets, guaranteed by construction rather than incidental row sizing. Verified exact alignment (0px delta) at 1920px and (1px, sub-pixel) at 390px via direct measurement, not a visual glance. `home/how-we-work.tsx` itself still has the same unfixed bug — flagged, not touched (out of scope for this instruction).

### Step 9 — Industries Page — PENDING
Industries: Professional Services, Healthcare, Financial Services, Retail & E-commerce, Manufacturing, Technology, Construction & Real Estate, Education, Other SMBs.
One elegant interactive/expandable experience, not 9 separate pages. Pattern per industry: risk, security priorities, Oragrol approach, recommended next step. No invented certifications/customer numbers/case studies.

### Step 10 — Resources / Insights Page — PENDING
Hero, Featured Insight, Latest Insights, Article Cards, Newsletter/LinkedIn, CTA. Editorial, spacious, custom visuals — no generic hacker imagery, no fake authors/stats/stories.

### Step 11 — Company / About Page — PENDING
Primarily light section. Hero, Who Oragrol Is, Company Story, Philosophy, Experience & Expertise, Partners & Ecosystem, Approach, CTA. Do not fabricate history/achievements — final story remains OPEN.

### Step 12 — Contact Page — PENDING (restored)
Primarily light, spacious, conversion-focused.
Hero: "Let's make security clearer."
CTAs: Talk to Oragrol / Get Your Cyber Health Score / Book a consultation.
Form fields: Name, Business email, Company, Company size, What can we help with, Message.
Include contact details, location, LinkedIn, EN/FR.

### Step 13 — FAQ / Supporting Content — PENDING
Contextual sections across relevant pages, supported by AI Chat. Categories: Cyber Health Assessment, Services, Security & Compliance, How Oragrol Works, Pricing & Packages, Partners & Technology, Getting Started. Don't finalize answers dependent on unresolved pricing.

### Step 14 — Live AI Chat shell — PENDING
Functions: answer service questions, explain Cyber Health Assessment, guide to right solution, answer FAQ, qualify leads, escalate to human, EN and FR. Opening line: "How can Oragrol help?" Design: elegant, unobtrusive, useful first.

### Step 15 — EN/FR Architecture — PENDING
Architecture supports English/French from day one; switching preserves current page. French content may be completed later.

### Step 16 — Global Responsive Review — PENDING
Mobile, tablet, 14-inch, 24-inch, large desktop, 2560px, ultra-wide. Adapt containers/typography/spacing/nav/hero/CTA intelligently — never just scale the small-screen layout up.

### Step 17 — Accessibility — PENDING
Contrast, focus states, keyboard nav, semantic structure, alt text, reduced-motion behavior. Verify nav contrast against dark backgrounds after any layout change.

### Step 18 — Motion System (hero integration) — PARTIAL
Smooth, controlled, premium, cinematic — not game-like. Integrate final 16-frame hero sequence using the technically appropriate method (image sequence/canvas/WebGL) after inspecting the project. Provide a lighter static fallback for reduced-motion/slower devices.

### Step 19 — SEO, Analytics & Performance — PENDING
Page-by-page SEO (EN+FR), titles/meta, H1/H2 structure, internal linking, schema markup. Optimized images/3D assets, lazy loading, secure forms, analytics/conversion tracking. 4K hero assets must use responsive loading — not force every device to download every frame.

### Step 20 — Cross-Page Consistency Review — PENDING
Header/footer/typography/buttons/cards/spacing/colors/motion language/CTA hierarchy — the site must feel like one product, not seven templates.

### Step 21 — Agent Integration Interfaces — PENDING
Architect website-to-19-agent-ecosystem connection points (see Section 5) without requiring full integration for the first visual build.

### Step 22 — Final QA — PENDING
Nav links, buttons, EN/FR, search overlay, forms, Cyber Health CTA, responsive/accessibility/animation behavior, console errors, broken assets, SEO basics, favicon/logo.

### Step 23 — Final Production Review — PENDING
No invented claims/pricing/partners. No placeholder content left live. No console errors/broken links/responsive failures. No accidental changes to approved sections.

---

## 4. Content Governance — never invent
Pricing, package names/inclusions, operational readiness of unfinished services, partner details, customer claims, certifications, statistics, detailed company history. Use elegant status language ("Capability currently being finalized," "This section is currently being finalized") instead.

---

## 5. 19-Agent Ecosystem (architecture reference only — not built into first visual pass)
Conductor, Content, SEO, Social, Campaign, Lead Qualification & Follow-up, Sales Enablement, Support, Finance, Ops/Admin, Assessment & Scoring, Risk & Compliance, Vulnerability, Security Awareness, vCISO Assistant, Reporting, Incident Response Support, Analytics & Intelligence, Knowledge/Brand.

Flow reference: Visitor to AI Chat/Cyber Health/Contact/Insights to respective agent chain; Conductor coordinates across all of it.

---

## 6. Open Decisions (keep visibly unresolved)
Final hero visual, final typography choice, exact service-page visuals, exact package names/inclusions/pricing, final About story, final French copy, final AI Chat implementation, exact tech stack, final 3D implementation, unconfirmed service operational readiness, partner details, final claims/statistics, detailed company history.

---

## 7. Current Position
Complete: Steps 1-7 (Step 4 hero motion frozen as-is — D-006; Step 5 scoped to hub page only — D-007; Steps 6-7 both built with their D-008 visual direction from the start).
D-008 per-page visual identity system: applied to Solutions, Cyber Health, and Services. Services went through two rounds: a schematic-linework retrofit (D-012) that Mohammad reviewed live and found didn't meet the bar, then a Design Correction round benchmarked against 3 concrete Dribbble references (nested dark glow-lit elevated panels, soft-3D icons, large numerals, bigger hero-scale illustrations) — prototyped on one row (D-013), approved, then shipped to all 8 capabilities (D-014). Every built page now carries its own distinct visual motif at the approved quality bar.
Also active: a full visual/UX audit (2026-08-13, D-009) produced the Oragrol Visual Redesign Blueprint (artifact + `VISUAL_REDESIGN_BLUEPRINT.md`), approved by Mohammad; two independent bugs it found (mobile nav overlay, WCAG AA contrast) were fixed the same day (D-010). The `21st` MCP (Magic component search) is authenticated for future rounds; a separate third-party site raised mid-D-013-rollout (`ui-ux-pro-max-skill.nextlevelbuilder.io`) hung the browser and was skipped, per Mohammad's call — see D-014.
Also active: `/cyber-health`'s CTAs link to the real, live external assessment (`https://tally.so/r/2EzROb`) — that flow itself is out of scope for this website codebase; do not attempt to rebuild or replace it.
Also active (D-015): site-wide `Container` widened (1024/1280px → 1280/1440px) to fix a header-vs-content width mismatch at ultra-wide viewports; Services capability rows got a typography-hierarchy fix and a real hero illustration (`ServicesNetworkVisual`, 8-nodes-to-one-hub). Verified no regression on Home/Solutions/Cyber Health.
Also active (D-016): the D-015 container fix was confirmed correctly applied but insufficient alone (math, not a bug — a capped width always leaves margin on ultra-wide screens); resolved by giving that space a real job — a new sticky `CategoryNav` (all 8 capabilities, jump-scroll + active-state tracking) inside a widened `[220px_1fr]` grid. Typography strengthened further, hover motion added to capability panels (a real Tailwind arbitrary-value bug found and fixed along the way — see D-016).
Also active (D-017): site-wide footer overhaul — Company/Resources/Legal grid (real nav items only), real LinkedIn URL, explicitly-flagged Instagram placeholder, and a floating "Under attack?" emergency CTA with a temporary phone number flagged for replacement before public launch. Investigated project docs before building rather than inventing missing values; asked Mohammad directly for what wasn't documented.
Also active (D-018): content-area headline relocated (was only in the visual column, content column had none), sidebar nav weight increased, visual panel shrunk to give content more room. A reported footer discrepancy (commit b2a7717 claimed Instagram/emergency-CTA were added; Mohammad's screenshot showed neither) was investigated via 4 independent methods (source read, process check, raw HTML via curl, fresh-context Playwright render) — code confirmed correct and rendering in every method tried; likely a stale browser/cache on Mohammad's end, not reproducible as a code defect, but not certain without seeing his browser directly.
Also active (D-019): sidebar/category-label font-weight reduced (both were heavier than intended); all 4 live-row CTAs standardized to "Talk to Oragrol" → /contact (one row had been using Cyber Health's own CTA). Headline font-family was investigated per an explicit "verify computed value, not just source" instruction — genuinely already Space Grotesk everywhere checked, no bug found or fixed.
Also active (2026-08-14): installed the `ui-ux-pro-max` Claude Code plugin (+ Python 3.12 dependency) and reviewed the already-approved Capability 02 row against its style/typography/UX database at Mohammad's request — found no genuinely superior treatment; `/services/prototype` was not recreated since there was nothing different to compare.
Also active (D-020, Round 5): the CTA-vs-graphic offset reported on 24" monitors was a real structural bug — the visual panel self-centered at a capped width inside its grid column, the CTA sibling below it had no matching width constraint — fixed with one shared width/centering wrapper as the true parent of both, verified `leftDelta: 0` via Playwright at 1440/1920/2560px. Sidebar nav weight now genuinely splits by state (active: semibold/accent, inactive: regular/muted-gray) instead of D-019's single uniform weight across all items — verified via real computed-style checks in a fresh browser context, not source alone.
Also active (D-021, Round 6): row top-alignment bug fixed — the row grid used `items-center` (vertically centers columns of unequal height) instead of `items-start`; visible on rows 02/03 whose longer capability names wrap the headline to two lines. Verified `delta: 0` across rows 01/02/03. Separately, Mohammad rejected the repeated glow-orb visual motif as generic/templated across all 8 rows — a new dashboard-mockup prototype (`CapabilityDashboardVisual`, reusing Cyber Health's already-approved score/risk-breakdown card content, re-themed into Services' dark panel shell) is live for comparison at `/services/prototype-v2` (Capability 02 only, noindex, nothing live touched) awaiting his decision.
Also active (D-022, Round 7): Mohammad disapproved the dark-panel/dot-grid/glow-orb SHELL itself (not just the icon) for Capabilities 04-08, requiring a treatment suited to what each capability does — explicitly not one new repeated formula. Researched via `ui-ux-pro-max` (Bento Grids/Dimensional Layering surfaced as current, well-supported panel patterns; Glassmorphism/Cyberpunk explicitly ruled out) and `21st.dev` (real training/progress components found, not imported wholesale — rebuilt with existing primitives) before building. Prototyped Capability 04 (Security Awareness Training) as `CapabilityTrainingVisual` — a module checklist + completion ring.
Also active (D-023): Capability 04's prototype approved and shipped live — `live-services.tsx` now renders it per-row (01-03 unaffected), `/services/prototype-v2` still open for its own separate decision (Capability 02), `/services/prototype-v3` removed.
Also active (D-024/D-025): Capability 05 (Managed Security Services/24-7 MDR) — `CapabilityMonitorMark` (live-pulse indicator + illustrative alert feed) approved and shipped live, `additional-capabilities.tsx`'s grid gained `items-start` at the same time. Verified via DOM measurement that 06-08's cards stay at their own natural height (252px) rather than stretching to match 05's taller card (450px) — the specific check Mohammad required before confirming. `/services/prototype-v4` removed.
Also active (D-026/D-027): Capability 06 (Penetration Testing) — `CapabilityFindingsMark` (ranked, severity-tagged example findings using the existing `RiskBadge`) approved and shipped live. A real text-truncation bug (finding labels clipping illegibly next to wider severity badges) was found via screenshot review and fixed before it was ever shown for review. `additional-capabilities.tsx` now uses a small `CapabilityMark` selector, same pattern as `LiveServices`' `CapabilityVisual`. Verified 07/08 stay at their own unstretched height post-ship. `/services/prototype-v5` removed.
Also active (D-028/D-029): Capability 07 (Endpoint Protection/EDR) — `CapabilityFleetMark` (a device-coverage pictogram, matching the ui-ux-pro-max chart guidance that pictograms beat pie/donut for part-to-whole accessibility) approved and shipped live. Verified Capability 08 stays at its own unstretched height post-ship. `/services/prototype-v6` removed.
Also active (D-030/D-031): Capability 08 (Incident Response) — `CapabilityPlaybookMark` (a connected 4-phase response sequence: Detect/Contain/Recover/Review, reusing Cyber Health's own "connecting spine" step technique at a smaller scale) approved and shipped live. This closes the "Capabilities 04-08 shell rethink" thread — all 8 capabilities now have a deliberate, individually-researched visual treatment (01/03 keep the original approved orb; 02 has its own separate open prototype, D-021; 04-08 each got a distinct replacement). `/services/prototype-v7` removed. Full-page 1920px screenshot captured for Mohammad's whole-page sign-off review.
Also active (D-032/D-033): Capability 02's dashboard mockup shipped live; a flagged discrepancy (no record of Capability 03 ever being approved for the same treatment, contrary to Mohammad's stated premise) was resolved by his explicit confirmation to extend it now, as a new decision — Capability 03 also renders `CapabilityDashboardVisual`. `/services/prototype-v2` removed — no prototype routes remain anywhere in the project. Ground-truth-verified all 8 capabilities individually (one treatment each, no overlaps) on a fresh production server before the final screenshot.
**D-034 — SERVICES SIGNED OFF, COMPLETE (2026-08-14):** Mohammad reviewed the final full-page screenshot and confirmed: "Services is approved and complete." This closes the entire visual-redesign thread (D-011 through D-034). No further Services visual/structural work without a new explicit instruction; the D-015 "item 5" capability-regrouping question remains separately held.
Also active (D-035/D-036/D-037): Step 8 (How We Work) — CONTENT COMPLETE, connector-line bug fixed. Hero visual researched/built (D-035), full page copy supplied and built (D-036), Stage Sequence connector-line bug found-and-fixed with a real structural fix, not a reference-matching patch — the cited reference (`home/how-we-work.tsx`) was found to have the identical bug and is flagged, not fixed (out of scope for this instruction) (D-037).
**D-038 (2026-08-14):** Mohammad confirmed — fixed `home/how-we-work.tsx`'s matching connector-line bug with the identical real fix (Grid-centered circle). Verified 0px delta at both 1920px and 390px on a fresh production server. Both instances of the bug are now resolved.
Next: Awaiting Mohammad's review of the How We Work page build overall.

---

## 8. Source-of-Truth Hierarchy
- PROJECT_MASTER.md (this file) — brand, sitemap, full build sequence, scope. Read this first, every session.
- CLAUDE.md — coding rules (oragrol-website root)
- PROJECT_MEMORY.md — rolling session log (oragrol-website root)
- DECISIONS.md — permanent decision record (oragrol-website root)
- ASSET_INDEX.md — live asset classification (asset-audit/assets-organized/)

Conflict rule: DECISIONS.md wins over this file for anything explicitly decided and logged there. When information conflicts and neither resolves it, ask Mohammad, don't guess.
