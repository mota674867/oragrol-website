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
 * `RotatingRing` and `FadeText` below are shared building blocks, also
 * used by `HeroAmbientLoader` (D-043) — extracted rather than
 * duplicated when that component needed the same ring/fade-text visual
 * treatment for a persistent, continuously-running hero use case.
 */

/**
 * RotatingRing — rotating conic-gradient ring masked into a thin ring,
 * plus a static inset-shadow core for depth. `spinning` lets a
 * continuously-running caller pause the CSS animation without
 * unmounting the ring (e.g. HeroAmbientLoader, while scrolled out of
 * view) — the animation is Tailwind's built-in `animate-spin`, so
 * toggling the class is enough; no JS animation loop to pause.
 */
export function RotatingRing({
  size = 96,
  spinning = true,
  className,
}: {
  size?: number;
  spinning?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)} style={{ height: size, width: size }}>
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 rounded-full", spinning && "animate-spin")}
        style={{
          background: "conic-gradient(from 0deg, transparent 0deg, var(--color-accent) 110deg, transparent 220deg)",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          animationDuration: "2.4s",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          inset: size * 0.125,
          background: "var(--color-background)",
          boxShadow:
            "inset 0 2px 8px color-mix(in srgb, var(--color-accent) 40%, transparent), " +
            "inset 0 -3px 10px color-mix(in srgb, black 45%, transparent), " +
            "0 0 24px 2px color-mix(in srgb, var(--color-accent) 30%, transparent)",
        }}
      />
    </div>
  );
}

/**
 * FadeText — letter-by-letter fade-up text. Pass a changing `wordKey`
 * (e.g. an index) to replay the fade whenever `text` changes; defaults
 * to `text` itself so a caller with a single static message (AiLoader)
 * doesn't need to think about it.
 */
export function FadeText({
  text,
  wordKey,
  className,
}: {
  text: string;
  wordKey?: string | number;
  className?: string;
}) {
  return (
    <span key={wordKey ?? text} className={cn("inline-block", className)}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block animate-[ai-loader-letter-fade_0.4s_ease_forwards] opacity-0"
          style={{ animationDelay: `${i * 22}ms`, whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

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
      <RotatingRing size={96} />
      <div className="font-data text-sm uppercase tracking-widest text-accent" aria-live="polite">
        <FadeText text={MESSAGE} />
      </div>
    </div>
  );
}
