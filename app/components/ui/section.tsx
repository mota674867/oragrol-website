import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

/**
 * Section — wraps a block of the page in one of the approved background
 * environments (app/styles/tokens.css: .env-dark / .env-deep-blue /
 * .env-light). Each environment repoints the same semantic tokens
 * (background, surface, border, text-primary/secondary/muted, accent) —
 * that's what "every component must work in every section environment"
 * means in practice, and it's why components in this folder only ever
 * reference the semantic tokens, never raw hex.
 *
 * D-068 (visual-system migration): "white"/"light-blue" retired — the new
 * approved palette has no light-background color at all except Warm
 * Off-White, which is used sparingly (see `light` below), not as a
 * systemic second theme. Most former White/Light-blue sections became
 * `dark`; former Light-blue sections (plus a few former White ones whose
 * content reads as "supporting depth" — pricing/selected cards,
 * dashboard-ish data, process visuals) became `deep-blue`, matching the
 * brief's own Deep Blue role. See each Section call site's own comment for
 * why that specific section got the tone it did.
 */

export type SectionEnvironment = "dark" | "deep-blue" | "light";

const envClasses: Record<SectionEnvironment, string> = {
  dark: "env-dark",
  "deep-blue": "env-deep-blue",
  light: "env-light",
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
