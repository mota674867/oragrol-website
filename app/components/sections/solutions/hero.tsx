import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { StrataVisual } from "./strata-visual";

/**
 * Solutions Hero — Step 6.
 *
 * Dark environment, same reasoning as ServicesHero: SiteHeader currently
 * assumes every page opens on a Dark section for nav-text contrast (see
 * its own comment in site-header.tsx) — a proper fix is to make it read
 * the entry section's actual environment, but that's a global change
 * outside this page's scope. Flagged, not silently worked around forever:
 * every future page (Cyber Health, How We Work, Industries, Resources,
 * Company, Contact) will hit this same constraint, so SiteHeader's
 * environment-awareness is worth its own pass soon.
 */
export function SolutionsHero() {
  return (
    <Section environment="dark">
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

        <Reveal delay={0.2}>
          <StrataVisual className="mx-auto mt-16 w-full max-w-2xl" />
        </Reveal>
      </Container>
    </Section>
  );
}
