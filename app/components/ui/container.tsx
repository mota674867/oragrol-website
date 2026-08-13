import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

/**
 * Max-width wrapper with responsive padding — Step 3.
 *
 * `lg`/`xl` widened 2026-08-13 (site-wide container fix, requested via
 * Services review): were max-w-5xl/7xl (1024px/1280px). At 1920/2560px
 * viewports, `Section`/`NavBar` backgrounds and the fixed header stay
 * edge-to-edge (D-001, deliberate — the header must match the Hero's own
 * full-bleed image), while page CONTENT sat centered in a comparatively
 * narrow 1024px band — the mismatch between "header content pinned near
 * the true edge" and "body content pinned to a much narrower centered
 * island" is what read as broken dead space on large displays, not a
 * literally-missing max-width (Container always had one). Now 1280px/
 * 1440px — both inside the requested 1280–1440px range, still two
 * distinct tiers (most sections use `lg`; a few intentionally wider ones
 * — Home's hero/services teaser, Cyber Health's flow, the footer — use
 * `xl`). This does not, and structurally can't, fully eliminate the gap
 * at ultra-wide viewports without either uncapping content (bad line
 * length) or making the header non-full-bleed too (reopens D-001, not
 * asked for) — it substantially narrows it instead. Global change: every
 * page using `Container` is affected; verify Home/Solutions/Cyber Health
 * after any edit here.
 */
const maxWidths = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-[1280px]",
  xl: "max-w-[1440px]",
} as const;

export type ContainerSize = keyof typeof maxWidths;

export interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  size?: ContainerSize;
}

export function Container({ size = "xl", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-6 md:px-12", maxWidths[size], className)}
      {...props}
    />
  );
}
