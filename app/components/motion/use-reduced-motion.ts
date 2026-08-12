"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe prefers-reduced-motion detection, via useSyncExternalStore —
 * React's purpose-built primitive for subscribing to an external mutable
 * source (here, a matchMedia query) without the hydration/timing pitfalls
 * of rolling it by hand with useState + useEffect.
 *
 * Deliberately NOT using motion's own `useReducedMotion()`: it resolves
 * `window.matchMedia` synchronously on the client, which disagrees with
 * the server (no `window`, so it can only assume false) whenever the
 * browser actually prefers reduced motion — a real hydration mismatch,
 * hit while verifying the Step 4 Home page ("Hydration failed... this
 * tree will be regenerated on the client"). `getServerSnapshot` below
 * fixes that at the source: the server and the client's first paint both
 * resolve to `false`, and only a later store-change flips it — a normal
 * post-mount update, not a mismatch.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
