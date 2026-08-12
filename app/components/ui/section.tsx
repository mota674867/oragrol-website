import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

/**
 * Section — wraps a block of the page in one of the three approved
 * background environments (app/styles/tokens.css: .env-dark / .env-white /
 * .env-light-blue). Only background + text-primary/secondary repoint per
 * environment; surface, border, accent, and text-muted stay constant by
 * design, so cards/badges/buttons/inputs read the same regardless of which
 * Section they sit in — that's what "every component must work in three
 * section environments" means in practice, and it's why components in this
 * folder only ever reference the semantic tokens, never raw hex.
 */

export type SectionEnvironment = "dark" | "white" | "light-blue";

const envClasses: Record<SectionEnvironment, string> = {
  dark: "env-dark",
  white: "env-white",
  "light-blue": "env-light-blue",
};

// Deliberately NOT a fully generic/polymorphic `as` (e.g. `ElementType` or
// `keyof HTMLElementTagNameMap`): installing @react-three/fiber (Step 4's
// Hero) globally augments JSX.IntrinsicElements with ~200 non-DOM tags
// (mesh, group, torusGeometry, ...), and any attempt to derive this
// component's props generically per-tag ran straight into that pollution
// (className collapsing to `never`, or the generic failing to resolve
// ComponentPropsWithoutRef at all). "section" and "footer" — the only two
// tags Section is ever asked to render — share the same HTMLAttributes
// shape, so there's nothing to gain from genericizing this; a plain fixed
// union sidesteps the whole problem.
export type SectionAs = "section" | "footer";

export interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  environment?: SectionEnvironment;
  /**
   * Element to render as, for the rare case a Section needs to be
   * something other than a `<section>` (e.g. `as="footer"` for the site
   * footer). Defaults to "section" — most call sites don't need this.
   */
  as?: SectionAs;
}

export function Section({
  environment = "dark",
  as: Component = "section",
  className,
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(envClasses[environment], "bg-background text-text-primary", className)}
      {...props}
    />
  );
}
