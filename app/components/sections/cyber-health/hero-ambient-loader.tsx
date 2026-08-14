"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../ui";
import { usePrefersReducedMotion } from "../../motion/use-reduced-motion";
import { RotatingRing, FadeText } from "./ai-loader";

/**
 * HeroAmbientLoader — Cyber Health hero's persistent visual (D-043,
 * replacing D-008's `GaugeVisual`, an explicit reopened-and-replaced
 * decision, not a bug fix — see DECISIONS.md D-043).
 *
 * Reuses AiLoader's `RotatingRing`/`FadeText` building blocks rather
 * than duplicating them, extended for a continuously-running,
 * page-lifetime use case instead of AiLoader's brief 2.6s click
 * transition:
 *
 * - No "Generating"/action language — cycles through short, static
 *   brand words instead ("Assess." / "Prioritize." / "Protect."), so
 *   nothing implies a real process is running. Same honesty-rule
 *   reasoning as D-042's overlay repurposing: this is decoration, not a
 *   status indicator, and must not read as one.
 * - Reduced motion renders ONE static line for as long as the
 *   component stays mounted — not a brief fallback window like
 *   AiLoader's, since this now runs for every visitor's entire time on
 *   the page. No interval is ever started in this branch.
 * - An `IntersectionObserver` pauses both the ring's CSS animation and
 *   the word-cycle interval whenever the hero visual scrolls out of
 *   view. Unlike AiLoader's brief overlay, this can run indefinitely,
 *   so idle off-screen animation has a real (if small) CPU/battery
 *   cost worth avoiding rather than a theoretical one.
 *
 * Pure decoration, `aria-hidden` on the outer wrapper in both branches
 * — the same treatment `GaugeVisual` itself used ("no text content,
 * the actual content is rendered as real text elsewhere"). The
 * headline/subhead/CTAs next to this carry the actual page content.
 */

const WORDS = ["Assess.", "Prioritize.", "Protect."];
const WORD_INTERVAL_MS = 2200;
const RING_SIZE = 224;

export function HeroAmbientLoader({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [inView, setInView] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Re-attaches whenever reducedMotion flips (live OS setting change) so
  // a wrapper that only renders in the non-reduced-motion branch still
  // gets observed correctly if the setting changes after mount.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.1,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !inView) return;
    const id = window.setInterval(() => {
      setWordIndex((i) => (i + 1) % WORDS.length);
    }, WORD_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, inView]);

  if (reducedMotion) {
    return (
      <div aria-hidden="true" className={cn("flex flex-col items-center gap-4", className)}>
        <span className="font-data text-sm uppercase tracking-widest text-accent">
          {WORDS.join(" ")}
        </span>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} aria-hidden="true" className={cn("flex flex-col items-center gap-6", className)}>
      <RotatingRing size={RING_SIZE} spinning={inView} />
      <div className="font-data text-sm uppercase tracking-widest text-accent">
        <FadeText text={WORDS[wordIndex]} wordKey={wordIndex} />
      </div>
    </div>
  );
}
