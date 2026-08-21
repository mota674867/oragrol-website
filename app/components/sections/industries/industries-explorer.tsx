"use client";

import { useEffect, useId, useState } from "react";
import { Check } from "lucide-react";
import { ButtonLink, Caption, Container, Icon, Section, Text, cn } from "../../ui";
import { AssessmentCta } from "../cyber-health/assessment-cta";
import { TALLY_ASSESSMENT_URL } from "../cyber-health/hero";
import { usePrefersReducedMotion } from "../../motion/use-reduced-motion";
import { INDUSTRIES, slugifyIndustryName } from "./industries-data";

/**
 * IndustriesExplorer — Step 9's core interaction. Researched first
 * (`ui-ux-pro-max` UX-domain search + a `21st.dev` component search for
 * "sidebar tabs detail panel selector"), same discipline as Services'
 * `CategoryNav` (D-016/D-018/D-019) and How We Work's hero visual (D-035):
 * this is a single ARIA "Tabs" widget (WAI-ARIA Tabs pattern — a
 * `tablist` of 9 `tab`s driving one `tabpanel` whose content is swapped
 * by React state, not 9 separate routes/anchors and not an accordion.
 * That's a deliberately different semantic from `CategoryNav`, which is a
 * same-page anchor-nav list (real hrefs, scroll-spy) — here there is only
 * ever one panel of content on screen, so `role="tab"`/`aria-selected`/
 * `aria-controls` is the correct pattern, not `NavLink`'s nav-item one.
 *
 * The active/inactive *visual* treatment still deliberately reuses the
 * exact weight/color rule already locked for this kind of list —
 * `NavLink`'s `size="lg"` active/inactive split (D-019: active =
 * `font-semibold text-accent`, inactive = `font-normal text-text-muted`)
 * — reimplemented on a `<button role="tab">` here since `NavLink` itself
 * is a real `<Link>` (page navigation), which this is not.
 *
 * Desktop: sticky vertical tablist, left column. Mobile (`lg:hidden`):
 * the same tabs re-rendered as a horizontally scrollable row —
 * `overflow-x-auto` + `whitespace-nowrap`, no wrapping/truncation, so
 * every industry name stays reachable by scroll/swipe on small screens
 * (site-wide `horizontal-scroll` / `touch-target-size` guidance from the
 * ux-domain research above).
 */

export function IndustriesExplorer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tablistId = useId();
  const reduceMotion = usePrefersReducedMotion();
  const active = INDUSTRIES[activeIndex];

  // Tab ids are deterministic slugs (`industry-<slug>`), not the opaque
  // useId-prefixed form panelId still uses below — the DESKTOP (vertical)
  // instance's id doubles as the real, stable deep-link anchor the nav
  // dropdown's `INDUSTRIES_DROPDOWN` targets (`/industries#industry-<slug>`,
  // see nav-dropdown.tsx). Both mobile and desktop tablists render
  // simultaneously (CSS `hidden`/`lg:hidden` only hides one visually, both
  // stay in the DOM) — reusing the same id on both would be a duplicate-id
  // bug, and specifically the WRONG one: `document.getElementById` returns
  // the first DOM match, which is the mobile row (rendered first in JSX),
  // silently breaking both anchor-scroll and the existing
  // Arrow-key-focus-follow behavior on desktop (a pre-existing bug, not
  // introduced here — caught while adding the anchor requirement). Mobile
  // gets a distinct `-mobile` suffix so both ids stay valid/unique; only the
  // unsuffixed desktop id is ever linked to.
  function tabId(i: number, orientation: "vertical" | "horizontal" = "vertical") {
    const slug = `industry-${slugifyIndustryName(INDUSTRIES[i].name)}`;
    return orientation === "vertical" ? slug : `${slug}-mobile`;
  }
  function panelId(i: number) {
    return `${tablistId}-panel-${i}`;
  }

  // Deep-linking: read the URL hash into the initial tab selection (a
  // direct `/industries#industry-healthcare` link), and again on any
  // same-page hash change (clicking the same link, or a browser back/
  // forward, while already on this page — the component doesn't remount
  // just because the hash changed). Also explicitly scrolls the matching
  // tab into view: relying on the browser's own native hash-scroll isn't
  // enough on its own once the *content* selection needs to change too,
  // and `scrollIntoView` on the currently-hidden orientation's
  // (display:none) element is a documented no-op — calling it on both ids
  // is safe, only the one actually laid out at the current viewport width
  // moves.
  //
  // Bug fix (2026-08-21, mobile): fixed a real "nothing happened" bug where
  // the right tab/panel content WAS selected internally (`<h2>` always
  // updated) but the page never visibly scrolled on mobile — the
  // horizontal tab strip's own `scrollIntoView({ block: "nearest" })` is
  // *correctly* a no-op whenever that strip is already inside the
  // viewport, true on every mobile load since it sits near the top of the
  // page, leaving the actual detail panel (stacked BELOW the strip until
  // `lg:`) off-screen. Fixed by also scrolling `[role="tabpanel"]` (a
  // stable selector — there's only ever one) into view below the `lg`
  // breakpoint (1024px, the same cutoff this component's own layout
  // already uses); desktop's already-working path is untouched, guarded by
  // the same check.
  //
  // Bug fix (2026-08-21, desktop — the real root cause of the original
  // report): clicking a DIFFERENT industry from the header dropdown while
  // ALREADY on this page did nothing at all — confirmed live (an
  // instrumented click logged zero `hashchange`/`popstate` events even
  // though `location.hash` genuinely changed to the clicked industry).
  // Root cause: Next.js's `<Link>` updates the URL for a same-route,
  // hash-only navigation via the History API directly (a `pushState`-style
  // update), and that does NOT fire a native `hashchange` event — only a
  // real hash-only navigation (typing a new hash, a plain non-JS anchor, or
  // browser back/forward) does. The `hashchange` listener below is
  // therefore only ever reached by those cases; every dropdown click while
  // already on `/industries` silently missed it, leaving the display stuck
  // on whichever industry was last reached by an actual full-page
  // navigation (which is why it looked "hardcoded" to one industry rather
  // than simply not moving). Fixed with a `click` listener on `document` in
  // the capture phase (runs before the `<Link>`'s own handler, so it
  // doesn't depend on or interfere with Next's routing) that reads the
  // clicked anchor's `href` directly — not `location.hash`, which hasn't
  // updated yet at this point in the capture phase — extracts the target
  // industry, and applies the same selection logic the hash-based path
  // uses. `applySelection` is shared between both paths so they can't drift
  // out of sync with each other.
  useEffect(() => {
    function slugToIndex(slug: string): number {
      return INDUSTRIES.findIndex((industry) => slugifyIndustryName(industry.name) === slug);
    }

    function applySelection(index: number, source: string) {
      // TEMPORARY diagnostic logging (2026-08-21) — trace exactly which
      // index gets applied and from which code path, per explicit
      // instruction to verify with runtime tracing rather than static
      // review or automated assertions alone. Remove once resolved.
      console.log("[industries-debug] applySelection", { source, index, name: INDUSTRIES[index]?.name });
      setActiveIndex(index);
      const behavior = reduceMotion ? "auto" : "smooth";
      const vTarget = document.getElementById(tabId(index, "vertical"));
      const hTarget = document.getElementById(tabId(index, "horizontal"));
      console.log("[industries-debug] scroll targets resolved", {
        index,
        vId: tabId(index, "vertical"),
        vFound: !!vTarget,
        vRectTop: vTarget?.getBoundingClientRect().top,
        hId: tabId(index, "horizontal"),
        hFound: !!hTarget,
        hRectTop: hTarget?.getBoundingClientRect().top,
        scrollYBefore: window.scrollY,
        innerWidth: window.innerWidth,
      });
      vTarget?.scrollIntoView({ behavior, block: "center" });
      hTarget?.scrollIntoView({ behavior, block: "nearest", inline: "center" });
      if (window.innerWidth < 1024) {
        requestAnimationFrame(() => {
          const panel = document.querySelector('[role="tabpanel"]');
          console.log("[industries-debug] mobile panel scroll", {
            index,
            panelFound: !!panel,
            panelRectTop: panel?.getBoundingClientRect().top,
            scrollYBefore: window.scrollY,
          });
          panel?.scrollIntoView({ behavior, block: "start" });
        });
      }
      // Trace the ACTUAL resting scroll position + rendered h2/active-tab
      // state at several points after the call, to catch anything that
      // re-scrolls or re-renders differently afterward (e.g. a competing
      // scroll, or activeIndex getting overwritten by something else).
      [0, 100, 300, 800].forEach((delay) => {
        setTimeout(() => {
          console.log("[industries-debug] settle check", {
            delay,
            index,
            scrollY: window.scrollY,
            h2: document.querySelector("h2")?.textContent,
            selectedTabId: document.querySelector('[role="tab"][aria-selected="true"]')?.id,
          });
        }, delay);
      });
    }

    function selectFromHash() {
      const slug = window.location.hash.replace(/^#industry-/, "");
      console.log("[industries-debug] selectFromHash", { hash: window.location.hash, slug });
      if (!slug) return;
      const index = slugToIndex(slug);
      if (index === -1) return;
      applySelection(index, "hashchange-or-mount");
    }

    function onDocumentClickCapture(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      console.log("[industries-debug] click captured", {
        targetTag: (event.target as HTMLElement | null)?.tagName,
        foundAnchor: !!anchor,
        href,
      });
      if (!href) return;
      const hashPos = href.indexOf("#industry-");
      if (hashPos === -1) return;
      const path = href.slice(0, hashPos);
      if (path && path !== window.location.pathname) return;
      const slug = href.slice(hashPos + "#industry-".length);
      const index = slugToIndex(slug);
      console.log("[industries-debug] click resolved", { href, slug, index, name: INDUSTRIES[index]?.name });
      if (index === -1) return;
      // Deferred one frame: let the click's own default navigation run
      // first (Next.js updates the URL/hash), so this doesn't race it.
      requestAnimationFrame(() => applySelection(index, "click-capture"));
    }

    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    document.addEventListener("click", onDocumentClickCapture, true);
    return () => {
      window.removeEventListener("hashchange", selectFromHash);
      document.removeEventListener("click", onDocumentClickCapture, true);
    };
  }, [reduceMotion]);

  function handleKeyDown(e: React.KeyboardEvent, i: number, orientation: "vertical" | "horizontal") {
    // Standard ARIA Tabs keyboard behavior: Left/Right (or Up/Down, since
    // desktop is a vertical tablist) move focus+selection between tabs.
    const last = INDUSTRIES.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next !== null) {
      e.preventDefault();
      setActiveIndex(next);
      document.getElementById(tabId(next, orientation))?.focus();
    }
  }

  function TabButton({ i, orientation }: { i: number; orientation: "vertical" | "horizontal" }) {
    const isActive = i === activeIndex;
    return (
      <button
        type="button"
        role="tab"
        id={tabId(i, orientation)}
        aria-selected={isActive}
        aria-controls={panelId(i)}
        tabIndex={isActive ? 0 : -1}
        onClick={() => setActiveIndex(i)}
        onKeyDown={(e) => handleKeyDown(e, i, orientation)}
        className={cn(
          "shrink-0 rounded-sm text-left font-body text-base transition-colors duration-150",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          orientation === "vertical"
            ? cn("border-l-2 py-1 pl-4", isActive ? "border-accent" : "border-border")
            : "whitespace-nowrap px-1 py-2",
          isActive ? "font-semibold text-accent" : "font-normal text-text-muted hover:text-text-primary",
        )}
      >
        {INDUSTRIES[i].name}
      </button>
    );
  }

  return (
    <Section environment="white">
      <Container size="lg" className="py-24 md:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-16">
          {/* Mobile: horizontal scrollable tabs */}
          <nav aria-label="Industries" className="lg:hidden">
            <div
              role="tablist"
              aria-orientation="horizontal"
              className="flex gap-6 overflow-x-auto border-b border-border pb-3"
            >
              {INDUSTRIES.map((_, i) => (
                <TabButton key={INDUSTRIES[i].name} i={i} orientation="horizontal" />
              ))}
            </div>
          </nav>

          {/* Desktop: sticky vertical sidebar */}
          <nav aria-label="Industries" className="hidden lg:block">
            <div role="tablist" aria-orientation="vertical" className="sticky top-28 flex flex-col gap-3">
              {INDUSTRIES.map((_, i) => (
                <TabButton key={INDUSTRIES[i].name} i={i} orientation="vertical" />
              ))}
            </div>
          </nav>

          {/* Detail panel — content swaps instantly on tab change, no
              transition/accordion, per the explicit "swaps instantly"
              requirement. */}
          <div
            role="tabpanel"
            id={panelId(activeIndex)}
            aria-labelledby={tabId(activeIndex)}
            tabIndex={0}
            className="min-w-0"
          >
            <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-text-primary md:text-4xl">
              {active.name}
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
              <div>
                <Caption tone="accent">Risk</Caption>
                <Text tone="secondary" className="mt-3">
                  {active.risk}
                </Text>
              </div>

              <div>
                <Caption tone="accent">Priorities</Caption>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {active.priorities.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Icon icon={Check} size="sm" className="mt-0.5 shrink-0 text-accent" />
                      <Text tone="secondary" size="sm">
                        {item}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Caption tone="accent">Approach</Caption>
                <Text tone="secondary" className="mt-3">
                  {active.approach}
                </Text>
              </div>

              <div>
                <Caption tone="accent">Next Step</Caption>
                <div className="mt-4">
                  {active.nextStep.kind === "assessment" ? (
                    <AssessmentCta href={TALLY_ASSESSMENT_URL} variant="primary" size="md">
                      {active.nextStep.label}
                    </AssessmentCta>
                  ) : (
                    <ButtonLink href="/contact" variant="primary" size="md">
                      {active.nextStep.label}
                    </ButtonLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
