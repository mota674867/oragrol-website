import { Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { KineticGrid } from "./kinetic-grid";

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
 *
 * D-039/D-040: the isometric strata visual (`StrataVisual`, D-008) is
 * explicitly, intentionally replaced with `KineticGrid` as the hero's
 * BACKGROUND — approved after review at `/solutions/prototype` (now
 * removed). Content now renders inside/on top of it (matching the
 * sourced component's own children pattern) rather than beside a
 * separate visual block below the text. `StrataVisual`'s own file is
 * left in place, unused — not deleted, in case this is reverted.
 * Existing copy (Caption/H1/Text) is unchanged, verbatim.
 */
export function SolutionsHero() {
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
