"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "./cn";
import { Icon } from "./icon-wrapper";

/**
 * Navigation primitives — Step 3 (shell only; final nav content is out of
 * scope for this step). NavLink lives in link.tsx and is reused here — see
 * that file for its underline/accent hover behavior.
 *
 * Redesign, 2026-08-21: `NavBar` used to pick a single Tailwind breakpoint
 * (`breakpoint="lg"`, i.e. 1024px) below which `links` disappeared and the
 * mobile trigger took over — a guess about how much horizontal room 6+ nav
 * items, a search icon, and a CTA button actually need, never verified
 * against their real rendered width. That guess is exactly what caused the
 * nav to overlap the logo: `SiteHeader`'s own comment (before this pass)
 * already flagged "labels/CTA/EN|FR wrapping" right at that breakpoint once
 * a 7th nav item was added — a symptom of an untested boundary, not a
 * one-off bug at one specific width. Patching the breakpoint number would
 * only move the same failure to a different, still-untested width.
 *
 * Root-cause fix: `NavBar` now measures. `desktopContent`'s true, unwrapped
 * width is read live from a hidden clone (same node, rendered twice — see
 * below) via `ResizeObserver`, and compared against the row's real
 * available width (also measured, not assumed) every time either changes.
 * `desktopContent` renders only when it actually fits; `collapsedContent`
 * (the mobile trigger) renders the instant it doesn't — at ANY width, not
 * just the ones anyone happened to test. There is no longer a second place
 * (a matching `lg:hidden`/`lg:flex` pair) that has to independently agree
 * with this decision — SiteHeader's mobile trigger and mobile panel are now
 * both driven by this same one boolean.
 */

export interface NavBarProps {
  /** Logo / wordmark slot — always rendered, never collapses. */
  logo: ReactNode;
  /**
   * The full desktop nav cluster (links + CTA, typically) — rendered only
   * when it actually fits the available row width. Rendered a second time,
   * invisibly, purely to measure its natural width (see the component body)
   * — the exact same node both times, so there is no risk of the measured
   * copy silently drifting out of sync with what's actually shown.
   */
  desktopContent: ReactNode;
  /** Rendered instead of `desktopContent` once it stops fitting — typically a `MobileMenuTrigger`. */
  collapsedContent: ReactNode;
  /** Always-visible trailing content that sits between `desktopContent`/`collapsedContent` and the row's edge (e.g. a search icon) — its own rendered width is measured too, not guessed. */
  persistentActions?: ReactNode;
  className?: string;
}

export function NavBar({ logo, desktopContent, collapsedContent, persistentActions, className }: NavBarProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const persistentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Optimistic default (assume it fits) so a typical desktop load doesn't
  // flash a hamburger for one frame — corrected before paint on the client
  // by the layout effect below (useLayoutEffect runs synchronously after
  // DOM mutations, before the browser paints, which is exactly what avoids
  // a visible flicker here). On a genuinely narrow device the very first
  // server-rendered paint may briefly show the desktop cluster before
  // hydration — the same tradeoff every JS-measured responsive component
  // makes; a CSS media query default can't replace this without
  // reintroducing the exact untested-guess problem this exists to fix.
  const [fitsDesktop, setFitsDesktop] = useState(true);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const logoEl = logoRef.current;
    const persistentEl = persistentRef.current;
    const measureEl = measureRef.current;
    if (!row || !logoEl || !measureEl) return;

    function check() {
      // GAP_BUFFER covers the two `gap-4` flex gaps around the
      // desktop/collapsed slot (logo↔cluster, cluster↔persistentActions) —
      // a known, deterministic value derived from the gap classes actually
      // used below (16px × 2 = 32px), not a guessed content-fit number.
      const GAP_BUFFER = 40;
      const persistentWidth = persistentEl?.offsetWidth ?? 0;
      const available = row!.clientWidth - logoEl!.offsetWidth - persistentWidth - GAP_BUFFER;
      const needed = measureEl!.scrollWidth;
      setFitsDesktop(needed <= available);
    }

    check();
    // Re-check on any change to the row's available width (viewport
    // resize, zoom, sidebar/devtools opening) AND on any change to the
    // cluster's own natural width (e.g. a web font finishing load and
    // reflowing text at different metrics than its fallback).
    const ro = new ResizeObserver(check);
    ro.observe(row);
    ro.observe(measureEl);
    if (persistentEl) ro.observe(persistentEl);
    return () => ro.disconnect();
  }, []);

  return (
    <header className={cn("w-full", className)}>
      {/*
        The header BAR itself (this <header>'s own background/border,
        supplied by the caller via `className`) still has no max-width —
        unchanged from D-001 (Header Fix Pass 2): it needs to stay
        genuinely full-bleed, matching the Hero's own edge-to-edge image,
        or the header reads as a mismatched box floating on top of it.

        The ROW'S CONTENT is different — reported 2026-08-21 (same day as
        the two-tier redesign) as an "awkward empty gap" at 24"+/1920px+
        monitors: logo pinned to the true left edge, the nav+CTA cluster
        pinned to the true right edge, `justify-between` filling
        whatever's left in between with dead space that grows without
        bound as the viewport widens — visually broken in the opposite
        direction from the original overlap bug, but the same root cause
        (a layout rule that was never checked against how it looks at the
        width where it actually gets used). Wrapped the row in a
        `max-w-[1440px]` `mx-auto` container — 1440px because it's not a
        new number: it's `Container`'s own existing `xl` tier (D-015/016),
        the same width Home's Hero/Cyber Health's Flow/the footer already
        use for their own content, so the nav row now lines up with the
        same content column those sections already establish instead of
        inventing an unrelated cap. Below 1440px this changes nothing —
        the wrapper's own width simply equals the viewport's, identical to
        the unwrapped behavior already verified across 1024-1920px. Above
        it, logo/cluster move inward together (still `justify-between`
        against each other, just within the capped box) rather than
        D-001's finite-cap attempts, which centered the WHOLE header
        (background included) and broke the "matches the full-bleed Hero"
        requirement that decision existed to protect — this cap only ever
        touches the row's own children, never the `<header>`'s background.
      */}
      <div className="mx-auto w-full max-w-[1440px]">
        <div ref={rowRef} className="flex h-20 w-full items-center justify-between px-6 md:px-12">
          <div ref={logoRef} className="flex shrink-0 items-center">
            {logo}
          </div>

        {/*
          Hidden measurement clone — the exact same `desktopContent` node,
          not a hand-copied approximation, so it can never visually drift
          from what's actually shown. `visibility:hidden` (not
          `display:none`, which reports zero size) keeps it fully
          measurable while removing it from layout flow, hit-testing, and
          tab order; `aria-hidden` + `pointer-events-none` are redundant
          belt-and-suspenders on top of that. `w-max` forces it to lay out
          at its natural, unwrapped size regardless of any inherited width
          constraint from `absolute` positioning.
        */}
          <div
            ref={measureRef}
            aria-hidden="true"
            data-nav-measure-clone="true"
            className="pointer-events-none invisible absolute left-0 top-0 flex w-max items-center gap-8"
          >
            {desktopContent}
          </div>

          <div className="flex items-center gap-4">
            {fitsDesktop ? desktopContent : collapsedContent}
            {persistentActions && (
              <div ref={persistentRef} className="flex shrink-0 items-center">
                {persistentActions}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export interface MobileMenuTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-expanded" | "aria-label" | "type"> {
  /** Whether the (out-of-scope) mobile menu this controls is open. */
  isOpen?: boolean;
}

/**
 * Hamburger/close trigger only — the menu panel itself is out of scope.
 * No breakpoint is baked in here — `NavBar` above decides, by measurement,
 * when this renders at all; this component doesn't need to know why.
 */
export function MobileMenuTrigger({
  isOpen = false,
  className,
  ...props
}: MobileMenuTriggerProps) {
  return (
    <button
      type="button"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors duration-150 hover:bg-text-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
      {...props}
    >
      <Icon icon={isOpen ? X : Menu} size="md" />
    </button>
  );
}
