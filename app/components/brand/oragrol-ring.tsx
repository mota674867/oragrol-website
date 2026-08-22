import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../ui/cn";

/**
 * OragrolRing — the confirmed Oragrol ring, Hero brand element.
 *
 * PROVENANCE: source asset is Oragrol_Logo_Final.svg (Downloads) —
 * confirmed by the user as the actual Oragrol logo/ring asset. Geometry is
 * reproduced here 1:1 from that file's ring circle (same cx/cy proportions,
 * r=62, stroke-width=26, stroke-dasharray="365 24", rotate 35°), with only
 * the wordmark and background removed, since the brief scopes the Hero to
 * the ring element only — not redrawn or reinterpreted.
 *
 * Deliberately NOT a Client Component: it's static markup. Wrap it in a
 * `motion.div` at the call site to animate it (see hero.tsx) rather than
 * building animation into the mark itself.
 */

export interface OragrolRingProps extends Omit<ComponentPropsWithoutRef<"svg">, "viewBox" | "children"> {
  /** Width/height in px — the ring is always square. */
  size?: number;
  /** Ring stroke color. Defaults to the accent token (D-068: this doc
   *  comment used to be aspirational — the default was actually a
   *  hardcoded hex copy of the old accent value, so none of this
   *  component's 3 call sites picked up a token change automatically.
   *  Fixed to a real `var(--color-accent)` reference.) */
  color?: string;
}

export function OragrolRing({ size = 150, color = "var(--color-accent)", className, ...props }: OragrolRingProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      role="img"
      aria-label="Oragrol ring mark"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle
        cx="75"
        cy="75"
        r="62"
        fill="none"
        stroke={color}
        strokeWidth="26"
        strokeDasharray="365 24"
        strokeDashoffset="0"
        strokeLinecap="round"
        transform="rotate(35 75 75)"
      />
    </svg>
  );
}
