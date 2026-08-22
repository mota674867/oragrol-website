import { Layers, Layers2, Layers3, Target } from "lucide-react";
import { Card, Caption, Container, Grid, H2, Icon, Section, Text, ButtonLink } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Solutions / Packages — Step 4. Pricing, package names and exact
 * inclusions are explicitly UNCONFIRMED (brief section 10) and must not be
 * invented or implied. This section states only what IS confirmed concept
 * ("3 core solution levels", "pentest as specialized add-on", "clear
 * progression of protection and strategic depth") and uses the brief's own
 * sanctioned status language for everything else. No dollar figures, no
 * inclusion lists, no branded names — those all remain OPEN.
 */

const LEVELS = [
  { n: "Level 01", copy: "Foundational protection and visibility.", icon: Layers },
  { n: "Level 02", copy: "Expanded protection with active monitoring.", icon: Layers2 },
  { n: "Level 03", copy: "Full strategic partnership and rapid response.", icon: Layers3 },
];

export function Solutions() {
  return (
    <Section environment="deep-blue">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Solutions</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Three levels of protection, one clear path forward.</H2>
        </Reveal>
        <Reveal delay={0.1}>
          <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
            Services are individual capabilities. Solutions package them into a level of
            protection that matches where your business is today — with penetration testing
            available as a specialized add-on.
          </Text>
        </Reveal>

        <Grid cols={{ base: 1, md: 3 }} gap="md" className="mt-14">
          {LEVELS.map((level, i) => (
            <Reveal key={level.n} delay={0.1 + i * 0.08}>
              <Card variant="bordered" className="flex h-full flex-col gap-4">
                <Icon icon={level.icon} size="md" className="text-text-primary" />
                <h3 className="font-heading text-lg font-semibold text-text-primary">
                  {level.n}
                </h3>
                <Text size="sm" tone="secondary">
                  {level.copy}
                </Text>
              </Card>
            </Reveal>
          ))}
        </Grid>

        <Reveal delay={0.3}>
          <Card variant="surface" className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Icon icon={Target} size="md" className="text-text-primary" />
              <div>
                <h3 className="font-heading text-base font-semibold text-text-primary">
                  Penetration Testing
                </h3>
                <Text size="sm" tone="secondary">
                  Specialized add-on, scoped separately from the core levels.
                </Text>
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.35}>
          <div className="mt-10 border-t border-border pt-8">
            <Text tone="secondary">
              Package names, inclusions and pricing are currently being finalized. Details will
              be available soon.
            </Text>
            <ButtonLink href="/contact" variant="secondary" size="md" className="mt-6">
              Talk to Oragrol
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
