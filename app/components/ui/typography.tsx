import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

/**
 * Typography primitives — Website Implementation Brief, Step 3.
 *
 * Headings use font-heading (Space Grotesk); body/caption use font-body
 * (Manrope, D-068 — was Inter); data/score figures use font-data (IBM Plex
 * Sans, D-068 — was JetBrains Mono). All colors
 * come from the semantic tokens (never raw hex) so every variant works
 * unchanged across the Dark / White / Light-blue section environments.
 */

export type H1Size = "default" | "xl";

const h1SizeClasses: Record<H1Size, string> = {
  default: "text-4xl md:text-5xl",
  // Hero-scale — deliberately larger than the standard H1 ladder, for the
  // one bespoke, editorial headline treatment the brief calls for.
  xl: "text-4xl sm:text-5xl md:text-6xl",
};

export interface H1Props extends ComponentPropsWithoutRef<"h1"> {
  size?: H1Size;
}

export function H1({ size = "default", className, ...props }: H1Props) {
  return (
    <h1
      className={cn(
        "font-heading font-semibold leading-tight tracking-tight text-text-primary",
        h1SizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

export function H2({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "font-heading text-3xl font-semibold leading-tight tracking-tight text-text-primary md:text-4xl",
        className,
      )}
      {...props}
    />
  );
}

export type H3Size = "default" | "lg";

const h3SizeClasses: Record<H3Size, string> = {
  default: "text-2xl font-semibold md:text-3xl",
  // Dominant-headline variant — added for the Services capability-row
  // hierarchy fix (headline vs. field-label weight, D-015; strengthened
  // D-016 after the first pass was confirmed still not enough contrast):
  // bigger and bolder than the default ladder step, for contexts where a
  // headline sits close to several small uppercase labels and needs
  // unambiguous visual dominance over them. Weight lives entirely in this
  // table (not the shared base string below) so default/lg never emit
  // two conflicting font-weight utility classes at once — see cn.ts's own
  // documented plain-concatenation gotcha.
  lg: "text-4xl font-bold md:text-5xl",
};

export interface H3Props extends ComponentPropsWithoutRef<"h3"> {
  size?: H3Size;
}

export function H3({ size = "default", className, ...props }: H3Props) {
  return (
    <h3
      className={cn(
        "font-heading leading-snug tracking-tight text-text-primary",
        h3SizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

export function H4({ className, ...props }: ComponentPropsWithoutRef<"h4">) {
  return (
    <h4
      className={cn(
        "font-heading text-xl font-semibold leading-snug tracking-tight text-text-primary",
        className,
      )}
      {...props}
    />
  );
}

export type TextTone = "primary" | "secondary" | "muted" | "accent";
export type TextSize = "sm" | "base" | "lg";

const toneClasses: Record<TextTone, string> = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  muted: "text-text-muted",
  accent: "text-accent",
};

const textSizeClasses: Record<TextSize, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

export interface TextProps extends ComponentPropsWithoutRef<"p"> {
  size?: TextSize;
  tone?: TextTone;
}

/** Body / UI copy. Use `tone` rather than overriding color via className. */
export function Text({
  size = "base",
  tone = "primary",
  className,
  ...props
}: TextProps) {
  return (
    <p
      className={cn(
        "font-body leading-relaxed",
        textSizeClasses[size],
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

export type CaptionSize = "default" | "sm";

const captionSizeClasses: Record<CaptionSize, string> = {
  default: "text-xs tracking-widest font-medium",
  // Quieter variant — added for the Services capability-row hierarchy fix
  // (D-015, tracking widened further in D-016): smaller and more
  // letter-spaced than the default, so a repeated field label (e.g. four
  // per row — "THE CHALLENGE", "WHAT ORAGROL DOES"...) reads as a quiet
  // category tag rather than repeatedly competing with the row's own
  // headline for attention. Weight dropped to font-normal (D-019, item
  // 3): computed at font-medium/500 before, which — combined with
  // uppercase + small size — still read as too heavy/competing. Weight
  // now lives per-tier (not the shared base string) so default/sm never
  // emit two conflicting font-weight classes at once, same reasoning as
  // H3/NavLink's own size variants.
  sm: "text-[10px] tracking-[0.22em] font-normal",
};

export interface CaptionProps extends ComponentPropsWithoutRef<"p"> {
  tone?: TextTone;
  size?: CaptionSize;
}

/** Small uppercase label — eyebrow text, section labels, metadata lines. */
export function Caption({
  tone = "secondary",
  size = "default",
  className,
  ...props
}: CaptionProps) {
  return (
    <p
      className={cn(
        "font-body uppercase",
        captionSizeClasses[size],
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

export type DataTextSize = "sm" | "md" | "lg" | "xl";

const dataSizeClasses: Record<DataTextSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
  xl: "text-5xl",
};

export interface DataTextProps extends ComponentPropsWithoutRef<"span"> {
  size?: DataTextSize;
  tone?: TextTone;
}

/** Monospace figure for scores and other data values — never for prose. */
export function DataText({
  size = "md",
  tone = "primary",
  className,
  ...props
}: DataTextProps) {
  return (
    <span
      className={cn(
        "font-data tabular-nums",
        dataSizeClasses[size],
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
