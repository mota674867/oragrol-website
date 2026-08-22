import { Caption, Container, DataText, H2, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { GlowEffect } from "./glow-effect";
import { getServicesTier1 } from "./services-data";

/**
 * ServicesOverview — Services Landing Page brief (Level 1, panel 2 of 2).
 * Second large panel, mirrored asymmetry from the hero (stat visual on
 * the left this time, copy on the right) — gives the landing genuine
 * multi-panel editorial rhythm instead of "hero, then straight into the
 * catalogue," per the brief's explicit "do not make this hero-only."
 *
 * Content: the exact eyebrow/heading/intro copy `LiveServices` already
 * carried at the top of its own body before this pass (see git history)
 * — moved up into its own panel, not rewritten, plus the real category/
 * service counts (already computed from the same data source every
 * category row uses) presented as a big-number statement — the same
 * "large real figure, not a sentence" treatment already established
 * elsewhere on the site (e.g. the Cyber Health Score), not a new pattern.
 *
 * `LiveServices` itself no longer renders this intro block — its own
 * body now starts directly at the category-nav/row list (Level 2),
 * completely unchanged otherwise.
 */
export function ServicesOverview() {
  const tier1 = getServicesTier1();
  const totalServices = tier1.reduce((sum, category) => sum + category.services.length, 0);

  return (
    <Section environment="dark">
      <Container size="2xl" className="py-8 md:py-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-surface/40 p-8 md:rounded-[2.5rem] md:p-14 lg:p-20">
          <GlowEffect
            blur="strongest"
            className="opacity-[0.15]"
            colors={["var(--color-accent-light)", "var(--color-accent)", "var(--color-accent-strong)"]}
          />
          <div className="relative grid grid-cols-1 items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <div className="flex items-center justify-center gap-10 lg:justify-start lg:gap-14">
                <div>
                  <DataText size="xl" tone="accent">
                    {tier1.length}
                  </DataText>
                  <Text size="sm" tone="secondary" className="mt-2">
                    Categories
                  </Text>
                </div>
                <div className="h-16 w-px bg-border" aria-hidden="true" />
                <div>
                  <DataText size="xl" tone="accent">
                    {totalServices}
                  </DataText>
                  <Text size="sm" tone="secondary" className="mt-2">
                    Services
                  </Text>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal delay={0.05}>
                <Caption tone="accent">Cybersecurity</Caption>
              </Reveal>
              <Reveal delay={0.1}>
                <H2 className="mt-4 max-w-xl">Services</H2>
              </Reveal>
              <Reveal delay={0.15}>
                <Text size="base" tone="secondary" className="mt-4 max-w-lg">
                  {tier1.length} categories covering the full range of cybersecurity work — explore
                  what each one covers below.
                </Text>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
