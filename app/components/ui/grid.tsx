import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

/**
 * Responsive grid primitive — Step 3.
 *
 * Column counts are looked up from fixed literal-string maps (not built via
 * template strings like `grid-cols-${n}`) so Tailwind's build-time scanner
 * can see every class it needs to generate.
 */

const colsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};
const smColsMap: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};
const mdColsMap: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  // 5 added for the footer overhaul (D-017): brand block (col-span-2) +
  // 3 nav columns (Company/Resources/Legal) needs 5 total md: units.
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};
const lgColsMap: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  6: "lg:grid-cols-6",
};

const gapClasses = { sm: "gap-4", md: "gap-6", lg: "gap-8" } as const;

export interface GridProps extends ComponentPropsWithoutRef<"div"> {
  /** Column count per breakpoint. Defaults to a 1 → 2 → 3 ladder. */
  cols?: { base?: number; sm?: number; md?: number; lg?: number };
  gap?: keyof typeof gapClasses;
}

export function Grid({
  cols = { base: 1, md: 2, lg: 3 },
  gap = "md",
  className,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        cols.base ? colsMap[cols.base] : null,
        cols.sm ? smColsMap[cols.sm] : null,
        cols.md ? mdColsMap[cols.md] : null,
        cols.lg ? lgColsMap[cols.lg] : null,
        gapClasses[gap],
        className,
      )}
      {...props}
    />
  );
}
