import { Container, H2, Section, ButtonLink } from "../../ui";
import { OragrolRing } from "../../brand/oragrol-ring";
import { Reveal } from "../../motion/reveal";

/**
 * Final CTA — Step 4. Copy is LOCKED verbatim (brief section 20). "Can
 * subtly reconnect to the ring language" — a single large, low-opacity
 * outline of the ring sits behind the copy; restrained, not a repeat of
 * the Hero's treatment.
 */

export function FinalCta() {
  return (
    <Section environment="dark" className="relative overflow-hidden">
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
