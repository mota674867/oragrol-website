"use client";

import { cn } from "../../ui";
import { usePrefersReducedMotion } from "../../motion/use-reduced-motion";

/**
 * AiLoader — brief, generic transition shown while a "Get Your Cyber
 * Health Score" CTA redirects to the real Tally assessment (D-042,
 * repurposed from D-041's original 5-step version).
 *
 * D-041 originally cycled through 5 named backend-pipeline steps
 * (Calculate Score, Assign Risk Tier, ...). Mohammad confirmed after
 * review: this codebase has no visibility into those steps actually
 * happening (the real pipeline runs entirely on the external Tally
 * form) — narrating them would imply real-time backend computation the
 * frontend can't actually observe. Repurposed to a single, generic,
 * honest message instead: "Preparing your assessment..." — no
 * step-cycling, no `setInterval`, no per-step state at all.
 *
 * Visual treatment (rotating ring + layered inset shadows + letter-fade
 * text) and reduced-motion handling are otherwise unchanged from D-041,
 * per Mohammad's explicit "keep the color remap, reduced-motion
 * handling, and clean component work" instruction.
 */

const MESSAGE = "Preparing your assessment...";

export function AiLoader({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <span className="font-data text-sm uppercase tracking-widest text-accent">{MESSAGE}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="relative h-24 w-24">
        {/* rotating conic sweep, masked into a thin ring -- Tailwind's
            built-in animate-spin, unchanged from D-041. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-spin rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, var(--color-accent) 110deg, transparent 220deg)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            animationDuration: "2.4s",
          }}
        />
        {/* static core, layered inset shadows for depth -- unchanged. */}
        <div
          aria-hidden="true"
          className="absolute inset-3 rounded-full"
          style={{
            background: "var(--color-background)",
            boxShadow:
              "inset 0 2px 8px color-mix(in srgb, var(--color-accent) 40%, transparent), " +
              "inset 0 -3px 10px color-mix(in srgb, black 45%, transparent), " +
              "0 0 24px 2px color-mix(in srgb, var(--color-accent) 30%, transparent)",
          }}
        />
      </div>

      <div className="font-data text-sm uppercase tracking-widest text-accent" aria-live="polite">
        {MESSAGE.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block animate-[ai-loader-letter-fade_0.4s_ease_forwards] opacity-0"
            style={{ animationDelay: `${i * 22}ms`, whiteSpace: char === " " ? "pre" : "normal" }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
