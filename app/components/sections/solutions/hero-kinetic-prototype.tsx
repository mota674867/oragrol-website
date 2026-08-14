import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { KineticGrid } from "./kinetic-grid";

/**
 * Prototype-only variant of `SolutionsHero` — D-039. Identical to the
 * live hero except `StrataVisual` is replaced with `KineticGrid` as the
 * background, per Mohammad's explicit instruction to reopen the
 * already-approved D-008 visual as a new, deliberate decision. Copy is
 * copied verbatim from `hero.tsx`, not reworded. Lives only at
 * `/solutions/prototype` — the live `hero.tsx`/`StrataVisual` are
 * untouched.
 */
export function SolutionsHeroKineticPrototype() {
  return (
    <Section environment="dark" className="overflow-hidden">
      <KineticGrid>
        <Container size="lg" className="py-24 md:py-32">
          <Reveal>
            <Caption tone="accent">Solutions</Caption>
          </Reveal>
          <Reveal delay={0.05}>
            <H1 className="mt-4 max-w-2xl">
              Three levels of protection, one clear path forward.
            </H1>
          </Reveal>
          <Reveal delay={0.1}>
            <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
              Services are individual capabilities. Solutions package them into a level of
              protection that matches where your business is today — with penetration testing
              available as a specialized add-on.
            </Text>
          </Reveal>
        </Container>
      </KineticGrid>
    </Section>
  );
}
