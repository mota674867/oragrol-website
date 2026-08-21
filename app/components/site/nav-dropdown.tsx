"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Icon, NavLink } from "../ui";
import { cn } from "../ui/cn";
import { usePrefersReducedMotion } from "../motion/use-reduced-motion";
import { INDUSTRIES, slugifyIndustryName } from "../sections/industries/industries-data";
import { ARTICLES } from "../sections/resources/articles-data";
import { getBusinessAutomationTier2, getServicesTier1 } from "../sections/services/services-data";
import { getTiers } from "../sections/solutions/solutions-data";

/**
 * NavItemDropdown — generalized nav mega-menu, extracted from the
 * Services-only `ServicesNavDropdown` (D-053/D-054) to also cover
 * Solutions/Industries/Resources (D-055). Same component, driven by a
 * per-nav-item `NavDropdownConfig` instead of hardcoded Services data.
 *
 * Which nav items get this vs. staying a plain `NavLink` was decided by
 * actually reading each page's real content/DOM first, not assumed:
 *  - Services/Solutions/Industries/Resources: real, distinct sub-content
 *    exists (confirmed below per item) → dropdown.
 *  - Cyber Health/Company: single narrative flow, no independently
 *    navigable sub-sections, no ids anywhere in their section files →
 *    stay plain `NavLink`s, untouched, per Mohammad's own stated examples.
 *
 * Per-item content/anchor provenance:
 *  - Services / Business Automation (2026-08-20 nav split, superseding
 *    this same date's earlier "one combined 2-column dropdown" — see
 *    DECISIONS.md): Business Automation became its own top-level nav item
 *    and page, so these are now two separate single-column dropdowns
 *    (10 cybersecurity categories under Services, 5 under Business
 *    Automation), hrefs/labels still sourced directly from
 *    `services-data.ts` (not re-typed, can't drift out of sync).
 *  - Solutions: 3 real tiers (`TierCards`) + 1 real add-on
 *    (`PentestAddon`) — real content, but NO anchor ids existed on
 *    /solutions before this change. Added `id="tier-0N"` /
 *    `id="pentest-addon"` (+ `scroll-mt-28`) directly to those existing
 *    elements — purely structural, no visual/content change — rather than
 *    link to anchors that didn't exist. Single column (4 items): a real
 *    tier/add-on split exists, but 4 items don't need forced sub-grouping.
 *  - Industries: 9 real, distinct industries (`INDUSTRIES` in
 *    `industries-data.ts`) — but `IndustriesExplorer` is a client-state
 *    tab widget (WAI-ARIA Tabs), not scroll-anchored sections, so no
 *    working per-industry link existed. Added real deep-linking to
 *    `industries-explorer.tsx`: each tab now has a stable
 *    `industry-<slug>` id (see `slugifyIndustryName`, co-located in
 *    `industries-data.ts` as the single source of truth both files share),
 *    and the explorer reads `location.hash` (on mount + `hashchange`) to
 *    select + scroll to the matching industry. Single column, all 9, in
 *    the page's own existing order — no sector-taxonomy grouping was
 *    invented; the source content doesn't group these 9 into named
 *    categories anywhere, unlike Services' groups (which came from real
 *    per-capability copy).
 *  - Resources: 6 real, already-live article pages (`/resources/<slug>`)
 *    — no anchors to add, these are genuine separate routes already.
 *    Single column: checked whether the 3 filter facets
 *    (contentType/topic/industry) group naturally — every article has a
 *    UNIQUE topic, and the other two facets split 5:1 — no natural
 *    multi-item grouping exists, so forcing columns here would invent
 *    structure the content doesn't have.
 *
 * Chevron: every dropdown trigger (desktop inline in the `NavLink`, mobile
 * on its existing separate toggle button) now shows a small `ChevronDown`
 * — the "there's more here" signal Mohammad asked for. Plain-link items
 * (Cyber Health, Company) render no chevron, same as before.
 *
 * Interaction contract (identical across every config, desktop + mobile):
 *  - Tab onto the trigger opens the panel (`onFocus` bubbles from the
 *    trigger); Tab then continues naturally into the panel's own links
 *    (real DOM order).
 *  - Escape closes and returns focus to the trigger (window-level
 *    listener, matches HeaderSearch's own existing Escape pattern). A
 *    one-shot `suppressNextFocusOpenRef` flag stops that programmatic
 *    refocus from re-triggering `onFocus` and reopening the panel on the
 *    same keypress — a real bug caught during Services' own verification
 *    (D-053).
 *  - ArrowDown/ArrowUp move a roving focus across every item link, in
 *    column-by-column display order, regardless of how many columns —
 *    category titles (when present) aren't part of this roving set, only
 *    reachable via Tab.
 *  - Outside click closes it (covers a click landing without prior
 *    pointer movement over the panel, which hover-close alone wouldn't
 *    catch).
 *  - Closes on pathname change (route change) and explicitly on every
 *    item click (covers same-page anchor navigation, where `pathname`
 *    alone doesn't change).
 *  - `prefers-reduced-motion`: panel show/hide becomes an instant
 *    `hidden`/`block` swap, no fade/scale transition.
 *  - Desktop hover-close is debounced ~150ms so crossing the small gap
 *    between the trigger and the panel doesn't prematurely close it.
 */

export interface NavDropdownItem {
  label: string;
  href: string;
}

export interface NavDropdownColumn {
  /** Omit for a flat single-column list (Solutions/Industries/Resources)
   *  — a column doesn't need a heading just because Services' does. */
  heading?: NavDropdownItem;
  items: NavDropdownItem[];
}

export interface NavDropdownConfig {
  /** Trigger label, e.g. "Services". */
  label: string;
  /** Trigger href — the page hub, same target the plain `NavLink` this
   *  replaces would have used. */
  href: string;
  columns: NavDropdownColumn[];
  /** Desktop panel width, sized per config's own content (Tailwind
   *  arbitrary-value width class, e.g. `"w-72"` / `"w-[820px]"`). */
  desktopPanelWidthClass: string;
  /** Desktop inner layout — `"grid grid-cols-N gap-x-6"` for a grouped,
   *  multi-column config (Services), `"flex flex-col"` for a flat
   *  single-column one (everything else so far). */
  desktopLayoutClassName: string;
}

const SERVICES_TIER1_CATEGORIES = getServicesTier1();
const SERVICES_TIER2_CATEGORIES = getBusinessAutomationTier2();

// Single column, 10 items — same shape as Industries' existing 9-item
// single-column dropdown (w-72), not a new pattern.
const SERVICES_DROPDOWN: NavDropdownConfig = {
  label: "Services",
  href: "/services",
  desktopPanelWidthClass: "w-72",
  desktopLayoutClassName: "flex flex-col",
  columns: [
    {
      items: SERVICES_TIER1_CATEGORIES.map((c) => ({
        label: c.name,
        href: `/services#category-${c.code.toLowerCase()}`,
      })),
    },
  ],
};

// Single column, 6 items — same shape/size as the existing Solutions
// dropdown (w-64), not a new pattern. "Packages" (2026-08-21) is listed
// first, matching the page's own top-to-bottom order (ProjectOffers +
// RecurringPackages sit above the 5 categories on the page) — links to
// `id="packages"` on `ProjectOffers`, the first of those two sections.
const BUSINESS_AUTOMATION_DROPDOWN: NavDropdownConfig = {
  label: "Business Automation",
  href: "/business-automation",
  desktopPanelWidthClass: "w-64",
  desktopLayoutClassName: "flex flex-col",
  columns: [
    {
      items: [
        { label: "Packages", href: "/business-automation#packages" },
        ...SERVICES_TIER2_CATEGORIES.map((c) => ({
          label: c.name,
          href: `/business-automation#category-${c.code.toLowerCase()}`,
        })),
      ],
    },
  ],
};

// 2026-08-20: labels sourced from the real tier names (solutions-data.ts,
// same reuse pattern as Services/Industries/Resources' dropdowns) —
// replaces the old hardcoded "Level 01/02/03" placeholders, which would
// otherwise silently go stale next to the page's now-real tier names.
const SOLUTIONS_TIERS = getTiers();

const SOLUTIONS_DROPDOWN: NavDropdownConfig = {
  label: "Solutions",
  href: "/solutions",
  desktopPanelWidthClass: "w-64",
  desktopLayoutClassName: "flex flex-col",
  columns: [
    {
      items: [
        ...SOLUTIONS_TIERS.map((tier, i) => ({ label: tier.name, href: `/solutions#tier-0${i + 1}` })),
        { label: "Penetration Testing", href: "/solutions#pentest-addon" },
      ],
    },
  ],
};

// Hrefs computed via the same `slugifyIndustryName` the explorer itself
// uses (imported, not re-implemented) — can't drift out of sync with the
// real anchor ids `industries-explorer.tsx` renders.
const INDUSTRIES_DROPDOWN: NavDropdownConfig = {
  label: "Industries",
  href: "/industries",
  desktopPanelWidthClass: "w-72",
  desktopLayoutClassName: "flex flex-col",
  columns: [
    {
      items: INDUSTRIES.map((industry) => ({
        label: industry.name,
        href: `/industries#industry-${slugifyIndustryName(industry.name)}`,
      })),
    },
  ],
};

// The 6 articles are already real, separate pages — hrefs point straight
// at `/resources/<slug>`, sourced from the same `ARTICLES` array the
// listing/detail pages themselves render from (not re-typed).
const RESOURCES_DROPDOWN: NavDropdownConfig = {
  label: "Resources",
  href: "/resources",
  desktopPanelWidthClass: "w-96",
  desktopLayoutClassName: "flex flex-col",
  columns: [
    {
      items: ARTICLES.map((article) => ({
        label: article.title,
        href: `/resources/${article.slug}`,
      })),
    },
  ],
};

/** Keyed by trigger href — `SiteHeader` looks up each `NAV_LINKS` entry
 *  here; a miss means that item stays a plain `NavLink`. */
export const NAV_DROPDOWNS: Record<string, NavDropdownConfig> = {
  "/services": SERVICES_DROPDOWN,
  "/business-automation": BUSINESS_AUTOMATION_DROPDOWN,
  "/solutions": SOLUTIONS_DROPDOWN,
  "/industries": INDUSTRIES_DROPDOWN,
  "/resources": RESOURCES_DROPDOWN,
};

const CLOSE_DELAY_MS = 150;

const categoryTitleClasses =
  "block rounded-sm font-heading text-xs font-semibold uppercase tracking-wider text-text-muted transition-colors duration-150 hover:text-accent focus-visible:text-accent focus-visible:outline-none";

export function NavItemDropdown({
  config,
  variant,
  active,
  className,
}: {
  config: NavDropdownConfig;
  variant: "desktop" | "mobile";
  active?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set right before an Escape-triggered `.focus()` call on the trigger,
  // consumed by the very next `onFocus` — without this, refocusing the
  // trigger programmatically re-triggers the same `onFocus` that opens the
  // panel on a real Tab-in, undoing the close on the same keypress.
  const suppressNextFocusOpenRef = useRef(false);
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const panelId = useId();

  const flatItems = config.columns.flatMap((column) => column.items);

  const cancelScheduledClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  // Route change (different page) closes the panel — adjusted during render
  // (React's recommended "reset state when a prop changes" pattern, same
  // one SiteHeader itself already uses for `mobileOpen`) rather than in an
  // Effect, so it doesn't cost an extra render/commit pass and doesn't trip
  // the "no setState synchronously in an effect" lint rule.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  // Unmount safety — don't fire setOpen after the component's gone.
  useEffect(() => cancelScheduledClose, []);

  // Outside click closes it, regardless of how it was opened.
  //
  // Listens on "click", not "pointerdown" (a real bug caught while adding
  // the Solutions/Industries/Resources dropdowns, D-055): with multiple
  // sibling dropdowns now on the page, closing on "pointerdown" meant
  // clicking a LOWER dropdown's own trigger — while a dropdown ABOVE it was
  // still open — closed the one above (correct) but then MISSED the click
  // on the lower trigger entirely. Closing on pointerdown fires (and
  // collapses/reflows the open panel above) before the browser's own
  // mouseup/click completes; Chromium resolves a click's target via
  // elementFromPoint at mouseup, so once the layout has already shifted
  // upward underneath a stationary pointer, mouseup lands on whatever
  // reflowed into that same screen position instead of the element the
  // gesture started on — reproduced live (mobile, Services open, then
  // clicking Solutions' chevron: Services correctly closed, but Solutions
  // never opened — confirmed via a mid-transition screenshot showing
  // Services' chevron still rotating closed while Solutions' own chevron
  // never left its resting position). "click" only fires after mouseup, by
  // which point React's own synthetic click on the actual target element
  // has already run (React's delegated listener sits below this
  // document-level one in the bubble path, so it fires first) — so the
  // lower trigger's own toggle always lands before this outside-close logic
  // ever runs, regardless of any reflow it goes on to cause.
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  // Escape closes and returns focus to the trigger, from anywhere (covers
  // hover-opened state too, not just keyboard-focused state).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        suppressNextFocusOpenRef.current = true;
        containerRef.current?.querySelector<HTMLElement>("[data-nav-trigger]")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const focusItem = (index: number) => {
    const count = flatItems.length;
    const clamped = ((index % count) + count) % count;
    itemRefs.current[clamped]?.focus();
  };

  const onContainerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const currentIndex = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (event.key === "ArrowDown") {
      focusItem(currentIndex === -1 ? 0 : currentIndex + 1);
    } else {
      focusItem(currentIndex === -1 ? flatItems.length - 1 : currentIndex - 1);
    }
  };

  const closePanel = () => setOpen(false);

  // Shared across both variants: assigns each item link a stable index into
  // the flattened list (for itemRefs / roving arrow-key focus) as the
  // columns render, without a separate lookup pass.
  let flatIndex = 0;
  const nextIndex = () => flatIndex++;

  const panelVisibilityClasses =
    variant === "desktop"
      ? reduceMotion
        ? open
          ? "block"
          : "hidden"
        : cn(
            "origin-top transition-[opacity,transform] duration-150 ease-out",
            open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0",
          )
      : open
        ? "block"
        : "hidden";

  const itemLinkClasses =
    variant === "desktop"
      ? "block rounded-lg px-2 py-2 font-body text-sm text-text-secondary transition-colors duration-150 hover:bg-text-primary/5 hover:text-accent focus-visible:bg-text-primary/5 focus-visible:text-accent focus-visible:outline-none"
      : "block rounded-sm py-1.5 font-body text-sm text-text-secondary transition-colors duration-150 hover:text-accent focus-visible:text-accent focus-visible:outline-none";

  const chevron = (
    <Icon
      icon={ChevronDown}
      size="sm"
      className={cn("shrink-0", !reduceMotion && "transition-transform duration-200", open && "rotate-180")}
    />
  );

  const panel =
    variant === "desktop" ? (
      <div
        id={panelId}
        className={cn(
          "absolute left-0 top-full z-10 mt-2 rounded-xl border border-border bg-background p-5 shadow-xl",
          config.desktopPanelWidthClass,
          panelVisibilityClasses,
        )}
      >
        <div className={config.desktopLayoutClassName}>
          {config.columns.map((column, columnIndex) => (
            <div key={column.heading?.label ?? columnIndex}>
              {column.heading && (
                <Link href={column.heading.href} onClick={closePanel} className={cn(categoryTitleClasses, "px-2 pb-2")}>
                  {column.heading.label}
                </Link>
              )}
              <ul className="flex flex-col">
                {column.items.map((item) => {
                  const index = nextIndex();
                  return (
                    <li key={item.href}>
                      <Link
                        ref={(el) => {
                          itemRefs.current[index] = el;
                        }}
                        href={item.href}
                        onClick={closePanel}
                        className={itemLinkClasses}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div id={panelId} className={panelVisibilityClasses}>
        <ul className="flex flex-col gap-1 border-l border-border py-1 pl-3">
          {config.columns.map((column, columnIndex) => (
            <li key={column.heading?.label ?? columnIndex} className="pt-3 first:pt-0">
              {column.heading && (
                <Link href={column.heading.href} onClick={closePanel} className={cn(categoryTitleClasses, "pb-1")}>
                  {column.heading.label}
                </Link>
              )}
              <ul className="flex flex-col">
                {column.items.map((item) => {
                  const index = nextIndex();
                  return (
                    <li key={item.href}>
                      <Link
                        ref={(el) => {
                          itemRefs.current[index] = el;
                        }}
                        href={item.href}
                        onClick={closePanel}
                        className={itemLinkClasses}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );

  if (variant === "mobile") {
    return (
      <div ref={containerRef} className={className} onKeyDown={onContainerKeyDown}>
        <div className="flex items-center">
          <NavLink href={config.href} active={active} data-nav-trigger className="flex-1 py-2 text-base">
            {config.label}
          </NavLink>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? `Collapse ${config.label}` : `Expand ${config.label}`}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:bg-text-primary/5 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {chevron}
          </button>
        </div>
        <div className="overflow-hidden pl-4">{panel}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseEnter={() => {
        cancelScheduledClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      // Hardening for a reported bug ("clicking an Industries item closes
      // the dropdown but doesn't navigate"): `cancelScheduledClose()` was
      // previously only wired to `onMouseEnter`, so a `scheduleClose()`
      // armed by an earlier, brief mouseleave (e.g. an imprecise diagonal
      // move from the trigger into the panel) could still be pending when
      // the user commits to a click. If that 150ms timer fires in the gap
      // between mousedown and mouseup, `setOpen(false)` flips the panel to
      // `invisible` (visibility:hidden, non-hit-testable) mid-click,
      // swallowing it before it reaches the `<Link>` — matching the
      // reported symptom. Cancelling on pointerdown (capture, so it runs
      // before the click's own handlers) closes that window: once the user
      // has physically started a click anywhere in the trigger or panel,
      // any pending close is cancelled first. (Extensive live reproduction
      // attempts were inconclusive on isolating this exact race — see
      // PROJECT_MEMORY.md for the full investigation — but this is a real,
      // narrow gap in the existing debounce logic regardless, and the fix
      // is a safe no-op when no close is pending.)
      onPointerDownCapture={cancelScheduledClose}
      onFocus={() => {
        if (suppressNextFocusOpenRef.current) {
          suppressNextFocusOpenRef.current = false;
          return;
        }
        setOpen(true);
      }}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
      onKeyDown={onContainerKeyDown}
    >
      <NavLink
        href={config.href}
        active={active}
        data-nav-trigger
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex items-center gap-1"
      >
        {config.label}
        {chevron}
      </NavLink>
      {panel}
    </div>
  );
}
