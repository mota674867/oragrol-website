import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Services Hero — Step 5.
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
        <Reveal>
          <Caption tone="accent">Services</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H1 className="mt-4 max-w-2xl">
            Eight capabilities. One coordinated approach.
          </H1>
        </Reveal>
        <Reveal delay={0.1}>
          <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
            Every service exists to answer one question: what does this business actually need
            to protect, and what&apos;s the most direct way to protect it. Explore what each
            capability covers below.
          </Text>
        </Reveal>
      </Container>
    </Section>
  );
}
