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
 *
 * Atmospheric transitions (D-069): every environment change between
 * consecutive sections used to be a hard color cut — Section A's solid
 * fill simply ends where Section B's begins, at whatever pixel their DOM
 * boxes happen to meet. `transitionFrom`/`transitionTo` render a soft
 * blend across this section's own leading/trailing edge instead, using a
 * `linear-gradient(in oklab, ...)` between the two environments' RAW
 * background colors (not `--background`, which only ever resolves to
 * THIS section's own environment — see `ENV_RAW_BACKGROUND` below for why
 * a real lookup table is necessary here specifically).
 *
 * `in oklab` interpolation is deliberate, and was picked by actually
 * rendering and comparing every candidate, not by spec-reading alone: the
 * gradient default (sRGB) already looks acceptable for the dark<->
 * deep-blue pairs, but `in oklch` — the more commonly-recommended
 * "perceptually uniform" choice — produces a real, visible pink/mauve
 * band partway through the Deep-Ink<->Warm-Off-White pair specifically
 * (oklch interpolates hue as an angle, and the shortest arc from Deep
 * Ink's cool near-black hue to Warm Off-White's warm cream hue swings
 * through magenta) — exactly the "sudden midpoint color" the brief
 * explicitly calls out, just introduced by the fix rather than by a plain
 * gradient. `oklab` interpolates in a rectangular (non-hue-angle) space,
 * which stayed clean across every pair actually in use on this site
 * (dark<->deep-blue, either direction, and both directions of dark/
 * deep-blue<->light) plus Deep Ink<->Muted Violet-Gray. No JS, no
 * animation, no images — a single absolutely-positioned, `pointer-
 * events-none` gradient layer, sized by `clamp()` so it scales with
 * viewport width without vanishing on mobile or ballooning on a 32"+
 * monitor (same technique already established for this codebase's fluid
 * container widths). See each Section call site's own comment for why
 * that specific boundary needed (or didn't need) one.
 */

export type SectionEnvironment = "dark" | "deep-blue" | "light";

const envClasses: Record<SectionEnvironment, string> = {
  dark: "env-dark",
  "deep-blue": "env-deep-blue",
  light: "env-light",
};

// Raw, environment-INDEPENDENT background hex per environment — mirrors
// tokens.css's own raw palette layer (`--palette-*`, defined once on
// `:root` and never repointed by any `.env-*` class), unlike `--background`
// itself, which always resolves relative to whichever `.env-*` class
// currently wraps the point it's referenced from. A transition overlay
// needs to name the ADJACENT section's color by value, which `--background`
// structurally cannot express from inside this section's own DOM node.
const ENV_RAW_BACKGROUND: Record<SectionEnvironment, string> = {
  dark: "var(--palette-deep-ink)",
  "deep-blue": "var(--palette-deep-blue)",
  light: "var(--palette-warm-off-white)",
};

// Dark<->deep-blue transitions get the fuller, more atmospheric zone;
// anything touching `light` is deliberately shorter and more controlled
// per the brief's explicit "do not make the fade excessively large or
// washed out" instruction for dark<->light pairs specifically — a longer
// fade between the darkest and lightest colors in the palette reads as
// foggy/washed-out rather than intentional.
function transitionSizeClass(a: SectionEnvironment, b: SectionEnvironment, direction: TransitionDirection): string {
  const short = a === "light" || b === "light";
  if (direction === "horizontal") {
    return short ? "w-[clamp(3rem,6vw,7rem)]" : "w-[clamp(3.5rem,8vw,11rem)]";
  }
  return short ? "h-[clamp(4rem,6vw,9rem)]" : "h-[clamp(5rem,10vw,14rem)]";
}

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

/** "vertical" (default) blends this section's TOP edge — the normal case,
 *  stacked full-width sections. "horizontal" blends its LEFT edge instead,
 *  for side-by-side split layouts where the boundary runs top-to-bottom. */
export type TransitionDirection = "vertical" | "horizontal";

export interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  environment?: SectionEnvironment;
  /**
   * Element to render as, for the rare case a Section needs to be
   * something other than a `<section>` (e.g. `as="footer"` for the site
   * footer). Defaults to "section" — most call sites don't need this.
   */
  as?: SectionAs;
  /**
   * The environment of the section immediately BEFORE this one in the
   * page's actual render order. When it differs from this section's own
   * `environment`, renders a soft atmospheric blend across this section's
   * leading edge instead of a hard cut. Omit when the previous section
   * already shares this one's environment (no boundary exists to soften)
   * — every call site says explicitly which case it is, not left to
   * infer from silence.
   */
  transitionFrom?: SectionEnvironment;
  /**
   * The environment of whatever comes immediately AFTER this section —
   * for the one case `transitionFrom` can't reach: the last section
   * before the shared, page-agnostic `SiteFooter` (always `dark`), which
   * lives in the root layout and has no way to know what any given page's
   * last section actually was. Blends across this section's TRAILING edge
   * instead. Rare — only needed when a page's last section isn't already
   * `dark`.
   */
  transitionTo?: SectionEnvironment;
  /** See `TransitionDirection`. Defaults to "vertical". Only meaningful
   *  alongside `transitionFrom`/`transitionTo`. */
  transitionDirection?: TransitionDirection;
}

function TransitionOverlay({
  from,
  to,
  direction,
  edge,
}: {
  from: SectionEnvironment;
  to: SectionEnvironment;
  direction: TransitionDirection;
  edge: "leading" | "trailing";
}) {
  const isHorizontal = direction === "horizontal";
  // "leading" blends INTO this section (from the previous one, at its top/
  // left edge); "trailing" blends OUT of it (toward the next one, at its
  // bottom/right edge) — same gradient, mirrored position and direction.
  const gradientDirection = isHorizontal
    ? edge === "leading" ? "to right" : "to left"
    : edge === "leading" ? "to bottom" : "to top";
  const positionClass = isHorizontal
    ? edge === "leading" ? "inset-y-0 left-0" : "inset-y-0 right-0"
    : edge === "leading" ? "inset-x-0 top-0" : "inset-x-0 bottom-0";

  return (
    <div
      aria-hidden="true"
      style={{
        background: `linear-gradient(in oklab ${gradientDirection}, ${ENV_RAW_BACKGROUND[from]} 0%, ${ENV_RAW_BACKGROUND[to]} 100%)`,
      }}
      className={cn("pointer-events-none absolute", positionClass, transitionSizeClass(from, to, direction))}
    />
  );
}

export function Section({
  environment = "dark",
  as: Component = "section",
  transitionFrom,
  transitionTo,
  transitionDirection = "vertical",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(envClasses[environment], "relative bg-background text-text-primary", className)}
      {...props}
    >
      {/* Both overlays render BEFORE `children`, regardless of which edge
          they sit on (top/bottom/left/right is just position, not paint
          order) — position:absolute descendants with no z-index paint in
          DOM order, so this keeps both strictly behind real content
          without requiring every call site's children to opt into their
          own z-10 wrapper (D-069; see the module doc comment). */}
      {transitionFrom && transitionFrom !== environment && (
        <TransitionOverlay from={transitionFrom} to={environment} direction={transitionDirection} edge="leading" />
      )}
      {transitionTo && transitionTo !== environment && (
        <TransitionOverlay from={environment} to={transitionTo} direction={transitionDirection} edge="trailing" />
      )}
      {children}
    </Component>
  );
}
