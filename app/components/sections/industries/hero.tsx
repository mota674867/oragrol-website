import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Industries Hero — Step 9. Dark environment, same SiteHeader-contrast
 * reasoning as every other page's opening section (see ServicesHero /
 * SolutionsHero / CyberHealthHero comments) — SiteHeader still assumes a
 * Dark entry section site-wide.
 *
 * Single column, no paired hero visual: unlike Services/Solutions/Cyber
 * Health, this page's own signature visual is the interactive
 * sidebar+panel explorer immediately below (D-008's "revealed via
 * in-page interaction/selection" direction), not a separate static
 * hero-scale graphic — adding one here would just compete with it.
 */
export function IndustriesHero() {
  return (
    <Section environment="dark">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Industries</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H1 className="mt-4 max-w-2xl">Different industries, different risk.</H1>
        </Reveal>
        <Reveal delay={0.1}>
          <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
            Cybersecurity isn&rsquo;t one-size-fits-all. Select an industry below to see the risks,
            priorities, and approach that matter most for it.
          </Text>
        </Reveal>
      </Container>
    </Section>
  );
}
