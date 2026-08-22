import { Container, H2, Section, type SectionEnvironment, ButtonLink } from "../../ui";
import { OragrolRing } from "../../brand/oragrol-ring";
import { Reveal } from "../../motion/reveal";

/**
 * Final CTA — Step 4. Copy is LOCKED verbatim (brief section 20). "Can
 * subtly reconnect to the ring language" — a single large, low-opacity
 * outline of the ring sits behind the copy; restrained, not a repeat of
 * the Hero's treatment.
 *
 * `transitionFrom` (D-069): this component is shared across 6 different
 * pages (Home, Solutions, Industries, Company, Services, Business
 * Automation), always as the section right before the always-dark
 * `SiteFooter` — but the section immediately BEFORE this one differs per
 * page (on every page except Company, it's already `dark`, so no
 * transition is needed; Company's own `ValuesSection` is `light`). Left
 * optional/undefined by default (no overlay renders) rather than
 * hardcoding one page's needs into a shared component; Company's own page
 * file is the one call site that actually passes it.
 */

export function FinalCta({ transitionFrom }: { transitionFrom?: SectionEnvironment } = {}) {
  return (
    <Section environment="dark" transitionFrom={transitionFrom} className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 opacity-[0.08]"
      >
        <OragrolRing size={480} />
      </div>

      <Container size="lg" className="relative py-24 text-center md:py-32">
        <Reveal>
          <H2 className="mx-auto max-w-2xl">Know where you stand. Know what to do next.</H2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/cyber-health" variant="primary" size="lg">
              Get Your Cyber Health Score
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Talk to Oragrol
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
