"use client";

import { useEffect, useState } from "react";
import { cn } from "../../ui";
import { usePrefersReducedMotion } from "../../motion/use-reduced-motion";

/**
 * AiLoader — Cyber Health "Processing Screen" prototype.
 *
 * Sourcing note: the instruction's own code block came through empty
 * (no `ai-loader.tsx`/CSS text was actually present in the message,
 * where it should have been). Searched `21st.dev` first, the same way
 * the last two rounds successfully recovered a missing source (Kinetic
 * Grid, id 18254) — this time nothing matched closely enough to treat
 * as confirmed: the instruction describes very specific bugs (`class`
 * instead of `className`, only keyframes provided with no base
 * `.loader`/`.loader-letter` rules, a specific purple/pink palette
 * `#ad5fff`/`#471eec`/`#d60a47`/`#311e80`, a dead `useState` counter)
 * that read as a raw HTML/CSS snippet (likely Uiverse.io or similar —
 * not a source this project has any search access to), not a 21st.dev
 * React component. Rather than guess at a specific external source and
 * present it as "the fixed version of your code," this is a NEW,
 * native implementation of the effect as DESCRIBED (a rotating ring
 * with layered inset shadows, plus letter-by-letter fade text) — built
 * with this codebase's own established techniques (inline-style
 * `color-mix()` for layered shadows, same pattern `capability-
 * spotlight.tsx`'s `ICON_BADGE_STYLE` already uses; `usePrefersReducedMotion`,
 * same hook Capability 05's live-pulse indicator uses), not literally
 * adapted line-by-line from unseen source. Flagged here so this is
 * traceable, not silently assumed.
 *
 * Two findings from checking the instruction's own premise before
 * building, per this project's "if you think a stated premise is wrong,
 * say so and ask" rule (see the chat response for this round for the
 * full report):
 *  - No "Processing Screen" section exists anywhere in this repo's own
 *    docs (`PROJECT_MASTER.md`/`DECISIONS.md`/`PROJECT_MEMORY.md`) —
 *    grepped for the section name and all 5 step names, zero hits.
 *  - This codebase has no in-app assessment/processing pipeline to
 *    attach a "processing screen" to in the first place: per
 *    `PROJECT_MASTER.md` Step 7 (an existing, already-established
 *    decision), the real Assessment/Submit/Score/AI-Analysis/Report/
 *    Email/CRM-Lead pipeline runs entirely on the external, already-
 *    live Tally MVP (`https://tally.so/r/2EzROb`) — every CTA on this
 *    page links out to it in a new tab, nothing about that flow is
 *    rendered by this Next.js app. Built as a requested, useful,
 *    self-contained prototype component regardless (nothing about
 *    building it is wrong), but "wiring it into the live assessment
 *    flow" needs Mohammad's input on WHERE that would even attach
 *    before it happens — flagged, not resolved unilaterally, not
 *    blocking this round's prototype work either (the instruction
 *    itself scoped "wiring into live" as a later, separate step).
 *
 * The 5 step labels below are used exactly as given, not invented or
 * substituted, per the explicit instruction.
 */

const STEPS = ["Calculate Score", "Assign Risk Tier", "Generate AI Analysis", "Generate PDF", "Update HubSpot"];
const STEP_DURATION_MS = 1900;

export function AiLoader({ className }: { className?: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  // The interval that advances through the real 5 steps runs regardless
  // of motion preference -- that's the actual content/progress, not a
  // decorative effect. Only the RING rotation and per-letter fade below
  // are gated behind `usePrefersReducedMotion`.
  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, STEP_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  const currentStep = STEPS[stepIndex];

  if (reducedMotion) {
    // Item 5: a simple static label, no rotation, no letter animation --
    // not just a frozen ring, the ring itself is omitted entirely, per
    // the instruction's own "rather than the animated loader" wording.
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <span className="font-data text-sm uppercase tracking-widest text-accent">{currentStep}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="relative h-24 w-24">
        {/* rotating conic sweep, masked into a thin ring -- reuses
            Tailwind's built-in animate-spin (already proven working
            elsewhere this session, e.g. How We Work's cycle visual),
            not a hand-rolled rotation keyframe. */}
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
        {/* static core with layered inset shadows, for depth -- the
            "layered inset shadows" the instruction asked to preserve
            from the described effect. Inline style, not a Tailwind
            arbitrary shadow-[...] class: this project already found
            that Tailwind v4's arbitrary-value parser silently drops
            shadow utilities containing color-mix()'s own internal
            commas (D-016) -- a raw inline `style` string is plain CSS
            the browser parses directly, unaffected by that bug. */}
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

      {/* key={stepIndex} remounts this on every step change, so the
          per-letter fade replays each time instead of only on first
          paint. */}
      <div key={stepIndex} className="font-data text-sm uppercase tracking-widest text-accent" aria-live="polite">
        {currentStep.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block animate-[ai-loader-letter-fade_0.4s_ease_forwards] opacity-0"
            style={{ animationDelay: `${i * 28}ms`, whiteSpace: char === " " ? "pre" : "normal" }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
