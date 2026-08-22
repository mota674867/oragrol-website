import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

/**
 * Max-width wrapper with responsive padding — Step 3.
 *
 * `lg`/`xl` widened 2026-08-13 (site-wide container fix, requested via
 * Services review) to flat 1280px/1440px caps. Widened again 2026-08-22
 * (root-cause fix for the 24"/2560px "dead space on both sides" report):
 * a FLAT pixel cap was itself the bug once viewports grow well past the
 * cap — every page using `Container` froze at the same ~1280-1440px
 * column no matter how much wider the screen got, exactly what read as
 * "designed for a smaller monitor and centered." Fixed by making `lg`/
 * `xl` (and the new `2xl`) fluid: each is a `clamp(MIN, INTERCEPT +
 * SLOPE*100vw, MAX)` ramp — holds at MIN up to the viewport where the
 * ramp reaches it, grows in direct proportion to viewport width from
 * there, then holds at a wider MAX rather than growing unbounded (never
 * `width: 100%` — that would blow out line length/visual hierarchy on a
 * 32"+ display). Anchored so each tier's MIN matches its old flat value
 * (no regression at 1280-1440px, where the previous pass already tuned
 * things) and ramps up to its MAX by ~2560px:
 *   lg  : 1280px  → ~1600px
 *   xl  : 1440px  → ~1800px
 *   2xl : 1600px  → ~2000px (new tier — formalizes the one-off 1680px
 *         `category-section.tsx` used to hardcode independently instead
 *         of sharing this system; see `CONTAINER_MAX_WIDTH` below, which
 *         `NavBar` (nav.tsx) also imports for its own content row instead
 *         of duplicating the `xl` literal)
 * `sm`/`md` are deliberately UNCHANGED and NOT fluid — those are prose/
 * form reading widths (42rem/56rem), not viewport-driven layout columns;
 * making them grow with the viewport would hurt the readability this fix
 * is explicitly supposed to preserve.
 */
export const CONTAINER_MAX_WIDTH = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-[clamp(1280px,960px_+_25vw,1600px)]",
  xl: "max-w-[clamp(1440px,1080px_+_28vw,1800px)]",
  "2xl": "max-w-[clamp(1600px,940px_+_40vw,2000px)]",
} as const;

export type ContainerSize = keyof typeof CONTAINER_MAX_WIDTH;

export interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  size?: ContainerSize;
}

export function Container({ size = "xl", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-6 md:px-12", CONTAINER_MAX_WIDTH[size], className)}
      {...props}
    />
  );
}
