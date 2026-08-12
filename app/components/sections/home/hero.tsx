"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, easeInOut, type MotionValue } from "motion/react";
import { Caption, Container, H1, Text, ButtonLink } from "../../ui";
import { usePrefersReducedMotion } from "../../motion/use-reduced-motion";
import { useMediaQuery } from "../../motion/use-media-query";

/**
 * Hero — image-based scroll sequence.
 *
 * The Hero approach changed from live Three.js/R3F 3D rendering to 16
 * locked, offline-rendered reference frames (public/hero/) — a real-time
 * WebGL scene can't be pixel-identical to an AI-rendered image, so the
 * images themselves are now the source of truth. This file only
 * sequences/crossfades them; it never redraws or reinterprets their
 * content. Copy, layout, header, and CTA structure are unchanged from
 * every earlier pass.
 *
 * Mechanism: the 16 frames are stacked (`absolute inset-0`) and
 * crossfaded via opacity, each driven by the same `scrollYProgress`
 * MotionValue the rest of the Hero already used for its scroll pin (no
 * GSAP, no Three.js) — read via `useTransform`, so it's pure CSS opacity
 * animation under the hood, not per-frame imperative work. This is a
 * single scroll-scrubbed pass only: frame-01 at scroll start, frame-16 at
 * scroll end, then the section releases normally to whatever follows.
 * There is no timer-based auto-play and no wrap-around back to frame-01
 * — scrolling back up simply reverses the same envelopes, which is
 * already smooth with no special-casing needed. (Frame-01 and frame-16
 * don't visually match each other — the sky/lighting differ — but since
 * the sequence never cuts from one directly to the other, that mismatch
 * never becomes visible.)
 *
 * Continuous-motion tuning (round 2): the blend envelopes deliberately
 * OVERLAP each other by more than one segment-width (`ENVELOPE_HALF_WIDTH`
 * > half the segment spacing), so a frame is always blending with at
 * least one neighbor — there's no scroll position where a frame sits at
 * opacity 1 while its neighbors sit at 0. Each frame also gets its own
 * continuous scale/drift ("camera push") for as long as it has any
 * visibility at all, not just while it's the dominant frame, and both the
 * opacity and scale/drift curves are eased (not linear) so the motion
 * accelerates/decelerates instead of moving at a constant, mechanical
 * rate — that combination is what reads as one continuous camera move
 * through the scene rather than 16 photos dissolving into each other.
 *
 * Mobile and reduced-motion collapse to the SAME simplified path: a
 * single static frame-01 image, no crossfade, no scroll pin (the section
 * is a plain 100svh block, not a tall pinned one — forcing extra scroll
 * distance for an animation that isn't happening would be poor UX, not
 * just wasted motion).
 */

const HERO_IMAGES = [
  "/hero/frame-01.png",
  "/hero/frame-02.png",
  "/hero/frame-03.png",
  "/hero/frame-04.png",
  "/hero/frame-05.png",
  "/hero/frame-06.png",
  "/hero/frame-07.png",
  "/hero/frame-08.png",
  "/hero/frame-09.png",
  "/hero/frame-10.png",
  "/hero/frame-11.png",
  "/hero/frame-12.png",
  "/hero/frame-13.png",
  "/hero/frame-14.png",
  "/hero/frame-15.png",
  "/hero/frame-16.png",
] as const;

const TOTAL = HERO_IMAGES.length;
const SEGMENT = 1 / TOTAL;
// > 1 segment-width on purpose: at 1.0 a frame would only ever touch its
// neighbor's envelope right at its own peak, never before — still a
// perceptible "arrived alone" instant. At 1.3, the next frame is already
// ~25% faded in by the time the current one peaks, so there's always at
// least two frames blending, never a lone fully-opaque frame.
const ENVELOPE_HALF_WIDTH = SEGMENT * 1.3;

function frameEnvelope(index: number, total: number) {
  const center = (index + 0.5) / total;
  return {
    start: Math.max(0, center - ENVELOPE_HALF_WIDTH),
    center,
    end: Math.min(1, center + ENVELOPE_HALF_WIDTH),
  };
}

function frameOpacityStops(index: number, total: number): { range: number[]; values: number[] } {
  const { start, center, end } = frameEnvelope(index, total);
  if (index === 0) {
    // Already fully visible at p=0 — nothing precedes it to blend from.
    return { range: [0, end], values: [1, 0] };
  }
  if (index === total - 1) {
    // Stays fully visible through p=1 — nothing follows it to blend to.
    return { range: [start, center, 1], values: [0, 1, 1] };
  }
  return { range: [start, center, end], values: [0, 1, 0] };
}

function HeroFrame({
  src,
  index,
  scrollYProgress,
}: {
  src: string;
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const total = HERO_IMAGES.length;
  const { range, values } = frameOpacityStops(index, total);
  const opacity = useTransform(scrollYProgress, range, values, { ease: easeInOut });

  // Continuous "camera push": scale/drift span the frame's FULL presence
  // (from when it starts fading in to when it's fully faded out), not
  // just its opacity peak — so it's always subtly moving while visible.
  const { start, end } = frameEnvelope(index, total);
  const motionStart = index === 0 ? 0 : start;
  const motionEnd = index === total - 1 ? 1 : end;
  const scale = useTransform(scrollYProgress, [motionStart, motionEnd], [1, 1.07], { ease: easeInOut });
  const y = useTransform(scrollYProgress, [motionStart, motionEnd], [0, -18], { ease: easeInOut });

  return (
    <motion.div className="absolute inset-0" style={{ opacity }} aria-hidden={index === 0 ? undefined : true}>
      <motion.div className="absolute inset-0" style={{ scale, y }}>
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={index === 0}
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const simplified = reduceMotion || isMobile;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Subtle parallax: the copy drifts up a little slower than the frames
  // transition, for depth — skipped entirely (not just shortened) when
  // simplified, matching the same reduced-motion contract used elsewhere.
  const textY = useTransform(scrollYProgress, [0, 1], [0, -36]);

  return (
    <div ref={sectionRef} className={`env-dark relative ${simplified ? "h-[100svh]" : "h-[350vh]"}`}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-background">
        {/* Background: locked reference frames — see file header. */}
        <div className="absolute inset-0">
          {simplified ? (
            <Image
              src={HERO_IMAGES[0]}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          ) : (
            HERO_IMAGES.map((src, i) => (
              <HeroFrame key={src} src={src} index={i} scrollYProgress={scrollYProgress} />
            ))
          )}
        </div>

        {/* Legibility scrim — constant across every frame, left-weighted
            behind the copy column. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/25 to-transparent"
        />

        {/* Foreground content — unchanged */}
        <Container size="xl" className="relative z-10 flex h-full flex-col justify-center">
          <motion.div
            className="max-w-xl pt-16 md:pt-8"
            style={simplified ? undefined : { y: textY }}
          >
            <Caption tone="accent">Cybersecurity for modern businesses</Caption>
            <H1 size="xl" className="mt-4">
              Security clarity
              <br />
              for what comes next.
            </H1>
            <Text tone="secondary" size="lg" className="mt-6 max-w-md">
              Oragrol helps businesses understand risk, prioritize what matters, and build
              practical protection that moves with the business.
            </Text>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/cyber-health" variant="primary" size="lg">
                Get Your Cyber Health Score
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="lg">
                Talk to Oragrol
              </ButtonLink>
            </div>
          </motion.div>
        </Container>

        {/* Scroll indicator — unchanged */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3">
          <span className="font-body text-xs uppercase tracking-widest text-text-secondary">
            Scroll to explore
          </span>
          <span className="h-8 w-px bg-border" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
