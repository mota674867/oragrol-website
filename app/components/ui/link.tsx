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
  // reference. Weight lives entirely in this table (not the shared base
  // string below) so default/lg never emit two conflicting font-weight
  // utility classes at once — see cn.ts's own documented plain-
  // concatenation gotcha (the same reason H3/Caption's size variants do
  // this too).
  lg: "text-base font-semibold",
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
        active ? "text-accent" : "text-text-secondary hover:text-text-primary",
        className,
      )}
      {...props}
    />
  );
}
