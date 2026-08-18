"use client";

import { usePrefersReducedMotion } from "../../motion/use-reduced-motion";
import { cn } from "../../ui/cn";

/**
 * PerimeterRing — Home hero's signature visual ("The Perimeter Sweep"),
 * replacing the 16-frame city-skyline photo sequence. See DECISIONS.md
 * D-057 for the full concept rationale; short version: the ring echoes
 * the Oragrol brand mark (reserved to Home per D-008 — "not reused
 * elsewhere"), and its one motion behavior — a short, bright arc
 * continuously tracing the ring's circumference on a slow loop — stands
 * in for what an MSSP actually does: watch a boundary continuously,
 * without gaps, without needing to look busy while doing it. Chosen over
 * both a stock photo (says nothing cybersecurity-specific) and an
 * abstract node-graph (the industry's most overused cliché, and already
 * this site's own language for Services'/Solutions' hero visuals — reused
 * here would blur the per-page-distinct-motif rule, D-008).
 *
 * Deviation from the approved concept, disclosed rather than silently
 * shipped: the first pass reused `OragrolRing` verbatim at hero scale and
 * it rendered wrong — that component's stroke (26 units on a 150-unit
 * viewBox, calibrated to stay legible as a small logo mark) is nearly
 * half its own radius, so blown up to ~760px it reads as a solid grey
 * disc, not a hairline ring (confirmed live via screenshot, not assumed).
 * This component instead builds its own circle at the SAME identity —
 * same near-full-circle-with-one-gap dash pattern, same 35° rotation — but
 * with a stroke width calibrated for large-scale background use instead
 * of small-logo use. It's the same ring language, re-parameterized for a
 * context `OragrolRing` was never designed to fill; it does not replace
 * `OragrolRing` anywhere else, and the logo itself is untouched.
 *
 * An earlier ambient-glow layer (a large `blur-3xl`'d filled circle) was
 * also cut for the same reason: a Gaussian blur only softens a filled
 * shape's edges, it doesn't make the shape read as faint — at any
 * usable opacity it still rendered as a solid grey blob dominating the
 * frame. The radial-gradient wash below fades to fully transparent well
 * inside its own bounds instead, which is what "ambient" actually needs.
 *
 * Composition: mostly off-canvas, bled past the right edge behind the
 * headline column, at every width — a background accent, never the focal
 * point (the headline still is).
 *
 * Reduced motion: the sweep freezes at its resting (unrotated) position —
 * same "one static frame" contract the old Hero already used for
 * mobile/reduced-motion, not a new pattern introduced here.
 */

// Sweep duration (11s) lives only in the `animate-[perimeter-sweep_11s_...]`
// class below, not as a JS constant — Tailwind's arbitrary-value syntax
// needs the literal string present in source to generate the CSS, it
// can't scan an interpolated template literal.
const RING_RADIUS = 86; // in this component's own 200x200 viewBox
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 540.4
const RING_GAP_LENGTH = 32; // ≈6% of the circumference — the brand mark's own near-full-circle identity
const SWEEP_ARC_LENGTH = 46; // short bright segment, not the whole ring

export function PerimeterRing({ className }: { className?: string }) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn(
        // Mobile gets its own corner-anchored position rather than the
        // wider breakpoints' vertical centering: at narrow widths the
        // headline/body copy run nearly full-bleed, so a vertically
        // centered ring bled into the text column (caught live via
        // screenshot — the promised "never sits behind the text" wasn't
        // holding). Anchored to the bottom-right corner instead, clear of
        // the copy stack above it.
        "pointer-events-none absolute right-[-40%] bottom-[-18%] aspect-square w-[70vw] max-w-[300px]",
        "sm:right-[-20%] sm:bottom-auto sm:top-1/2 sm:max-w-[560px] sm:-translate-y-1/2",
        "lg:right-[-12%] lg:max-w-[760px]",
        className,
      )}
    >
      {/* Ambient glow — a true radial gradient (fades to transparent on
          its own, no blur trick), not a second shape competing for
          attention. */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, var(--color-accent-light) 0%, transparent 62%)",
          opacity: 0.1,
        }}
      />

      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        {/* Resting ring — same identity as the brand mark (near-full
            circle, one gap, rotated 35°), restroked as a hairline for
            this large-scale background use (see header comment). */}
        <circle
          cx={100}
          cy={100}
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-accent-light)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE - RING_GAP_LENGTH} ${RING_GAP_LENGTH}`}
          strokeOpacity={0.35}
          transform="rotate(35 100 100)"
        />

        {/* The sweep: one short, bright arc continuously tracing the same
            circle. This is the entire animated behavior in this hero.
            Plain CSS keyframe (globals.css `perimeter-sweep`), applied
            only when motion isn't reduced — omitting the class leaves the
            circle at its unrotated resting angle, the same "one static
            frame" contract the old Hero already used. */}
        <circle
          cx={100}
          cy={100}
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={`${SWEEP_ARC_LENGTH} ${CIRCUMFERENCE - SWEEP_ARC_LENGTH}`}
          className={cn("origin-center", !reduceMotion && "animate-[perimeter-sweep_11s_linear_infinite]")}
          style={{ transformBox: "fill-box", filter: "drop-shadow(0 0 8px var(--color-accent))" }}
        />
      </svg>
    </div>
  );
}
