"use client";

/**
 * GlowEffect — sourced from 21st.dev (ibelick/glow-effect, component id 59,
 * "Card with Glow"), pulled directly per the Services Design Correction
 * brief (SERVICES_REDESIGN_PROMPT.md) rather than hand-built from scratch.
 * Adapted to this project:
 *  - `colors` defaults to the locked accent family (--color-accent-light /
 *    --color-accent / --color-accent-strong) instead of the original demo's
 *    four-color rainbow palette — no new primary color introduced, per the
 *    brief's explicit color note.
 *  - `mode` defaults to "static" (one fixed gradient, no animation loop).
 *    The original's other modes (rotate/pulse/breathe/colorShift/
 *    flowHorizontal) all run an infinite Framer Motion animation, which
 *    conflicts with this project's own documented motion rule (tokens.css:
 *    "restricted by convention to duration-150/200/300 ... nothing
 *    cinematic ... do not use duration-500+"). Static keeps the real
 *    gradient-light depth the reference sites use without adding a new,
 *    continuous-motion pattern nothing else on the site has. The other
 *    modes are left in — untouched, still real 21st.dev code — for a
 *    later, deliberate call if one is ever wanted.
 * Everything else (structure, blur presets) is the original component.
 */
import { motion, type Transition } from "motion/react";
import { cn } from "../../ui";

export type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?: "rotate" | "pulse" | "breathe" | "colorShift" | "flowHorizontal" | "static";
  blur?: number | "softest" | "soft" | "medium" | "strong" | "stronger" | "strongest" | "none";
  transition?: Transition;
  scale?: number;
  duration?: number;
};

const DEFAULT_COLORS = ["var(--color-accent-light)", "var(--color-accent)", "var(--color-accent-strong)"];

export function GlowEffect({
  className,
  style,
  colors = DEFAULT_COLORS,
  mode = "static",
  blur = "medium",
  transition,
  scale = 1,
  duration = 5,
}: GlowEffectProps) {
  const BASE_TRANSITION: Transition = { repeat: Infinity, duration, ease: "linear" };

  const animations = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(", ")})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(", ")})`,
      ],
      transition: { ...(transition ?? BASE_TRANSITION) },
    },
    pulse: {
      background: colors.map((color) => `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`),
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.5, 0.8, 0.5],
      transition: { ...(transition ?? { ...BASE_TRANSITION, repeatType: "mirror" as const }) },
    },
    breathe: {
      background: colors.map((color) => `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`),
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: { ...(transition ?? { ...BASE_TRANSITION, repeatType: "mirror" as const }) },
    },
    colorShift: {
      background: colors.map((color, index) => {
        const nextColor = colors[(index + 1) % colors.length];
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${nextColor} 50%, ${color} 100%)`;
      }),
      transition: { ...(transition ?? { ...BASE_TRANSITION, repeatType: "mirror" as const }) },
    },
    flowHorizontal: {
      background: colors.map((color) => {
        const nextColor = colors[(colors.indexOf(color) + 1) % colors.length];
        return `linear-gradient(to right, ${color}, ${nextColor})`;
      }),
      transition: { ...(transition ?? { ...BASE_TRANSITION, repeatType: "mirror" as const }) },
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(", ")})`,
    },
  };

  const getBlurClass = (b: GlowEffectProps["blur"]) => {
    if (typeof b === "number") return `blur-[${b}px]`;
    const presets = {
      softest: "blur-sm",
      soft: "blur",
      medium: "blur-md",
      strong: "blur-lg",
      stronger: "blur-xl",
      strongest: "blur-xl",
      none: "blur-none",
    };
    return presets[b as keyof typeof presets];
  };

  return (
    <motion.div
      style={
        {
          ...style,
          "--scale": scale,
          willChange: "transform",
          backfaceVisibility: "hidden",
        } as React.CSSProperties
      }
      animate={animations[mode]}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        "scale-[var(--scale)] transform-gpu",
        getBlurClass(blur),
        className,
      )}
    />
  );
}
