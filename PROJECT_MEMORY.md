# Project Memory — Oragrol Website

Rolling log, most recent session at the top. Keep to last ~10 sessions — older entries move to `PROJECT_MEMORY_ARCHIVE.md`. Durable design/architecture decisions go in `DECISIONS.md`, not here — this file is session history, not a decision record.

---

## Current Status
Home (Step 4), Services hub (Step 5), Solutions (Step 6), and Cyber Health (Step 7, `/cyber-health`) all built. A full visual/UX audit (2026-08-13, AUDIT ONLY) produced the **Oragrol Visual Redesign Blueprint** (private Claude artifact + `VISUAL_REDESIGN_BLUEPRINT.md` in the repo root) — **approved by Mohammad**. Rollout order confirmed (D-009): new visual system builds on `/services` ONLY first; no other page touched until Services is reviewed and approved. Two independent, non-gated defects the audit also found were fixed the same session (D-010): the mobile nav overlay now covers the full viewport (was bleeding page content through underneath itself), and two WCAG AA contrast failures are fixed via new scoped tokens (`--accent-strong` for the primary button fill, `.env-dark`'s `--text-muted` override) — verified clean build/typecheck/lint plus Playwright/computed-style checks. Cyber Health's CTAs link to the real, live, already-in-production Tally assessment (`https://tally.so/r/2EzROb`, confirmed by Mohammad) — out of scope for this codebase, not rebuilt. Hero: all 16 frames, scroll bug fixed (D-005), visual-quality gap frozen (D-006) — superseded going forward by "Aperture O", not yet prototyped. Company/Industries flagged for a possible future photographic upgrade, deferred, not blocking.

**SERVICES SIGNED OFF, COMPLETE (D-034, 2026-08-14).** The full multi-round visual-redesign thread (D-011 through D-034) is closed — Mohammad reviewed the final `/services` full-page screenshot and confirmed approval. Per the page-by-page rollout rule (D-009), this unblocked the next page: **Step 8 — How We Work**.

**STEP 8 CONTENT-COMPLETE, CONNECTOR BUG FIXED (D-035/D-036/D-037, 2026-08-14).** Hero visual researched and built (D-035). Full page copy supplied and built (D-036), byte-for-byte verified. Connector-line bug reported and fixed (D-037) — investigated the cited reference component first and found it has the identical bug (flagged, not silently copied or silently ignored); real fix uses CSS Grid to structurally guarantee the circle sits on the spine. `/how-we-work` is live, `noindex` removed. Awaiting Mohammad's review.

**CYBER HEALTH LOADER RESOLVED, LIVE, AND MOHAMMAD-CONFIRMED (D-042, 2026-08-14).** Mohammad confirmed D-041's architecture finding and directed a repurpose: no fake 5-step backend narration, replaced with one generic honest transition message ("Preparing your assessment...") shown during the click-to-redirect to the real Tally form. `AssessmentCta` (new wrapper, native `<a target="_blank">` preserved, no popup-blocker risk) now live on both Cyber Health CTAs (hero + closing-cta). `/cyber-health/prototype-loader` removed. Verified by Claude via Playwright (real new-tab navigation, color remap, reduced-motion), then separately confirmed by Mohammad directly in-browser: "Confirmed working live — loader shows correctly, colors match, Tally opens in new tab as expected. Approved." Fully closed.

**CYBER HEALTH HERO GAUGE REOPENED, AMBIENT LOADER PROTOTYPED, NOT WIRED IN (D-043, 2026-08-14).** Mohammad reopened D-008's `GaugeVisual` hero, requesting a persistent ambient visual built on D-042's `AiLoader` ring (extracted into shared `RotatingRing`/`FadeText`, not duplicated), cycling short brand words instead of action language, reduced-motion holding for the full page lifetime, and offscreen pausing for performance. Prototyped at `/cyber-health/prototype-hero`, all 5 required changes verified with direct evidence. `hero.tsx`/`GaugeVisual` untouched — awaiting Mohammad's review and his call on a wording flag (see Next Steps #1).

**CYBER HEALTH AMBIENT HERO SHIPPED LIVE (D-043, 2026-08-15).** Mohammad approved and re-specified the exact wording ("Assess."/"Prioritize."/"Protect.") — resolves the wording flag by keeping his original words. `hero.tsx` now renders `HeroAmbientLoader` in place of `GaugeVisual`; prototype route/component removed. Re-verified live (not just re-assumed from the prototype): clean typecheck/lint/build, and Playwright-captured proof screenshots (the Chrome-extension tab in this environment runs with `document.hidden === true` regardless of focus, throttling/freezing the CSS fade — Playwright was used instead, per CLAUDE.md §7's documented method) of the mid-cycle "PRIORITIZE." state, the reduced-motion static state, and the IntersectionObserver pause/resume on scroll.

**STEP 9 — INDUSTRIES BUILT (D-044, 2026-08-15).** Mohammad supplied the real, fact-checked content brief (`ORAGROL_INDUSTRIES_CONTENT_CANADA.md`) plus an explicit structure spec. Built `/industries`: desktop sticky sidebar / mobile horizontal scrollable tabs (real ARIA `tablist`/`tab`/`tabpanel`, keyboard-navigable), an instant-swap detail panel (Risk/Priorities/Approach/Next Step), all 9 industries, active/inactive styling reusing Services' locked weight-600/weight-400-muted convention. Content verified byte-for-byte against the source `.md` via a Node diff script (not a visual read-through). Awaiting Mohammad's review.

**EMERGENCY CTA PLACEHOLDER NUMBER REMOVED (D-045, 2026-08-15).** The temporary Malaysian number in the site-wide floating "Under attack?" pill (D-017) is gone — the pill is now text-only ("Under attack? Contact us now"), links to `/contact` instead of `tel:`, same styling/icon/position. Single global component (`EmergencyCta`, rendered once from `RootLayout`), no separate footer instance existed. Confirmed via grep: the number no longer appears anywhere in source, only in this file and `DECISIONS.md`'s historical record.

**STEP 12 — CONTACT BUILT (D-046, 2026-08-15).** Mohammad supplied `Oragrol_Contact_Page_Content.md` with a two-path structure superseding the original generic-form outline. Built `/contact`: Path 1 "New to Oragrol" → the real Cyber Health assessment; Path 2 "Existing client / urgent" → direct `tel:`/`mailto:` to the real Thunder Bay number/email plus "Under attack?" framing. Two location cards — Toronto primary/Operations (all fields `[pending]` in the source, rendered as "Coming soon" badges, not blank/invented), Thunder Bay secondary/Registered Office (real details). Same session: footer's Instagram `href="#"` placeholder replaced with the real URL (`https://www.instagram.com/oragrolglobal`) — confirmed via grep to be the only instance site-wide. Awaiting Mohammad's review.

**GENERAL INQUIRY FORM ADDED, BLOCKING ON A REAL API KEY (D-047, 2026-08-15).** Third entry point added to `/contact` above Locations: Name/Email/Company(optional)/Message, real email send via Resend at `POST /api/contact` (`resend`/`@hookform/resolvers` added; `react-hook-form`/`zod` were already installed, unused until now — one shared schema validates both client and server). No fake success path — verified directly: with `RESEND_API_KEY` unset in this environment, a real test submission correctly surfaces "Email sending isn't configured yet..." as an error, logged server-side with the exact fix needed. **BLOCKING — needs from Mohammad:** a real Resend API key (free tier is enough — https://resend.com/api-keys, no domain verification required to send via Resend's own `onboarding@resend.dev` sandbox sender). Once supplied, set it as `RESEND_API_KEY` in `.env.local` (gitignored, never committed — `.env.local.example` in the repo root documents this and two optional overrides) and restart the dev server; then a real test send still needs to be run and proven (screenshot of the received email, or a server log showing success) before this is fully closed.

**STEP 11 — COMPANY / ABOUT BUILT (D-048, 2026-08-17).** Built `/company` from Mohammad's real, final content brief (`ORAGROL_ABOUT_PAGE_CONTENT_FINAL.md`, 4 sections: Founder Bio/Mission-Story/Team/Values) plus his real founder photo (arrived mis-saved to the repo root with a mangled filename — moved to the correct `public/images/founder-mohammad.jpg` after verifying it was a real, valid 3024×4032 photo). Researched via `ui-ux-pro-max` + `21st.dev` first per instruction; no strong pre-built "premium founder bio" match surfaced, so all 4 sections were built natively with distinct treatments (Dark 2-col editorial photo+bio / Light-blue single-column manifesto / minimal white band / icon grid + dark closing panel) — flagged as native-build rather than falsely claimed as sourced. No separate hero was built (none was supplied — Founder Bio doubles as the opening). Deliberately opens Dark rather than the brief's "primarily light" framing, to avoid a real pre-existing SiteHeader defect (illegible white nav text over a light entry section before ~140px of scroll) — flagged, not silently worked around. Caught and fixed two real issues before shipping: a mobile horizontal-overflow bug (a `GlowEffect` halo's negative inset bled past the viewport) and a heading-hierarchy gap (Values' card titles were `H4` under an `H2`, skipping a level — fixed to `H3`, matching this project's own established convention). Correctly diagnosed a screenshot false alarm (Playwright's `fullPage` mode mis-composites `position: fixed` elements) rather than reporting it as a bug. Full details: D-048. `tsc`/lint/build all clean, `/company` static. Awaiting Mohammad's review.

**FOUNDER BIO RESTRUCTURED (D-049, 2026-08-17).** Mohammad requested a layout-only restructure of Company's Founder Bio (D-048): small circular headshot (new file, `founder-mohammad-headshot.jpg` — arrived with the same mis-saved-filename pattern as the first photo, renamed to the correct path) + name + title at top, the same 3 bio paragraphs (byte-identical) reading through as a narrative middle column, then the original large photo reappearing as a widened (`max-w-2xl`) closing visual at the end. Text content unchanged, verified. A real (not a screenshot artifact this time — checked both ways) mobile-only issue found: the wider closing photo now visibly overlaps the sitewide `EmergencyCta` pill at real scroll positions, obscuring the founder's face — the same standing D-044 pill-overlap issue, now landing on the actual deliverable of this task rather than incidental text. Flagged with evidence, not fixed (pill is a single global `RootLayout` instance; desktop unaffected). Full details: D-049. `tsc`/lint/build clean.

**FOUNDER BIO REAL DESIGN FIXES (D-050, 2026-08-17).** Mohammad reviewed D-049 and reported two real problems, not a quick tweak: the top circular headshot cropped awkwardly (face off-center), and the closing photo was still far too large. Root cause of the crop bug: `founder-mohammad-headshot.jpg` (from D-049) turned out to actually be a 3/4-body composition, not a tight face crop — confirmed by direct pixel inspection — plus it was genuinely PNG bytes wrongly named `.jpg` (renamed to `.png`, D-049's own mistake, fixed here). Fixed the crop by decoupling `object-position` (top-anchored) from an explicit `transform-origin` placed at the face's real position + `scale(2)` — tuned empirically against a standalone comparison harness, then re-verified at the real rendered pixel size. Researched per instruction (`ui-ux-pro-max`: 0 matches, flagged; `21st.dev`: found "Editorial Testimonial," id 9637 — small photo beside a bold pull-quote) and redesigned the closing beat around that pattern: photo shrunk from a 672px stacked block to 224px (exactly one-third), placed beside a pull-quote (a verbatim excerpt of the bio's own first sentence, not new copy). Genuine side-effect: the mobile `EmergencyCta`/photo overlap D-049 flagged (pill covering the face) is now much smaller — the pill barely brushes the photo's corner at one scroll position instead of covering the subject, though not fully eliminated (same standing global-component issue). Full details: D-050. `tsc`/lint/build clean, 0px overflow both widths.

**TOP HEADSHOT REMOVED (D-051, 2026-08-17).** Mohammad instructed removing D-050's small circular headshot from the top of Founder Bio entirely — name + "Founder & CEO" only, no photo there. The founder's photo now appears exactly once on the page: the closing placement established by D-050 (`founder-mohammad.jpg`, ~224px, beside the pull-quote), unchanged. `founder-mohammad-headshot.png` is no longer referenced anywhere (grepped repo-wide) — left on disk unused, same convention as other superseded visual assets. Verified via DOM query: exactly one `<img>` in the Founder Bio section, resolving to the closing photo. `tsc`/lint/build clean, 0px overflow both widths.

**STEP 10 — RESOURCES BUILT (D-052, 2026-08-17).** Built `/resources` from the real content brief (`ORAGROL_RESOURCES_ALL_ARTICLES_FINAL.md`, 6 full articles + a CTA-mapping table). Found and fixed a real route mismatch: nav's existing "Resources" link pointed to `/insights` (an unbuilt D-017 placeholder), but the brief's own slugs are all `/resources/<slug>` — re-pointed `SiteHeader`/`SiteFooter` to `/resources`; `home/insights.tsx`'s "coming soon" teaser deliberately left untouched (out of scope, flagged, now slightly stale). Researched per instruction (`ui-ux-pro-max`: 0 landing-domain matches, flagged; real `ux`-domain chip-reflow guidance applied; `21st.dev`: "Blog Posts" and "Link Breadcrumb" retrieved and used, "Filter Grid" hit the session's retrieval limit so its *pattern* — not code — was rebuilt natively, flagged as such). All 6 articles transcribed verbatim then verified byte-for-byte via 3 separate Node diff scripts (body text, metadata, heading levels) — the heading-level script caught a real transcription mistake (Article 1's headings typed as `h2` while 2-6 were `h3`) before shipping, resolved by making all 6 uniformly `h2` (the correct page-level hierarchy: H1 title → H2 subsections, no skip — not a literal mirror of the source file's own internal markdown levels). Built faceted filters (Content Type/Topic/Industry) that hide zero-match options dynamically — verified live, not just asserted. CTA text/hrefs verified live against the source's mapping table via Playwright. Caught and fixed 2 more instances of the project's own documented `cn()` size-override conflict (`ArticleCard`'s `H3`, `ArticleDetail`'s `H2`) before shipping. Reading time computed from real word count. `tsc`/lint/build all clean, zero console errors, zero horizontal overflow both widths, unknown slug confirmed 404. Full details: D-052.

## Next Steps
1. **BLOCKING: General Inquiry real email send (D-047).** Needs a real `RESEND_API_KEY` from Mohammad before the required real-send proof can be completed — see Current Status above for exactly what to supply and where it goes. Do not fabricate a "success" screenshot/log without an actual send.
2. Awaiting Mohammad's review of Company (D-048/D-049/D-050/D-051) and Resources (D-052) — see Current Status. All page-build Steps (1-12) are now done; Steps 13-23 (cross-cutting QA/polish) are next once reviews clear, not a new page. Same standing flag: the sitewide `EmergencyCta` pill can still lightly overlap page content at some scroll positions (D-044-class, out of scope for a page-level task); SiteHeader's Dark-entry-section assumption remains open for whenever a genuinely light-first page is wanted; `home/insights.tsx`'s "coming soon" teaser is now stale next to a live `/resources` page (D-052, flagged, not fixed).
2. ~~BLOCKING: Cyber Health ambient hero (D-043)~~ — **SHIPPED LIVE 2026-08-15**, see Current Status. No longer blocking.
2. ~~ACTIVE: Step 9 — Industries~~ — **BUILT 2026-08-15 (D-044)**, see Current Status. Awaiting Mohammad's review. A pre-existing, out-of-scope issue was surfaced (not fixed) while building this: the sitewide floating "Under attack?" widget can visually overlap the panel's Next-Step CTA button at some scroll positions — flag for a future pass.
3. Solutions' Kinetic Grid hero (D-039) approved and shipped live (D-040) — all 5 required modifications re-verified against the live page (canvas scoping, background pixel, reduced-motion staticness), not assumed to still hold from the prototype. `/solutions/prototype` removed. `StrataVisual`'s file kept unused, available for revert.
4. Awaiting Mohammad's review of Step 8 (How We Work) — full page built, content-complete, connector-line bug fixed (D-037), and the same bug fixed on Home's own teaser too (D-038, confirmed). One thing still flagged, not silently resolved: the hero visual's own short stage one-liners sit directly above the Stage Sequence's full-paragraph versions of the same 4 stages — some content echo, left as-is per "build around the hero visual already built."
5. **SERVICES SIGNED OFF (D-034, 2026-08-14):** Mohammad confirmed "Services is approved and complete." No further Services visual/structural work without a new explicit instruction. The D-015 "item 5" capability-regrouping question remains separately held, not reopened by this sign-off. Both flags carried forward from D-017 are now resolved: Instagram has a real URL (D-046); the emergency-CTA phone number is gone entirely (D-045).
12. Awaiting Mohammad's review of Contact (D-046). Toronto's address/phone/email/hours are all still genuinely `[pending]` — do not fill any of them in without a real supplied value, even once the page is reviewed.
6. `21st` MCP is authenticated (OAuth completed 2026-08-13) — its real search/generate/get_component tools are available for future rounds without re-authenticating. `ui-ux-pro-max` skill is installed (Python 3.12 dependency) and usable the same way.
7. Known Tailwind v4 gotcha worth remembering: arbitrary-value utilities with `color-mix()` (or similar multi-comma CSS functions) nested inside bracket syntax can silently generate no CSS at all. Prefer Tailwind's built-in `{utility}-{registered-color}/{opacity}` mechanic over hand-rolled arbitrary values when a registered theme color is involved. Also: Tailwind v4 uses standalone `translate`/`scale`/`rotate` CSS properties, not the composed `transform` — don't debug hover/motion utilities by checking `getComputedStyle(el).transform`.
8. Known follow-up, not urgent: `StrataVisual`/`GaugeVisual` use `var(--color-surface)`/`var(--color-border)`, which have the same latent per-environment token bug D-011 found and fixed in the Services visual components — harmless today since both are Dark-only, but swap to `var(--surface)`/`var(--border)` if either is ever reused in a non-Dark context.
9. Hero (Home): current 16-frame sequence stays frozen per D-006; "Aperture O" is the named successor concept — Prototype 1 (isolated hero prototype) not started yet.
10. Pricing/package names/inclusions remain UNCONFIRMED site-wide — keep "currently being finalized" language.
11. Durable patterns from the Services thread, worth applying to future pages: (a) two visually-adjacent elements that must share exact width/position should share one physical wrapper with the constraint declared once, not matching classes independently on each (D-020); (b) any illustrative numeric figure needs its own explicit "not a real result" flag unless reusing an already-approved example (D-022); (c) a grid that stretches cards to match the tallest by CSS Grid default needs `items-start` once a mark's height varies (D-024/D-025); (d) a text label + variable-width badge sharing a row needs a wrap-friendly label, not a fixed single-line truncate (D-026); (e) a Waffle/Pictogram (grid of discrete units) beats a pie/donut for part-to-whole data, per `ui-ux-pro-max` (D-028); (f) never simulate a LIVE/in-progress operational state on marketing-page illustrative content, even labeled as an example (D-030).

---

## Session Log

### 2026-08-17 (continued 7) — Nav dropdowns extended to Solutions/Industries/Resources; Services generalized into shared NavItemDropdown (D-055)
**Completed:**
- **Investigated each nav item's real content before proposing anything** (Solutions, Cyber Health, Industries, Resources, Company), per the explicit instruction not to invent sub-sections. Read every page.tsx, section component, and data file directly rather than assuming:
  - **Cyber Health / Company: NO dropdown** — both single narrative flows, zero `id`s anywhere in their section files. Matches Mohammad's own stated no-dropdown examples exactly.
  - **Solutions: real content (3 tiers + 1 add-on), but zero anchor ids existed.** Flagged before building — needs small structural additions to `tier-cards.tsx`/`pentest-addon.tsx`.
  - **Industries: real content (9 industries), but implemented as a client-state ARIA Tabs widget** (`IndustriesExplorer`), not scroll anchors — no working per-industry link existed at all. Flagged as the biggest-scope item.
  - **Resources: real content (6 already-live article pages)** — nothing to add, genuine existing routes. Checked whether the 3 filter facets (contentType/topic/industry) grouped naturally — every article has a UNIQUE topic, the other two facets split 5:1 — no natural grouping exists, so a single-column list (not forced columns) was the right shape.
- **Reported all 5 determinations + proposed structures before writing any code**, then used `AskUserQuestion` for the two genuinely open decisions (Industries: build real deep-linking vs. skip; Solutions: add new anchor ids vs. skip). Mohammad approved both: build Industries deep-linking with a flat 9-item list (no invented sector taxonomy — the source content doesn't group these 9 anywhere), and add the Solutions anchor ids.
- **Solutions:** added real `id`/`scroll-mt-28` to the 3 existing `TierCards` (`tier-01`/`02`/`03`) and `PentestAddon` (`pentest-addon`) — purely structural, no visual/content change. Dropdown: single column, 4 items (Level 01/02/03, Penetration Testing).
- **Industries:** added real deep-linking to `industries-explorer.tsx`. Extracted a shared `slugifyIndustryName()` into `industries-data.ts` (single source of truth for both the explorer's tab ids and the nav dropdown's hrefs — can't drift out of sync). Tabs now read `location.hash` on mount + `hashchange` to select + scroll to the right industry. **Caught and fixed a real pre-existing duplicate-id bug while doing this:** the mobile and desktop tablists render simultaneously (CSS only hides one visually) and previously shared the exact same tab id — `document.getElementById` always resolved to the first (mobile) instance, which silently broke the existing Arrow-key-focus-follow behavior on desktop keyboards (pre-existing, not introduced here, just newly consequential once these ids became real anchor targets). Fixed by giving the two orientations distinct ids (desktop keeps the real slug, mobile gets a `-mobile` suffix); only the desktop id is ever linked to externally.
- **Services generalized:** `ServicesNavDropdown` (D-053/D-054) rewritten as a generic `NavItemDropdown` (`app/components/site/nav-dropdown.tsx`) driven by a `NavDropdownConfig` (columns, optional per-column heading, desktop width/layout classes) instead of hardcoded Services data. `SiteHeader` now looks up `NAV_DROPDOWNS[link.href]` per nav item instead of a single `label === "Services"` check. `services-nav-dropdown.tsx` deleted; `NAV_DROPDOWNS` covers `/services`, `/solutions`, `/industries`, `/resources`.
- **Chevron added to every dropdown trigger** (desktop: inline inside the `NavLink`, rotates on open via Tailwind's `rotate-*`; mobile: on the existing separate toggle button, unchanged) — the "there's more here" signal Mohammad asked for. Cyber Health/Company render none, confirmed via `aria-haspopup`/svg-count checks.
- **One real interaction bug caught and fixed during verification, not just the earlier-session Escape bug:** closing a sibling dropdown on `pointerdown` (used so an outside click registers before a full click completes) meant that once a SECOND dropdown existed on the page, clicking a lower trigger while an upper one was still open would correctly close the upper one but then MISS the click on the lower trigger entirely — reproduced live (mobile: Services open, click Solutions' chevron → Services closes, Solutions never opens), root-caused via a mid-transition screenshot (Chromium resolves a click's target via `elementFromPoint` at mouseup, and the upper dropdown's `pointerdown`-triggered close/reflow had already shifted the layout by the time mouseup fired, so the click landed on whatever reflowed into that same screen position instead). Fixed by switching the outside-click listener from `pointerdown` to `click` — React's own delegated click on the actual target element fires first (its listener sits lower in the bubble path), so a lower trigger's own toggle always lands before this outside-close logic runs, regardless of any reflow it goes on to cause. This wasn't reachable as a bug in D-053/D-054 (only one dropdown existed then) — only surfaced once a second one did.
- **Verified:** `npx tsc --noEmit` / `npm run lint` / `npm run build` all clean (same 20 routes, no new ones). Full Playwright pass: all 4 dropdowns' `aria-haspopup`/chevron/link-count/hrefs/panel-bg/chevron-rotate; Cyber Health/Company confirmed to have neither; zero horizontal overflow at 1024/1280/1440 with each dropdown open; Industries deep-link both via direct URL load (`/industries#industry-healthcare` → panel shows "Healthcare") and via clicking the dropdown item while already on another page; Solutions' 4 new ids all resolve; a Resources guide-article URL returns 200; mobile: all 4 chevrons present and none on Cyber Health/Company, sequential-click accordion behavior re-verified correct after the outside-click fix (each new dropdown opens, previous one correctly auto-closes, zero overflow). Screenshots reviewed directly (all 4 desktop dropdowns open, mobile fully expanded) before reporting anything as done.
- **One test-tooling correction, not a product bug:** an early check read `getComputedStyle(el).transform` to confirm the chevron rotates, saw `"none"`, and initially looked like a bug — Tailwind v4 compiles `rotate-*` to the standalone CSS `rotate` property (not the legacy `transform: rotate()`), so that was the wrong property to check. Confirmed via `getComputedStyle(el).rotate` (`none` → `180deg`) and a direct stylesheet-rule check before concluding anything.

**Files changed:**
- New: `app/components/site/nav-dropdown.tsx` (replaces `services-nav-dropdown.tsx`, deleted)
- `app/components/site/site-header.tsx` (config-lookup instead of single-item conditional)
- `app/components/sections/solutions/tier-cards.tsx`, `pentest-addon.tsx` (new anchor ids, structural only)
- `app/components/sections/industries/industries-data.ts` (new `slugifyIndustryName` export)
- `app/components/sections/industries/industries-explorer.tsx` (deep-linking + duplicate-id fix)

**Problems found:**
- Pre-existing duplicate tab-id bug in `IndustriesExplorer` (see above) — fixed as part of this work, not a new regression.
- The outside-click `pointerdown`-vs-`click` interaction bug (see above) — a real bug, only reachable once multiple dropdowns coexisted; fixed.
- One test-script false alarm (Tailwind v4's `rotate` property, see above) — correctly diagnosed as tooling, not product, before being dismissed.

**Still open / needs verification:**
- Mohammad's in-browser review of all 4 dropdowns — not yet done.
- The 4 Services category names (Advisory/Assessment & Testing/Protection & Monitoring/Response & Training, D-054) still carry their existing "needs separate sign-off if reused beyond nav" flag.
- Pre-existing carried-forward items unrelated to this work: Home `insights.tsx` stale teaser, sitewide `EmergencyCta` overlap-at-some-scroll-positions, the 1024px nav-row cramping noted in D-054.

**Next recommended step:**
- Get all 4 dropdowns reviewed live.

---

### 2026-08-17 (continued 6) — Services dropdown: bg-token fix + restructured into grouped columns (D-054)
**Completed:**
- **Bg-token fix (reported by Mohammad live in-browser):** the dropdown panel looked semi-transparent, hero text bleeding through. Checked computed style directly via Playwright at scroll 0 and scrolled past the header's own fade — `backgroundColor` was already opaque (`rgb(20,20,20)`, `opacity:1`, no `backdrop-filter`) in both states; couldn't reproduce real alpha transparency. Made the fix anyway, per the explicit instruction to match the nav bar's own token rather than guess a new value: the panel was using `--surface` (#141414, the `HeaderSearch`-style "floating card" token) instead of the nav bar's own real background token, `--background` (#0a0a0a — confirmed by reading `SiteHeader`'s own gradient layers, which are built from `from-background/90...`, not `--surface`). Swapped `bg-surface` → `bg-background`; re-verified computed style now `rgb(10,10,10)`.
- **Restructured from a flat 8-item list into Bell.ca-style grouped columns** (structure only — explicitly NOT Bell's promo-card/image treatment; kept the plain dark panel, no photography). Re-confirmed `oragrol_services_page_content.md` still doesn't exist anywhere in the repo (second check, same method as the first). Read the real per-capability copy already on `/services` (problem/what-we-do/what-you-get/outcome text) and built 3 candidate groupings from it, shown to Mohammad via `AskUserQuestion` before building anything — he picked **4 columns, paired by stage**:
  - Advisory — Virtual CISO, Risk Assessment & Compliance
  - Assessment & Testing — Vulnerability Assessment & Management, Penetration Testing
  - Protection & Monitoring — Managed Security Services / 24/7 MDR, Endpoint Protection / EDR
  - Response & Training — Incident Response, Security Awareness Training
- **These 4 category names are new** — Claude's synthesis of the real per-capability copy into a theme label, not text present verbatim anywhere in existing content, and not independently confirmed as customer-facing marketing copy. Approved by Mohammad for this nav menu specifically; flagged in the component's own header comment as needing separate sign-off if used as marketing copy elsewhere.
- No category-level anchor exists on `/services` itself (only the 8 `capability-0N` ids) — each category title links to the first capability listed under it in this component's own display order, not a fabricated section anchor.
- Desktop: `grid-cols-4` panel, widened `w-72` → `w-[820px]`, still `left-0`-anchored (not centered — centering was considered and rejected: the trigger sits near the nav's left edge, right after the logo, so centering an 820px panel on it would push the panel's left edge off-screen). Verified via Playwright at 1024/1280/1440/1920px: zero horizontal page overflow at any width, panel's own right edge stays well inside the viewport at all four (max 1345px at 1920px viewport). Mobile: the single chevron-toggle disclosure now expands into 4 stacked category groups (each with its own heading + indented items) instead of one flat list — still one control, still inside the existing full-viewport mobile panel.
- ArrowUp/ArrowDown roving focus now moves across all 8 capability links in column-then-row display order (category titles aren't part of the roving set, same as v1 — only reachable via Tab); re-verified the full 9-press wrap-around sequence lands back on item 1.
- **Verified:** `npx tsc --noEmit` / `npm run lint` / `npm run build` all clean. Fresh Playwright pass: category titles + hrefs, all 8 item labels + hrefs, ArrowDown roving order (9 presses, correct wrap), Escape closes (`aria-expanded` → `false`), category-title font-family `"Space Grotesk"`, item font-family `Inter`, category-title hover color confirmed exactly `rgb(1, 138, 190)` (#018ABE) via a real `:hover`-pseudo-class match (isolated, single-purpose script — the first combined script's own hover read was a flake from a rapid keyboard→mouse sequence on one page instance, diagnosed and confirmed not a product bug before being dismissed), mobile expand shows all 4 category headings + 8 items in the right grouping, zero horizontal overflow on mobile. Screenshots reviewed directly at 1024/1440 desktop and 390 mobile before reporting anything as done.
- **Noted, not fixed (pre-existing, unrelated to this task):** at exactly the 1024px `lg` breakpoint where the desktop nav switches on, the nav row itself is already cramped pre-existing this change — "Cyber Health" wraps to two lines, the primary CTA button wraps, "EN | FR" wraps. Visible in the 1024px screenshot taken for this verification; not introduced by the Services dropdown (confirmed by reading `NavBar`/`SiteHeader` — none of `NAV_LINKS`' other items were touched) and out of scope for this task. Flagging for a future pass.

**Files changed:**
- `app/components/site/services-nav-dropdown.tsx` (bg-token swap, then full restructure into `SERVICES_CATEGORIES`/grouped rendering — same file from D-053, no new files)

**Problems found:**
- None that were real product bugs. The reported bg-transparency issue couldn't be reproduced in automated testing at any state tested, before or after the fix — reported honestly rather than claiming to have found+fixed a bug that wasn't observed. The fix (matching the literal nav-bar token) was made regardless, per the explicit instruction, and is a real correctness improvement independent of whether the original bug reproduced.
- One test-script flake (hover-color read returned the muted/default color once, in a script hammering keyboard+mouse interactions back-to-back on one page instance) — isolated and confirmed to be a script artifact, not a product bug, via a clean single-purpose repro.

**Still open / needs verification:**
- Mohammad's in-browser review of the grouped dropdown — not yet done (this entry covers Claude's own verification only).
- The 4 new category names (Advisory / Assessment & Testing / Protection & Monitoring / Response & Training) may need separate sign-off if reused as customer-facing copy beyond this nav menu.
- The pre-existing 1024px nav-cramping issue (noted above) — not addressed, flagged for a future pass.
- All previously-carried-forward open items (Home `insights.tsx` stale teaser, sitewide `EmergencyCta` overlap-at-some-scroll-positions, D-053's own review) remain open.

**Next recommended step:**
- Get the grouped Services dropdown reviewed live; decide whether the 1024px nav-cramping issue gets its own pass.

---

### 2026-08-17 (continued 5) — Services nav mega-menu added (D-053)
**Completed:**
- Built `app/components/site/services-nav-dropdown.tsx` (`ServicesNavDropdown`) and wired it into `SiteHeader` — the "Services" item only (desktop nav row + mobile nav panel); the other 6 nav items (Home logo aside — Solutions/Cyber Health/Industries/Resources/Company/Contact-via-CTA) are byte-for-byte untouched, confirmed via Playwright (`aria-haspopup` absent on Cyber Health's link, no chevron sibling on Company's mobile row).
- **Content-source gap found and reported, not silently substituted:** the instruction named `oragrol_services_page_content.md` as the section-header source; a full repo search (glob + `git log --all --full-history`) found no such file, ever, in this repo. Used the actual confirmed, already-shipped source instead — `/services`' own locked capability data (`LiveServices.LIVE_SERVICES` 01-04 + `AdditionalCapabilities.FINALIZING_SERVICES` 05-08, and their real `capability-0N` DOM ids that `CategoryNav` already jump-scrolls to) — rather than inventing names to match a file that doesn't exist. Flagged to Mohammad in the same-turn report.
- The 8 links: Virtual CISO, Risk Assessment & Compliance, Vulnerability Assessment & Management, Security Awareness Training, Managed Security Services / 24/7 MDR, Penetration Testing, Endpoint Protection / EDR, Incident Response — each `/services#capability-0N`. The instruction's own example anchor format (`#capability-name`, i.e. a slugified name) doesn't match the real anchors already live on the page (`#capability-01`...`#capability-08`, numbered) — used the real ones (a slug anchor would silently 404-scroll, matching nothing), flagged as a mismatch rather than silently deviating from the instruction's example unremarked.
- Two variants, one component (`variant: "desktop" | "mobile"`): desktop is a hover/focus-opened absolute panel below the existing `NavLink` trigger (same component every other item uses, so it's pixel-identical at rest); mobile is an inline disclosure inside the existing full-viewport mobile panel — a chevron button toggles an indented sub-list, the "Services" label itself stays a plain link to `/services`.
- Styling: reused tokens only — `bg-surface`/`border-border`/`shadow-xl` (same recipe as `HeaderSearch`'s existing floating panel), `font-heading` (Space Grotesk) on the small "Capabilities" panel label, `font-body` (Inter) on every link, `text-accent` (#018ABE, verified via computed style: `rgb(1, 138, 190)`) on hover/focus. No new colors, no promo cards/images — a plain link list, per the explicit "not Bell-style" instruction.
- Behavior, each verified live via Playwright (not just asserted): Tab onto the trigger opens the panel (`onFocus`) and Tab continues naturally into its links (real DOM order); ArrowDown/ArrowUp move focus between the 8 items; Escape closes AND returns focus to the trigger; outside click closes it; closes on route change (`usePathname`, render-time reset — same pattern `SiteHeader` already uses for `mobileOpen`, not an effect, so it doesn't trip the "no setState in an effect" lint rule) and explicitly on every item click (covers same-page anchor navigation, where pathname alone doesn't change); `prefers-reduced-motion` swaps the open/close transition for an instant `hidden`/`block` toggle (verified under `reducedMotion: "reduce"` emulation).
- **One real bug caught by the verification script and fixed before shipping:** Escape's `.focus()` call on the trigger re-triggered the same `onFocus` handler that opens the panel on a real Tab-in, silently reopening it on the same keypress — `aria-expanded` stayed `"true"` after Escape instead of flipping to `"false"`. Fixed with a one-shot `suppressNextFocusOpenRef` flag set right before the programmatic refocus and consumed by the very next `onFocus`. Re-verified clean after the fix.
- Desktop hover-close is debounced ~150ms (`setTimeout`, cleared on re-entry): the panel is a DOM descendant of the hover container but the visual gap between trigger and panel isn't covered by either element, so an undebounced `mouseleave` fired mid-transit on a diagonal mouse move — caught by reasoning through the geometry before shipping, not discovered as a live bug.
- **Verified:** `npx tsc --noEmit` / `npm run lint` / `npm run build` all clean (no new routes, same 20 pages). Full Playwright pass against the running dev server (not just component-level assumptions): desktop hover open/close, full keyboard flow (Tab → ArrowDown/ArrowUp → Escape), outside-click close, reduced-motion instant toggle, mobile chevron expand/collapse, click-through navigation to `/services#capability-01` (URL and panel-closed state both confirmed), hover-state accent color computed exactly `#018ABE`, panel heading computed font-family `"Space Grotesk"`, link computed font-family `Inter`. Screenshots reviewed directly (desktop panel open, mobile panel expanded) before reporting anything as done.

**Files changed:**
- New: `app/components/site/services-nav-dropdown.tsx`
- `app/components/site/site-header.tsx` (conditional render: "Services" → `ServicesNavDropdown`, all 5 other links untouched)

**Problems found:**
- The named content file doesn't exist (see above) — reported, not guessed around.
- The Escape/re-focus/re-open loop bug (see above) — caught by the verification script itself, fixed same session.

**Still open / needs verification:**
- Mohammad's in-browser review of the new dropdown — not yet done.
- All previously-carried-forward open items (Home `insights.tsx` stale teaser, sitewide `EmergencyCta` overlap-at-some-scroll-positions) are unrelated to this session and remain open.

**Next recommended step:**
- Get the Services dropdown reviewed live; otherwise continue with whatever page/step Mohammad prioritizes next.

---

### 2026-08-17 (continued 4) — Resources page built (Step 10, D-052)
**Completed:**
- User instructed building `/resources` with a mandatory research step first, content read verbatim from `ORAGROL_RESOURCES_ALL_ARTICLES_FINAL.md` (6 articles, Article 1 featured), a content grid with faceted filters (Industry/Topic/Content Type, hiding zero-match options), and an article detail template with an exact per-article CTA from the source's mapping table.
- Found the nav's existing "Resources" link pointed to `/insights` (D-017's unbuilt placeholder), inconsistent with the brief's own `/resources/<slug>` slugs. Re-pointed `SiteHeader`/`SiteFooter` to `/resources` rather than building at the stale target. `home/insights.tsx`'s Home-page "coming soon" teaser was left untouched — out of scope for this instruction, flagged as now slightly stale rather than silently updated.
- Research: `ui-ux-pro-max` (`--domain landing` — 0 matches, flagged; `--domain ux` — real chip-reflow/lazy-load findings, applied). `21st.dev search` surfaced 3 real matches; successfully retrieved and used "Blog Posts" (asymmetric featured-card grid) and "Link Breadcrumb"; "Filter Grid" (segmented chips with live counts) hit this session's daily retrieval-limit mid-task — its pattern was rebuilt natively instead of literal code, flagged as such in the component's own comment rather than presented as sourced.
- Transcribed all 6 articles' full bodies + every metadata field into `articles-data.ts` by hand, then verified byte-for-byte via 3 separate Node scripts (body text, metadata fields, heading levels) run against the actual source file — not re-read by eye a second time. The heading-level script caught a real mistake: Article 1's subheadings had been typed `h2` while Articles 2-6 were `h3` (the source itself is uniform `###` throughout — this was my own inconsistent transcription, not a source variation). Fixed by making all 6 articles' subheadings `h2` uniformly, the correct choice for the rendered page's own hierarchy (H1 title → H2 subsections, no skip) rather than a literal mirror of the source file's internal markdown structure. All 3 scripts passed clean after the fix.
- Built genuinely faceted filtering (not independent per-dimension filters): each filter group computes its visible options from the OTHER two active filters, so a combination with zero matches is never rendered as a choice — verified live (selecting Industry: Professional Services immediately hid "Article" from Content Type and every topic but one, since the sole Professional-Services piece is the one Guide), not just asserted from the code.
- Verified CTA text/href live via Playwright against the source's own mapping table (not just copied into the data file and assumed correct) — confirmed exact text and correct `/contact` vs `/cyber-health` destination.
- Caught and fixed 2 more instances of this project's own documented `cn()` conflict (component base classes + a conflicting `className` size override) before shipping: `ArticleCard`'s title against `H3`, `ArticleDetail`'s body headings against `H2` — same fix D-018/D-048 already established for the identical mistake.
- Reading time computed from real word count (`app/lib/reading-time.ts`, 200 wpm, minimum 1 min), not hardcoded per article.
- No `FinalCta` added to either page — each article already has its own specific mapped CTA, and the grid's whole purpose is surfacing a next step; stacking a generic CTA on top would compete with the specific one (same reasoning Contact used, D-046).
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean (`/resources` static, all 6 `/resources/<slug>` pages statically generated, unknown slug confirmed 404). Server HTML fetched via `curl` confirms all 6 titles present verbatim. Playwright: 0px horizontal overflow at 1440/390px; 0 console errors on both the grid and an article page; correct heading order (H1 then H2s, no skips); reduced-motion renders content at final `opacity: 1`. Full-page and filtered-state screenshots at both widths reviewed directly.

**Files changed:**
- New: `app/resources/page.tsx`, `app/resources/[slug]/page.tsx`, `app/lib/reading-time.ts`, `app/components/sections/resources/{hero,article-card,resources-explorer,breadcrumb,article-detail,articles-data,inline-markdown}.tsx/.ts`
- `app/components/site/site-header.tsx`, `app/components/site/site-footer.tsx` (Resources nav link `/insights` → `/resources`)
- `DECISIONS.md` (D-052), `PROJECT_MASTER.md` (Step 10 → IMPLEMENTED, Current Position), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The stale `/insights` nav target (caught and fixed before shipping).
- The heading-level transcription mistake (caught via the verification script, fixed before shipping).
- Two `cn()` size-override conflicts (caught before shipping, same known project gotcha).
- `21st.dev`'s daily retrieval limit hit mid-research (worked around by rebuilding the pattern natively, flagged honestly rather than claimed as sourced).

**Problems solved:**
- All 6 articles built from a real, final content brief, verified byte-for-byte accurate — matching this project's content-accuracy discipline (CLAUDE.md §8) for client-facing MSSP copy, at real scale (6 full long-form articles, not a handful of short fields like prior pages).
- A genuinely faceted (not merely independent) filter system, verified interactively.

**Still open / needs verification:**
- Mohammad's review of `/resources` (D-052).
- `home/insights.tsx`'s now-stale "coming soon" teaser (flagged, not fixed — out of scope for this instruction).
- Same standing flags carried forward: `EmergencyCta` overlap (D-044-class), SiteHeader Dark-entry assumption, the blocking `RESEND_API_KEY` (D-047).

**Next recommended step:**
- Get Resources reviewed alongside the rest of the recently-built pages. All page-build Steps (1-12) are now done — next real work is Steps 13-23 (cross-cutting QA/polish), not a new page.

---

### 2026-08-17 (continued 3) — Top headshot removed from Founder Bio (D-051)
**Completed:**
- Mohammad instructed removing D-050's small circular headshot from the top of Founder Bio entirely — name + "Founder & CEO" only there. Removed the photo `<div>` (circle frame, `Image`, crop styling) from `founder-bio.tsx` outright, not hidden/commented out; the top block is now just centered `H1` name + `Caption` title.
- Confirmed via repo-wide grep that `founder-mohammad-headshot.png` (D-050's corrected asset) is no longer referenced anywhere — left in place on disk, unused, same "kept for a possible revert" convention already used for other superseded visual assets (`StrataVisual`, `SchematicVisual`).
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean; 0px horizontal overflow at 1440/390px; DOM query confirms exactly one `<img>` inside the Founder Bio `<section>`, resolving to `founder-mohammad.jpg` (the closing photo, unchanged from D-050) — not the removed headshot. Screenshots at both widths reviewed directly.

**Files changed:**
- `app/components/sections/company/founder-bio.tsx` (top photo removed, doc comment updated)
- `DECISIONS.md` (D-051, D-050 status marked superseded), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- None — straightforward removal, no surprises.

**Still open / needs verification:**
- Mohammad's review of the full Company page (D-048 through D-051).
- Same standing flags carried forward unchanged (Resend API key, `EmergencyCta` overlap, SiteHeader Dark-entry assumption).

**Next recommended step:**
- Get this reviewed alongside the rest of Company.

---

### 2026-08-17 (continued 2) — Founder Bio real design fixes: headshot crop + closing photo redesign (D-050)
**Completed:**
- Mohammad reported D-049's restructure had two real design problems (not a quick tweak): the top circular headshot's crop was awkward/off-center, and the closing photo was still far too large — plus an explicit instruction to research (`ui-ux-pro-max` + `21st.dev`) a real redesign of the closing beat, e.g. a smaller photo beside a pull-quote instead of a stacked block.
- Investigated the crop bug before touching CSS: pixel-inspected `founder-mohammad-headshot.jpg` and found it's actually a 3/4-body composition (same "arms crossed" framing as the main photo), not a tight face crop, despite its name — confirmed via `xxd` that its real bytes are also PNG (magic number `89 50 4E 47`), mis-extensioned `.jpg` during D-049. Renamed to the correct `.png`.
- Tuned the crop empirically: built a standalone 4-way comparison HTML harness (scratchpad only) to test `object-position`/`transform-origin`/`scale` combinations against the real source file, screenshotted via Playwright. First attempt (position bias + scale from default center) was visibly wrong — worked out why mathematically (a `scale()` from the box's own center can never land on the face when the cover-fit window's center, computed from the real image proportions, falls below the face no matter what position is chosen) — then fixed by explicitly decoupling `object-position` (top-anchored) from `transform-origin` (placed at the face's real position) before scaling. Verified against the real rendered 96px/80px circle on the live page, not just the larger test harness.
- Researched the closing-photo redesign per instruction: `ui-ux-pro-max` returned 0 matches for the specific pattern (flagged, not silently defaulted); `21st.dev search` found "Editorial Testimonial" (id 9637) — small ringed photo beside a bold pull-quote, oversized faint numeral, generous whitespace. Adapted its core pairing (not its carousel machinery, which doesn't apply to one founder) into a static closing beat: photo shrunk from a 672px stacked block to 224px (exactly one-third on desktop), placed beside a pull-quote — the bio's own first sentence, quoted verbatim (a pull-quote by definition re-displays existing text; not new copy).
- Added a `border-t` divider above the closing beat for clearer section rhythm — part of the "framing/text placement looks unpolished" complaint, not just the two explicit sizing/crop items.
- Re-verified the D-049-flagged mobile `EmergencyCta`/photo overlap at the same real scroll positions with the new, smaller photo: no longer covers the subject's face (the severity D-049 flagged) — the pill now only lightly brushes the photo frame's corner at one scroll position, the same lower-severity, still-standing D-044-class sitewide issue as everywhere else. Verified this honestly rather than either claiming it's fully fixed or leaving the D-049 severity claim uncorrected.
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean; 0px horizontal overflow at 1440/390px; both images confirmed correctly wired via DOM query; full-section screenshots (element-scoped, not `fullPage`) reviewed directly at both widths.

**Files changed:**
- `app/components/sections/company/founder-bio.tsx` (crop fix + closing-beat redesign)
- Renamed: `public/images/founder-mohammad-headshot.jpg` → `founder-mohammad-headshot.png` (asset-hygiene fix, corrects D-049's mistake)
- `DECISIONS.md` (D-050), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The headshot's actual composition (3/4-body, not a tight face crop) and its PNG-named-.jpg mismatch — both from D-049, both caught and fixed here.
- The math error in the first crop attempt — caught via the comparison harness before shipping, not left for a second round of feedback.

**Problems solved:**
- A real, empirically-tuned crop fix instead of a single guessed value.
- A genuine redesign (not a resize alone) of the closing beat, grounded in real research per instruction, with a byproduct fix to the D-049-flagged pill/photo overlap.

**Still open / needs verification:**
- Mohammad's review of this round.
- The lighter-severity `EmergencyCta` corner-brush overlap noted above (D-044-class, out of scope).

**Next recommended step:**
- Get this reviewed. Every other outstanding item (Resend API key, other pages' reviews) is unchanged from before this round.

---

### 2026-08-17 (continued) — Founder Bio restructured: small top identifier → narrative bio → large closing photo (D-049)
**Completed:**
- Restructured `FounderBio` (`app/components/sections/company/founder-bio.tsx`) per instruction: small circular headshot + name + "Founder & CEO" at top, the same 3 bio paragraphs (verified byte-identical, not touched) reading through as a narrative middle column, then the large-format photo reappearing as a widened closing visual at the end. Text-only-unchanged confirmed by direct comparison against the pre-edit file.
- New headshot (`public/images/founder-mohammad-headshot.jpg`) arrived saved as `founder-mohammad-headshot.jpg.png` — same mis-saved-filename pattern as the original founder photo — verified it was a real, valid headshot before renaming to the correct path.
- Moved `priority` from the large closing photo to the small top headshot (now the actual above-the-fold/LCP image) — a correctness fix that falls naturally out of the restructure, not a separate ask.
- Found and verified a real (not a screenshot-stitching artifact — checked both ways, learned from the prior round's false alarm) mobile-only issue: the widened closing photo now visibly overlaps the sitewide `EmergencyCta` pill at real scroll positions, landing on the founder's face — the same standing D-044 pill-overlap issue, now hitting the actual deliverable this task asked for rather than incidental text. Flagged with evidence (real per-frame screenshots at fixed scroll offsets on both widths), not fixed — `EmergencyCta` is one global `RootLayout` instance; desktop confirmed unaffected at the same scroll positions.
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean; 0px horizontal overflow at 1440/390px; both images confirmed correctly wired via DOM query (correct `src`, correct alt-text split between decorative top photo and descriptive closing photo).

**Files changed:**
- `app/components/sections/company/founder-bio.tsx` (restructured)
- New: `public/images/founder-mohammad-headshot.jpg` (moved/renamed from a mis-saved upload)
- `DECISIONS.md` (D-049), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The mis-saved headshot filename (caught before use).
- The real mobile pill/photo overlap — a genuine, new-severity instance of the already-standing D-044 issue, correctly distinguished from a screenshot artifact this time via real per-frame captures.

**Still open / needs verification:**
- Mohammad's review of the restructure, specifically his call on the mobile pill/photo overlap (a global-component question, not scoped to this page).
- Every other still-open item carried forward unchanged (see Next Steps).

**Next recommended step:**
- Get this restructure reviewed alongside the rest of Company. If Mohammad wants the `EmergencyCta` overlap addressed, that's a separate, sitewide-scoped task (touches `RootLayout`/`emergency-cta.tsx`, not just this page).

---

### 2026-08-17 — Company / About page built (Step 11, D-048)
**Completed:**
- User instructed building `/company` (matching the site's existing route pattern — confirmed via grep of `site-header.tsx`/`site-footer.tsx`, both already link "Company" → `/company`), with a mandatory research step (`ui-ux-pro-max` + `21st.dev`) before designing, content read verbatim from `ORAGROL_ABOUT_PAGE_CONTENT_FINAL.md` (4 sections: Founder Bio, Company Mission/Story, Team, Values/Differentiators), and the founder photo used at large editorial scale, not a small avatar.
- Investigated project memory first, per CLAUDE.md §2: read the last several `PROJECT_MEMORY.md`/`DECISIONS.md` entries, confirmed D-008's original Company motif ("architectural/material-study abstractions... no fabricated people/office photography, since none exists") is now superseded for Founder Bio specifically — a real photo now exists — and confirmed PROJECT_MASTER.md's Step 11 outline (Hero/Who Oragrol Is/Company Story/Philosophy/Experience & Expertise/Partners & Ecosystem/Approach/CTA, "primarily light") is superseded by the real content brief, the same pattern D-046 set for Contact.
- Found the founder photo saved to the repo root as `publicimagesfounder-mohammad.jpg.jpeg` (path separators and correct extension lost) instead of the stated `public/images/founder-mohammad.jpg`. Read/viewed it directly first to confirm it's a real, valid, high-resolution (3024×4032, exact 3:4 portrait) photo — not a broken/placeholder file — before moving it to the correct path and deleting the stray original.
- Research: `ui-ux-pro-max` (`--domain landing`, `--domain ux`) and `21st.dev` (`search` for founder/about/team patterns) — neither surfaced a strong match for a premium editorial founder-bio pattern; results were generic SaaS "About Page" templates. Built natively instead, flagged as such rather than falsely presented as sourced — consistent with this project's repeated precedent (D-035/D-041/D-043) for the same situation.
- Built 4 components, each with a distinct treatment (not four stacked identical blocks): `FounderBio` (Dark, 2-col, real photo at hero scale with a `GlowEffect` halo reusing Services' D-013 "light-based depth" material, lede-sized origin paragraph), `MissionStory` (Light-blue, single-column manifesto — the two-sentence opening set at display scale via a plain `<h2>` to avoid the H2-size/`cn()` conflict D-018 already documented), `TeamSection` (White, deliberately minimal bordered band), `ValuesSection` (White, 3-item icon-led grid reusing `CapabilitySpotlight`'s exact icon-badge gradient, closing one-line summary in its own nested `env-dark` panel). Composed in `app/company/page.tsx` with the existing `FinalCta` reused at the bottom (flagged as a structural choice, same as Industries' identical reuse).
- **Deliberately opened Founder Bio Dark, not the brief's "primarily light" framing — flagged, not silent:** `SiteHeader` is hardcoded `env-dark`, illegible-by-design against a light entry section before ~140px of scroll (its own comment already flags this as a known, not-yet-fixed gap). Every page built so far opens Dark for the identical reason (confirmed via `services/hero.tsx`'s own comment). Rather than touch the shared `SiteHeader` (out of scope, risks every already-approved page) or ship a page illegible at load, kept Founder Bio Dark and the remaining 3 sections White/Light-blue.
- Caught and fixed two real issues before calling this done, not after: (1) a mobile-only 8px horizontal overflow — Founder Bio's photo-halo `GlowEffect` wrapper used a `-inset-8` negative inset with no `overflow-hidden` ancestor; fixed by adding `overflow-hidden` to the section, the same pattern `FinalCta`'s own decorative bleed already uses. (2) A heading-hierarchy gap — Values' 3 card titles were built as `H4` under an `H2`, skipping a level and breaking this project's own established convention (grepped the whole codebase: every other card/item title site-wide — Contact, How We Work, Services — uses `H3`, never `H4`); fixed to `H3`.
- Correctly diagnosed a screenshot false alarm rather than reporting it as a bug: a `fullPage: true` Playwright mobile capture appeared to show the founder photo entirely missing and the sitewide `EmergencyCta` pill overlapping the H1 name. Checked via direct DOM/computed-style query before concluding anything (same discipline as D-036/D-041/D-043's own prior false-alarm catches) — the photo was fully loaded/visible/correctly positioned, and the pill's actual parent element is genuinely `position: fixed` (confirmed in source); both artifacts were Playwright's own known limitation of compositing fixed-position elements once into a tall stitched image, not a live defect. Re-captured with per-viewport (non-stitched) screenshots, which show both rendering correctly. Separately confirmed the pill's real, live overlap with Values' third card at one specific mobile scroll depth is the same already-flagged, out-of-scope D-044 issue from Industries — not new, not silently fixed, not silently ignored either.
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean (`/company` static, 11 routes). Server HTML fetched directly via `curl` (not just browser-rendered) confirmed all 4 section headings present verbatim. Playwright: 0px horizontal overflow at 1440px/390px; reduced-motion context confirms every `Reveal`-wrapped heading renders at `opacity: 1` (final state); alt text confirmed present and meaningful; heading order confirmed correct (one H1, then H2s, then H3s, no skips) after the fix. Full-page and per-section screenshots at both widths reviewed directly before reporting anything as done.

**Files changed:**
- New: `app/company/page.tsx`, `app/components/sections/company/{founder-bio,mission-story,team,values,values-data}.tsx/.ts`
- Moved: founder photo from a mis-saved repo-root file to `public/images/founder-mohammad.jpg`
- `DECISIONS.md` (D-048), `PROJECT_MASTER.md` (Step 11 → IMPLEMENTED, Current Position), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The mis-saved founder-photo filename (caught before use, not a code defect).
- The mobile overflow bug and the H4/H3 heading-hierarchy gap — both caught and fixed within this same round, not left for Mohammad to discover.
- The Playwright `fullPage`+`position:fixed` compositing artifact — a real tooling quirk, correctly diagnosed via direct DOM inspection before being (not) reported as a product bug.

**Problems solved:**
- Step 11 built from a real, final content brief with a genuinely different (specific, compliance-reviewed) structure than the original placeholder outline, verbatim copy preserved, nothing invented — matching this project's content-accuracy discipline (CLAUDE.md §8) for client-facing MSSP copy. A real photo now exists, superseding D-008's "no fabricated photography" note for this one section.

**Still open / needs verification:**
- Mohammad's review of `/company` (D-048).
- Same standing flags as every recent page: the sitewide `EmergencyCta` pill overlap-at-some-scroll-positions issue (D-044, out of scope); SiteHeader's Dark-entry-section assumption (reaffirmed here, not fixed).
- **BLOCKING, unrelated to this session:** a real `RESEND_API_KEY` from Mohammad for D-047 — still outstanding.

**Next recommended step:**
- Get Company reviewed. Step 10 (Resources/Insights) is the next unbuilt step once outstanding reviews clear (How We Work, Cyber Health ambient hero, Industries, Contact, Company).

---

### 2026-08-15 (continued 4) — General Inquiry form added to Contact (D-047), blocking on a real API key
**Completed:**
- User instructed a third Contact-page entry point, above Locations: "General Inquiry" (headline/subtext + Name/Email/Company-optional/Message form, "Send Message" button), with an explicit real-email requirement — no n8n/HubSpot, must actually send via Resend or SendGrid (whichever's simpler), a real success/error state (no faked success), and an explicit instruction to say exactly what API key setup is needed rather than hardcoding anything.
- Chose Resend over SendGrid: one API key, one `emails.send()` call, and its own `onboarding@resend.dev` sandbox sender can send a real test email immediately with just the key — no mandatory sender-verification step first, unlike SendGrid. Installed `resend` + `@hookform/resolvers`; `react-hook-form`/`zod` were already project dependencies, unused anywhere until now — reused rather than hand-rolling form state or a different library.
- Built one shared `zod` schema (`app/lib/contact-schema.ts`), validating both client (`GeneralInquiry`, via `zodResolver`) and server (`/api/contact`'s authoritative re-check). Hit and fixed a real zod+RHF typing pitfall before shipping: an initial `.transform()` on the optional `company` field made zod's input/output types diverge, which broke `useForm`'s single generic — removed the transform, handled blank-vs-provided at render time instead (`company || "—"` in the email body).
- Built `POST /api/contact` — the only place the real send happens (client never touches Resend directly, no key in the browser bundle). `RESEND_API_KEY` read via `process.env` only; a missing key is a real, logged, reportable failure (never a faked success) — returns a real error pointing the visitor to the direct email address. Added `.env.local.example` (had to also fix `.gitignore`: the existing blanket `.env*` rule was silently swallowing example files too — added `!.env*.example`) documenting `RESEND_API_KEY` (required) plus `CONTACT_TO_EMAIL`/`CONTACT_FROM_EMAIL` (optional overrides).
- Verified the "no fake success" behavior directly rather than just claiming it: submitted the live form with no `RESEND_API_KEY` set (this environment has none) — Playwright and the dev-server log both confirm it surfaces the real "Email sending isn't configured yet..." error, with the exact diagnostic logged server-side.
- Visual consistency: the form sits in the same `Card` treatment as `TwoPath`'s two path-cards (bordered, same Caption/H2 pattern) — reads as a third option in the same family, not a bolted-on generic form. Error text reuses the site's existing `text-risk-critical` form-error convention (already used by `FieldChrome`), not a new color.
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean (`/api/contact` now a dynamic route, `/contact` still static — 13 routes total). Screenshots sent showing the idle form (styled consistent with the two path-cards) and the real error state after a live test submission.
- **Still blocking, surfaced explicitly rather than worked around:** a real `RESEND_API_KEY` is needed from Mohammad before the required real-send proof (screenshot of a received email, or a server log showing success) can be completed. Did not fabricate either.

**Files changed:**
- New: `app/api/contact/route.ts`, `app/lib/contact-schema.ts`, `app/components/sections/contact/general-inquiry.tsx`, `.env.local.example`
- `app/contact/page.tsx` (wired in above LocationsSection), `.gitignore` (`!.env*.example` exception), `package.json`/`package-lock.json` (`resend`, `@hookform/resolvers`)
- `DECISIONS.md` (D-047), `PROJECT_MASTER.md` (Step 12 update, Current Position), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The zod `.transform()`/RHF generic-type mismatch above — caught by `tsc`, fixed before shipping, not a runtime bug.

**Problems solved:**
- A real, working (pending only a real API key) email-send integration built from already-installed dependencies, with the "don't fake success" requirement verified by actually triggering the failure path live, not just written into the code and assumed correct.

**Still open / needs verification:**
- **BLOCKING:** a real `RESEND_API_KEY` from Mohammad (see Current Status/Next Steps #1 for exactly what to supply and where it goes) — required before the real-send proof this task explicitly asked for can be completed.
- Mohammad's review of `/contact` (D-046/D-047), `/industries` (D-044), the Cyber Health ambient hero (D-043), and How We Work (D-036/D-037/D-038) — all pending.
- Nav contrast (visual check only, carried over) — still the only long-standing open item.

**Next recommended step:**
- Get the real `RESEND_API_KEY` from Mohammad, wire it into `.env.local`, run and prove a real test send. Otherwise: awaiting review of the several items above; Step 10 (Resources/Insights) once those clear.

---

### 2026-08-15 (continued 3) — Contact page built (Step 12, D-046) + Instagram link fixed
**Completed:**
- User supplied `Oragrol_Contact_Page_Content.md` with an explicit two-path structure superseding Step 12's original generic-form outline: Path 1 "New to Oragrol" → the Cyber Health assessment; Path 2 "Existing client / urgent" → direct phone/email + "Under attack?" — kept visually/functionally separate, not merged into one form. Reused the hero headline ("Let's make security clearer.") from the original outline since it's still the same locked line; dropped "Book a consultation" since no real booking destination exists anywhere in the project (flagged, not invented).
- Built `locations-data.ts` — a typed `Location[]` array. Thunder Bay's fields copied verbatim (real address/phone/email/hours). Every Toronto field is the literal `[pending]` marker from the source, rendered per-field as a "Coming soon" `Badge` — not blank, not backfilled with Thunder Bay's values. Toronto renders as the visually primary card (larger, accent border/tint, "Operations" label); Thunder Bay renders smaller/secondary, explicitly "Registered Office."
- Caught and avoided a real pitfall before it shipped: the location cards needed a heading size between `H3`'s two existing tiers. Overriding `H3`'s size via `className` would have emitted two conflicting `text-*` utilities for the same element — the exact plain-`cn()`-concatenation gotcha `cn.ts`/`typography.tsx` already document. Used a plain `<h3>` with one complete class string instead of fighting the shared component's own size table.
- Path 2's "Under attack?" CTA is a real `tel:` link to Thunder Bay's confirmed number, not a link back to `/contact` — that would be circular now that this page IS `/contact` and the sitewide pill (D-045) already points here. Path 1 reuses the exact same `AssessmentCta`/Tally destination used everywhere else. Deliberately no closing `FinalCta` on this page (every other page has one) — `FinalCta` itself points at `/contact`, so it would point the page at itself.
- Instagram fix (separate item, same session): grepped the whole repo for `instagram` first — confirmed exactly one live `href` existed (`SiteFooter`'s `href="#"` placeholder, D-017); no separate hardcoded instance anywhere else, including the new Contact page (which doesn't render social icons). Updated to `https://www.instagram.com/oragrolglobal`, added `target="_blank"`/`rel="noopener noreferrer"` to match the LinkedIn icon's existing pattern, removed the now-inaccurate "(coming soon)" `aria-label`.
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean (`/contact` now static, 12 total routes). Playwright confirmed — scoped to `<main>`, since the header nav has its own same-text CTA that a naive query would wrongly match — Path 1's CTA resolves to the real Tally URL; Path 2's CTA resolves to `tel:+16133150328`; the email link resolves to `mailto:info@oragrolglobal.com`; exactly 4 "Coming soon" badges render; both "Registered Office"/"Operations" labels are present. Post-edit grep: zero remaining `href="#"` in any `.tsx` file; exactly one hit for the real Instagram URL. Screenshots sent to the user showing both location cards (pending-state styling included) and the footer.

**Files changed:**
- New: `app/contact/page.tsx`, `app/components/sections/contact/{hero,two-path,locations,locations-data}.tsx/.ts`
- `app/components/site/site-footer.tsx` (Instagram href + comment)
- `DECISIONS.md` (D-046), `PROJECT_MASTER.md` (Step 12 → IMPLEMENTED, Current Position), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The `H3` size-conflict pitfall above — caught and avoided before it shipped, not a real bug in the final code.

**Problems solved:**
- Step 12 built from a real content brief with a genuinely different (better-specified) structure than the original placeholder outline, without silently dropping the "Book a consultation" CTA's absence — flagged instead.
- Instagram's last remaining dead link on the site replaced with the real URL.

**Still open / needs verification:**
- Mohammad's review of `/contact`, `/industries` (D-044), the Cyber Health ambient hero (D-043), and How We Work (D-036/D-037/D-038) — all pending.
- Toronto's address/phone/email/hours remain genuinely unconfirmed — do not fill in without a real supplied value.
- Nav contrast (visual check only, carried over) — still the only long-standing open item.

**Next recommended step:**
- Awaiting Mohammad's review of the several items above; Step 10 (Resources/Insights) once those clear.

---

### 2026-08-15 (continued 2) — Emergency CTA placeholder number removed (D-045)
**Completed:**
- User instructed removing D-017's temporary Malaysian emergency number from the "Under attack?" floating pill site-wide, replacing it with a text-only CTA linking to `/contact` — "Under attack? Contact us now," same pill styling/icon/position.
- Grepped the whole repo for the number and its `tel:` variant first, per this project's "investigate before editing" discipline: found exactly one component, `EmergencyCta`, rendered once from `RootLayout` (already site-wide, including behind the footer) — no separate hardcoded footer instance existed to find.
- Edited `EmergencyCta`: `<a href="tel:...">` → `next/link` `<Link href="/contact">`; deleted the phone-number constants entirely (not just hidden/commented out); kept `PhoneCall` icon, pill classes, and fixed bottom-right position untouched, per explicit instruction. Also stripped the literal digits out of the component's own code comment — the requirement was "no longer appears anywhere," which a comment would have violated even though it doesn't render.
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean. Post-edit grep for the exact digit sequence across the repo: zero hits outside `DECISIONS.md`/`PROJECT_MEMORY.md` (the permanent historical record, correctly left alone). Playwright-confirmed on 3 different pages (`/`, `/cyber-health`, `/industries`) that the pill's text and `href` are both correct — not assumed from editing one call site, since the component is global.

**Files changed:**
- `app/components/site/emergency-cta.tsx`
- `DECISIONS.md` (D-045, D-017 cross-reference update), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- None — straightforward single-component change, no surprises.

**Problems solved:**
- D-017's "temporary placeholder, replace before launch" flag is now moot for the phone number specifically (no number shown at all). Instagram's separate placeholder from the same D-017 round is untouched, still open.

**Still open / needs verification:**
- Instagram `href="#"` placeholder (D-017, unrelated to this change).
- Mohammad's review of `/industries` (D-044), the Cyber Health ambient hero (D-043), and How We Work (D-036/D-037/D-038) — all still pending from prior sessions.

**Next recommended step:**
- Awaiting Mohammad's review of the several items above; Step 10 (Resources/Insights) once those clear.

---

### 2026-08-15 (continued) — Industries page built (Step 9, D-044)
**Completed:**
- User supplied `ORAGROL_INDUSTRIES_CONTENT_CANADA.md` (Mohammad's real, fact-checked-against-Canadian-Centre-for-Cyber-Security/OSFI content brief) plus an explicit structure spec: desktop left sidebar / mobile horizontal scrollable tabs, a right detail panel with 4 fields (Risk/Priorities/Approach/Next Step), instant swap on click (no reload, no accordion), active/inactive styling reusing Services' existing weight-600/weight-400-muted convention, and a typed content array separate from component logic.
- Researched the interaction pattern first, same discipline as Services/How We Work: `ui-ux-pro-max`'s `ux` domain (keyboard-nav/focus-state/tab-order guidance) and a `21st.dev` component search for "sidebar tabs detail panel selector," both confirming this is the WAI-ARIA "Tabs" pattern — a `tablist` of `tab`s driving one `tabpanel` via state — not a same-page anchor-nav list like Services' `CategoryNav` (that one scroll-spies real hrefs to always-rendered sections; here only one panel is ever on screen).
- Built `IndustriesExplorer`: real `role="tablist"`/`tab`/`tabpanel` semantics on `<button>`s (not `NavLink`, which is a real page-navigating `<Link>`) with full keyboard support (Arrow/Home/End, roving `tabIndex`). Active/inactive styling reimplements `NavLink`'s locked `size="lg"` split (D-019) rather than inventing a new rule. Desktop: sticky vertical tablist. Mobile: the identical tab set rendered horizontally with `overflow-x-auto`/`whitespace-nowrap` — verified zero horizontal overflow at 390px.
- Built `industries-data.ts` — all 9 industries as a typed array, content copied verbatim. **Verified byte-for-byte via a Node script** that parses the source `.md` and diffs every field against the built array programmatically (not a visual read-through) — all 9 industries × 4 fields matched exactly on the first pass.
- `nextStep.kind` routes each CTA to the correct real existing target (not new content): "Get Your Cyber Health Score" → the live Tally assessment via the existing `AssessmentCta`; every "Talk to Oragrol About X" variant → `/contact`, same as every other "Talk to Oragrol" CTA site-wide.
- Flagged rather than silently decided: no separate abstract-line-motif hero visual was built (D-008's original direction) — the structure spec given this round didn't call for one, and the interactive explorer itself is the "revealed via interaction" element; a future round could still add one. Also reused `FinalCta` at the page bottom (consistency with every other shipped page, not explicitly requested — flagged as a choice, not invented content).
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean (`/industries` now a static route, 11 total). Playwright clicked through 3 industries confirming the panel swaps to the correct real content every time (checked via `innerText`, not a glance); keyboard `ArrowDown` correctly moved tab selection; zero horizontal overflow at 390px. Screenshots sent to the user showing two different industries selected plus the mobile tab bar.
- Surfaced, not fixed (out of scope): the sitewide floating "Under attack?" widget can visually overlap the panel's Next-Step CTA button at some scroll positions on this page — a pre-existing floating-element layout issue, not specific to Industries.

**Files changed:**
- New: `app/industries/page.tsx`, `app/components/sections/industries/{hero,industries-explorer,industries-data}.tsx/.ts`
- `DECISIONS.md` (D-044), `PROJECT_MASTER.md` (Step 9 → IMPLEMENTED, Current Position), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The pre-existing "Under attack?" widget overlap noted above — real, but out of scope for this instruction.

**Problems solved:**
- Step 9 fully built from a real, sourced content brief with byte-for-byte verification, not a paraphrase — matching this project's content-accuracy discipline (CLAUDE.md §8) for client-facing MSSP copy.

**Still open / needs verification:**
- Mohammad's review of `/industries`.
- Awaiting Mohammad's review of Step 8 (How We Work) and the Cyber Health ambient hero (D-043) — both still open from prior sessions.
- Nav contrast (visual check only, carried over) — still the only long-standing open item.

**Next recommended step:**
- Get Industries reviewed; Step 10 (Resources/Insights) is next once outstanding reviews clear.

---

### 2026-08-15 — Cyber Health ambient hero shipped live (D-043)
**Completed:**
- User (in-session, standing in for Mohammad's sign-off) gave the final go-ahead on D-043's prototype: replace `GaugeVisual` with `HeroAmbientLoader` in the live hero, and explicitly re-specified the wording — "Assess." → "Prioritize." → "Protect." every ~2.2s — resolving last session's flagged wording note in favor of keeping the original words as given rather than reconciling with the locked How We Work vocabulary.
- Confirmed nothing needed building from scratch: the D-043 prototype (`hero-ambient-loader.tsx`, `RotatingRing`/`FadeText` extracted into `ai-loader.tsx`) already satisfied every requirement (persistent/no isLoading flag, reduced-motion, IntersectionObserver offscreen-pause, `--color-accent`/`--color-background` tokens only, headline/subhead/CTAs untouched) — wired it in rather than re-deriving it.
- `hero.tsx`: swapped the `GaugeVisual` import/usage for `HeroAmbientLoader`, added an inline comment pointing to D-043. Removed `/cyber-health/prototype-hero` and the prototype-only `CyberHealthHeroAmbientPrototype` component, per the same prototype-lifecycle convention as D-039/D-040 and D-041/D-042 (noindex prototype routes get deleted once the real decision is made). Updated `cyber-health/page.tsx`'s own doc comment (still referenced `GaugeVisual`). Left `gauge-visual.tsx` itself in place, unused, available for revert — same convention as `StrataVisual` after D-039/D-040.
- Verification: `.next` cleared (stale route-manifest reference to the deleted prototype route caused a transient `tsc` error, resolved by clearing the cache — not a real code problem), then `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean. Dev server restarted clean to clear stale HMR state from the deleted route.
- **Screenshot-methodology finding, surfaced rather than worked around silently:** the Chrome-extension automation tab in this environment reports `document.hidden === true` / `document.hasFocus() === false` even immediately after an explicit click on the page, regardless of `tabs_create_mcp`d fresh tabs — Chrome throttles/freezes CSS animations and `setInterval` timers on such tabs, which produced a string of misleading screenshots (the fade-in stuck at "P", then "PR", advancing by roughly one letter per screenshot call — consistent with Chrome forcing exactly one paint per `captureScreenshot` call and otherwise freezing the compositor). Diagnosed via direct DOM query (`getComputedStyle(letterSpan).opacity` reading `0` for every letter of "Prioritize." while screenshots showed partial glyphs) before concluding it was a capture artifact, not a real animation bug. Switched to the project's own documented method (CLAUDE.md §7: Playwright via `playwright-core`, scripted from the scratchpad) instead of fighting the extension — Playwright's headless page has no such hidden-tab throttling, and correctly captured all three required states on the first pass: (a) live proof screenshot with "PRIORITIZE." fully opaque and the ring mid-spin, sent to the user; (b) reduced-motion context — 0 `.animate-spin` elements, static "Assess. Prioritize. Protect." label; (c) scroll-based IntersectionObserver check — `.animate-spin` count 1 in view → 0 scrolled to page bottom → 1 back in view.

**Files changed:**
- `app/components/sections/cyber-health/hero.tsx` (`GaugeVisual` → `HeroAmbientLoader`)
- `app/cyber-health/page.tsx` (doc comment only)
- Deleted: `app/cyber-health/prototype-hero/page.tsx`, `app/components/sections/cyber-health/hero-ambient-prototype.tsx`
- `DECISIONS.md` (D-043 status → shipped)
- `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The Chrome-extension screenshot-throttling issue above — real, but a tooling/environment artifact, not a defect in the shipped code (confirmed by the DOM-level opacity check and by the clean Playwright capture of the same page).

**Problems solved:**
- D-043 fully closed: prototype → live, with direct-evidence proof (not code-level claims) for every one of the 7 stated requirements.

**Still open / needs verification:**
- Step 9 — Industries content brief, not yet received.
- Nav contrast (visual check only, carried over) — still the only long-standing open item.

**Next recommended step:**
- Step 9 — Industries, once Mohammad sends the per-industry content brief.

---

### 2026-08-14 (continued 24) — Cyber Health hero gauge reopened, ambient rotating-ring loader prototyped; wording flag surfaced (D-043)
**Completed:**
- Mohammad reopened D-008's `GaugeVisual` hero visual, requesting a persistent ambient animated visual reusing D-042's `AiLoader` ring rather than duplicating it, with 5 required changes for the different (continuous, page-lifetime) use case: no action language, reduced-motion holding indefinitely, verified performance with offscreen throttling if needed, locked color palette, and preserved headline/subhead/CTAs. Prototype-first, same as every prior visual-change round.
- Refactored `ai-loader.tsx` to export `RotatingRing` (now takes a `spinning` prop) and `FadeText` (now takes a `wordKey`) as shared building blocks, rather than copy-pasting the ring/fade-text markup into a new file — genuine reuse, not superficial. `AiLoader` itself now composes these internally; verified the refactor is byte-identical in output to the pre-refactor version (`RotatingRing size={96}` reproduces the original `h-24 w-24`/`inset-3` geometry exactly).
- Built `HeroAmbientLoader`: cycles through Mohammad's exact given words ("Assess." / "Prioritize." / "Protect.") every 2.2s via `setInterval`, gated off entirely (never started) when `usePrefersReducedMotion` is true — verified by sampling DOM state at t=0s and t=8s under `reducedMotion: 'reduce'`, both showing zero `.animate-spin` elements and the same static text, not just checked once at the start. An `IntersectionObserver` on the wrapper pauses the ring's CSS animation and the word-cycle interval when scrolled out of view — verified `.animate-spin` count is 1 in view, 0 once scrolled away.
- Performance measured, not assumed: 59fps sampled on desktop (normal CPU), 61fps sampled at a 390px viewport under CDP 4x CPU throttling — a CSS-only, compositor-driven animation, no meaningful cost either case, offscreen-pausing implemented regardless since this now runs indefinitely per visitor rather than AiLoader's brief 2.6s.
- A wording note flagged, not silently resolved either way: Mohammad's given words only partially match the already-locked How We Work 4-stage vocabulary ("Understand/Prioritize/Protect/Improve," D-035/D-036) — "Assess" isn't one of the four. Built with his words exactly as given, per his own explicit "confirm with me if you want different wording" invitation — surfaced for his decision, not changed unilaterally.
- Built `/cyber-health/prototype-hero`: shows the current live hero (`CyberHealthHero`, `GaugeVisual`, unchanged) stacked above the new prototype (`CyberHealthHeroAmbientPrototype`, `HeroAmbientLoader`) with identical copy, same comparison pattern as D-039's Kinetic Grid prototype. `hero.tsx`/`GaugeVisual` completely untouched.
- Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean (10 routes); fresh clean rebuild; zero horizontal overflow at 1920/390px; both normal-motion and reduced-motion states screenshotted and reviewed directly (with proper scroll-through wait before capture, this project's established methodology for avoiding false "content missing" alarms from unfired `Reveal` animations).

**Files changed:**
- Refactored: `app/components/sections/cyber-health/ai-loader.tsx` (extracted `RotatingRing`, `FadeText`)
- New: `app/components/sections/cyber-health/hero-ambient-loader.tsx`, `app/components/sections/cyber-health/hero-ambient-prototype.tsx`, `app/cyber-health/prototype-hero/page.tsx`
- `DECISIONS.md` (D-043), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- None — this was a clean build. One thing flagged rather than silently resolved: the wording partial-mismatch with How We Work's locked stage names.

**Problems solved:**
- Reused (not duplicated) D-042's ring/fade-text visual treatment across two structurally different use cases (brief overlay vs. persistent hero) via a genuine shared-component extraction, per the instruction's explicit requirement.

**Still open — needs Mohammad's input, not resolved unilaterally:**
- Approval/rejection of the ambient hero visual itself.
- The wording flag: keep "Assess./Prioritize./Protect." as given, or align to the locked How We Work vocabulary instead.

**Next recommended step:**
- Await Mohammad's review of `/cyber-health/prototype-hero` and his wording decision before wiring into the live page.

---

### 2026-08-14 (continued 23) — Cyber Health loader repurposed to a generic transition, wired live into both CTAs; /cyber-health/prototype-loader removed (D-042)
**Completed:**
- Mohammad confirmed D-041's architecture finding was correct and directed a repurpose: "this shouldn't narrate real backend steps that aren't actually visible to the frontend... Repurpose the loader as a brief, generic transition only — a few seconds showing something like 'Preparing your assessment...' before redirecting to the Tally form... Keep the color remap, reduced-motion handling, and clean component work you already did. Wire this in as the loading state shown during the click-to-redirect transition to Tally."
- Rewrote `ai-loader.tsx`: removed the `STEPS` array, `stepIndex` state, and `setInterval`-based advancement entirely; replaced with one static `MESSAGE = "Preparing your assessment..."` constant. Visual treatment (rotating conic-gradient ring, layered inset-shadow core, letter-by-letter fade text) and the reduced-motion-gated static-label fallback are otherwise unchanged from D-041.
- Designed around a real risk before building the wrong thing: a JS-triggered `window.open()` inside a delayed `setTimeout` loses the synchronous-user-gesture context browsers require, and would very likely get silently popup-blocked on this live, revenue-critical path. Built a new `AssessmentCta` wrapper instead — the underlying element stays a genuine `<a target="_blank" rel="noopener noreferrer">` with no `preventDefault`, so native navigation (middle-click, right-click, keyboard) is completely unmodified; the `onClick` handler shows a fixed full-screen overlay containing `AiLoader` alongside that native navigation, for 2.6s, then auto-hides.
- Wired `AssessmentCta` into both of Cyber Health's "Get Your Cyber Health Score" CTAs — `hero.tsx` and `closing-cta.tsx`. Secondary "Talk to Oragrol" buttons (internal `/contact` links) untouched.
- Removed `/cyber-health/prototype-loader`, same lifecycle as every prior prototype route this session.
- A locator mistake caught mid-verification, not misreported: the first Playwright pass matched SiteHeader's own nav CTA (same accessible name, different `href`, internal `/cyber-health` link) instead of the hero's real `AssessmentCta`. Confirmed via `outerHTML` inspection before concluding anything, then re-scoped to `a[href*="tally.so"]`. A one-off timing flake in that same first run (overlay screenshot landed empty due to unusually slow new-tab-open latency that run) was distinguished from a real bug by re-running twice more (both passed) and by an isolated timing trace sampling overlay presence at 9 checkpoints from t+50ms to t+2864ms, which showed consistent, correct behavior throughout.
- Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean (9 routes, prototype route confirmed gone); fresh clean rebuild; Playwright confirmed real Tally navigation via `context.waitForEvent('page')` in both normal-motion (hero) and reduced-motion (closing-cta) contexts; screenshotted both states; confirmed zero `.animate-spin` elements in the reduced-motion overlay; zero horizontal overflow; console 404s traced to pre-existing RSC prefetches for not-yet-built nav routes, confirmed unrelated to this change via a clean pageload with no clicks.

**Files changed:**
- Rewrote: `app/components/sections/cyber-health/ai-loader.tsx`
- New: `app/components/sections/cyber-health/assessment-cta.tsx`
- Edited: `app/components/sections/cyber-health/hero.tsx`, `app/components/sections/cyber-health/closing-cta.tsx`
- Removed: `app/cyber-health/prototype-loader/page.tsx`
- `DECISIONS.md` (D-042), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- A test-locator mistake (matched the wrong CTA) and a one-off timing flake — both caught and correctly diagnosed as test artifacts, not product bugs, before being reported as anything.

**Problems solved:**
- D-041's open architecture question (whether/where the loader should attach) is now fully resolved per Mohammad's explicit direction — no longer a blocking item.
- Popup-blocker risk on a live, revenue-critical CTA designed around proactively, not discovered after shipping.

**Still open / needs verification:**
- Order of Step 9 (Industries) content brief — not yet supplied.
- Nav contrast (visual check only, carried over) — still the only long-standing open item.

**Next recommended step:**
- Step 9 (Industries) needs a full per-industry content brief from Mohammad before it can be built.

---

### 2026-08-14 (continued 22) — Cyber Health processing-screen loader prototyped natively; two premise checks surfaced (D-041)
**Completed:**
- Mohammad requested an "ai-loader" processing animation for Cyber Health, framed as filling an already-documented "Processing Screen" spec gap, with a source code block that came through empty. Searched `21st.dev` first (same recovery approach that worked for Kinetic Grid) — no confident match this time; the described bugs (raw `class` attributes, missing base CSS, a specific purple/pink palette, dead `useState`) read as a non-21st.dev HTML/CSS snippet this project has no search access to. Built a native implementation of the described EFFECT instead — flagged explicitly as such, not presented as literally sourced code.
- Checked the instruction's stated premise before building further, per this project's own discipline: grepped all project docs for "Processing Screen" and the 5 named steps — zero hits, no such spec section exists in this repo. More significantly, confirmed via `PROJECT_MASTER.md` Step 7 (an existing, already-documented architectural decision) that this codebase has NO in-app processing pipeline at all — the real Assessment/Score/AI-Analysis/CRM flow runs entirely on the external, already-live Tally MVP. Displaying a fake "Calculate Score → ... → Update HubSpot" progress animation as if this app performs those steps would misrepresent the product — a real Honesty Rule concern surfaced and reported, not silently built around.
- Proceeded with the requested prototype anyway (the instruction itself already scoped "wiring into live" as a separate, later step) — built `AiLoader`: a rotating conic-gradient ring with a layered inset-shadow core (reusing the `color-mix()`-via-inline-style technique already established for `capability-spotlight.tsx`'s icon badge), letter-by-letter fade-up text cycling through the exact 5 given step names, and `usePrefersReducedMotion`-gated fallback (plain static label, no ring at all, when reduced motion is on).
- Verified all 5 required fixes with direct evidence: each of the 5 step states individually screenshotted and confirmed via exact DOM text match (not timing alone); reduced-motion state confirmed to contain zero ring/animation elements via a precisely-scoped query (an initial broader check gave a false positive from an unrelated `aria-hidden` element elsewhere on the page — caught and corrected before concluding anything); confirmed text still advances through all 5 steps under reduced motion (only the visual animation is gated, not the underlying progress info); confirmed live `/cyber-health` has zero loader-related content — nothing wired in.
- Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (10 routes); fresh clean rebuild; zero overflow.

**Files changed:**
- New: `app/components/sections/cyber-health/ai-loader.tsx`, `app/cyber-health/prototype-loader/page.tsx`
- `app/globals.css` (one new `@keyframes` for the letter-fade effect — first custom keyframe in the file)
- `DECISIONS.md` (D-041), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- Missing source code (resolved via native rebuild, flagged).
- The "Processing Screen" spec claim doesn't match this repo's record.
- A real architectural mismatch: this codebase has no in-app pipeline for a processing screen to represent honestly.
- A false-positive in my own first verification check (too-broad selector) — caught and corrected within the same round.

**Still open — needs Mohammad's input, not resolved unilaterally:**
- Whether/where this loader should attach to the live Cyber Health page, given it has no real in-app process to represent.

---

### 2026-08-14 (continued 21) — Kinetic Grid shipped to live Solutions hero, re-verified; /solutions/prototype removed (D-040)
**Completed:**
- Mohammad approved D-039's prototype: "Approve the Kinetic Grid hero for Solutions. Ship it... Update DECISIONS.md to log this as an intentional replacement of D-008's original hero." Applied the exact same change from the prototype to the live `hero.tsx` — `KineticGrid` replacing `StrataVisual`, copy unchanged. Deleted `app/solutions/prototype/` and the prototype-only `hero-kinetic-prototype.tsx` component.
- Re-ran the full verification suite against the LIVE page, not assumed to still hold from the prototype: fresh clean rebuild, `tsc`/`lint`/`build` clean (9 routes, `prototype` confirmed 404); canvas scoping re-measured (1920×520px on a 2530px page); background pixel re-sampled (exactly `rgb(10,10,10)`); reduced-motion frame re-sampled twice 600ms apart (byte-identical, confirms no animation); zero overflow at 1920/390px; confirmed via DOM query the hero section has a `<canvas>` and no `<svg>` (no `StrataVisual` remnant); full-page screenshot reviewed directly.
- Logged D-040 per Mohammad's explicit instruction, framed as an intentional replacement of D-008's decision, not a defect fix — D-008 itself stays in the record unchanged as history.

**Files changed:**
- `app/components/sections/solutions/hero.tsx` (live: `KineticGrid` replaces `StrataVisual`)
- Deleted: `app/solutions/prototype/page.tsx`, `app/components/sections/solutions/hero-kinetic-prototype.tsx`
- `DECISIONS.md` (D-040), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Still open, unrelated to this change:**
- `StrataVisual`'s file remains unused in the codebase, kept for a possible revert.
- SiteHeader's dark-environment-on-entry assumption — long-standing, not newly introduced.

**Next recommended step:**
- Confirmed with Mohammad: next unbuilt page is Step 9 (Industries) — needs its own per-industry content brief before building, not started yet.

---

### 2026-08-14 (continued 20) — Solutions hero reopened: Kinetic Grid prototype, all 5 required modifications verified with direct evidence (D-039)
**Completed:**
- Mohammad explicitly reopened Solutions' already-approved D-008 hero visual, requesting a specific "Kinetic Grid" component (sourced via 21st.dev) as the new background. The instruction's own code block came through empty. Rather than block a second time on a missing-content issue, searched `21st.dev` directly and found an exact match ("Kinetic Grid," satoriui, id 18254) — confirmed via `get_component` that its name, description, and exact technical details (theme prop shape, `fixed inset-0`/`min-h-screen`) matched the instruction's own description before treating it as the real source.
- Built all 5 required modifications: (1) scoped to the hero via `ResizeObserver` + wrapper-relative coordinates, not `window`; (2) color remapped to `tokens.css`'s own raw hex values (`#0a0a0a` background, `#018abe` accent), monochrome variant removed entirely; (3) reduced-motion support via the existing `usePrefersReducedMotion` hook, one static frame instead of the rAF loop; (4) performance measured, not assumed; (5) existing Solutions hero copy preserved verbatim.
- Initially edited the LIVE `hero.tsx` directly — caught this immediately (the instruction explicitly said prototype at `/solutions/prototype` first) and reverted via `git checkout` before building the actual prototype route correctly.
- Caught and fixed a real lint error (not just a functional bug): the sourced component's own recursive `requestAnimationFrame(animate)` inside a `const animate = useCallback(...)` tripped a `react-hooks` self-reference rule. Fixed with a hoisted local `function` declaration instead.
- Caught two screenshot-timing false alarms (both normal and reduced-motion captures initially appeared to show the prototype's headline missing) — same category this project has now hit multiple times. Confirmed via computed-style query before re-capturing with proper scroll-through, which showed correct rendering in both cases.
- Verified with direct evidence, not assumption, for every one of the 5 required items: canvas bounding box measured (520px tall on a 2380px page, not viewport-fixed); background pixel sampled via `getImageData` (exactly `rgb(10,10,10)`); reduced-motion frame sampled twice 600ms apart and found byte-identical (proves no animation running); FPS measured via a real rAF-sampling script (60fps at 1920px, 56fps at 390px under a CDP 4x CPU throttle); live `/solutions` confirmed to have zero `<canvas>` elements (untouched).
- Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (10 routes); fresh clean rebuild; zero overflow at 1920/390px.

**Files changed:**
- New: `app/components/sections/solutions/kinetic-grid.tsx`, `hero-kinetic-prototype.tsx`, `app/solutions/prototype/page.tsx`
- `app/components/sections/solutions/hero.tsx` — reverted to original after an accidental direct edit, confirmed unchanged
- `DECISIONS.md` (D-039), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- Missing source code in the instruction (resolved via direct 21st.dev search, not blocking).
- A real lint error in the sourced component's own recursive rAF pattern.
- Two screenshot-timing false alarms — both correctly diagnosed before being reported as real.
- My own process slip (editing the live file before the prototype) — caught and reverted within the same turn.

**Still open:**
- Mohammad's review and approval before shipping to the live `/solutions` page.

---

### 2026-08-14 (continued 19) — Home teaser's matching connector-line bug fixed (D-038)
**Completed:**
- Mohammad confirmed fixing `home/how-we-work.tsx`'s matching bug (flagged during D-037's investigation). Applied the identical Grid-based fix — circle in `sm:col-start-2`, content alternating left/right, text-aligned toward the spine. Mobile untouched.
- Verified: fresh clean rebuild, `tsc`/`lint`/`build` clean (9 routes); Playwright measurement at both 1920px and 390px confirms 0px delta between every circle's center and the spine's center (even tighter than the new page's 1px sub-pixel gap); zero overflow at both widths; screenshots reviewed directly at both widths, confirming the fix visually; confirmed Approach's separate horizontal 4-stage section (same labels, unrelated layout) is unaffected.

**Files changed:**
- `app/components/sections/home/how-we-work.tsx` (Grid-based circle-centering fix, same technique as D-037)
- `DECISIONS.md` (D-038), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Still open:**
- Mohammad's review of the overall How We Work page build (D-036/D-037) and this Home fix.

---

### 2026-08-14 (continued 18) — Stage Sequence connector-line bug fixed; cited reference component found to have the identical bug (D-037)
**Completed:**
- Mohammad reported the connector line doesn't pass through the alternating stage circles, and named `home/how-we-work.tsx`'s own teaser as a working reference to check against. Investigated the reference directly before assuming it was correct — measured its actual live circle and spine positions (not read from source alone): circles at x=340/1100, spine at x=720, at 1440px. The reference has the exact same disconnect, confirmed via both DOM measurement and a direct screenshot of that section. Reported this rather than either silently copying a broken pattern or silently staying quiet about the reference also being wrong.
- Root cause identified in both components: a fixed-position spine (`left-1/2 -translate-x-1/2`) combined with `flex-row-reverse` alternation, which packs each row's circle+content toward that row's own flex-start edge (alternating left/right) — never toward the actual center where the spine sits.
- Real fix, not a reference-matching patch: restructured the `sm:`+ layout as CSS Grid with the circle always explicitly in the center column (`sm:col-start-2`, the same column the spine targets) — guaranteed by construction, not incidental row width. Content alternates into the left or right column depending on stage, text-aligned toward the spine. Mobile (already correct, single left-aligned column) untouched.
- Verified the specific requirement (screenshots at 1920px and 390px showing the line passing through each circle) with actual measurement, not just a screenshot glance: at 1920px, all 4 circles' center-x exactly matches the spine's center-x (0px delta). At 390px, 1px delta (sub-pixel rounding). Screenshots at both widths confirm this visually.
- Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (9 routes); fresh clean rebuild; zero overflow at 1920/390px.
- Flagged, not actioned: `home/how-we-work.tsx` still has the same bug — out of scope for this instruction (different page), left for Mohammad's decision.

**Files changed:**
- `app/components/sections/how-we-work/stage-sequence.tsx` (Grid-based circle-centering fix)
- `DECISIONS.md` (D-037), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The reported bug (real, confirmed).
- The cited reference component has the identical bug — a real finding surfaced during investigation, not something Mohammad had asked to be checked, reported anyway per this project's own "don't stay quiet about it" discipline.

**Still open:**
- Mohammad's review of the fix.
- Whether to also fix `home/how-we-work.tsx`'s matching bug.

---

### 2026-08-14 (continued 17) — Step 8 (How We Work) content-complete: full page built from supplied copy, byte-for-byte verified (D-036)
**Completed:**
- Mohammad supplied the real page copy (hero headline/subhead, 4 full stage paragraphs, closing band). Built the full page around the already-approved-pending hero visual: `HowWeWorkHero` (headline/subhead + the D-035 visual, White environment — kept deliberately, since the visual is a nested dark panel that needs a lighter surrounding environment to read as elevated, explained in the component's own comment), `StageSequence` (4 full-paragraph stages, a page-level scale-up of `home/how-we-work.tsx`'s own vertical spine+circle teaser pattern — the same "reuse the technique, scale it up" move Cyber Health's `Flow` already made from `Approach.tsx`), `HowWeWorkClosingCta` (page-specific, single button, same ring/dark visual family as `FinalCta`/Cyber Health's `ClosingCta` but its own component since the given copy doesn't match either).
- Verified copy fidelity with actual evidence, not a glance: wrote a Playwright script asserting byte-for-byte string equality between the supplied text and the rendered DOM for all 12 content pieces (headline, subhead, 4 stage titles, 4 stage paragraphs, closing headline, closing button). All 12 passed exactly.
- Caught and correctly diagnosed a screenshot false alarm: the first mobile full-page screenshot appeared to show the Stage Sequence section completely blank. Investigated via computed-style query before concluding anything — confirmed `opacity: 1`, correct position, fully visible; root cause was the screenshot script's 400ms per-scroll wait being too short for the section's staggered `Reveal` animations, the same category of false alarm this project's own history already has a precedent for (Cyber Health's `Flow`). Re-captured with a longer wait and confirmed all 4 stages render correctly.
- Flagged one judgment call rather than silently resolving it: the hero visual's own short stage one-liners now sit directly above the Stage Sequence's full-paragraph versions of the same 4 stages. Left unchanged (wasn't asked to revise the hero visual), flagged for Mohammad's read on whether the repetition is intentional or redundant.
- Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (9 routes); fresh clean rebuild; zero overflow at 1440/390px; `noindex` removed now that real content exists.

**Files changed:**
- New: `app/components/sections/how-we-work/hero.tsx`, `stage-sequence.tsx`, `closing-cta.tsx`
- `app/how-we-work/page.tsx` (rebuilt to compose the 3 new sections, `noindex` removed)
- `DECISIONS.md` (D-036), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The mobile screenshot false alarm — caught and correctly diagnosed within this same round, not left for Mohammad to discover.

**Still open / needs verification:**
- Mohammad's review of the finished page.
- His read on the hero-visual/Stage-Sequence content echo, flagged above.

**Next recommended step:**
- Await review. If approved, ask whether to continue to Step 9 (Industries) or handle further How We Work feedback first.

---

### 2026-08-14 (continued 16) — Step 8 (How We Work) started: hero visual built and self-verified; page copy flagged as missing, not invented (D-035)
**Completed:**
- Mohammad's build instruction for Step 8 was meant to include the full page copy, prefixed with clear instructions not to invent/add/reword anything. The message's copy section contained only the literal placeholder text `[PASTE THE FULL COPY ABOVE HERE]` — no real content. Flagged this immediately rather than guessing what the copy might have said or building placeholder-quality text to fill the gap.
- Did the requested research anyway, since it didn't depend on the missing copy: `ui-ux-pro-max --domain chart` for cyclical/loop process data (Sankey/Process Mining both flagged with real accessibility caveats, rejected — same category of mismatch as Capability 08's earlier research); `mcp__21st__search` for a circular/looping component (nothing literally cyclical surfaced — "Animated Roadmap" is a path, not a closed loop). Built `HowWeWorkCycleVisual` natively instead, reusing this codebase's own proven techniques (`GaugeVisual`'s polar-coordinate math, `HeroSchematicVisual`'s node/connector language) rather than forcing a mismatched import.
- The visual: 4 numbered nodes at compass positions, connected by directional accent arcs with arrowhead markers forming a closed loop — including the literal Improve→Understand closing segment Mohammad specifically asked for. A single slow flowing-dash animation reinforces the cycle, respecting `prefers-reduced-motion` (verified in a dedicated reduced-motion browser context, not just assumed).
- Caught a real bug before build: an early draft applied `font-heading` via className to the shared `Text` component, which already carries `font-body` in its base string — the same `cn()` conflict pattern documented in D-016/D-019. Fixed with a plain `<p>` instead of fighting the shared component.
- Caught and corrected a verification miss within the same round: the first computed-style check used a generic `document.querySelector('svg')`, which grabbed the site header's logo SVG (first in DOM order) instead of the diagram, and appeared to show 0 paths / no marker — looked like a real bug. Re-ran the check scoped specifically to the diagram's own `viewBox` and confirmed the arcs/marker/animation are all genuinely present and correctly computed. Logged the near-miss in `DECISIONS.md` rather than silently correcting it and moving on.
- Built `/how-we-work` (noindex) containing only the confirmed-safe page label, the hero visual, and the instructed CTA text ("Talk to Oragrol" → `/contact`) — no invented headline/body copy. Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (9 routes); fresh clean rebuild; zero overflow at 1440/390px; zero non-pre-existing console errors; screenshots at both widths plus a reduced-motion context reviewed directly.

**Files changed:**
- New: `app/components/sections/how-we-work/cycle-visual.tsx`, `app/how-we-work/page.tsx`
- `DECISIONS.md` (D-035), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The missing copy block (user-message issue, not a code defect) — caught before any content was invented.
- The `font-heading`/`Text` conflict and the wrong-SVG verification miss — both caught and fixed within this same round, not left for a later round to discover.

**Still open / needs verification:**
- The actual "How We Work" page copy, from Mohammad.
- Mohammad's review of the hero-visual prototype itself.

**Next recommended step:**
- Await the real copy block, then build the rest of Step 8 around the now-approved-pending hero visual.

---

### 2026-08-14 (continued 15) — Services signed off complete; docs updated; next page confirmed as Step 8 (D-034)
**Completed:**
- Mohammad gave explicit final sign-off: "Services is approved and complete." Logged D-034 in `DECISIONS.md` closing the entire visual-redesign thread (D-011 through D-034) with a summary of the final state per capability.
- Updated `PROJECT_MASTER.md`: Step 5's status line changed to "SIGNED OFF, COMPLETE," a new paragraph added under it summarizing the Visual Design Correction thread's final state; Current Position (Section 7) updated with the D-034 sign-off and the confirmed next-step identification.
- Read `PROJECT_MASTER.md`'s Build Sequence (Section 3) in full to identify the next page correctly rather than assuming: Steps 6 (Solutions) and 7 (Cyber Health) are already marked IMPLEMENTED — built before the D-009 page-by-page rollout rule existed — so the next PENDING step is **Step 8 — How We Work**. Confirmed this explicitly per Mohammad's own instruction ("confirm which page that is... before starting") rather than starting work on an assumption.
- Trimmed `PROJECT_MEMORY.md`'s Next Steps list — removed now-superseded per-capability shipping bullets (fully captured in `DECISIONS.md` D-021 through D-034 already) and consolidated the durable cross-round lessons (grid stretch, badge-width truncation, illustrative-data flagging, etc.) into one compact list entry instead of six separate ones.

**Files changed:**
- `DECISIONS.md` (D-034), `PROJECT_MASTER.md` (Step 5 + Current Position), `PROJECT_MEMORY.md` (Current Status, Next Steps, this entry)

**Next recommended step:**
- Confirm with Mohammad that Step 8 (How We Work) is correct before starting real build work on it, and check whether a detailed content brief exists beyond the one-line design note already in `PROJECT_MASTER.md`.

---

### 2026-08-14 (continued 14) — Capability 03 extended per Mohammad's confirmation; all 8 capabilities ground-truth-verified; final 1920px sign-off screenshot sent (D-033)
**Completed:**
- Asked Mohammad directly (AskUserQuestion) rather than guessing how to resolve the D-032 discrepancy. He chose: extend the dashboard treatment to Capability 03 now, as a new decision.
- `live-services.tsx`'s `CapabilityVisual` selector now matches both `n === "02"` and `n === "03"` for `CapabilityDashboardVisual`. Component takes no per-capability props (shared illustrative content) — reused as-is, not forked.
- Full verification: killed stray node processes, cleared `.next`, `npm run build`/`tsc`/`lint` all clean (8 routes, no prototype routes remain anywhere); Playwright DOM/text-content check on all 8 rows individually confirms exactly one treatment each, no overlaps, no gaps: 01→orb only, 02→score card, 03→score card, 04→ring, 05→feed, 06→findings, 07→fleet, 08→playbook; zero overflow at 1440/1920/390px; zero non-pre-existing console errors.
- Captured and sent the final full-page 1920px screenshot Mohammad requested, now that Capability 03's state is actually resolved and verified rather than assumed.

**Files changed:**
- `app/components/sections/services/live-services.tsx` (Capability 03 mark extension)
- `DECISIONS.md` (D-033), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems solved:**
- Resolved the D-032 discrepancy correctly — asked rather than guessed, then verified the actual result rather than trusting the instruction alone.

**Still open / needs verification:**
- Mohammad's actual sign-off on the final screenshot — not to be assumed from silence.

**Next recommended step:**
- Await his review. If approved, Services' visual-treatment work is done; ask what's next (another page's visual system, or further Services feedback).

---

### 2026-08-14 (continued 13) — Capability 02 shipped, verified; Capability 03 factual discrepancy found and flagged, not resolved either way (D-032)
**Completed:**
- Mohammad approved D-021's prototype. `live-services.tsx`'s `CapabilityVisual` selector gained a second branch — Capability 02 now renders `CapabilityDashboardVisual`. Deleted `app/services/prototype-v2/` — no prototype routes remain anywhere in the project.
- The same message asked to "confirm Capability 03 still correctly shows the same dashboard treatment (it was approved as an extension of 02 earlier)." Checked this claim directly before doing anything with it: grepped `DECISIONS.md`/`PROJECT_MEMORY.md`/`PROJECT_MASTER.md` for any Capability 03 + dashboard reference — none exists. Re-read D-021's own text: explicitly "prototype ONE new treatment for Capability 02," never mentions 03. Checked the actual current code (`live-services.tsx`'s pre-edit `CapabilityVisual`) — only ever special-cased `n === "04"`, row 03 always fell through to the orb. Confirmed on a fresh production server via DOM/text-content query and a direct screenshot: Capability 03 renders the orb (ghost-numeral marker present), not the score card. The premise in Mohammad's message doesn't match any part of the project record.
- Did not act on the unconfirmed premise either direction — did not silently extend the dashboard treatment to Capability 03 (would be inventing a decision that was never made, un-researched, no prototype/review step), and did not falsely report it as "confirmed correct" (would violate the Honesty Rule — it demonstrably isn't what he described). Flagged the discrepancy directly instead, per this project's own explicit rule for disagreeing with a stated premise.
- Held the "final all 8 distinct" full-page screenshot Mohammad separately requested — generating it now would either misrepresent Capability 03's actual state or require guessing which way he wants it resolved.
- Verified the Capability 02 ship itself thoroughly regardless: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (8 routes); fresh clean rebuild; zero overflow at 1440/390px; zero non-pre-existing console errors; screenshot of rows 02/03 reviewed side by side.

**Files changed:**
- `app/components/sections/services/live-services.tsx` (Capability 02 mark swap)
- Deleted: `app/services/prototype-v2/page.tsx`
- `DECISIONS.md` (D-032), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The Capability 03 discrepancy — a false premise in the user's own instruction, caught by checking the record before acting rather than trusting the stated premise.

**Still open / needs verification:**
- Mohammad's answer on Capability 03 (misremembered, or does he want it extended now as a fresh decision).
- The final 1920px sign-off screenshot, blocked on the above.

**Next recommended step:**
- Await his clarification before generating the requested final screenshot.

---

### 2026-08-14 (continued 12) — Capability 08 shipped live, verified; all 8 capabilities now individually treated; full-page 1920px screenshot for sign-off (D-031)
**Completed:**
- Mohammad approved D-030's prototype. `additional-capabilities.tsx`'s `CapabilityMark` selector gained a fourth branch — Capability 08 now renders `CapabilityPlaybookMark`. Deleted `app/services/prototype-v7/`. This closes the "Capabilities 04-08 shell rethink" thread opened by Mohammad's Round 7 instruction.
- Verified: killed stray node processes, cleared `.next`, `npm run build`/`tsc`/`lint` all clean (9 routes, `prototype-v7` confirmed 404); DOM measurement shows all 4 finalizing cards at their own distinct natural heights (05: 450px, 06: 456px, 07: 370px, 08: 424px) — no stretching, the D-025 `items-start` fix held across all 4 replacements; zero overflow at 1440/1920/390px; zero non-pre-existing console errors.
- Captured the full-page 1920px screenshot Mohammad requested for whole-page review (fresh production server, incremental scroll to trigger all `Reveal` on-scroll animations before capture, zero overflow confirmed at 1920px specifically) and sent it to him.

**Files changed:**
- `app/components/sections/services/additional-capabilities.tsx` (Capability 08 mark swap)
- Deleted: `app/services/prototype-v7/page.tsx`
- `DECISIONS.md` (D-031), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Still open / needs verification:**
- Mohammad's whole-page review of the 1920px screenshot.
- D-021 (Capability 02's dashboard-mockup prototype) remains the only open visual-treatment decision on Services.

**Next recommended step:**
- Await his full-page sign-off or further feedback.

---

### 2026-08-14 (continued 11) — Round 11: Capability 08 (Incident Response) shell prototype — LAST of the 8, self-verified (D-030)
**Completed:**
- Researched before building: `ui-ux-pro-max --domain chart` for process/sequence data (Process Map/Sankey both flagged with real accessibility caveats, too complex for a 4-step plan; UX-domain search confirmed a simple numbered step-sequence indicator instead); `mcp__21st__search` for playbook/timeline components ("How It Works," "How We Do It" — both real connected-step-card patterns, confirmed the mechanic, not imported directly).
- Built `CapabilityPlaybookMark`: 4 connected phases (Detect/Contain/Recover/Review), numbered dots joined by a vertical spine — reusing the "connecting spine" TECHNIQUE Cyber Health's `Flow` already established on this site, at a much smaller scale. A genuinely 5th distinct mechanic among all capabilities addressed.
- Considered and deliberately dropped a risk before building: an early draft showed one phase as "in progress." Dropped because a marketing page simulating a live "currently responding" state risks reading as an actual ongoing incident. All four phases render as an equal-weight static sequence instead.
- Checked the shared-layout risk explicitly and found no issue (mark isn't taller than Capability 07's pictogram, confirmed via the in-context screenshot).
- Built `/services/prototype-v7` (noindex), Capabilities 05/06/07 already reflecting their shipped treatments in both rows so only 08 differs. Self-verified against actual screenshots before reporting (per instruction): full clean rebuild, `tsc`/`lint`/`build` clean (10 routes), zero overflow at 390px, zero non-pre-existing console errors, DOM query confirming live `/services` Capability 08 unaffected, and the final screenshot reviewed directly — connecting line/dots align correctly, all four labels legible, no defects found.

**Files changed:**
- New: `app/components/sections/services/capability-playbook-mark.tsx`, `app/services/prototype-v7/page.tsx`
- `DECISIONS.md` (D-030), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Still open / needs verification:**
- Mohammad's review of D-030 — the last capability. If approved, all 8 have their own researched treatment.

**Next recommended step:**
- Await his decision. If approved and shipped, ask whether Services is now considered fully approved, or whether another review pass is coming before moving to another page.

---

### 2026-08-14 (continued 10) — Capability 07 shipped live, verified (D-029)
**Completed:**
- Mohammad approved D-028's prototype. `additional-capabilities.tsx`'s `CapabilityMark` selector gained a third branch — Capability 07 now renders `CapabilityFleetMark`. Deleted `app/services/prototype-v6/`.
- Verified: killed stray node processes, cleared `.next`, `npm run build`/`tsc`/`lint` all clean (9 routes, `prototype-v6` confirmed 404); DOM measurement of all 4 finalizing cards confirms Capability 08 stays at 252px (unaffected) while 05/06/07 are 450/456/370px; zero overflow at 1440/390px; zero non-pre-existing console errors; screenshot reviewed directly.

**Files changed:**
- `app/components/sections/services/additional-capabilities.tsx` (Capability 07 mark swap)
- Deleted: `app/services/prototype-v6/page.tsx`
- `DECISIONS.md` (D-029), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Next recommended step:**
- Research and prototype Capability 08 (Incident Response) next — the LAST of the 8, same process.

---

### 2026-08-14 (continued 9) — Round 10: Capability 07 (Endpoint Protection/EDR) shell prototype, self-verified before reporting (D-028)
**Completed:**
- Researched before building: `ui-ux-pro-max --domain chart` for device/coverage data — the specific query returned nothing, broadened to "part to whole coverage percentage protected total" and got Waffle Chart/Pictogram, explicitly more accessible than pie/donut for this data shape; informed a literal grid-of-devices visual (endpoints are discrete, countable units). `mcp__21st__search` didn't surface a device-specific match; "Card Status List" confirmed the general per-item-status-cell pattern, applied to the pictogram cells.
- Built `CapabilityFleetMark`: a 5x2 grid of device icons (Laptop/Monitor/Smartphone/Server, cycled), 9 accent "protected," 1 muted "not yet," with a "9/10" figure — a fourth genuinely different mechanic among the capabilities addressed (not a ring, feed, or ranked list).
- Checked the shared-layout risk explicitly (per instruction) and found no issue this time — confirmed via the in-context whole-row screenshot that the pictogram isn't taller than the plain orb mark it replaces, so no grid change needed.
- Built `/services/prototype-v6` (noindex), Capabilities 05/06 already reflecting their shipped D-025/D-027 treatments in both rows so only 07 differs. Self-verified against actual screenshots before reporting (per instruction): full clean rebuild, `tsc`/`lint`/`build` clean (10 routes), zero overflow at 390px, zero non-pre-existing console errors, DOM query confirming live `/services` Capability 07 unaffected, and the final screenshot reviewed directly for legibility/layout defects before this entry was written — no truncation or layout issues found this time (unlike D-026).

**Files changed:**
- New: `app/components/sections/services/capability-fleet-mark.tsx`, `app/services/prototype-v6/page.tsx`
- `DECISIONS.md` (D-028), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Still open / needs verification:**
- Mohammad's review of D-028.

**Next recommended step:**
- Await his decision. Capability 08 (Incident Response) is the last of the 8, still needs its own individually-researched treatment.

---

### 2026-08-14 (continued 8) — Capability 06 shipped live, verified; refactored per-capability mark selector (D-027)
**Completed:**
- Mohammad approved D-026's prototype. Refactored `additional-capabilities.tsx`'s per-capability mark rendering from a growing `n === "05"` ternary into a small `CapabilityMark({ service })` selector — cleaner than stacking a second ternary branch, and matches the pattern `LiveServices` already uses for its own per-row visual. Capability 06 now renders `CapabilityFindingsMark`; 07-08 still fall through to the default orb. Deleted `app/services/prototype-v5/`.
- Verified: killed stray node processes, cleared `.next`, `npm run build`/`tsc`/`lint` all clean (9 routes, `prototype-v5` confirmed 404); DOM measurement of all 4 finalizing cards confirms 07/08 stay at 252px (unaffected) while 05/06 are 450/456px — the D-025 `items-start` grid fix continues to hold for a second taller mark automatically; zero overflow at 1440/390px; zero non-pre-existing console errors; screenshot reviewed directly.

**Files changed:**
- `app/components/sections/services/additional-capabilities.tsx` (Capability 06 mark swap + `CapabilityMark` selector refactor)
- Deleted: `app/services/prototype-v5/page.tsx`
- `DECISIONS.md` (D-027), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Next recommended step:**
- Research and prototype Capability 07 (Endpoint Protection/EDR) next, same process.

---

### 2026-08-14 (continued 7) — Round 9: Capability 06 (Penetration Testing) shell prototype, truncation bug caught and fixed (D-026)
**Completed:**
- Researched before building: `ui-ux-pro-max --domain chart` for severity/findings data (recommended sorted-descending "Compare Categories" treatment — informed a ranked list, not a score or unordered grid); `mcp__21st__search` for findings-report components (mostly small badge/chip primitives — confirmed severity tag as the right atomic unit, composed with the existing `RiskBadge` rather than a new import).
- Built `CapabilityFindingsMark`: 4 illustrative example findings, each with a `RiskBadge` severity tag, sorted critical→low — deliberately a different composition from Capability 02's score card and Capability 05's activity feed.
- Caught a real bug via screenshot review (not assumed correct from code): finding labels truncated illegibly next to the widest severity badges. First fix (shortening labels) was only partial — two rows still clipped, since it's the badge's own width (varies by tier: "Critical" is much wider than "Low") driving available space, not label length alone. Second fix (natural text wrap instead of forced `truncate`) resolved it fully — re-verified with a fresh screenshot after each change, not just once.
- Built `/services/prototype-v5` (noindex) — whole 4-card row shown twice, Capability 05 reflecting its already-shipped D-025 treatment in both so only Capability 06 differs. Full verification after each fix: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (10 routes); fresh clean rebuild; zero overflow at 390px; zero non-pre-existing console errors; confirmed live `/services` Capability 06 unaffected.

**Files changed:**
- New: `app/components/sections/services/capability-findings-mark.tsx`, `app/services/prototype-v5/page.tsx`
- `DECISIONS.md` (D-026), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The truncation bug above — caught before presenting as final, not after Mohammad's own review flagged it (unlike a few earlier rounds this session).

**Still open / needs verification:**
- Mohammad's review of D-026.

**Next recommended step:**
- Await his decision before touching 07-08.

---

### 2026-08-14 (continued 6) — Capability 05 shipped live with items-start grid fix, verified (D-025)
**Completed:**
- Mohammad approved D-024's prototype with an explicit requirement: verify the `items-start` grid fix doesn't break 06-08 before confirming. Added `CapabilityMonitorMark` for Capability 05 in `additional-capabilities.tsx`, added `lg:items-start` to the grid. Deleted `app/services/prototype-v4/`.
- Verified the specific requirement via Playwright `getBoundingClientRect()` on a fresh production server: Capability 05's card is 450px tall (the new mark); Capabilities 06/07/08 are each 252px — their own natural unstretched height, confirming the grid no longer forces them to match 05's height.
- Full verification: killed stray node processes, cleared `.next`, `npm run build`/`tsc`/`lint` all clean (9 routes, `prototype-v4` confirmed 404); zero overflow at 1440/390px; zero non-pre-existing console errors; screenshot reviewed directly.

**Files changed:**
- `app/components/sections/services/additional-capabilities.tsx` (Capability 05 mark swap + grid `items-start`)
- Deleted: `app/services/prototype-v4/page.tsx`
- `DECISIONS.md` (D-025), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Next recommended step:**
- Research and prototype Capability 06 (Penetration Testing) next, same process.

---

### 2026-08-14 (continued 5) — Round 8: Capability 05 (MDR) shell prototype (D-024)
**Completed:**
- Researched before building: `ui-ux-pro-max --domain chart` for real-time monitoring data (recommended streaming viz, flagged flashing-element accessibility risk — informed a single restrained `motion-safe:`/`motion-reduce:` pulse instead of a ticker); `mcp__21st__search` for live activity feed components (found "Chrono Board," confirmed the "timestamped event list + live indicator" pattern, rebuilt with existing primitives rather than importing).
- Found and surfaced a scope question before building: Capability 05 lives in `additional-capabilities.tsx`'s shared 4-card grid (D-007's finalizing tier), not a full row like 01-04. Kept it in that format — flagged explicitly rather than assuming a promotion to full-row status.
- Built `CapabilityMonitorMark` (live-pulse dot + Radar icon + 2 illustrative timestamped alert rows) for Capability 05 only.
- Found and flagged a real layout consequence: the new mark is taller than the plain icon mark, and the live grid's default CSS Grid stretch behavior would force 06-08's still-plain cards to match, leaving empty space — demonstrated directly in the prototype (shows the whole 4-card row twice, not just Capability 05 in isolation) with `items-start` applied only inside the prototype's own second grid, not the live file.
- Built `/services/prototype-v4` (noindex). Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (10 routes); fresh clean rebuild; zero overflow at 390px; zero non-pre-existing console errors; confirmed via DOM query that live `/services` Capability 05 card is unaffected.

**Files changed:**
- New: `app/components/sections/services/capability-monitor-mark.tsx`, `app/services/prototype-v4/page.tsx`
- `DECISIONS.md` (D-024), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- The card-height/grid-stretch issue above — found before it could become a real bug on ship, not after.

**Still open / needs verification:**
- Mohammad's review of D-024, including the `items-start` grid fix required if approved.

**Next recommended step:**
- Await his decision before touching 06-08 or the live grid.

---

### 2026-08-14 (continued 4) — Capability 04 shipped live; /services/prototype-v3 removed (D-023)
**Completed:**
- Mohammad approved D-022's prototype. Added a small `CapabilityVisual({ service })` selector in `live-services.tsx` — Capability 04 now renders `CapabilityTrainingVisual` in place of the orb; rows 01-03 unaffected. Deleted `app/services/prototype-v3/`.
- Full verification: killed stray node processes, cleared `.next`, `npm run build` clean (regenerated Next's route-type-validator, which had gone stale after the route deletion and caused a transient standalone-`tsc` error — resolved once `.next` was rebuilt, not a real code issue), `npx tsc --noEmit`/`npm run lint` both clean after; 9 routes (`prototype-v3` confirmed 404, `prototype-v2` still present/unaffected); DOM query confirmed rows 01-03 still show the orb's ghost-numeral marker and row 04 now shows the completion-ring SVG; zero overflow at 390px; zero non-pre-existing console errors; screenshot reviewed directly.

**Files changed:**
- `app/components/sections/services/live-services.tsx` (per-row visual selector)
- Deleted: `app/services/prototype-v3/page.tsx`
- `DECISIONS.md` (D-023), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Next recommended step:**
- Research and prototype Capability 05 (Managed Security Services / 24/7 MDR) next, same process.

---

### 2026-08-14 (continued 3) — Round 7: Capabilities 04-08 shell rethink, prototyped on Capability 04 (D-022)
**Completed:**
- Researched before building, per explicit instruction: `ui-ux-pro-max --domain style` for current B2B SaaS/security panel guidance (surfaced Bento Grids/Dimensional Layering as current well-supported patterns; explicitly ruled out Glassmorphism and Cyberpunk UI as not fitting "premium, restrained"); `mcp__21st__search` for real training/progress components (ProjectProgressCard, Onboarding Checklist, Skills Progress Dashboard — confirmed the pattern, not imported wholesale due to unrelated dependency trees, same reasoning as D-021); re-fetched Bell Business's service-panel page specifically for this round and found it's actually flat (title+description only, no visual variety) — confirmed Bell isn't the source for "vary the visual," only for spacing/hierarchy discipline, same as before.
- Built `CapabilityTrainingVisual` for Capability 04 (Security Awareness Training): module checklist (4 generic topics, complete/in-progress/pending status icons) + a single accent-colored completion ring with a centered percentage, replacing the orb's node-diagram/icon-badge/ghost-numeral formula. Kept the outer dark elevated-card container as a through-line device across rows — flagged explicitly as a judgment call for Mohammad to confirm or override, not asserted as settled.
- Content governance: the 84% figure and 4 module names are NEW illustrative values (no existing training-completion precedent to reuse, unlike Capability 02's reused 78/100) — explicitly flagged as such in both the component comment and the on-page label.
- Built `/services/prototype-v3` (noindex) showing current vs. new treatment with identical Capability 04 copy. Confirmed via DOM query that live `/services` row 04 still renders its original `.env-dark` orb panel — nothing live touched.
- Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (10 routes); killed stray node processes, cleared `.next`, fresh `npm run start`; zero horizontal overflow at 390px; zero non-pre-existing console errors; screenshot reviewed directly.

**Files changed:**
- New: `app/components/sections/services/capability-training-visual.tsx`, `app/services/prototype-v3/page.tsx`
- `DECISIONS.md` (D-022), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- None. Confirmed no dependency-tree drift by hand-rebuilding with existing primitives instead of importing 21st code directly.

**Problems solved:**
- Delivered a genuinely distinct third visual formula (checklist+ring, vs. gauge card vs. orb) with a stated, traceable research trail rather than an asserted design choice.

**Still open / needs verification:**
- Mohammad's review of D-022. If approved, capabilities 05-08 each need their own individually-researched treatment — not a reuse of this same checklist/ring formula, which was scoped to training content specifically.

**Next recommended step:**
- Await his decision before touching 05-08 or any other capability.

---

### 2026-08-14 (continued 2) — Round 6: row top-alignment fix; Capability 02 dashboard-mockup prototype (D-021)
**Completed:**
- Item 1 (top alignment): found the row grid used `md:items-center` (vertically centers two columns of possibly-unequal height) instead of `md:items-start`. Row 01's short one-line headline made both columns nearly equal height by coincidence, masking the bug; rows 02/03's longer names wrap to two H3 lines, so `items-center` visibly shifted the graphic column down. One-line fix (`items-center` → `items-start`). Verified with Playwright `getBoundingClientRect()` on rows 01/02/03: `delta: 0` on all three, not just the one reported.
- Item 2 (visual variety prototype): researched via `mcp__21st__search` (found "Financial Score Cards," pulled its real code, but it's built on an unrelated "liquid glass" component system not present in this codebase — and this session's own earlier `ui-ux-pro-max` search had already flagged that exact style as a weaker choice) and `ui-ux-pro-max`'s chart domain (confirmed a score/gauge treatment with numeric value + tier label is the right chart type for this kind of data). Rather than import an unrelated dependency tree, reused a pattern already built and approved in this codebase — Cyber Health's `OutputShape` illustrative score/risk-breakdown card — re-themed into Services' own dark panel shell as a new `CapabilityDashboardVisual` component. Exact same illustrative numbers (78/100, Medium, same 4 categories) as the already-approved source, not invented. Built `/services/prototype-v2` (noindex) showing both treatments side by side with identical Capability 02 copy. Did not touch `live-services.tsx`'s data, `capability-spotlight.tsx`, or rows 3-8.
- Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` clean (9 routes); killed stray node processes, cleared `.next`, fresh `npm run start`; zero horizontal overflow at 390px on both `/services` and `/services/prototype-v2`; zero non-pre-existing console errors; screenshots of rows 01/02/03 and the full prototype-v2 comparison reviewed directly.

**Files changed:**
- `app/components/sections/services/live-services.tsx` (`items-center` → `items-start`)
- New: `app/components/sections/services/capability-dashboard-visual.tsx`, `app/services/prototype-v2/page.tsx`
- `DECISIONS.md` (D-021), `PROJECT_MASTER.md`, `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- None beyond the two reported.

**Problems solved:**
- Alignment bug traced to the specific CSS property responsible (`items-center` vs. `items-start`), not patched with per-row margins that would drift again.
- Delivered a genuinely different, non-generic visual direction for review by reusing this project's own already-approved data-viz pattern instead of introducing a new external dependency tree or inventing new illustrative numbers.

**Still open / needs verification:**
- Mohammad's review of D-021, both parts.

**Next recommended step:**
- Await his decision on the prototype-v2 direction before touching any other row.

---

### 2026-08-14 (continued) — Round 5: CTA-alignment structural fix, sidebar weight genuinely split by state (D-020)
**Completed:**
- Item 1 (CTA offset on 24" monitors): read the code first per instruction rather than assuming a fix — Mohammad's specific hypothesis (button not nested in the graphic's container) wasn't quite right, the button *was* a sibling inside the same wrapping div, but the real bug was one level down: `mx-auto max-w-md` lived only on `CapabilitySpotlightVisual` itself (self-centers the 448px panel inside a much wider grid column on large screens), while the `ButtonLink` sibling below had no matching width constraint and rendered from the column's own left edge instead. Fixed by making a single shared `<div className="mx-auto max-w-md">` the true parent of both elements, removing the duplicate constraint from the visual's own className. Verified with Playwright at real 1440/1920/2560px viewports via `getBoundingClientRect()` — `leftDelta: 0` at every width, not just one — plus screenshots reviewed directly.
- Item 2 (sidebar weight): D-019's fix had applied one uniform `font-medium` to every sidebar item regardless of state, which is why it still read as "all bold" — a uniformly-medium list is still uniformly heavier than the page's body text. Replaced with a genuine active/inactive split on `NavLink`'s `lg` tier only (the site header/footer's `default` tier untouched): active → `font-semibold` (600) + existing `text-accent`, unchanged; inactive → `font-normal` (400) + `text-text-muted` (switched off `text-text-secondary`, which is near-black on White, not actually gray). Verified computed styles directly in a fresh Playwright browser context: active item reads `font-weight: 600`, all 7 inactive items read `font-weight: 400` / `color: rgb(107, 114, 128)` — not just the source checked.
- Full verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean; killed stray node processes, cleared `.next`, fresh `npm run start` before any measurement, per the stale-cache lesson from D-018/D-019.

**Files changed:**
- `app/components/sections/services/live-services.tsx` (shared width wrapper for visual + CTA)
- `app/components/ui/link.tsx` (`NavLink`'s `lg` tier: active/inactive weight + color split)
- `DECISIONS.md` (D-020), `PROJECT_MASTER.md` (Current Position), `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- None beyond the two reported. Confirmed the `default` NavLink tier (header/footer) is unaffected by the `lg`-only change.

**Problems solved:**
- Both items verified with real measurements/computed styles at the specific conditions Mohammad reported (24" width; active vs. inactive state), not just re-reading source.

**Still open / needs verification:**
- Mohammad's direct review of D-020.

**Next recommended step:**
- Await review; if approved, Services may be fully signed off — check whether Mohammad wants to move to Step 8 or extend the visual system to another page next.

---

### 2026-08-14 — ui-ux-pro-max skill installed; Capability 02 reviewed, no change made
**Completed:**
- Installed the `ui-ux-pro-max` Claude Code plugin at Mohammad's request (marketplace `nextlevelbuilder/ui-ux-pro-max-skill`) to check whether it suggests a genuinely better treatment for the already-approved Capability 02 row (Risk Assessment & Compliance) before it's considered final. This is a different tool from the earlier `ui-ux-pro-max-skill.nextlevelbuilder.io` reference site that hung the browser during D-014's rollout (that was a hosted web page; this is a proper Claude Code plugin with a local Python search script) — no conflict with that earlier "skip it" decision.
- The skill's search tool needed Python; none was installed. Asked Mohammad, who chose to install it — installed Python 3.12.10 via `winget` (`Python.Python.3.12`).
- Ran the skill's local design-system/style/typography/ux database searches against Capability 02's actual built treatment (nested dark glow-lit panel, ghost numeral, soft-3D icon badge, schematic node diagram, content column with accent eyebrow/bold headline/4-field grid/CTA):
  - `--design-system "cybersecurity MSSP B2B enterprise SaaS professional trust"` → recommended a "Trust & Authority" pattern (certification badges, case-study metrics, before/after comparisons) with a different palette (navy/slate) and font (Plus Jakarta Sans). Not applicable: this is a page/site-level trust-signal pattern, not a per-capability-row pattern; the palette/fonts are Oragrol's own locked brand tokens from earlier steps, not up for reinvention here; and the suggested content (certs, case-study metrics) isn't confirmed real data — inventing it would violate this project's own Honesty Rule (CLAUDE.md §8).
  - `--domain style "dark glass glow panel enterprise security dashboard"` → closest match was "Dark Mode (OLED)" with minimal-glow effects (WCAG AAA), which is what's already built. Genuinely fancier alternatives in the same result set (Liquid Glass, Spatial UI/VisionOS glass) are explicitly flagged in the skill's own data as moderate-poor performance and/or contrast-risk — worse choices for this context, not better.
  - `--domain typography "Space Grotesk geometric heading professional"` → the closest professional-SaaS match is "Tech Startup" (Space Grotesk heading + DM Sans body), confirming Space Grotesk is a sound, on-category heading choice for this product type. No pairing in the results scored Inter (the current body font) as a weaker choice, or proposed a pairing that would outperform the current Space Grotesk/Inter combination for this stack.
  - `--domain ux "feature row hierarchy visual weight numeral icon"` → returned general checklist items (hover-state feedback, sequential heading hierarchy, consistent type scale). Cross-checked against the actual code: `H2` ("Available today.") → `H3` (capability name) is sequential, no skipped heading level; hover states exist via `group-hover` with 150-300ms transitions (the `shadow-accent`/`translate`/`scale` fix from D-016); focus-visible rings present on interactive elements (`NavLink`, `ButtonLink`); `prefers-reduced-motion` is respected via a dedicated hook (`use-reduced-motion.ts`) that `Reveal` already checks. `Caption tone="muted"` contrast on the White environment was already explicitly audited in D-010 (computes ~4.84:1, passing) — re-confirmed by reading `tokens.css` directly, not re-tested.
- **Verdict reported to Mohammad:** the skill's own database doesn't surface a genuinely better treatment for this row — it's consistent with, not different from, what D-013 through D-019 already converged on (which was itself benchmarked against real B2B security-SaaS references: QClay, Cybershield, Tokenex). Did **not** recreate `/services/prototype`, since there's no different treatment to put side-by-side. Live `/services` was not touched.

**Files changed:**
- `PROJECT_MEMORY.md` (this entry). No component/route files changed — review-only, no code change.

**Problems found:**
- None in the built row. The skill's generic B2B "Trust & Authority" recommendation doesn't fit a single capability row's scope and would require unconfirmed content (certifications, case-study metrics) to execute honestly — flagged, not pursued.

**Problems solved:**
- Answered Mohammad's actual question (does a genuinely better treatment exist) with real search evidence rather than a guess, and avoided an unnecessary rebuild cycle by reporting "no" clearly instead of manufacturing a difference to justify the tool.

**Still open / needs verification:**
- Mohammad's review of D-019 (see Next Steps #1) — unaffected by this session, still pending.

**Next recommended step:**
- Await Mohammad's decision on whether Services is now fully approved, or whether another round of feedback is coming.

---

### 2026-08-13
**Completed:**
- Full visual/UX audit of the live site — AUDIT ONLY, explicitly no code/copy/component changes made or intended this session.
- Confirmed scope before starting: an example audit-report-layout image supplied alongside the brief was formatting reference only — no finding, number, or wording from it was used; every finding below came from actually opening the rendered site.
- Started `npm run dev`, used Playwright (`playwright-core`, per CLAUDE.md's documented method) to capture real incremental-scroll screenshots (not `fullPage`) of all 4 built pages (`/`, `/services`, `/solutions`, `/cyber-health`) at desktop (1440px), tablet (834px), and mobile (390px) — 48 screenshots, zero console/network errors.
- Verified no horizontal overflow at 1440/834/390/320px on any built page (`scrollWidth` vs `clientWidth` check).
- Exercised interactive elements directly: mobile hamburger nav, desktop search modal, FAQ accordion, CTA hover, keyboard Tab focus order.
- Computed WCAG contrast ratios directly from the locked hex values in `tokens.css` (not estimated): white text on primary accent button = 3.90:1 (fails AA normal-text 4.5:1, passes large-text/UI-component 3:1); `--color-text-muted` on dark background = 4.09:1 (also fails AA normal-text). Both are new findings, not previously logged.
- Found and screenshotted a real mobile nav defect: the open-state menu overlay doesn't extend to a full-height solid background — hero content, including a second "Get Your Cyber Health Score" button, is visible underneath it.
- Found the closing-CTA section (`FinalCta`-pattern: ring decoration + "Know where you stand. Know what to do next." + dual buttons) is pixel-identical across Home, Services, and Solutions — confirmed via direct side-by-side screenshot comparison at matched scroll depth. Cyber Health is the one exception (different copy, same layout/decoration).
- Confirmed the D-008 per-page-motif pattern is only half-applied on both pages that have one: Solutions' isometric strata and Cyber Health's arc gauge both appear once in their hero and never again on the same page — the Level cards / Flow / Reassurance sections directly below revert to the generic bordered-card-with-circle-icon pattern used everywhere else on the site.
- Produced the **Oragrol Visual Redesign Blueprint** — executive summary, top-10 prioritized problem list, page-by-page audit (4 pages), visual-system-gap breakdown (incl. a dedicated Hero/"Aperture O" section — a new hero direction named in this session's brief as the successor to the frozen 16-frame sequence), 3 highest-impact changes, 3 recommended prototypes, and a full strategy blueprint (background/typography/hero/motion/3D/interaction/responsive) — published as a private Claude artifact, link delivered to Mohammad in-chat.
- Logged the rollout sequencing as D-009 (see `DECISIONS.md`): blueprint stops for review/approval; once approved, implement on `/services` ONLY first (agreed proving ground); do not extend to any other page until Services is reviewed and approved.
- Stopped the dev server; confirmed no files under source control were modified this session (`git status` clean going in, still clean at audit's end aside from this memory-file update).

**Decisions:** D-009 logged (blueprint approval gate + Services-first rollout order; see `DECISIONS.md`).

**Verification:** No build/typecheck/lint run — no code was touched. Screenshot evidence and computed contrast ratios are the audit's own verification method; both are embedded in the delivered artifact as exhibits.

**Next:** Awaiting Mohammad's review of the blueprint artifact. Do not begin implementation, on Services or any other page, before that approval — see Next Steps above.

---

### 2026-08-13 (continued) — approval, two bug fixes, plain-markdown copy
**Completed:**
- Saved the blueprint content verbatim as `VISUAL_REDESIGN_BLUEPRINT.md` in the project root, on request, for reading/sharing without the artifact viewer. Noted in D-009.
- Mohammad approved the blueprint and confirmed the two independent bugs it surfaced (#5 mobile nav, #6/#7 contrast) should be fixed immediately, not gated behind blueprint rollout.
- Fixed the mobile nav overlay (`app/components/site/site-header.tsx`): converted from an in-flow `max-height` accordion to a `fixed` full-viewport panel (opaque background, body-scroll lock while open, `inert`+`aria-hidden` while closed). Verified via Playwright: body overflow toggles correctly, `panel.inert` is `true` when closed, no bleed-through at 390px.
- Fixed both WCAG AA contrast failures via new scoped tokens in `tokens.css`, not by changing the locked `--accent` or the shared `--text-muted` raw value: added `--accent-strong` (`#017CAC`, ~4.7:1 with white text, used only by `Button`/`ButtonLink`'s primary variant) and an `.env-dark`-only `--text-muted` override (`#75828D`, ~5.0:1, since White/Light-blue already passed). Reviewed every other `bg-accent` usage site-wide (pentest-addon badge icon, tier-cards progress bar, checkbox/radio) and confirmed none are text-on-fill, so none needed the swap.
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded (all 5 routes present). Playwright screenshots + computed-style checks confirmed both fixes render correctly and produce zero console errors; screenshots sent to Mohammad.
- Logged as D-010 in `DECISIONS.md`.

**Decisions:** D-010 logged.

---

### 2026-08-13 (continued 2) — Prototype 2 built
**Completed:**
- Built `SchematicVisual` (`app/components/sections/services/schematic-visual.tsx`) — the Services schematic-linework motif (D-008): a hub-and-spoke blueprint diagram, orthogonal connector traces, faint dot-grid background, same `color-mix` fill-progression technique already established by StrataVisual.
- Applied it to exactly one row — "Risk Assessment & Compliance" — via `SchematicRowPrototype`, copy copied verbatim from `live-services.tsx`, nothing new written.
- Shown on a new noindex, nav-unlinked route `/services/prototype`, next to the current live row for direct comparison — same disposable-preview pattern as `/style-guide`. The live `/services` page itself was not touched.
- Found and fixed a real, previously-latent bug while building this: `var(--color-surface)`/`var(--color-border)` don't reliably track a Section's per-environment override when read directly via `var()` (rendered the hub solid black on this White-environment page instead of a light accent-tinted panel). Root-caused via computed-style inspection, fixed by consuming the raw semantic tokens (`var(--surface)`/`var(--border)`) instead — confirmed correct after the fix. `StrataVisual`/`GaugeVisual` have the same latent issue but are unaffected today (Dark-only) — flagged for later, not fixed in this pass (see Next Steps).
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded (6 routes, `/services/prototype` added). Playwright screenshots at desktop (1280px) and mobile (390px), zero console errors, zero horizontal overflow. Confirmed `/services` renders unchanged (no regression — no existing file was modified).
- Logged as D-011.

**Decisions:** D-011 logged (Prototype 2 + the discovered token bug).

---

### 2026-08-13 (continued 3) — Services D-008 retrofit shipped, prototype route removed
**Completed:**
- Mohammad approved Prototype 2. Asked one clarifying question before proceeding (the 8 capabilities span two structurally different sections — 4 full-width rows in `LiveServices`, 4 compact no-CTA cards in `AdditionalCapabilities`, a deliberate live/not-yet-live distinction from D-007) — answer: keep both structures, adapt the schematic motif to each rather than unifying into one layout.
- `LiveServices.tsx`: remaining 3 rows (Virtual CISO, Vulnerability Assessment & Management, Security Awareness Training) now use the same `SchematicVisual` treatment as the approved prototype's row — all 4 live rows visually consistent.
- `AdditionalCapabilities.tsx`: added `SchematicMark`, a compact variant (two short corner ticks, no dot grid, no output node) replacing the plain Lucide icon in each of the 4 cards — carries the visual language through without giving not-yet-live capabilities the same visual weight as live ones (existing card grid, no-CTA, "finalizing" badge all kept as-is).
- Deleted `/services/prototype` and `SchematicRowPrototype` — no longer needed now that the treatment is live. Cleared `.next` cache to drop the stale route from Next's generated type validator after deletion (confirmed clean typecheck after).
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded (8 routes, `/services/prototype` gone). Full-page Playwright screenshots (real incremental scroll, not `fullPage`-only) at 1440px and 390px — zero console errors, zero horizontal overflow. Confirmed on a freshly restarted dev server that `/services` returns 200 and `/services/prototype` returns 404.
- Sent a full-page screenshot of the shipped `/services` page to Mohammad.
- Logged as D-012 — the D-008 Services retrofit ([[D-007]]) is now COMPLETE.

**Decisions:** D-012 logged.

---

### 2026-08-13 (continued 4) — Design Correction round (D-013), 21st.dev authorized
**Completed:**
- Mohammad reviewed the shipped D-012 page live and rejected it — "still small icon decoration on a flat background, not real graphic design" — and supplied `SERVICES_REDESIGN_PROMPT.md` (via `C:\Users\60183\Downloads\`) with 3 concrete Dribbble references and 7 specific, checkable requirements, plus explicit process rules (use 21st.dev/Magic if available, benchmark against references, state technique before generating, one row first, side-by-side review).
- Opened and viewed all 3 references directly in Chrome (QClay: dark atmospheric glow + light-beam sweeps; Cybershield: photographic imagery + dark shadowed icon cards; Tokenex: dark card on gradient canvas + one large radial illustration). None showed a literal 3D-rendered object — that specific claim in the brief came from a broader search, not these 3 links — flagged that distinction to Mohammad rather than silently building toward the more literal wording.
- `21st` MCP was unauthenticated. Asked Mohammad how to proceed (authorize now vs. skip and build from references directly) — he chose to authorize; completed the OAuth flow. Also asked his preference on 3D-rendered vs. CSS-simulated depth — he chose CSS-simulated (no new asset pipeline).
- Used `21st`'s `get_inspiration`/`search` (free) then `get_component` (paid retrieval) to pull real code for **"Card with Glow" (id 59, ibelick)** — a `motion/react` gradient-glow layer — adapted into `glow-effect.tsx`: locked-accent-only palette, defaulted to `mode="static"` since the original's other modes loop infinitely, which conflicts with this project's own documented motion restraint (flagged explicitly, not silently chosen).
- Stated the full technique plan in chat (which of the brief's 7 requirements map to which technique, and why) before writing any component code, per the brief's own required process step.
- Built, prototype-only, not wired into the live page: `glow-effect.tsx`, `hero-schematic-visual.tsx` (~40% bigger than the shipped `SchematicVisual`, kept as a separate file so D-012's live component isn't touched), `capability-spotlight.tsx` (the full row — nested `.env-dark` elevated panel, glow layer, oversized real-index numeral, soft-3D gradient/shadow icon badge). Recreated `/services/prototype` (noindex) showing the shipped D-012 row next to the new prototype, with a written 3-reference benchmark table.
- Color governance: flagged that white/black appear once, mixed into the accent as tonal highlight/shadow inside the icon badge — not a new decorative hue, per the brief's own color note.
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean (one `react/no-unescaped-entities` catch, fixed), `npm run build` succeeded (9 routes). Playwright screenshots at desktop (1280px) and mobile (390px), zero console errors, zero horizontal overflow. Confirmed via `git status` that no existing/shipped file was modified — only new files added, `/services` itself unaffected.
- Logged as D-013.

**Decisions:** D-013 logged (prototype round; does not change D-012's shipped state).

---

### 2026-08-13 (continued 5) — Design Correction shipped to all 8 capabilities (D-014)
**Completed:**
- Mohammad reviewed the D-013 prototype live — "this is a real improvement, meets the brief" — approved it for the remaining 7 capabilities, adapted per the existing size/weight distinction (same split as D-012).
- Mid-rollout: Mohammad asked me to check a third-party site, `ui-ux-pro-max-skill.nextlevelbuilder.io` ("UI UX Pro Max" — design-reference database, Claude-Code-integrated, `uip`/`uipro init` setup command), for anything that would improve the approved prototype further, before touching the other rows. Homepage loaded fine; its "How it Works" page hung the browser tab twice (30s CDP timeouts, unresponsive renderer) before any setup command could be seen. Did not run any install/init command — flagged as a standing rule (verify what a third-party setup script does before running it), independent of the hang. Asked Mohammad how to proceed; he chose to skip it and continue with the already-approved 21st.dev-based version.
- Generalized `capability-spotlight.tsx` from the single hardcoded prototype into `CapabilitySpotlightVisual({ n, icon })` (full treatment) and `CapabilitySpotlightMark({ icon })` (compact treatment) — same relationship as D-012's `SchematicVisual`/`SchematicMark`.
- `live-services.tsx`: all 4 rows (was 1 prototyped + 3 old-schematic) now use `CapabilitySpotlightVisual`. `additional-capabilities.tsx`: all 4 cards now use `CapabilitySpotlightMark` in place of `SchematicMark`.
- Deleted `/services/prototype` — no longer needed. Cleared `.next` cache, confirmed clean typecheck after.
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded (8 routes, `/services/prototype` gone). Full-page Playwright screenshots (real incremental scroll) at 1440px and 390px — zero console errors, zero horizontal overflow. Confirmed on a freshly restarted dev server that `/services` returns 200 and `/services/prototype` returns 404.
- Sent a full-page screenshot of the fully rolled-out `/services` page to Mohammad.
- Logged as D-014 — Services Design Correction is now COMPLETE across all 8 capabilities.

**Decisions:** D-014 logged.

---

### 2026-08-13 (continued 6) — Container fix, typography hierarchy, real hero (D-015)
**Completed:**
- New 4-item instruction (Services-scoped except item 1, explicit): container/dead-gutter bug, typography hierarchy, audit for rejected-motif drift, and a real hero illustration. A 5th item (regroup the 8 capabilities structurally, referencing a Bell Business page for information architecture only, not visual style) was included but explicitly held — "don't block the visual fixes on it."
- Item 1: investigated empirically first rather than assuming — every section already used a capped `Container`; the actual defect was the mismatch between the deliberately full-bleed header (D-001) and body content capped at 1024px. Fixed `container.tsx`'s `lg`/`xl` tiers to 1280px/1440px (inside the requested range, two tiers preserved). Verified zero horizontal overflow and no visual regression on Home/Solutions/Cyber Health at 1440/1920/2560/768/375px — the one Home@2560px Playwright timeout during verification was a script wait-strategy issue (network-heavy 16-frame hero), not a real page hang, confirmed by retrying with `domcontentloaded`.
- Item 2: added non-breaking opt-in `size` variants to `H3`/`Caption` (same pattern as `H1`'s existing `size` prop), applied only in Services' capability rows.
- Item 3: audited and found the connector-circle elements in every panel are `HeroSchematicVisual`, built as part of D-013 and visible in both of D-013's approvals — not drift, no record of a separate rejected motif. Flagged the discrepancy to Mohammad rather than silently changing anything; he confirmed after seeing the finding: keep as-is.
- Item 4: built `ServicesNetworkVisual` — 8 nodes (real count, from the H1) converging to one hub, in a `GlowEffect`-lit panel; `ServicesHero` rebuilt to the 2-column text|visual layout Solutions/Cyber Health already use. Deliberately a different composition from the row panels' diagram.
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded. Screenshots sent mid-task for the item-3 audit before any panel change was made (none was needed in the end).
- Logged as D-015.

**Decisions:** D-015 logged.

---

### 2026-08-13 (continued 7) — Round 2: sidebar nav resolves container issue, stronger typography, hover motion (D-016)
**Completed:**
- Mohammad reported D-015's container fix "did not actually resolve" the gutter complaint, with an explicit instruction not to claim success from code inspection alone. Re-investigated on a fresh production build (not dev server): the fix was genuinely applied and computing correctly (`max-width: 1280px` confirmed via DOM measurement at all 3 widths) — the real issue was mathematical, not a bug: a 1280px cap on a 2560px screen always leaves 640px margin per side. Presented this with screenshots + exact measurements, then asked Mohammad how to resolve it rather than guessing further. He chose to use item 3's new sidebar nav to occupy the gutter space instead of widening the cap further.
- Built `CategoryNav` (new) — sticky, all 8 real capabilities, `IntersectionObserver`-driven active state, real DOM-id jump-scrolling. Widened `LiveServices`' wrapper to a `[220px_1fr]` grid so the nav has real space. Added matching ids to `AdditionalCapabilities`' cards.
- Strengthened typography further (D-015's first pass judged insufficient): H3 `lg` tier bumped again, Caption `sm` tracking widened again, body copy bumped a full tier, added a small accent eyebrow above each headline (color contrast, staying within the site's existing "accent = eyebrow only" rule rather than recoloring full headlines).
- Added hover motion to capability panels (border/shadow lift, icon scale+brightness) — found and fixed a real bug in the process: a Tailwind arbitrary-value shadow class using `color-mix()` generated no CSS at all (confirmed via computed-style inspection, not just a screenshot glance) — the base shadow was invisible too, not just hover. Fixed with Tailwind's built-in `shadow-accent/opacity` mechanic instead. Also ruled out a false alarm: Tailwind v4 uses standalone `translate`/`scale` CSS properties, not `transform` — a naive check reads hover motion as broken when it isn't.
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded, fresh production server. Zero horizontal overflow at 1440/1920/2560/768/375px. Zero non-pre-existing console errors (23 pre-existing nav-prefetch 404s for not-yet-built pages, confirmed unrelated to this round via isolated check). Real click-scroll test confirmed correct target + active-state update. Screenshots sent per Mohammad's explicit item-1 proof requirement.
- Logged as D-016.

**Decisions:** D-016 logged.

---

### 2026-08-13 (continued 8) — Footer overhaul, site-wide, separate commit (D-017)
**Completed:**
- Investigated project docs before building anything, per Mohammad's own instruction: "Blog" isn't a real page name here — the real planned page is "Resources / Insights" (Step 10, PENDING), already linked as "Resources" in the header/prior footer. Found no LinkedIn/Instagram URLs or emergency-contact info in any project doc — the existing footer already had LinkedIn flagged as a `href="#"` placeholder for the same reason. Presented all of this and asked directly rather than guessing.
- Mohammad supplied real values: LinkedIn (`https://www.linkedin.com/company/oragrol-global/`, now live), Instagram (no real page yet, explicit placeholder), emergency contact (`+60 18-377-2761`, explicitly TEMPORARY pending a real Canadian line — flagged in a code comment), and confirmed keeping the "Resources" label (not introducing "Blog").
- Rebuilt `SiteFooter`: Company/Resources/Legal 3-column grid from real existing nav items only (Resources column deliberately has just the one real item, not padded). `Grid`'s `md` column map didn't support 5 (needed for brand-block + 3 nav columns) — added it, additive/non-breaking.
- Built small hand-drawn outline social icons (`social-icons.tsx`) since `lucide-react` has no brand icon exports — matches the site's existing icon style, not the platforms' literal filled logos.
- Built `EmergencyCta` (new) — fixed bottom-right "Under attack?" pill, rendered from `RootLayout` (not `SiteFooter`) so it's genuinely site-wide/scroll-independent. Locked cyan/navy palette, no new urgency color.
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded. Fresh production server. Zero horizontal overflow at 1440/1920/390px across 4 pages. Zero non-pre-existing console errors. Confirmed via DOM query that every href resolves to the exact real/placeholder value intended, nothing silently wrong.
- Committed separately from D-016's items 1-4, per instruction.
- Logged as D-017.

**Decisions:** D-017 logged. Two explicit flags carried forward unresolved: Instagram URL, real emergency contact number.

---

### 2026-08-13 (continued 9) — Round 3: content-area headline, sidebar weight, panel shrink; footer discrepancy investigated (D-018)
**Completed:**
- Mohammad reported item 4 as a real discrepancy: commit b2a7717 claimed Instagram + emergency CTA were added and visible, but his own screenshot showed neither. Investigated thoroughly rather than just re-screenshotting: read the actual current source of all three touched files (all unconditional, no hiding logic found), checked for stray duplicate server processes on the machine (found only one process ever listening on port 3000), fetched the raw server HTML via `curl` (both markers present in the literal bytes sent, zero browser/cache involved), and loaded the page in a brand-new Playwright context with fresh cache/cookies (both elements confirmed via computed style + bounding rect + screenshot). Could not reproduce the absence through any method. Most likely explanation is a stale browser tab/cache on Mohammad's side, but flagged this as the *likely* explanation, not a certainty, since his own browser can't be directly observed. Did a fully clean rebuild (killed all node processes, cleared `.next`, fresh `npm run start`) before any of this round's screenshots regardless, to rule out staleness on this end too.
- Item 1: found the real structural issue — the row's `H3` headline lived only in the *visual* column, physically apart from the content column (Challenge/Does/Get/Outcome) it was meant to anchor, so the content area itself had no headline at all. Moved the eyebrow+headline into the content column, above the field grid; removed the now-redundant duplicate from the visual column.
- Item 2: added a non-breaking `size` variant to the shared `NavLink` component (same pattern as `H1`/`H3`/`Caption`), new `lg` tier for `CategoryNav` only. Active-state logic untouched.
- Item 3: `CapabilitySpotlightVisual` capped at `max-w-md`, row grid ratio shifted from even `md:grid-cols-2` to `md:grid-cols-[0.9fr_1.1fr]` — content column gets real extra width, not just empty space in the visual's own column.
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded, fresh production server after a full process/cache clear. Zero horizontal overflow at 1440/1920/2560/768/375px. Zero non-pre-existing console errors. Screenshots reviewed directly before reporting (row hierarchy, sidebar, full page, mobile) — not claimed from code alone, per Mohammad's explicit "do not report resolved without direct visual confirmation" instruction.
- Logged as D-018.

**Decisions:** D-018 logged.

---

### 2026-08-13 (continued 10) — Round 4: weight reductions, CTA fix, font-family investigated (D-019)
**Completed:**
- Item 2 first (font-family bug check): checked computed `font-family` for all 8 capability headlines on a fresh, `.next`-cleared production build. Before and after (no code changed): all 8 compute to `"Space Grotesk", "Space Grotesk Fallback"`, weight 700/600 — genuinely distinct from body's `Inter, "Inter Fallback"`. No bug found in the code; reported the actual values rather than asserting "fixed" for something that was never broken. Flagged the possibility this is another instance of D-018's pattern (what Mohammad sees not matching what the code/browser computes) — recommend a hard refresh if the perception persists.
- Item 1: `NavLink`'s `lg` tier (used by `CategoryNav`) dropped `font-semibold`→`font-medium`; confirmed 600→500 computed. Active-state color/border untouched.
- Item 3: `Caption`'s `sm` tier (used only by `ServiceField` labels) dropped from the shared `font-medium` (baked into Caption's base string) to a per-tier `font-normal`; confirmed 500→400 computed. `default` tier (every other Caption usage sitewide) explicitly kept at `font-medium` in its own tier string — nothing else on the site changes.
- Item 4: found `LIVE_SERVICES[1]` (Risk Assessment & Compliance) was the one outlier — `"Get Your Cyber Health Score"` → `/cyber-health`, while the other 3 rows already used `"Talk to Oragrol"` → `/contact`. Changed both label and href to match (leaving the old href under new text would have been a mismatched link). Confirmed via DOM query all 4 rows now emit identical CTA pairs.
- Verification: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeded. Fully clean rebuild (all node processes killed, `.next` cleared) before this round's own screenshots, given last round's stale-cache lesson. Zero horizontal overflow at 4 widths, zero non-pre-existing console errors. Full-page screenshot captured showing all 8 capability panels for the CTA-consistency check specifically, per instruction.
- Logged as D-019.

**Decisions:** D-019 logged.

**Next:** Awaiting Mohammad's review. If either the footer discrepancy or the font-family perception persists after this round's fresh rebuild, the recommended next step is asking what URL/browser state he's viewing rather than re-investigating the same code a third time — both have now been independently verified clean on the code/server side.

---

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

### 2026-08-12 (later same day) — Services page: fix spacing defect, sign-off
**Completed:**
- Mohammad reviewed `/services` directly in-browser: structure and copy both approved. One defect found: excessive blank gap between the last live-service row (Security Awareness Training) and the Additional Capabilities section start.
- Root-caused: `LiveServices`' outer `Container` carried its own `py-24 md:py-32` (top+bottom padding), stacking on top of the last row's own `py-14` (each row's individual top+bottom padding, used for the `divide-y` inter-row rhythm) — a doubled-up bottom gap unique to this section, since no other section in the codebase wraps a `divide-y` list with per-row `py-*` inside a `Container` that also carries its own `py-*`.
- Fixed by making the Container's padding asymmetric: `pt-24 pb-8 md:pt-32 md:pb-12` — top (entrance spacing, not flagged) stays exactly as it was; bottom is reduced since the last row's own `pb-14` already covers most of that space. Left the per-row `py-14` and the section's top padding untouched, keeping the fix scoped to exactly the reported symptom.
- Re-verified: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean, and a targeted Playwright screenshot centered on the exact section boundary (found via `.env-light-blue`'s live `getBoundingClientRect()`, not a guessed scroll offset) confirms the gap now reads as a normal, proportionate section transition.

**Files changed:**
- `app/components/sections/services/live-services.tsx` (Container className only — `py-24 md:py-32` → `pt-24 pb-8 md:pt-32 md:pb-12`, plus an explanatory comment)

**Problems found:**
- N/A — the fix matched the initial root-cause diagnosis on the first attempt.

**Problems solved:**
- Services page spacing defect, confirmed fixed by direct measurement of the section boundary, not just "looks better."

**Still open / needs verification:**
- Nav contrast (visual check only, carried over from earlier sessions) — the only remaining open item site-wide.

**Next recommended step:**
- Step 6 — Solutions Page.

---

### 2026-08-12 (later same day) — Per-page visual identity system, proposed and approved (no build)
**Completed:**
- User raised a real design-direction problem before Step 6: Home and Services were differentiated mostly by `Section` background color/icon choice, not actual distinct visual content — risked all 9 pages feeling interchangeable if repeated.
- Proposed a per-page visual metaphor for all 9 pages (report only, no code) — table of core concept / visual metaphor / distinctness per page — plus a unifying principle (shared color/type/spacing/motion "material," distinct "shape" per page). Explicit design constraint carried through: Home's ring+skyline stays reserved to Home (existing "never invent a similar ring" rule), so Cyber Health's data visuals use arcs/gauges, not closed rings.
- Asked and got an answer on production method: code-generated SVG/CSS for all pages now (not commissioned imagery), with Company and Industries explicitly flagged as candidates for a future photographic/commissioned upgrade — deferred, not blocking, same pattern as D-006's hero deferral.
- Logged the full per-page direction table and production-method decision as DECISIONS.md D-008.
- **No code was built this session** — per explicit instruction, this was direction-approval only.

**Files changed:**
- `DECISIONS.md` (D-008, and a cross-reference note on D-007)
- `PROJECT_MEMORY.md` (this entry)

**Problems found:**
- N/A — process/direction session, no implementation.

**Problems solved:**
- N/A.

**Still open / needs verification:**
- Whether Services (already built under the old color-only treatment) gets retrofitted with its D-008 schematic-linework motif before, alongside, or after Step 6 — resolved next session (user chose: Solutions first, Services retrofit after — logged, see below).

**Next recommended step:**
- Step 6 — Solutions Page, built with its D-008 visual direction (ascending stacked planes/strata) from the start rather than added later.

---

### 2026-08-12 (later same day) — Build Solutions page (Step 6)
**Completed:**
- Confirmed build order first (asked, didn't assume): Solutions built now, Services' D-008 retrofit explicitly deferred to its own later pass.
- Inspected before coding: no `/solutions` route existed, only the Home teaser (generic "Level 01/02/03" labels, no branded names — already correctly avoiding the unconfirmed-pricing trap) and Services' own dead `/solutions` cross-link. Re-confirmed `PROJECT_MASTER.md`'s Step 6 governance: pricing table is internal-reference-only, tier *names* aren't confirmed either ("distinctive branded names" is a goal, not a delivered decision) — carried the Home teaser's existing discipline (generic labels, no numbers) onto the dedicated page rather than inventing names to fill space.
- Designed and built `StrataVisual` (`app/components/sections/solutions/strata-visual.tsx`) — Solutions' D-008 signature graphic: 3 plates sharing a baseline, increasing height and accent-intensity, using the same `color-mix(in srgb, var(--color-accent) X%, ...)` technique already established in `Approach.tsx` (not a new pattern) plus the first-ever use of `--color-accent-light` (the locked "Light tint" #97CADB token — wired into `tokens.css` since Step 1 but unused anywhere until now) for the plate-top highlight.
- Built the full page: `SolutionsHero` (dark environment — same header-contrast reasoning as `ServicesHero`, flagged again in a comment that this recurring constraint across every future page argues for eventually making `SiteHeader` read its entry section's real environment rather than assuming dark) → `TierCards` (3 cards, each with a small bar echoing its StrataVisual plate) → `PentestAddon` (dashed border + a `+` badge on the icon, deliberately reading as a "satellite" outside the 3-level stack, not a 4th rung) + reused status-disclaimer/CTA copy verbatim → reused `FinalCta` directly.
- Caught and fixed a real bug before it shipped: initially passed a conflicting `className="h-3 w-3"` alongside `Icon`'s `size="sm"` prop on the pentest badge — since `cn()` is plain concatenation with no conflict resolution (confirmed earlier this project, see `nav.tsx`'s own comment on the same issue), this would have been the exact class of bug already flagged as a known risk. Fixed by not fighting the size system — resized the badge circle instead.
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean (new static `/solutions` route). Scroll-verified Playwright screenshots (not `fullPage` — applying last session's lesson) at desktop and mobile widths, zero console/network errors.
- Updated `PROJECT_MASTER.md` (Step 6 → IMPLEMENTED, Current Position → Step 7 or Services retrofit next, order not yet decided).

**Files changed:**
- New: `app/solutions/page.tsx`, `app/components/sections/solutions/{hero,strata-visual,tier-cards,pentest-addon}.tsx`
- `PROJECT_MASTER.md` (Step 6 + Current Position)

**Problems found:**
- The `Icon` component `className` conflict described above — caught before commit, not shipped.

**Problems solved:**
- First real application of D-008's per-page visual system, proving the "code-generated, shares the existing color-mix/token idioms" approach works without inventing new patterns or new tokens beyond what's already locked.

**Still open / needs verification:**
- Order of Step 7 vs. the Services D-008 retrofit — not yet decided.
- Nav contrast (visual check only, carried over) — still the only long-standing open item.

**Next recommended step:**
- Decide Step 7 vs. Services retrofit order.

---

### 2026-08-12 (later same day) — Solutions review: fix strata visual + footer logo
**Completed:**
- Mohammad reviewed `/solutions` in-browser. Two defects found:
  1. `StrataVisual` didn't match the approved plan — rendered as 3 plain flat rectangles of increasing height (no overlap, no perspective), not the "overlapping/offset, isometric terrace" effect described when the direction was proposed.
  2. Footer logo didn't match the header logo — footer was hand-typing a bold all-caps "ORAGROL" span next to a bare `OragrolRing`, instead of reusing `OragrolLogo` (the single component that owns the correct case, the "GLOBAL" subtitle, and the exact ring-to-text geometry). Visibly wrong (missing subtitle, wrong case) and architecturally wrong (a second, drifted recreation of the logo instead of one source of truth).
- Rebuilt `StrataVisual` from scratch as true isometric geometry: each block is a top rhombus face + two extruded side faces (standard isometric-tile construction), positioned with real x/y overlap so each subsequent block visibly layers in front of the previous one (SVG document order = z-order, later-drawn on top) — not a bar-chart-style row of separate rectangles. Side faces get progressively darker `color-mix` fills than the top face per block, faking a lit-top/shadowed-side look consistent with the brief's "subtle depth, controlled reflections" direction. Kept the same design tokens/technique as v1 (no new colors invented).
- Fixed `SiteFooter` to import and render `OragrolLogo` directly (same import SiteHeader uses) instead of hand-composing `OragrolRing` + a text span. Removed the now-unused `OragrolRing` import.
- Verified both fixes: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean. Screenshotted the rebuilt strata visual (full hero, taller viewport to avoid fold-cropping) and a side-by-side header-vs-footer logo closeup confirming pixel-identical rendering. Re-ran the full Solutions scroll-through to confirm no regressions elsewhere on the page. Sent screenshots to Mohammad before committing, per his explicit request — got confirmation before this commit.

**Files changed:**
- `app/components/sections/solutions/strata-visual.tsx` (full rewrite — isometric block geometry)
- `app/components/site/site-footer.tsx` (logo: `OragrolRing` + hand-typed text → `OragrolLogo`)

**Problems found:**
- The footer logo bug raises a pattern worth checking elsewhere: is `OragrolRing` (the bare ring, no text) used correctly everywhere it appears (e.g. `FinalCta`'s background accent, which is meant to be ring-only, not a full lockup), or could a similar "recreated instead of reused" drift exist anywhere else? Not audited this session — flagged in Next Steps.

**Problems solved:**
- Both defects fixed and confirmed by direct visual comparison (isometric geometry inspected at a taller viewport to see the whole shape; logos compared side-by-side crop-for-crop), not just "looks better."

**Still open / needs verification:**
- A broader audit of whether any other component recreated a brand asset by hand instead of importing it — not done, just this one instance.
- Order of Step 7 vs. the Services D-008 retrofit — not yet decided.
- Nav contrast (visual check only, carried over).

**Next recommended step:**
- Decide Step 7 (Cyber Health) vs. Services D-008 retrofit order.

---

### 2026-08-12 (later same day) — Brand-asset sweep + build Cyber Health (Step 7)
**Completed:**
- **Sweep (requested item 1):** searched the whole repo for hand-recreated brand elements — plain-text "ORAGROL"/"Oragrol" hits (all legitimate prose/metadata, none a visual recreation), the ring's exact geometry signature (`strokeDasharray="365 24"` — found only in the two canonical components, nowhere else), and every import site of `OragrolLogo`/`OragrolRing` (header, footer, `FinalCta`'s ring-only background accent — exactly the expected set, no extras). Conclusion: the footer (fixed last session) was the only instance. No further fixes needed.
- **Order decision (requested item 2):** confirmed Step 7 (Cyber Health) before the Services retrofit, same reasoning as before — prove the D-008 pattern on a second page first.
- Inspected before coding: no `/cyber-health` route existed, only the Home teaser with LOCKED content (the 7-step flow, the 6-item output shape, an explicitly-labeled illustrative mock score). Re-read `PROJECT_MASTER.md` Step 7's "Existing MVP flow (Tally-based) stays live underneath" line, searched the whole repo for any Tally URL/API route/CRM-AI-email SDK — found none, confirming the real assessment/scoring/AI/CRM pipeline runs entirely outside this codebase. Reported this gap rather than inventing a destination, and asked where the CTA should actually point.
- User supplied the real, live URL (`https://tally.so/r/2EzROb`, already receiving real submissions). Fetched it directly to confirm it's the correct "Free Cyber Health Assessment" form and to pull real, confirmed facts (5-7 min, no commitment, AI-generated suggestions, executive PDF report) for the Reassurance section — not invented.
- Chose link-out-in-new-tab over iframe embed (my call, as the user authorized) and explained why: no way to confirm this specific form allows iframing, and a live form with real submissions shouldn't risk a broken/blocked embed when a plain link is guaranteed to work.
- Built `/cyber-health`: `CyberHealthHero` (dark env, same SiteHeader-contrast reasoning as every other page + `GaugeVisual`, D-008's instrument-panel motif — a 4-segment arc gauge using the risk-tier tokens as a legitimate *functional* data use, not decoration) → `Flow` (the locked 7-step sequence at full page weight, reusing Approach.tsx's connecting-spine pattern extended from 4 to 7 items via hand-written grid classes, same as Approach.tsx already does for its own non-standard column count) → `OutputShape` (the locked 6-item list + an illustrative report preview reusing the exact 78/Medium example already approved on the Home teaser, plus new illustrative "Top Risks" bars using generic, non-proprietary security-domain names, explicitly labeled illustrative) → `Reassurance` (facts sourced from the live form) → `ClosingCta` (page-specific — NOT the reused `FinalCta`, since FinalCta's own CTA points *to* `/cyber-health`, which would be circular on this exact page).
- Verification: `npx tsc --noEmit`/`npm run lint`/`npm run build` all clean (new static `/cyber-health` route). Scroll-verified screenshots desktop+mobile. Caught and correctly diagnosed a screenshot-methodology artifact (not a real bug): the last Flow step looked faded in one screenshot — traced to the item's staggered `Reveal` delay (0.36s) + animation duration (0.5s) exceeding my script's 400ms wait, confirmed by re-screenshotting with a longer wait. Directly verified (via DOM query, not assumption) that both on-page action CTAs resolve to the exact Tally URL with `target="_blank"`/proper `rel`, while the header/nav CTA correctly still points to `/cyber-health` itself.
- Updated `PROJECT_MASTER.md` (Step 7 → IMPLEMENTED, Current Position, and an explicit note that the Tally flow is out of scope for this codebase).

**Files changed:**
- New: `app/cyber-health/page.tsx`, `app/components/sections/cyber-health/{hero,gauge-visual,flow,output-shape,reassurance,closing-cta}.tsx`
- `PROJECT_MASTER.md` (Step 7 + Current Position)

**Problems found:**
- None in the sweep. One screenshot-methodology artifact during verification (described above), correctly identified as such before it could be misreported as a bug.

**Problems solved:**
- Resolved a real content-governance risk before it became a mistake: PROJECT_MASTER.md referenced an "existing MVP" without a URL anywhere in the repo — surfaced the gap and got the real answer instead of guessing or inventing a placeholder link.

**Still open / needs verification:**
- Mohammad's in-browser review of `/cyber-health` — not yet done.
- Order of Step 8 vs. the Services D-008 retrofit — not yet decided.
- Nav contrast (visual check only, carried over) — still the only long-standing open item.

**Next recommended step:**
- Get Cyber Health reviewed, then decide Step 8 vs. Services retrofit order.

---
*(New sessions get added above this line, newest first. When this file passes ~10 sessions, move the oldest ones into PROJECT_MEMORY_ARCHIVE.md.)*
