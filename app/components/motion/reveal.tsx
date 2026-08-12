"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/**
 * Reveal — the one scroll-reveal treatment used across every Home section.
 *
 * Deliberately restrained per brief ("restrained cinematic motion", "every
 * animation must communicate something"): a short fade + small upward drift,
 * once per element, nothing bouncy or cinematic-for-its-own-sake. Respects
 * prefers-reduced-motion by rendering content already in its final state —
 * no opacity/position animation at all, not just a shorter one.
 *
 * Use `delay` to stagger a group (e.g. `delay={i * 0.08}` over a list).
 */

export interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Starting vertical offset in px. */
  y?: number;
}

export function Reveal({ children, className, delay = 0, y = 16 }: RevealProps) {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
