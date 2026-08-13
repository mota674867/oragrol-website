import type { ComponentType, SVGProps } from "react";
import { cn, Icon } from "../../ui";
import { GlowEffect } from "./glow-effect";
import { HeroSchematicVisual } from "./hero-schematic-visual";

/**
 * CapabilitySpotlight visuals — Services Design Correction (D-013),
 * approved and rolled out to all 8 capabilities (D-014). Generalized from
 * the single-row prototype into two reusable components, same relationship
 * as SchematicVisual/SchematicMark had (D-012): a full treatment for
 * LiveServices' 4 rows, a compact one for AdditionalCapabilities' 4 cards
 * — same "adapt per section's existing size/weight distinction" answer
 * Mohammad gave for D-012, applied again here rather than assumed.
 *
 * Techniques (stated before D-013 was built, unchanged since — see
 * DECISIONS.md D-013):
 *  - Scale/hero-scale illustration: HeroSchematicVisual, larger than the
 *    original SchematicVisual, is the row's clear focal point.
 *  - Depth through light: a real nested `env-dark` panel — a dark,
 *    shadow-elevated card floating on the White-environment page — plus a
 *    `GlowEffect` (21st.dev, adapted) atmospheric layer and a separate
 *    SVG-blurred rim glow (HeroSchematicVisual itself).
 *  - 3D icon style, CSS-simulated per Mohammad's choice: radial-gradient
 *    "material" fill + layered box-shadow (inner highlight, inner shadow,
 *    outer glow ring), not literal 3D geometry.
 *  - Large-scale numerals: the capability's own real index, not an
 *    invented stat.
 *
 * Color note: every gradient/glow uses only the locked accent family.
 * white/black appear ONLY as tonal shading mixed into the accent for the
 * icon badge's highlight/shadow — flagged, not a new decorative hue.
 */

type LucideIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_BADGE_STYLE: React.CSSProperties = {
  background: "radial-gradient(circle at 35% 30%, var(--color-accent-light), var(--color-accent) 55%, var(--color-accent-strong) 100%)",
  boxShadow:
    "inset 0 1.5px 0 0 color-mix(in srgb, white 45%, transparent), inset 0 -8px 14px -6px color-mix(in srgb, black 55%, transparent), 0 0 28px 4px color-mix(in srgb, var(--color-accent) 55%, transparent)",
};

/** Full treatment — LiveServices' 4 rows. */
export function CapabilitySpotlightVisual({
  n,
  icon,
  className,
}: {
  n: string;
  icon: LucideIconComponent;
  className?: string;
}) {
  return (
    <div
      className={cn("env-dark relative overflow-hidden rounded-3xl border border-border bg-background", className)}
      style={{ boxShadow: "0 30px 80px -24px color-mix(in srgb, var(--color-accent) 45%, transparent)" }}
    >
      <GlowEffect blur="strong" className="opacity-50" />
      <div className="relative px-6 pb-2 pt-8 sm:px-10 sm:pt-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 right-4 select-none font-data text-[9rem] font-bold leading-none text-white/[0.04] sm:text-[11rem]"
        >
          {n}
        </span>
        <div className="relative mx-auto max-w-md">
          <HeroSchematicVisual className="w-full" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[51.5%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={ICON_BADGE_STYLE}
          >
            <Icon icon={icon} size="lg" className="text-white" />
          </span>
        </div>
        <p className="relative mt-2 pb-6 text-center font-data text-[10px] uppercase tracking-[0.2em] text-text-muted sm:pb-8">
          FIG.{n} — schematic
        </p>
      </div>
    </div>
  );
}

/**
 * Compact treatment — AdditionalCapabilities' 4 cards. Deliberately
 * smaller and simpler than the full spotlight (no schematic diagram, no
 * numeral, no border-radius panel with its own copy) — these 4 aren't
 * live yet (D-007), and that visual-weight distinction is preserved here
 * the same way SchematicMark preserved it for D-012.
 */
export function CapabilitySpotlightMark({ icon, className }: { icon: LucideIconComponent; className?: string }) {
  return (
    <div
      className={cn("env-dark relative flex items-center justify-center overflow-hidden rounded-2xl bg-background", className)}
      style={{ boxShadow: "0 12px 28px -10px color-mix(in srgb, var(--color-accent) 40%, transparent)" }}
    >
      <GlowEffect blur="medium" className="opacity-60" />
      <span
        aria-hidden="true"
        className="relative flex h-8 w-8 items-center justify-center rounded-full"
        style={ICON_BADGE_STYLE}
      >
        <Icon icon={icon} size="sm" className="text-white" />
      </span>
    </div>
  );
}
