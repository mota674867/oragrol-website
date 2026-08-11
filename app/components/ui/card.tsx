import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { cn } from "./cn";

/**
 * Card — Step 3.
 *
 * variant="surface": flat fill, no border (use inside an already-bordered
 * container, or where separation comes from spacing alone).
 * variant="bordered" (default): the workhorse card — subtle border + fill.
 * interactive: adds a hover/focus lift for clickable cards. Pass `href` to
 * render the whole card as a link (no onClick handler needed, so this stays
 * a plain server-renderable component — no 'use client' required).
 */

export type CardVariant = "surface" | "bordered";

export interface CardProps {
  variant?: CardVariant;
  interactive?: boolean;
  href?: string;
  className?: string;
  id?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement | HTMLAnchorElement>;
}

export function Card({
  variant = "bordered",
  interactive = false,
  href,
  className,
  children,
  ...rest
}: CardProps) {
  const classes = cn(
    "rounded-2xl p-6",
    variant === "bordered" ? "border border-border bg-surface" : "bg-surface",
    interactive &&
      "block transition-colors duration-200 hover:border-text-secondary hover:bg-text-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
