import { Caption, Container, H1, Text, ButtonLink } from "../../ui";
import { HeroRingSpline } from "./hero-ring-spline";

/**
 * Hero — "The Perimeter Sweep" (replaces the 16-frame city-skyline photo
 * sequence — see DECISIONS.md D-057 for the full concept/approval trail).
 *
 * The signature visual is now `HeroRingSpline`: a Spline-hosted 3D scene
 * of the ring, replacing D-057's SVG `PerimeterRing` per an explicit,
 * approved architecture change — see DECISIONS.md D-059. `PerimeterRing`
 * (perimeter-ring.tsx) is intentionally left in the codebase, unedited
 * and unreferenced, so this swap is a one-line revert if needed — not
 * deleted, not folded into this change.
 *
 * Structural change from the old Hero, approved alongside the visual
 * swap: the previous 350vh scroll-pinned section existed only to stage
 * the 16-frame crossfade against `scrollYProgress` (D-005). With no more
 * frames to crossfade through, there's nothing left to pin — this is now
 * a normal-height section, no scroll-jacking, no `useScroll`/`useTransform`
 * machinery. That also means the old subtle scroll-linked upward drift on
 * the headline column (tied to that same `scrollYProgress`) is gone along
 * with the mechanism it depended on — the text itself is unchanged, just
 * no longer scroll-parallaxed.
 *
 * Mobile/reduced-motion: no more separate "simplified path" branch here —
 * `PerimeterRing` is responsive via plain CSS breakpoints and handles its
 * own `prefers-reduced-motion` check internally (freezes the sweep), so
 * the Hero's own markup is now identical at every width/motion setting.
 *
 * The 16 source frames (public/hero/frame-*.png) are left on disk,
 * unreferenced — same convention this project already uses for other
 * superseded visual assets (e.g. the unused founder headshot from D-050) —
 * confirmed via a repo-wide grep that nothing else references them.
 */

export function Hero() {
  return (
    <div className="env-dark relative h-[100svh] w-full overflow-hidden bg-background">
      <HeroRingSpline />

      {/* Foreground content — unchanged copy/CTAs */}
      <Container size="xl" className="relative z-10 flex h-full flex-col justify-center">
        <div className="max-w-xl pt-16 md:pt-8">
          <Caption tone="accent">Cybersecurity for modern businesses</Caption>
          <H1 size="xl" className="mt-4">
            Security clarity
            <br />
            for what comes next.
          </H1>
          <Text tone="secondary" size="lg" className="mt-6 max-w-md">
            Oragrol helps businesses understand risk, prioritize what matters, and build
            practical protection that moves with the business.
          </Text>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/cyber-health" variant="primary" size="lg">
              Get Your Cyber Health Score
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Talk to Oragrol
            </ButtonLink>
          </div>
        </div>
      </Container>

      {/* Scroll indicator — unchanged */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3">
        <span className="font-body text-xs uppercase tracking-widest text-text-secondary">
          Scroll to explore
        </span>
        <span className="h-8 w-px bg-border" aria-hidden="true" />
      </div>
    </div>
  );
}
