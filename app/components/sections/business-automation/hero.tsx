import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { GlowEffect } from "../services/glow-effect";
import { ServicesNetworkVisual } from "../services/network-visual";

/**
 * Business Automation Hero — 2026-08-20 nav split. Same visual system as
 * `services/hero.tsx` verbatim (2-column text|visual layout, `GlowEffect`-
 * lit panel, `ServicesNetworkVisual`, Dark environment for the same
 * SiteHeader-contrast reason documented there) — cross-folder reuse of
 * both, not a rebuild, matching the "same visual system, just change
 * navigation/structure" instruction. Only the copy and the ghost numeral
 * (5, this tier's real category count) differ.
 */
export function BusinessAutomationHero() {
  return (
    <Section environment="dark">
      <Container size="lg" className="py-24 md:py-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Reveal>
              <Caption tone="accent">Business Automation</Caption>
            </Reveal>
            <Reveal delay={0.05}>
              <H1 className="mt-4 max-w-2xl">
                Five categories. One coordinated approach.
              </H1>
            </Reveal>
            <Reveal delay={0.1}>
              <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
                Every service exists to answer one question: where can AI and automation save time
                or create value, and what&apos;s the most direct way to capture it. Explore what each
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
                5
              </span>
              <ServicesNetworkVisual className="relative w-full" />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
