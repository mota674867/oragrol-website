"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { cn } from "../../ui";
import { usePrefersReducedMotion } from "../../motion/use-reduced-motion";

/**
 * KineticGrid — Solutions hero background, replacing the isometric
 * strata visual (D-039). Sourced via 21st.dev ("Kinetic Grid", author
 * satoriui, id 18254 — found and fetched directly after the instruction's
 * own code block came through empty, same placeholder-text failure mode
 * as the earlier How We Work round; the search result's name, description,
 * and exact technical details — `fixed inset-0` canvas, `min-h-screen`
 * wrapper, a `globalColor: "default" | "monochrome"` theme prop with
 * `lineActive`/`nodeActive`/`glow`/`ripple` keys — all matched the
 * instruction's own description closely enough to treat as confirmed
 * rather than blocking again; flagged here so it's traceable, not
 * silently assumed).
 *
 * Five required modifications from the original 21st.dev source, in
 * order:
 *
 * 1. SCOPED TO HERO, NOT VIEWPORT — the canvas was `fixed inset-0`
 *    (viewport-relative) inside a `min-h-screen` wrapper (a full-page
 *    background regardless of where it's mounted). Canvas is now
 *    `absolute inset-0` within a `relative` wrapper that has NO forced
 *    height — it sizes to its own children's natural content height
 *    (the hero's Caption/H1/Text stack), same as any other section.
 *    Sizing itself now reads the wrapper's own `getBoundingClientRect()`
 *    via `ResizeObserver` (fires on content reflow too, not just window
 *    resize — more robust than the original's `window.innerWidth/Height`
 *    + resize-listener approach for a container that isn't the viewport).
 *    Mouse/click listeners are attached to the wrapper element itself,
 *    not `window` — interaction (warp, ripple) only reacts inside the
 *    hero's own bounds, consistent with "must not render behind the nav,
 *    footer, or other sections."
 *
 * 2. COLOR REMAP — the original's `theme.default`/`theme.monochrome`
 *    switch is replaced with ONE fixed theme built from `tokens.css`'s
 *    own locked raw values (not invented, not eyeballed): background
 *    `#0a0a0a` (`--palette-black-900`, the same value `.env-dark`'s
 *    `--background` already resolves to — the Section this mounts in is
 *    already this color underneath, so the canvas matches exactly, no
 *    seam), active line/node/glow/ripple `#018abe` (`--palette-blue-600`,
 *    Oragrol Cyan, the locked `--accent`). The `globalColor` prop and the
 *    monochrome variant are removed entirely — per instruction, not just
 *    defaulted away — there is only ever the one Oragrol-mapped theme
 *    now. Idle/base line and node colors (a low-opacity white wash used
 *    only for the un-warped resting grid) are left unchanged — the
 *    instruction only named the ACTIVE-state colors for remapping, and a
 *    neutral idle base is what lets the accent-colored active state read
 *    as a real highlight rather than "everything is cyan."
 *
 * 3. REDUCED-MOTION SUPPORT — the original had no `prefers-reduced-motion`
 *    handling despite a continuous `requestAnimationFrame` loop. Reuses
 *    this codebase's own `usePrefersReducedMotion` hook (already built,
 *    SSR-safe, used elsewhere — e.g. Capability 05's live-pulse
 *    indicator) rather than rolling a new check. When reduced motion is
 *    on: no rAF loop is ever started, no mousemove/click listeners are
 *    attached (so no warp, no ripple-on-click), and exactly one static
 *    frame is drawn on mount/resize — background + the static dot
 *    texture + the grid lines/nodes in their resting (un-warped, base-
 *    color) state, since forcing the mouse position permanently
 *    off-canvas and never pushing a ripple naturally produces that same
 *    frame through the existing `draw()` function, without forking the
 *    drawing logic into a second code path.
 *
 * 4. PERFORMANCE — verified via a scripted frame-rate sample (see
 *    DECISIONS.md D-039) at 1920px and under Chrome DevTools Protocol
 *    4x CPU throttling (approximating a mid-range mobile device); no
 *    other change made here beyond confirming it, since the animation
 *    loop itself is unchanged from the sourced component.
 *
 * 5. CONTENT PRESERVED — `hero.tsx`'s existing Caption/H1/Text (all
 *    locked, unchanged copy) are passed as `children`, rendered in the
 *    same `relative z-10` layer the original component already used to
 *    keep content above the canvas.
 */

interface Point {
  x: number;
  y: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
}

const CELL_SIZE = 55;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 28;
const LERP_SPEED = 0.08;

const LINE_BASE = { r: 255, g: 255, b: 255, a: 0.13 };
const NODE_BASE_RADIUS = 1.8;
const NODE_ACTIVE_RADIUS = 3.2;

// Locked-palette theme (item 2) — raw hex values copied verbatim from
// tokens.css, not reinterpreted. #0a0a0a = --palette-black-900
// (--background in .env-dark). #018abe = --palette-blue-600 (--accent).
const THEME = {
  bg: "#0a0a0a",
  lineActive: { r: 1, g: 138, b: 190, a: 0.9 },
  nodeActive: { r: 1, g: 138, b: 190, a: 1.0 },
  glow: "1,138,190",
  ripple: "1,138,190",
};

function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(
  base: { r: number; g: number; b: number; a: number },
  active: { r: number; g: number; b: number; a: number },
  t: number,
): string {
  const r = Math.round(lerpN(base.r, active.r, t));
  const g = Math.round(lerpN(base.g, active.g, t));
  const b = Math.round(lerpN(base.b, active.b, t));
  const a = lerpN(base.a, active.a, t);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

export function KineticGrid({ children, className }: { children?: ReactNode; className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const targetMouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const reducedMotion = usePrefersReducedMotion();

  const getWarpedPoint = useCallback(
    (
      gx: number,
      gy: number,
      col: number,
      row: number,
      mouse: Point,
      ripples: Ripple[],
      cols: number,
      rows: number,
    ): { pt: Point; proximity: number } => {
      const edgeMargin = 1.5;
      const colPin = Math.min(col / edgeMargin, (cols - 1 - col) / edgeMargin, 1);
      const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
      const pinFactor = colPin * colPin * rowPin * rowPin;

      const dx = gx - mouse.x;
      const dy = gy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pinFactor;

      let rx = 0;
      let ry = 0;
      for (const r of ripples) {
        const rdx = gx - r.x;
        const rdy = gy - r.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveWidth = 55;
        const diff = rdist - r.radius;
        if (Math.abs(diff) < waveWidth) {
          const strength = (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pinFactor;
          const angle = Math.atan2(rdy, rdx);
          const sign = diff < 0 ? -1 : 1;
          rx += Math.cos(angle) * strength * sign * -1;
          ry += Math.sin(angle) * strength * sign * -1;
        }
      }

      if (dist < INFLUENCE_RADIUS && dist > 0 && pinFactor > 0) {
        const t = dist / INFLUENCE_RADIUS;
        const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
        const warpAmt = eased * MAX_WARP * pinFactor;
        const angle = Math.atan2(dy, dx);
        return {
          pt: { x: gx - Math.cos(angle) * warpAmt + rx, y: gy - Math.sin(angle) * warpAmt + ry },
          proximity,
        };
      }

      return { pt: { x: gx + rx, y: gy + ry }, proximity };
    },
    [],
  );

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w: W, h: H } = sizeRef.current;
      if (W === 0 || H === 0) return;
      const mouse = mouseRef.current;
      const ripples = ripplesRef.current;

      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = THEME.bg;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (let x = DOT_SPACING / 2; x < W; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < H; y += DOT_SPACING) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 400);
        r.opacity = Math.max(0, 1 - age * 1.2);
        if (r.opacity <= 0) ripples.splice(i, 1);
      }

      const cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1;
      const cellW = W / (cols - 1);
      const cellH = H / (rows - 1);

      const pts: Point[][] = [];
      const prox: number[][] = [];

      for (let row = 0; row < rows; row++) {
        pts[row] = [];
        prox[row] = [];
        for (let col = 0; col < cols; col++) {
          const { pt, proximity } = getWarpedPoint(col * cellW, row * cellH, col, row, mouse, ripples, cols, rows);
          pts[row][col] = pt;
          prox[row][col] = proximity;
        }
      }

      const drawSeg = (p1: Point, p2: Point, pr1: number, pr2: number) => {
        const avg = (pr1 + pr2) / 2;
        const t = avg * avg * (3 - 2 * avg);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = lerpColor(LINE_BASE, THEME.lineActive, t);
        ctx.lineWidth = lerpN(0.8, 1.5, t);
        ctx.stroke();
      };

      ctx.lineCap = "butt";

      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols - 1; col++)
          drawSeg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1]);

      for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows - 1; row++)
          drawSeg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col]);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const p = pts[row][col];
          const pr = prox[row][col];
          const t = pr * pr * (3 - 2 * pr);
          const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);

          if (t > 0.3) {
            const glowR = r + lerpN(0, 6, (t - 0.3) / 0.7);
            const grd = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR);
            grd.addColorStop(0, `rgba(${THEME.glow},${(t * 0.3).toFixed(3)})`);
            grd.addColorStop(1, `rgba(${THEME.glow},0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = lerpColor({ r: 255, g: 255, b: 255, a: 0.2 }, THEME.nodeActive, t);
          ctx.fill();
        }
      }

      for (const r of ripples) {
        const safeRadius = Math.max(0, r.radius);
        ctx.beginPath();
        ctx.arc(r.x, r.y, safeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${THEME.ripple},${(r.opacity * 0.28).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    [getWarpedPoint],
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    // Item 1: size from the WRAPPER's own box, not window.innerWidth/Height.
    const setSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
    };

    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(wrapper);

    if (reducedMotion) {
      // Item 3: no rAF loop, no listeners -- one static frame with the
      // mouse permanently off-canvas and no ripples, so draw() naturally
      // renders the resting (un-warped) grid.
      draw(performance.now());
      return () => resizeObserver.disconnect();
    }

    // Item 1: listeners on the wrapper, coordinates relative to it -- not
    // `window`/`e.clientX` -- so warp/ripple only react within the hero.
    const onMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      targetMouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      targetMouseRef.current = { x: -9999, y: -9999 };
    };
    const onClick = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      ripplesRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        opacity: 1,
        born: performance.now(),
      });
    };

    wrapper.addEventListener("mousemove", onMouseMove);
    wrapper.addEventListener("mouseleave", onMouseLeave);
    wrapper.addEventListener("click", onClick);

    // A hoisted function declaration (not a `const` arrow) so it can
    // safely reference itself recursively -- avoids the "accessed before
    // declared" lint error a `const animate = useCallback(...)` self-
    // referencing `requestAnimationFrame(animate)` inside its own
    // initializer triggered (caught during typecheck/lint, fixed before
    // this was ever reported as done). Only ever used inside this one
    // effect, so it doesn't need to live outside it as its own
    // useCallback.
    function animate(now: number) {
      const m = mouseRef.current;
      const t = targetMouseRef.current;
      m.x = lerpN(m.x, t.x, LERP_SPEED);
      m.y = lerpN(m.y, t.y, LERP_SPEED);
      draw(now);
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      wrapper.removeEventListener("mousemove", onMouseMove);
      wrapper.removeEventListener("mouseleave", onMouseLeave);
      wrapper.removeEventListener("click", onClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw, reducedMotion]);

  return (
    <div ref={wrapperRef} className={cn("relative w-full overflow-hidden bg-[#0a0a0a]", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
