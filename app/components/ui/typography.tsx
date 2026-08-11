import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

/**
 * Typography primitives — Website Implementation Brief, Step 3.
 *
 * Headings use font-heading (Space Grotesk); body/caption use font-body
 * (Inter); data/score figures use font-data (JetBrains Mono). All colors
 * come from the semantic tokens (never raw hex) so every variant works
 * unchanged across the Dark / White / Light-blue section environments.
 */

export function H1({ className, ...props }: ComponentPropsWithoutRef<"h1">) {
  return (
    <h1
      className={cn(
        "font-heading text-4xl font-semibold leading-tight tracking-tight text-text-primary md:text-5xl",
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

export function H3({ className, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn(
        "font-heading text-2xl font-semibold leading-snug tracking-tight text-text-primary md:text-3xl",
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

export interface CaptionProps extends ComponentPropsWithoutRef<"p"> {
  tone?: TextTone;
}

/** Small uppercase label — eyebrow text, section labels, metadata lines. */
export function Caption({
  tone = "secondary",
  className,
  ...props
}: CaptionProps) {
  return (
    <p
      className={cn(
        "font-body text-xs font-medium uppercase tracking-widest",
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
