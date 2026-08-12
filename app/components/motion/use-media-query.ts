"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook, via useSyncExternalStore — same rationale as
 * use-reduced-motion.ts: reading `window.matchMedia` directly on the
 * client during render disagrees with the server (no `window`), causing a
 * hydration mismatch. `getServerSnapshot` below fixes that at the source.
 *
 * Defaults to `false` (i.e. assume desktop) on the server and the
 * client's first paint; useSyncExternalStore corrects it synchronously as
 * part of the same commit once real `window` info is available, so there
 * is no separate flash-of-wrong-content frame to worry about.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onChange);
      return () => mediaQueryList.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
