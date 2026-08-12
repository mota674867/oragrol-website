import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "./cn";
import { Icon } from "./icon-wrapper";

/**
 * Navigation primitives — Step 3 (shell only; final nav content is out of
 * scope for this step). NavLink lives in link.tsx and is reused here — see
 * that file for its underline/accent hover behavior.
 */

export type NavBreakpoint = "md" | "lg";

const linksVisibleAt: Record<NavBreakpoint, string> = {
  md: "md:flex",
  lg: "lg:flex",
};

export interface NavBarProps {
  /** Logo / wordmark slot. */
  logo: ReactNode;
  /** Desktop nav links — hidden below `breakpoint`. */
  links?: ReactNode;
  /** Trailing actions (CTA button, mobile menu trigger, etc.). */
  actions?: ReactNode;
  className?: string;
  /**
   * Breakpoint at which `links` switches from hidden to visible. Defaults
   * to "md"; use "lg" when the nav has enough items/label length that it
   * gets cramped at the md range (see SiteHeader, which needs this — 6 nav
   * items + a long CTA don't fit at 768px).
   */
  breakpoint?: NavBreakpoint;
}

export function NavBar({ logo, links, actions, className, breakpoint = "md" }: NavBarProps) {
  // No default `bg-background`/`border-*` here — a caller needing a plain
  // opaque bar can pass those via `className`. Baking in `bg-background` by
  // default previously fought a caller's own background-image (gradient)
  // override at the CSS-property level: bg-background sets
  // `background-color`, a gradient sets `background-image`, so both could
  // apply simultaneously with the color showing through the gradient's
  // transparent stops instead of true see-through — confirmed while
  // debugging Header Fix Pass 2. Leaving background fully caller-owned
  // avoids that class of bug outright instead of relying on Tailwind's
  // generated-CSS order (see cn.ts).
  return (
    <header className={cn("w-full", className)}>
      {/*
        No max-width here at all (Header Fix Pass 2 tried max-w-[1920px],
        which was still a finite cap and broke the same way at 2560px that
        max-w-7xl/1280px had at 1440/1920px — confirmed by measuring the
        logo's x-position, which jumped from a consistent 48px at
        1366/1920px to 368px at 2560px once the cap engaged and centered
        the content). The Hero this header sits over is genuinely
        full-bleed at every width tested (its <img> measures edge-to-edge
        at 1366/1920/2560px, no cap of its own) — so the header needs the
        same property, not a larger finite cap that just moves the
        breakpoint where it fails. `px-6 md:px-12` alone keeps the logo and
        actions pinned to a constant distance from the viewport edge at any
        width, matching the Hero's own edge-to-edge behavior instead of
        fighting it.
      */}
      <div className="flex h-20 w-full items-center justify-between px-6 md:px-12">
        <div className="flex items-center">{logo}</div>
        {links && (
          <nav className={cn("hidden items-center gap-10", linksVisibleAt[breakpoint])} aria-label="Primary">
            {links}
          </nav>
        )}
        {actions && <div className="flex items-center gap-4">{actions}</div>}
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
 * No breakpoint is baked in here: at which width this disappears is a
 * layout decision for whatever header/nav renders it (pair with a
 * matching `hidden <bp>:flex` on the desktop nav cluster), not something
 * this component should assume.
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
