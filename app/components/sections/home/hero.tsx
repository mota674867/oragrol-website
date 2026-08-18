import { Caption, Container, H1, Text, ButtonLink } from "../../ui";
import { PerimeterRing } from "./perimeter-ring";

/**
 * Hero — "The Perimeter Sweep" (replaces the 16-frame city-skyline photo
 * sequence — see DECISIONS.md D-057 for the full concept/approval trail).
 *
 * The signature visual is `PerimeterRing`: a hand-coded SVG/CSS ring —
 * segmented/dashed circumference, one continuous rotating highlight
 * sweep, token colors only, `prefers-reduced-motion` respected. D-057
 * built it; D-059 swapped it for a Spline-hosted 3D scene; D-061 reverts
 * that Spline detour back to this component after the 3D scene proved
 * unfixable from this codebase's side (a persistent opaque backdrop
 * behind the ring — see D-060). `hero-ring-spline.tsx`,
 * `@splinetool/react-spline`, and `@splinetool/runtime` are deleted —
 * confirmed unreferenced anywhere else first.
 *
 * Structural change from the pre-D-057 Hero: the old 350vh scroll-pinned
 * section existed only to stage the 16-frame crossfade against
 * `scrollYProgress` (D-005). With no more frames to crossfade through,
 * there's nothing left to pin — this is a normal-height section, no
 * scroll-jacking, no `useScroll`/`useTransform` machinery.
 *
 * Mobile/reduced-motion: no separate "simplified path" branch here —
 * `PerimeterRing` is responsive via plain CSS breakpoints and handles its
 * own `prefers-reduced-motion` check internally (freezes the sweep), so
 * the Hero's own markup is identical at every width/motion setting.
 *
 * The 16 source frames (public/hero/frame-*.png) are left on disk,
 * unreferenced — same convention this project already uses for other
 * superseded visual assets (e.g. the unused founder headshot from D-050).
 */

export function Hero() {
  return (
    <div className="env-dark relative h-[100svh] w-full overflow-hidden bg-background">
      <PerimeterRing />

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
