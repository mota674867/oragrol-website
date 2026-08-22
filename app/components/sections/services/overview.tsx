import { Caption, Container, DataText, H2, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { getServicesTier1 } from "./services-data";

/**
 * ServicesOverview — Services Landing Page, visual-correction pass (2026-08-22
 * follow-up to D-072). D-072's version repeated the hero's exact rounded
 * `bg-surface/40` + full-panel `GlowEffect` treatment — the "same large
 * colored card twice in a row" the brief calls out by name. This pass drops
 * the panel entirely: no border, no fill, no glow. The section is plain
 * dark ground (inherits `Section`'s own `environment="dark"` background),
 * distinguished from the hero purely by a different compositional rhythm —
 * a thin top rule (the only line on the page here) instead of a card
 * boundary, and a tighter, more asymmetric grid — so consecutive sections
 * read as distinct editorial beats rather than the same block repeated.
 *
 * Content unchanged from D-072: the exact eyebrow/heading/intro copy
 * `live-services.tsx` used to render at its own top (relocated there, not
 * rewritten), plus the real category/service counts (already computed from
 * the same data source every category row uses) as a big-number statement
 * — the same "large real figure, not a sentence" treatment already
 * established elsewhere on the site (Cyber Health Score), not a new
 * pattern. `LiveServices` itself still doesn't render this intro block.
 */
export function ServicesOverview() {
  const tier1 = getServicesTier1();
  const totalServices = tier1.reduce((sum, category) => sum + category.services.length, 0);

  return (
    <Section environment="dark">
      <Container size="2xl" className="border-t border-border/15 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-16">
          <div>
            <Reveal delay={0.05}>
              <Caption tone="accent">Cybersecurity</Caption>
            </Reveal>
            <Reveal delay={0.1}>
              <H2 className="mt-4 max-w-md">Services</H2>
            </Reveal>
            <Reveal delay={0.15}>
              <Text size="base" tone="secondary" className="mt-4 max-w-md">
                {tier1.length} categories covering the full range of cybersecurity work — explore
                what each one covers below.
              </Text>
            </Reveal>
          </div>

          <Reveal>
            <div className="flex items-end gap-10 lg:justify-end lg:gap-16">
              <div>
                <DataText size="xl" tone="accent">
                  {tier1.length}
                </DataText>
                <Text size="sm" tone="secondary" className="mt-2">
                  Categories
                </Text>
              </div>
              <div className="h-16 w-px bg-border/40" aria-hidden="true" />
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
        </div>
      </Container>
    </Section>
  );
}
