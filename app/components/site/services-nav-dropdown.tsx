"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Icon, NavLink } from "../ui";
import { cn } from "../ui/cn";
import { usePrefersReducedMotion } from "../motion/use-reduced-motion";

/**
 * ServicesNavDropdown — Services nav-item mega-menu (minimal variant).
 *
 * Scope: ONLY the "Services" item in SiteHeader gets this treatment — every
 * other nav item (Home/Cyber Health/Industries/Company/Resources/Contact)
 * stays a plain `NavLink`, untouched.
 *
 * Content source: the 8 capability names below are copied verbatim from the
 * already-locked, already-shipped /services page data (`LiveServices.
 * LIVE_SERVICES` for 01-04, `AdditionalCapabilities.FINALIZING_SERVICES` for
 * 05-08) and their real `capability-0N` DOM ids / CategoryNav entries —
 * nothing invented here, just re-pointed at anchors on the real page. No
 * file named `oragrol_services_page_content.md` exists anywhere in this repo
 * (checked via a full-repo search before building this) — flagged to
 * Mohammad rather than guessing at a source; this list is the actual
 * confirmed content instead. Keep in sync with those two files if either
 * capability list ever changes.
 *
 * Two render variants sharing one set of interaction logic:
 *  - "desktop": hover/focus-opened dropdown panel, absolutely positioned
 *    below the existing `NavLink` trigger (same component every other nav
 *    item uses, so it's pixel-identical at rest).
 *  - "mobile": inline disclosure inside the existing full-viewport mobile
 *    nav panel — a chevron button toggles an indented sub-list; the
 *    "Services" label itself stays a normal link to /services.
 *
 * Behavior (shared across both variants):
 *  - Tab onto the trigger opens the panel (`onFocus` bubbles from the
 *    trigger); Tab then continues naturally into the panel's own links
 *    (real DOM order, no manual tabindex juggling).
 *  - Escape closes and returns focus to the trigger (window-level listener,
 *    matches HeaderSearch's own existing Escape pattern).
 *  - ArrowDown/ArrowUp move focus between the 8 panel links (and from the
 *    trigger into the first/last item).
 *  - Outside click closes it (desktop hover-opened case doesn't always fire
 *    mouseleave/blur first, e.g. a click that lands without prior pointer
 *    movement over the panel).
 *  - Closes on pathname change (route change), and explicitly on every item
 *    click (covers same-page anchor navigation, where pathname alone
 *    wouldn't change).
 *  - `prefers-reduced-motion`: panel show/hide becomes an instant
 *    `hidden`/`block` swap, no fade/scale transition.
 *  - Desktop hover close is debounced ~150ms so crossing the small gap
 *    between the trigger and the panel doesn't prematurely close it (the
 *    panel is a DOM descendant of the hover container, but the gap between
 *    trigger and panel isn't covered by either element, so an
 *    un-debounced `mouseleave` fires mid-transit on a straight diagonal
 *    move).
 */

export interface ServicesMenuItem {
  label: string;
  href: string;
}

const SERVICES_MENU_ITEMS: ServicesMenuItem[] = [
  { label: "Virtual CISO", href: "/services#capability-01" },
  { label: "Risk Assessment & Compliance", href: "/services#capability-02" },
  { label: "Vulnerability Assessment & Management", href: "/services#capability-03" },
  { label: "Security Awareness Training", href: "/services#capability-04" },
  { label: "Managed Security Services / 24/7 MDR", href: "/services#capability-05" },
  { label: "Penetration Testing", href: "/services#capability-06" },
  { label: "Endpoint Protection / EDR", href: "/services#capability-07" },
  { label: "Incident Response", href: "/services#capability-08" },
];

const CLOSE_DELAY_MS = 150;

export function ServicesNavDropdown({
  variant,
  active,
  className,
}: {
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
  // panel on a real Tab-in, undoing the close on the same keypress (caught
  // live: `aria-expanded` stayed "true" after Escape until this was added).
  const suppressNextFocusOpenRef = useRef(false);
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const panelId = useId();

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
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Escape closes and returns focus to the trigger, from anywhere (covers
  // hover-opened state too, not just keyboard-focused state).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        suppressNextFocusOpenRef.current = true;
        containerRef.current?.querySelector<HTMLElement>("[data-services-trigger]")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const focusItem = (index: number) => {
    const count = SERVICES_MENU_ITEMS.length;
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
      focusItem(currentIndex === -1 ? SERVICES_MENU_ITEMS.length - 1 : currentIndex - 1);
    }
  };

  const closePanel = () => setOpen(false);

  const panel = (
    <div
      id={panelId}
      className={
        variant === "desktop"
          ? cn(
              "absolute left-0 top-full z-10 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-xl",
              reduceMotion
                ? open
                  ? "block"
                  : "hidden"
                : cn(
                    "origin-top transition-[opacity,transform] duration-150 ease-out",
                    open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0",
                  ),
            )
          : cn("overflow-hidden", open ? "block" : "hidden")
      }
    >
      {variant === "desktop" && (
        <p className="px-3 pb-1.5 pt-1 font-heading text-xs font-semibold uppercase tracking-wider text-text-muted">
          Capabilities
        </p>
      )}
      <ul
        className={cn(
          "flex flex-col",
          variant === "mobile" && "gap-1 border-l border-border py-1 pl-3",
        )}
      >
        {SERVICES_MENU_ITEMS.map((item, index) => (
          <li key={item.href}>
            <Link
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              href={item.href}
              onClick={closePanel}
              className={
                variant === "desktop"
                  ? "block rounded-lg px-3 py-2 font-body text-sm text-text-secondary transition-colors duration-150 hover:bg-text-primary/5 hover:text-accent focus-visible:bg-text-primary/5 focus-visible:text-accent focus-visible:outline-none"
                  : "block rounded-sm py-1.5 font-body text-sm text-text-secondary transition-colors duration-150 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
              }
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  if (variant === "mobile") {
    return (
      <div ref={containerRef} className={className} onKeyDown={onContainerKeyDown}>
        <div className="flex items-center">
          <NavLink href="/services" active={active} data-services-trigger className="flex-1 py-2 text-base">
            Services
          </NavLink>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Collapse Services capabilities" : "Expand Services capabilities"}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:bg-text-primary/5 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Icon
              icon={ChevronDown}
              size="sm"
              className={cn(!reduceMotion && "transition-transform duration-200", open && "rotate-180")}
            />
          </button>
        </div>
        <div className="pl-4">{panel}</div>
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
        href="/services"
        active={active}
        data-services-trigger
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
      >
        Services
      </NavLink>
      {panel}
    </div>
  );
}
