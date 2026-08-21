"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import { ButtonLink, MobileMenuTrigger, NavBar, NavLink } from "../ui";
import { cn } from "../ui/cn";
import { OragrolLogo } from "../brand/oragrol-logo";
import { HeaderSearch } from "./header-search";
import { NAV_DROPDOWNS, NavItemDropdown } from "./nav-dropdown";

/**
 * SiteHeader — Step 4, refined in Header Refinement Pass 1, fixed in
 * Header Fix Pass 2, redesigned to a two-tier structure 2026-08-21
 * (utility bar + main nav, Bell Business reference pattern).
 *
 * Composes the Step 3 nav primitives (NavBar shell, NavLink, MobileMenuTrigger)
 * rather than re-implementing them.
 *
 * Background (Pass 2 fix): two stacked gradient layers instead of a
 * transparent/solid boolean toggle:
 *  - a permanent, subtle base gradient (dark tint at the header's own top
 *    edge, fading to transparent by its bottom edge) — always present, so
 *    the header blends into the Hero image instead of sitting on a hard
 *    edge, even before any scrolling.
 *  - a stronger gradient that fades in smoothly as `window.scrollY`
 *    increases (via the same `motion` scroll system used elsewhere — no
 *    GSAP), driving real interpolated opacity rather than a CSS
 *    `transition` on `background-image`, which browsers don't animate
 *    smoothly between two different gradients (it just snaps).
 *
 * Why it stays a gradient (never fully transparent) once scrolled, even
 * though the brief's own framing was about "blending into the Hero image":
 * this header is `fixed`, so it sits over EVERY section on the page, not
 * just the dark Hero — including the White/Light-blue sections further
 * down (Security Challenge, Services, FAQ, ...). A header that fades to
 * full transparency would make its white nav text illegible against those
 * lighter sections. The scrolled gradient's lightest stop is verified
 * (see report) to keep white text at ≥4.5:1 contrast even against a
 * worst-case white background behind it — still visibly softer than the
 * old flat bg-background/95, which is what actually read as "a hard black
 * bar" (a single flat value, snapped in at just 8px of scroll). The
 * gradient layers now span the FULL two-tier header (utility bar + main
 * nav, both inside the same `relative` wrapper), not just the main row.
 *
 * Scoped to env-dark for now: every page that exists today (Home) opens on
 * a Dark-environment section, so this reads correctly everywhere it's
 * currently used. Once light-first pages exist, this should read the
 * entry section's environment instead of assuming Dark.
 *
 * Two-tier redesign (2026-08-21): a thin utility bar now sits above the
 * main nav row — currently just "EN | FR" (moved here from the main row,
 * where it and the mobile panel each carried their own separate copy —
 * now there's exactly one, always visible, right-aligned, still the same
 * static/decorative label since full locale routing isn't built yet). The
 * `justify-between` layout with a placeholder on the left leaves genuine
 * room for a future item (a "Blog" link or a "Login" link were both named
 * as candidates) without another redesign. "Cyber Health" is no longer a
 * standalone main-nav link — it was a plain `NavLink` pointing at the
 * exact same `/cyber-health` the CTA button already goes to, a real
 * redundant duplicate, not a distinct destination. The main-row CTA's
 * label is now "Get Score" on desktop (the mobile panel's own CTA instance
 * is untouched — still the full "Get Your Cyber Health Score", where a
 * full-width button has the room for it).
 *
 * Adaptive nav (2026-08-21, root-cause fix for the nav/logo overlap bug):
 * `NavBar` now decides, via live measurement (see nav.tsx), whether the
 * nav-links+CTA cluster fits the row — not a guessed Tailwind breakpoint.
 * See nav.tsx's own doc comment for the full reasoning. `desktopContent`
 * below is that measured cluster; `HeaderSearch` is `persistentActions`
 * (always visible, on either side of the fits/doesn't-fit boundary);
 * `MobileMenuTrigger` is `collapsedContent`. The mobile trigger and mobile
 * panel are both gated by the SAME `fitsDesktop`-derived state now — there
 * is no second `lg:hidden`/`lg:flex` pair left to independently drift out
 * of sync with it.
 *
 * Nav dropdowns (D-053 Services, D-055 Solutions/Industries/Resources): a
 * `NAV_LINKS` entry whose href has a matching `NAV_DROPDOWNS[href]` config
 * renders as `NavItemDropdown` instead of a plain `NavLink`, both here and
 * in the mobile panel below — see nav-dropdown.tsx for the shared
 * component and each config's real-content provenance. Company stays a
 * plain `NavLink`: a single narrative flow with no independently
 * navigable sub-content (confirmed by reading its section files — no ids
 * anywhere), not an oversight.
 */

// "Cyber Health" removed 2026-08-21 — see the two-tier redesign note
// above: it was a redundant standalone link to the same page the CTA
// button already goes to.
const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Business Automation", href: "/business-automation" },
  { label: "Solutions", href: "/solutions" },
  { label: "Industries", href: "/industries" },
  { label: "Resources", href: "/resources" },
  { label: "Company", href: "/company" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Window-scoped scroll (not tied to a specific section ref) drives a
  // smooth 0→1 fade for the stronger background layer over the first
  // ~140px of scroll — a continuous interpolation, not a boolean snap.
  const { scrollY } = useScroll();
  const strongBgOpacity = useTransform(scrollY, [0, 140], [0, 1]);

  // Close the mobile menu on navigation. Adjusted during render (React's
  // recommended pattern for "reset state when a prop changes") rather than
  // in an Effect, so it doesn't cost an extra render/commit pass.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Lock page scroll while the mobile panel is open — it's now a
  // full-viewport overlay (see mobile-nav-panel below), so a scrollable
  // page underneath would be visible/scrollable behind it, which reads as
  // broken in the same way the old bleed-through bug did.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const navLinks = NAV_LINKS.map((link) => {
    const dropdown = NAV_DROPDOWNS[link.href];
    return dropdown ? (
      <NavItemDropdown key={link.href} config={dropdown} variant="desktop" active={pathname === link.href} />
    ) : (
      <NavLink key={link.href} href={link.href} active={pathname === link.href}>
        {link.label}
      </NavLink>
    );
  });

  return (
    <div className="env-dark fixed inset-x-0 top-0 z-50 text-text-primary">
      <div className="relative">
        {/* Base layer — permanent, subtle, blends the header into the Hero
            even before any scroll. Spans the whole two-tier header. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 to-transparent"
        />
        {/* Stronger layer — fades in smoothly with scroll depth, stays
            legible over any section color once it's fully in. */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: strongBgOpacity }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/90 via-background/82 to-background/72 backdrop-blur-sm"
        />

        {/*
          Top utility bar — thin, full-width, above the main nav row. Just
          EN | FR for now (moved here from the main row and the mobile
          panel, where it existed as two separate always-visible copies —
          now exactly one). `justify-between` with an empty placeholder on
          the left leaves real room for a future item (a "Blog" or "Login"
          link were both named as candidates) without needing another
          layout pass — it's a flex row, not a hardcoded single-child one.
          Always visible (not gated by the main row's fits/doesn't-fit
          state) — "EN | FR" alone is short, fixed text that was never at
          risk of the crowding problem the main row had.
        */}
        <div className="relative z-10 border-b border-border/60">
          <div className="flex h-9 items-center justify-between px-6 md:px-12">
            <div aria-hidden="true" />
            <div className="flex items-center gap-6">
              <span className="font-body text-xs text-text-secondary" aria-hidden="true">
                EN&nbsp;|&nbsp;FR
              </span>
            </div>
          </div>
        </div>

        <NavBar
          className="relative z-10 border-b border-border"
          logo={
            <Link href="/" className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              <OragrolLogo height={36} />
            </Link>
          }
          desktopContent={
            <>
              <nav aria-label="Primary" className="flex items-center gap-8">
                {navLinks}
              </nav>
              <ButtonLink variant="primary" size="sm" href="/cyber-health">
                Get Score
              </ButtonLink>
            </>
          }
          collapsedContent={
            <MobileMenuTrigger
              isOpen={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              aria-controls="mobile-nav-panel"
            />
          }
          persistentActions={<HeaderSearch />}
        />
      </div>

      {/*
        Fix (2026-08-13 audit, #5 / D-010): this used to be an in-flow
        max-height accordion capped at 28rem. On any page whose content sits
        directly below the header, once open it revealed page content
        (including a second "Get Your Cyber Health Score" button) bleeding
        in underneath its own bottom edge — two instances of the same CTA
        visible on screen at once. Fixed by making it a real full-viewport
        overlay instead: `fixed` from the header's own bottom edge to the
        bottom of the viewport, opaque `bg-background`, so nothing behind it
        can show through regardless of how tall its own content is.
        `overflow-y-auto` covers the case where a future longer link list
        doesn't fit a short mobile viewport.

        Top offset (2026-08-21): now `--header-height` (116px, the real
        two-tier header's total height — see tokens.css) instead of a
        hardcoded `top-20` that only matched the old single-row header.
        No `lg:hidden` anymore either — this panel's own visibility is
        fully driven by `mobileOpen`, which can only become true by
        clicking `MobileMenuTrigger`, and that trigger only exists in the
        DOM when `NavBar`'s own live measurement decided the desktop
        cluster doesn't fit. There's no longer a second, independent
        breakpoint here that could disagree with that decision.
      */}
      <div
        id="mobile-nav-panel"
        className={cn(
          "fixed inset-x-0 bottom-0 overflow-y-auto bg-background transition-opacity duration-200",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{ top: "var(--header-height)" }}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <nav className="flex flex-col gap-1 px-6 py-6" aria-label="Mobile">
          {NAV_LINKS.map((link) => {
            const dropdown = NAV_DROPDOWNS[link.href];
            return dropdown ? (
              <NavItemDropdown
                key={link.href}
                config={dropdown}
                variant="mobile"
                active={pathname === link.href}
              />
            ) : (
              <NavLink
                key={link.href}
                href={link.href}
                active={pathname === link.href}
                className="py-2 text-base"
              >
                {link.label}
              </NavLink>
            );
          })}
          <ButtonLink variant="primary" size="md" href="/cyber-health" className="mt-3 w-full">
            Get Your Cyber Health Score
          </ButtonLink>
        </nav>
      </div>
    </div>
  );
}
