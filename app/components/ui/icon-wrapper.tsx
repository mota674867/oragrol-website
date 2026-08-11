import type { ComponentType, SVGProps } from "react";
import { cn } from "./cn";

/**
 * Icon — sizing/stroke convention for Lucide React icons, Step 3.
 *
 * Filename note: this can't be `icon.tsx` — anywhere under `app/`, that
 * filename is Next's special file convention for generating a favicon/app
 * icon route (see node_modules/next/dist/docs .../file-conventions), and it
 * gets picked up as a route even nested inside components/. Hence
 * `icon-wrapper.tsx`; the exported component is still named `Icon`.
 *
 * A thinner-than-default stroke (1.75 vs Lucide's default 2) reads as more
 * refined/matte at these sizes. Color always inherits `currentColor` from
 * the surrounding text — set color via the parent's text-* utility, not
 * here, so icons stay in sync with adjacent text across environments.
 */

export type LucideIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type IconSize = "sm" | "md" | "lg";

const sizeClasses: Record<IconSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export interface IconProps {
  /** A Lucide icon component, e.g. `icon={ShieldCheck}`. */
  icon: LucideIconComponent;
  size?: IconSize;
  className?: string;
  /** Accessible label. Omit for purely decorative icons (the default). */
  label?: string;
}

export function Icon({ icon: IconComponent, size = "md", className, label }: IconProps) {
  return (
    <IconComponent
      className={cn(sizeClasses[size], "shrink-0 text-current", className)}
      strokeWidth={1.75}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    />
  );
}
