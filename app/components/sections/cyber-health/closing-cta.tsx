import { Container, H2, Section, ButtonLink } from "../../ui";
import { OragrolRing } from "../../brand/oragrol-ring";
import { Reveal } from "../../motion/reveal";
import { TALLY_ASSESSMENT_URL } from "./hero";
import { AssessmentCta } from "./assessment-cta";

/**
 * Closing CTA — Step 7. Deliberately NOT the reused FinalCta component:
 * FinalCta's primary button points to /cyber-health, which would be
 * circular on this exact page. Same visual family (ring background
 * accent, centered H2 + two-button layout) for site-wide consistency,
 * but page-specific copy and a primary button that goes to the real
 * assessment instead of back to this page.
 */
export function ClosingCta() {
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
          <H2 className="mx-auto max-w-2xl">
            5-7 minutes to a clear picture of where you stand.
          </H2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {/* D-042: same AssessmentCta as the hero — see that
                component's own comment. */}
            <AssessmentCta href={TALLY_ASSESSMENT_URL} variant="primary" size="lg">
              Get Your Cyber Health Score
            </AssessmentCta>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Talk to Oragrol
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
