import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { HowWeWorkCycleVisual } from "./cycle-visual";

/**
 * How We Work Hero — Step 8. Copy LOCKED verbatim, supplied by Mohammad.
 *
 * Environment deliberately White, not Dark like Services/Solutions/Cyber
 * Health's heroes: `HowWeWorkCycleVisual` (built and approved last round)
 * is itself a nested `env-dark` elevated panel — the same "dark card
 * floating on a lighter page" language Services' capability rows use.
 * Putting that panel inside an already-dark hero would flatten its own
 * contrast/elevation (dark-on-dark); White keeps the panel reading as a
 * genuinely elevated, glow-lit object, consistent with how the exact
 * same visual language already works elsewhere on the site. The visual
 * itself is untouched from last round — only its position (centered
 * placeholder -> hero's second column) changes.
 */
export function HowWeWorkHero() {
  return (
    <Section environment="dark">
      <Container size="lg" className="py-24 md:py-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Reveal>
              <Caption tone="accent">How We Work</Caption>
            </Reveal>
            <Reveal delay={0.05}>
              <H1 className="mt-4 max-w-xl">A clear method, not a black box.</H1>
            </Reveal>
            <Reveal delay={0.1}>
              <Text tone="secondary" size="lg" className="mt-6 max-w-md">
                Security work fails when it stays vague. Here is exactly how we work with you,
                stage by stage, from the first conversation onward.
              </Text>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <HowWeWorkCycleVisual className="mx-auto w-full max-w-lg" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
