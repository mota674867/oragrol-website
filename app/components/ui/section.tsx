import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

/**
 * Section — wraps a block of the page in one of the three approved
 * background environments (app/styles/tokens.css: .env-dark / .env-white /
 * .env-light-blue). Only background + text-primary/secondary repoint per
 * environment; surface, border, accent, and text-muted stay constant by
 * design, so cards/badges/buttons/inputs read the same regardless of which
 * Section they sit in — that's what "every component must work in three
 * section environments" means in practice, and it's why components in this
 * folder only ever reference the semantic tokens, never raw hex.
 */

export type SectionEnvironment = "dark" | "white" | "light-blue";

const envClasses: Record<SectionEnvironment, string> = {
  dark: "env-dark",
  white: "env-white",
  "light-blue": "env-light-blue",
};

export interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  environment?: SectionEnvironment;
}

export function Section({
  environment = "dark",
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        envClasses[environment],
        "bg-background text-text-primary",
        className,
      )}
      {...props}
    />
  );
}
