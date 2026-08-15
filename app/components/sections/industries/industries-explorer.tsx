"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import { ButtonLink, Caption, Container, Icon, Section, Text, cn } from "../../ui";
import { AssessmentCta } from "../cyber-health/assessment-cta";
import { TALLY_ASSESSMENT_URL } from "../cyber-health/hero";
import { INDUSTRIES } from "./industries-data";

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
  const active = INDUSTRIES[activeIndex];

  function tabId(i: number) {
    return `${tablistId}-tab-${i}`;
  }
  function panelId(i: number) {
    return `${tablistId}-panel-${i}`;
  }

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
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
      document.getElementById(tabId(next))?.focus();
    }
  }

  function TabButton({ i, orientation }: { i: number; orientation: "vertical" | "horizontal" }) {
    const isActive = i === activeIndex;
    return (
      <button
        type="button"
        role="tab"
        id={tabId(i)}
        aria-selected={isActive}
        aria-controls={panelId(i)}
        tabIndex={isActive ? 0 : -1}
        onClick={() => setActiveIndex(i)}
        onKeyDown={(e) => handleKeyDown(e, i)}
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
