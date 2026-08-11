import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

/** Max-width wrapper with responsive padding — Step 3. */

const maxWidths = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
} as const;

export type ContainerSize = keyof typeof maxWidths;

export interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  size?: ContainerSize;
}

export function Container({ size = "xl", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-6 md:px-12", maxWidths[size], className)}
      {...props}
    />
  );
}
