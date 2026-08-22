import Link from "next/link";
import { Badge, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { OragrolLogo } from "../../brand/oragrol-logo";
import { GlowEffect } from "./glow-effect";
import { ServicesNetworkVisual } from "./network-visual";

/**
 * Services Hero — Services Landing Page brief (Level 1, panel 1 of 2).
 * Composition reference: an external image (dark, large rounded panel,
 * split left-text/right-visual, small logomark + pill eyebrow + large
 * two-tier headline + short description on the left, one large cinematic
 * visual bleeding toward the panel's own edges on the right, warm
 * accent-colored ambient glow behind it) — used for COMPOSITION only, not
 * copied: brand, content, colors, typography, and the visual itself are
 * all ORAGROL's own, per the brief's explicit instruction.
 *
 * Content is the same approved Services copy this page already had
 * before this pass (see git history) — re-composed into the new panel
 * layout, not rewritten. No new marketing claims.
 *
 * Visual: `ServicesNetworkVisual`, the page's own existing signature
 * illustration (D-008/D-015), scaled up to hero size rather than replaced
 * with a new illustration system — the brief is explicit that the
 * existing visual language should be scaled/adapted, not reinvented, and
 * explicit that this must not be a human/robot face.
 *
 * `GlowEffect` gets an explicit `colors` override back to the accent
 * family here (its shared default is Deep-Blue per D-068/D-069 — correct
 * for the ~16 other cards that use it as ambient "depth," but this one
 * panel specifically wants the reference's warm orange ambient light, so
 * it's a per-call-site override, not a change to the shared default).
 *
 * D-069/D-070: this section carries no `transitionFrom`/`transitionTo` —
 * every section on `/services` is `environment="dark"`, so there was no
 * boundary to soften before this pass and there still isn't. Section's
 * own layering (`isolate`, `-z-10` overlay) is untouched.
 */
export function ServicesHero() {
  return (
    <Section environment="dark">
      <Container size="2xl" className="pt-16 md:pt-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-surface/40 p-8 md:rounded-[2.5rem] md:p-14 lg:p-20">
          <GlowEffect
            blur="strongest"
            className="opacity-25"
            colors={["var(--color-accent-light)", "var(--color-accent)", "var(--color-accent-strong)"]}
          />
          <div className="relative grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Reveal>
                <Link
                  href="/"
                  className="inline-flex rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <OragrolLogo height={32} />
                </Link>
              </Reveal>
              <Reveal delay={0.05}>
                <Badge tone="accent" className="mt-10">
                  Services
                </Badge>
              </Reveal>
              <Reveal delay={0.1}>
                <H1 size="xl" className="mt-6 max-w-xl">
                  Ten categories. One coordinated approach.
                </H1>
              </Reveal>
              <Reveal delay={0.15}>
                <Text tone="secondary" size="lg" className="mt-6 max-w-lg">
                  Every service exists to answer one question: what does this business actually need
                  to protect, and what&apos;s the most direct way to protect it. Explore what each
                  category covers below.
                </Text>
              </Reveal>
            </div>

            <Reveal delay={0.2}>
              <div className="relative mx-auto flex min-h-[280px] w-full max-w-lg items-center justify-center md:min-h-[360px] lg:max-w-none">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 -top-6 select-none font-data text-[9rem] font-bold leading-none text-white/[0.04] md:text-[12rem]"
                >
                  10
                </span>
                <ServicesNetworkVisual className="relative w-full" />
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
