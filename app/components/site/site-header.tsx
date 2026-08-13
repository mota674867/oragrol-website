"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import { ButtonLink, MobileMenuTrigger, NavBar, NavLink } from "../ui";
import { cn } from "../ui/cn";
import { OragrolLogo } from "../brand/oragrol-logo";
import { HeaderSearch } from "./header-search";

/**
 * SiteHeader — Step 4, refined in Header Refinement Pass 1, fixed in
 * Header Fix Pass 2.
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
 * bar" (a single flat value, snapped in at just 8px of scroll).
 *
 * Scoped to env-dark for now: every page that exists today (Home) opens on
 * a Dark-environment section, so this reads correctly everywhere it's
 * currently used. Once light-first pages exist, this should read the
 * entry section's environment instead of assuming Dark.
 *
 * Search is implemented (brief section 6 always specified it) — see
 * header-search.tsx. Live AI Chat remains out of scope: it's its own later
 * build phase per the Implementation Sequence, and this header still
 * doesn't render a non-functional placeholder for it. EN | FR stays a
 * static label (info-architecture presence per the brief) since full
 * locale routing isn't built yet.
 */

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  { label: "Cyber Health", href: "/cyber-health" },
  { label: "Industries", href: "/industries" },
  { label: "Resources", href: "/insights" },
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

  return (
    <div className="env-dark fixed inset-x-0 top-0 z-50 text-text-primary">
      <div className="relative">
        {/* Base layer — permanent, subtle, blends the header into the Hero
            even before any scroll. */}
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

        <NavBar
          breakpoint="lg"
          className="relative z-10 border-b border-border"
          logo={
            <Link href="/" className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              <OragrolLogo height={36} />
            </Link>
          }
          links={NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} active={pathname === link.href}>
              {link.label}
            </NavLink>
          ))}
          actions={
            <>
              <HeaderSearch />
              {/*
                Wrapper divs, not `hidden <bp>:inline-flex` directly on
                ButtonLink: ButtonLink's own base classes hard-code
                `inline-flex`, and since Tailwind's generated CSS order isn't
                guaranteed to follow className string order (see cn.ts),
                that `hidden` can lose to the component's own `inline-flex`
                at every width — confirmed live at the 390px mobile check
                during Step 4 verification, where the CTA stayed visible
                when it should've been hidden. A plain wrapper with no
                competing base `display` class sidesteps the issue entirely.
              */}
              <div className="hidden items-center gap-4 lg:flex">
                <span className="font-body text-sm text-text-secondary" aria-hidden="true">
                  EN&nbsp;|&nbsp;FR
                </span>
                <ButtonLink variant="primary" size="sm" href="/cyber-health">
                  Get Your Cyber Health Score
                </ButtonLink>
              </div>
              <MobileMenuTrigger
                isOpen={mobileOpen}
                onClick={() => setMobileOpen((open) => !open)}
                aria-controls="mobile-nav-panel"
                className="lg:hidden"
              />
            </>
          }
        />
      </div>

      {/*
        Fix (2026-08-13 audit, #5 / D-010): this used to be an in-flow
        max-height accordion capped at 28rem. On any page whose content sits
        directly below the header, once open it revealed page content
        (including a second "Get Your Cyber Health Score" button) bleeding
        in underneath its own bottom edge — two instances of the same CTA
        visible on screen at once. Fixed by making it a real full-viewport
        overlay instead: `fixed` from the header's own bottom edge (`top-20`
        matches NavBar's `h-20`) to the bottom of the viewport, opaque
        `bg-background`, so nothing behind it can show through regardless of
        how tall its own content is. `overflow-y-auto` covers the case where
        a future longer link list doesn't fit a short mobile viewport.
      */}
      <div
        id="mobile-nav-panel"
        className={cn(
          "fixed inset-x-0 top-20 bottom-0 overflow-y-auto bg-background transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <nav className="flex flex-col gap-1 px-6 py-6" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              active={pathname === link.href}
              className="py-2 text-base"
            >
              {link.label}
            </NavLink>
          ))}
          <ButtonLink variant="primary" size="md" href="/cyber-health" className="mt-3 w-full">
            Get Your Cyber Health Score
          </ButtonLink>
          <span className="mt-3 font-body text-sm text-text-secondary">EN | FR</span>
        </nav>
      </div>
    </div>
  );
}
