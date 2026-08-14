import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { cn } from "./cn";

/**
 * Links — Website Implementation Brief, Step 3.
 *
 * TextLink: inline prose link, underlined by default (so it reads as a link
 * without relying on color alone), accent on hover.
 *
 * NavLink: chromeless nav item, accent on hover/active — reused by the
 * navigation primitives in nav.tsx.
 */

export type LinkComponentProps = ComponentPropsWithoutRef<typeof Link>;

export function TextLink({ className, ...props }: LinkComponentProps) {
  return (
    <Link
      className={cn(
        "rounded-sm font-body text-text-primary underline decoration-text-secondary/50 decoration-1 underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
      {...props}
    />
  );
}

export type NavLinkSize = "default" | "lg";

const navLinkSizeClasses: Record<NavLinkSize, string> = {
  default: "text-sm font-medium",
  // Added for Services' CategoryNav (D-018, item 2): the sidebar was
  // judged too quiet to read as a primary nav element next to Bell's
  // reference. Size only here — weight moved out (Round 5, below): D-019
  // dropped a single uniform weight (font-semibold → font-medium) applied
  // to every item regardless of state, which is what actually kept
  // reading as "all bold" — a uniformly-medium list is still uniformly
  // heavier than body text. Round 5 replaces that with a real per-state
  // split (active vs. inactive), so `lg` itself no longer carries a
  // weight class — see the active/inactive ternary below instead.
  lg: "text-base",
};

export interface NavLinkProps extends LinkComponentProps {
  /** Marks this as the current page — accent color, no underline needed. */
  active?: boolean;
  size?: NavLinkSize;
}

export function NavLink({ active = false, size = "default", className, ...props }: NavLinkProps) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-sm font-body transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        navLinkSizeClasses[size],
        // `default` tier (site header/footer nav, unrelated to this round's
        // instruction) keeps its original always-font-medium behavior
        // untouched. `lg` (CategoryNav only) now genuinely differentiates
        // by state, per Round 5: active gets weight + the existing accent
        // color (left-border indicator lives in CategoryNav itself,
        // untouched); every inactive item drops to regular weight and a
        // muted-gray tone instead of the near-black `text-secondary` it
        // used before, so the resting list reads visibly quieter than the
        // one active item, not just a shade of the same weight.
        size === "lg"
          ? active
            ? "font-semibold text-accent"
            : "font-normal text-text-muted hover:text-text-primary"
          : active
            ? "text-accent"
            : "text-text-secondary hover:text-text-primary",
        className,
      )}
      {...props}
    />
  );
}
