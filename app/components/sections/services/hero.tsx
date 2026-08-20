import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { GlowEffect } from "./glow-effect";
import { ServicesNetworkVisual } from "./network-visual";

/**
 * Services Hero — Step 5, given a real signature illustration (D-015).
 * Previously text-only (see git history) — weak next to Solutions'
 * StrataVisual / Cyber Health's GaugeVisual hero visuals. Now a 2-column
 * layout matching that same established pattern (text | visual), with
 * ServicesNetworkVisual in a glow-lit elevated panel (GlowEffect, same
 * component as the capability rows — D-013 material) as the page's own
 * hero-scale signature piece.
 *
 * Dark environment, matching Home's opening section — deliberate, not
 * arbitrary: SiteHeader (site-header.tsx) is currently scoped to assume a
 * Dark entry section for every page ("Once light-first pages exist, this
 * should read the entry section's environment instead of assuming Dark" —
 * see its own header comment). Services is the first non-Home page built;
 * opening it in White/Light-blue would put white header nav text on a
 * light background with only the base 30%-opacity gradient for contrast
 * (the stronger gradient only fades in after ~140px of scroll). Staying
 * Dark here avoids that regression without having to touch SiteHeader in
 * this pass. No 16-frame scroll sequence — that treatment is Home-exclusive
 * per DECISIONS.md D-006.
 */
export function ServicesHero() {
  return (
    <Section environment="dark">
      <Container size="lg" className="py-24 md:py-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Reveal>
              <Caption tone="accent">Services</Caption>
            </Reveal>
            <Reveal delay={0.05}>
              <H1 className="mt-4 max-w-2xl">
                Fifteen categories. One coordinated approach.
              </H1>
            </Reveal>
            <Reveal delay={0.1}>
              <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
                Every service exists to answer one question: what does this business actually need
                to protect or improve, and what&apos;s the most direct way to do it. Explore what each
                category covers below.
              </Text>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-8">
              <GlowEffect blur="strong" className="opacity-40" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-8 -right-2 select-none font-data text-[11rem] font-bold leading-none text-white/[0.04]"
              >
                15
              </span>
              <ServicesNetworkVisual className="relative w-full" />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
