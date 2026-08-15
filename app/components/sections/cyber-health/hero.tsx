import { ButtonLink, Caption, Container, H1, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { HeroAmbientLoader } from "./hero-ambient-loader";
import { AssessmentCta } from "./assessment-cta";

/** The real, live assessment — confirmed by Mohammad, currently receiving
 * real submissions. Every "Get Your Cyber Health Score" CTA on this page
 * points here directly (new tab, so the marketing page stays intact
 * behind it) rather than an embed — no way to confirm this specific form
 * permits iframing, and linking to the exact page that's already proven
 * to work is the lower-risk choice for a live, real-submissions form. */
export const TALLY_ASSESSMENT_URL = "https://tally.so/r/2EzROb";

/**
 * Cyber Health Hero — Step 7. Dark environment, same SiteHeader-contrast
 * reasoning as every other page's hero so far (see ServicesHero /
 * SolutionsHero comments).
 */
export function CyberHealthHero() {
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
                {/* D-042: AssessmentCta wraps the same real target="_blank"
                    link with a brief on-page loading transition — see
                    that component's own comment for why this isn't a
                    JS-triggered window.open() (popup-blocker risk on a
                    real, live lead-generation path). */}
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
            {/* D-043: GaugeVisual (static instrument-panel gauge, D-008)
                replaced with HeroAmbientLoader — a persistent, ambient
                animated visual built on AiLoader's RotatingRing/FadeText
                (D-042), reused rather than duplicated. Not a one-time
                loading state: runs for the visitor's entire time on the
                page, respects reduced-motion, pauses via IntersectionObserver
                when scrolled out of view. See DECISIONS.md D-043. */}
            <HeroAmbientLoader className="mx-auto w-full max-w-md" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
