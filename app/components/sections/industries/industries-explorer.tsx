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
  // just because the hash changed, so `hashchange` is the real signal).
  // Also explicitly scrolls the matching tab into view: relying on the
  // browser's own native hash-scroll isn't enough on its own once the
  // *content* selection needs to change too, and `scrollIntoView` on the
  // currently-hidden orientation's (display:none) element is a documented
  // no-op — calling it on both ids is safe, only the one actually laid out
  // at the current viewport width moves.
  //
  // Bug fix (2026-08-21): on mobile, clicking a nav dropdown industry link
  // correctly selected the right tab/panel content internally (confirmed:
  // the `<h2>` always updated) but the page never visibly scrolled — a real
  // "nothing happened" bug, not the reported "lands near the footer"
  // verbatim, but the same underlying failure (a click that promises a
  // specific industry's content doesn't bring it into view). Root-caused
  // by testing the actual click flow directly (desktop worked in every
  // test — cold load, warm client-side transition, dev and production
  // builds) rather than guessing: mobile's own `scrollIntoView` call below
  // targets the horizontal tab strip with `block: "nearest"`, which is
  // *correctly* a no-op whenever that strip is already inside the
  // viewport — true on every mobile page load, since the strip sits near
  // the top of the page. That left the actual detail panel (stacked BELOW
  // the tab strip on mobile, `grid-cols-1` until `lg:`) off-screen with
  // nothing telling the visitor a selection even happened. Desktop never
  // had this problem: the sidebar tab and the panel sit side-by-side in
  // the same row there, so centering the tab already brings the panel
  // along with it — confirmed this fix doesn't touch that already-working
  // path by scoping it to below the `lg` breakpoint (1024px, the same cutoff
  // this component's own `hidden lg:block` / `lg:hidden` layout already
  // uses). Targets `[role="tabpanel"]` (a stable selector — there is only
  // ever one, regardless of which industry is active) rather than the
  // panel's own `id` (which changes with `activeIndex` and wouldn't
  // resolve to the new selection synchronously, since `setActiveIndex`
  // hasn't committed yet at this point in the function) — deferred one
  // frame via `requestAnimationFrame` so the position measured is the
  // post-switch one, not the outgoing panel's.
  useEffect(() => {
    function selectFromHash() {
      const slug = window.location.hash.replace(/^#industry-/, "");
      if (!slug) return;
      const index = INDUSTRIES.findIndex((industry) => slugifyIndustryName(industry.name) === slug);
      if (index === -1) return;
      setActiveIndex(index);
      const behavior = reduceMotion ? "auto" : "smooth";
      document.getElementById(tabId(index, "vertical"))?.scrollIntoView({ behavior, block: "center" });
      document.getElementById(tabId(index, "horizontal"))?.scrollIntoView({ behavior, block: "nearest", inline: "center" });
      if (window.innerWidth < 1024) {
        requestAnimationFrame(() => {
          document.querySelector('[role="tabpanel"]')?.scrollIntoView({ behavior, block: "start" });
        });
      }
    }
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => window.removeEventListener("hashchange", selectFromHash);
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
