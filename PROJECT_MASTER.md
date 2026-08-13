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

### Step 5 — Services Page — COMPLETE (hub page only)
Inspected current page, design system, and content first; reported before coding, per process. Hub page (`/services`) built, verified, reviewed by Mohammad in-browser, and approved — structure and copy both signed off. One spacing defect found in review (excessive gap before Additional Capabilities) was fixed and re-verified. Individual per-service detail pages (Hero/Problem/What Oragrol Does/What You Get/How It Works/Who It's For/Related Services/CTA) are explicitly deferred to a future step — see DECISIONS.md D-007.

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

### Step 8 — How We Work Page — PENDING (restored)
4-stage methodology as an evolving visual system, not 4 generic cards: 01 Understand, 02 Prioritize, 03 Protect, 04 Improve.

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
Next: Awaiting Mohammad's approval of D-016. Two separate "item 5"s remain open and unbuilt: (a) regrouping the 8 capabilities into categories (D-015's round, structure/copy only, held pending confirmation) and (b) a site-wide footer overhaul (D-016's round, explicitly "do it last, separate commit" — needs a project-docs check for real Blog/social/emergency-contact info before building, flag gaps rather than invent). Step 8 (How We Work) and any extension of the new visual system to Home/Solutions/Cyber Health all stay on hold until Services is fully approved — expansion is page-by-page, not all at once.

---

## 8. Source-of-Truth Hierarchy
- PROJECT_MASTER.md (this file) — brand, sitemap, full build sequence, scope. Read this first, every session.
- CLAUDE.md — coding rules (oragrol-website root)
- PROJECT_MEMORY.md — rolling session log (oragrol-website root)
- DECISIONS.md — permanent decision record (oragrol-website root)
- ASSET_INDEX.md — live asset classification (asset-audit/assets-organized/)

Conflict rule: DECISIONS.md wins over this file for anything explicitly decided and logged there. When information conflicts and neither resolves it, ask Mohammad, don't guess.
