import { ButtonLink, Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { HeroAmbientLoader } from "./hero-ambient-loader";
import { TALLY_ASSESSMENT_URL } from "./hero";
import { AssessmentCta } from "./assessment-cta";

/**
 * CyberHealthHeroAmbientPrototype — prototype-only hero (D-043), shown
 * at `/cyber-health/prototype-hero` alongside the current live hero for
 * side-by-side comparison. Identical copy/CTAs to the live `CyberHealthHero`
 * in `hero.tsx` — the only difference is `GaugeVisual` replaced with
 * `HeroAmbientLoader`. `hero.tsx` itself is untouched until this is
 * approved, same prototype lifecycle as every prior visual change this
 * project (Kinetic Grid D-039/D-040, AiLoader D-041/D-042).
 */
export function CyberHealthHeroAmbientPrototype() {
  return (
    <Section environment="dark">
      <Container size="lg" className="py-24 md:py-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Reveal>
              <Caption tone="accent">Cyber Health</Caption>
            </Reveal>
            <Reveal delay={0.05}>
              <H1 className="mt-4 max-w-xl">Know your Cyber Health Score in minutes.</H1>
            </Reveal>
            <Reveal delay={0.1}>
              <Text tone="secondary" size="lg" className="mt-6 max-w-md">
                A focused set of questions. A clear score. A practical plan for what to do next —
                Oragrol&rsquo;s flagship diagnostic, built to feel like a premium security tool,
                not a generic form.
              </Text>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <AssessmentCta href={TALLY_ASSESSMENT_URL} variant="primary" size="lg">
                  Get Your Cyber Health Score
                </AssessmentCta>
                <ButtonLink href="/contact" variant="secondary" size="lg">
                  Talk to Oragrol
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <HeroAmbientLoader className="mx-auto w-full max-w-md" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
