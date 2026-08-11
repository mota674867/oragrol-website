import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "./cn";

/**
 * Button — Website Implementation Brief, Step 3.
 *
 * Flat, matte styling: solid fills or a single subtle border, color-only
 * hover states (no shadow/scale/glow), a visible focus ring for keyboard
 * users. Works unchanged across all three section environments because
 * every color is a semantic token; hover tints use `text-primary/5` (an
 * opacity mix of whichever text color the current environment resolves to)
 * instead of a hardcoded white/black tint.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center font-body font-medium transition-colors duration-150 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:pointer-events-none disabled:opacity-50";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-lg px-3.5 text-sm gap-1.5",
  md: "h-11 rounded-lg px-5 text-sm gap-2",
  lg: "h-12 rounded-lg px-6 text-base gap-2.5",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent/90",
  secondary:
    "border border-border bg-surface text-text-primary hover:border-text-secondary hover:bg-text-primary/5",
  ghost: "text-text-primary hover:bg-text-primary/5",
};

function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(base, sizeClasses[size], variantClasses[variant], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className, type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses(variant, size, className)}
        {...props}
      />
    );
  },
);

export interface ButtonLinkProps
  extends LinkProps,
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      keyof LinkProps | "className"
    > {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
}

/** Same visual system as Button, for actions that navigate. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    { variant = "primary", size = "md", className, ...props },
    ref,
  ) {
    return (
      <Link
        ref={ref}
        className={buttonClasses(variant, size, className)}
        {...props}
      />
    );
  },
);
