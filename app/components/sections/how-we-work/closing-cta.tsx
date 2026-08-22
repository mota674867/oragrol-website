import { Container, H2, Section, ButtonLink } from "../../ui";
import { OragrolRing } from "../../brand/oragrol-ring";
import { Reveal } from "../../motion/reveal";

/**
 * Closing CTA — Step 8. Copy LOCKED verbatim, supplied by Mohammad: one
 * headline, one button ("Talk to Oragrol") — not the reused `FinalCta`
 * (different headline, two buttons) or Cyber Health's own `ClosingCta`
 * (also two buttons, one pointed at the Tally assessment). Same visual
 * family as both (ring background accent, centered H2, dark environment)
 * for site-wide consistency, single button per the exact copy given.
 */
export function HowWeWorkClosingCta() {
  return (
    <Section environment="dark" transitionFrom="deep-blue" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 opacity-[0.08]"
      >
        <OragrolRing size={480} />
      </div>

      <Container size="lg" className="relative py-24 text-center md:py-32">
        <Reveal>
          <H2 className="mx-auto max-w-2xl">Ready to see exactly where you stand.</H2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/contact" variant="primary" size="lg">
              Talk to Oragrol
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
