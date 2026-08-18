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
 *
 * Console warning fix (found live, every one of this component's ~16
 * call sites across the site — all use the default "static" mode):
 * "static" was routing its one fixed background through `animate={{
 * background: ... }}`, which asks Framer Motion to interpolate FROM the
 * element's initial transparent background TO the gradient — despite
 * "no animation loop" being the whole documented point of this mode.
 * Framer Motion can't do that interpolation anyway (confirmed live via
 * an isolated test, not assumed: a gradient built from this project's
 * `var(--color-accent...)` tokens fails its animatable-value check and
 * warns every render; the identical gradient with the same colors
 * resolved to literal hex does NOT warn), so the value was always just
 * snapping straight to its final state with zero actual transition —
 * the warning was pure console noise, not a broken visual. Since
 * "static" was never meant to animate, the real fix is to stop asking
 * Framer Motion to: its background is now set as a plain CSS value on
 * `style`, `animate` isn't used for it at all. Same exact gradient,
 * same colors, same instant appearance — nothing visually changes.
 * The other modes (rotate/pulse/breathe/colorShift/flowHorizontal) DO
 * still animate a `background`, and still build their gradients from
 * these same `var(--color-accent...)` colors — they'd hit this exact
 * warning (and, worse, likely just snap with no real crossfade, same as
 * static did) the moment any of them is actually used. Not fixed here:
 * they're unused everywhere in this codebase today (confirmed via
 * grep — no call site passes a non-default `mode`), so there's nothing
 * to verify live, and resolving `colors` to concrete hex/rgb (which the
 * isolated test confirms does make Framer Motion treat a gradient as
 * animatable) is real follow-up work for whoever activates one of them,
 * not a speculative fix to ship unverified now.
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
  };

  const isStatic = mode === "static";
  const staticBackground = `linear-gradient(to right, ${colors.join(", ")})`;

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
          ...(isStatic ? { background: staticBackground } : {}),
          "--scale": scale,
          willChange: "transform",
          backfaceVisibility: "hidden",
        } as React.CSSProperties
      }
      animate={isStatic ? undefined : animations[mode]}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        "scale-[var(--scale)] transform-gpu",
        getBlurClass(blur),
        className,
      )}
    />
  );
}
