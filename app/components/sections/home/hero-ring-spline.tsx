"use client";

import { useEffect, useRef, useState } from "react";
import Spline from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";
import { usePrefersReducedMotion } from "../../motion/use-reduced-motion";
import { cn } from "../../ui/cn";

/**
 * HeroRingSpline — Home hero's signature visual, replacing `PerimeterRing`
 * (the SVG "Perimeter Sweep" ring, D-057) with a Spline-hosted 3D scene.
 * See DECISIONS.md D-059 for the full architecture-change rationale —
 * short version: this is a deliberate, instructed move of this ONE
 * component off this project's code-generated-visuals convention (D-008)
 * onto an externally-hosted Spline scene, not a default/silent choice.
 *
 * `PerimeterRing` (perimeter-ring.tsx) is deliberately left untouched and
 * unreferenced anywhere — not deleted, not edited — so reverting is a
 * one-line import swap in hero.tsx, not a rebuild.
 *
 * Import note: `@splinetool/react-spline` also ships a `/next` entry
 * (`SplineNext`, an async Server Component with a built-in blur-hash
 * preview via `next/image`, fetched from Spline's own `/hash` endpoint) —
 * genuinely worth a look for a future pass, since it would replace the
 * hand-rolled skeleton below with Spline's own purpose-built solution.
 * Not used here: it's a Server Component, and composing one from inside
 * a "use client" file (required per this component's own brief) isn't a
 * pattern this codebase uses anywhere yet — flagged rather than adopted
 * silently mid-task.
 *
 * Loading state: the scene is fetched from Spline's CDN at runtime (not
 * bundled), so there's a real gap between mount and first paint. A
 * fixed-aspect skeleton (matching the wrapper's own `aspect-square`, so
 * there's no layout shift either direction) cross-fades to the loaded
 * canvas via `onLoad`, which react-spline fires with the live `Application`
 * instance once the scene has actually rendered.
 *
 * Reduced motion: `@splinetool/runtime`'s `Application` class exposes
 * real playback controls (`stop()`/`play()`/`isStopped`) — confirmed by
 * reading `runtime.d.ts` directly, not assumed. `stop()` is called in
 * `onLoad` when reduced motion is already on, and a separate effect
 * re-applies `stop()`/`play()` if the OS setting changes live after
 * mount, matching how `usePrefersReducedMotion` itself is reactive.
 */

const SPLINE_SCENE_URL = "https://prod.spline.design/V1tyQ1GeBELqa-K1/scene.splinecode";

export function HeroRingSpline({ className }: { className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const appRef = useRef<Application | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const handleLoad = (app: Application) => {
    appRef.current = app;
    setLoaded(true);
    if (reduceMotion) app.stop();
    // Belt-and-suspenders: force transparency from this side too, in
    // case the scene's own background setting doesn't fully propagate.
    // Tested live (see DECISIONS.md D-060) — made no visible difference
    // against the actual issue found (an opaque object rendered by the
    // scene itself, not a background-color setting), but it's a real,
    // documented API for exactly this and costs nothing to keep.
    app.setBackgroundColor("transparent");
  };

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    if (reduceMotion) app.stop();
    else app.play();
  }, [reduceMotion]);

  // Unmount safety — Application holds a live WebGL context/render loop.
  useEffect(() => {
    return () => appRef.current?.dispose();
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute right-[-40%] bottom-[-18%] aspect-square w-[70vw] max-w-[300px] sm:right-[-20%] sm:bottom-auto sm:top-1/2 sm:max-w-[560px] sm:-translate-y-1/2 lg:right-[-12%] lg:max-w-[760px]",
        className,
      )}
    >
      {/* Skeleton — same footprint as the scene itself (this wrapper is
          already `aspect-square`), so it occupies the space instead of
          the fetch/parse/WebGL-boot gap causing a jump when it appears. */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-surface transition-opacity duration-300",
          loaded ? "pointer-events-none opacity-0" : "opacity-60",
        )}
      />
      <Spline
        scene={SPLINE_SCENE_URL}
        onLoad={handleLoad}
        style={{ width: "100%", height: "100%" }}
        className={cn("transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
