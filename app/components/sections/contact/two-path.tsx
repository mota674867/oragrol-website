import { Mail, PhoneCall } from "lucide-react";
import { ButtonLink, Card, Caption, Container, H3, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { AssessmentCta } from "../cyber-health/assessment-cta";
import { TALLY_ASSESSMENT_URL } from "../cyber-health/hero";
import { LOCATIONS } from "./locations-data";

/**
 * TwoPath — Step 12's core structural requirement: two paths, kept
 * visually and functionally separate, not merged into one generic
 * contact form (explicit instruction). Two `Card`s side by side, each
 * with its own distinct primary action rather than a shared form below
 * both.
 *
 * Path 1 (New to Oragrol) reuses the exact same self-serve funnel CTA
 * used everywhere else on the site (`AssessmentCta` → the real, live
 * Tally assessment) — not a new destination.
 *
 * Path 2 (existing client / urgent) uses Thunder Bay's real phone/email
 * (`LOCATIONS` — the only confirmed contact info; Toronto's is still
 * `[pending]`, see `LocationsSection`). The "Under attack?" emergency
 * framing IS the direct-phone action here, not a separate third
 * destination: the sitewide floating pill (`EmergencyCta`, D-045) now
 * links to this very page, so re-pointing it at itself here would be
 * circular — instead this is where that phrase resolves to a real
 * `tel:` action, with email as the secondary path underneath.
 */

const hq = LOCATIONS.find((l) => l.id === "thunder-bay")!;
const HQ_PHONE = hq.phone as string;
const HQ_PHONE_TEL = `tel:${HQ_PHONE.replace(/[^\d+]/g, "")}`;
const HQ_EMAIL = hq.email as string;

export function TwoPath() {
  return (
    <Section environment="dark">
      <Container size="lg" className="py-24 md:py-32">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Reveal>
            <Card className="flex h-full flex-col gap-6 p-8">
              <div>
                <Caption tone="accent">New to Oragrol</Caption>
                <H3 className="mt-3">Start with your Cyber Health Score.</H3>
                <Text tone="secondary" className="mt-3">
                  A focused, self-serve assessment — the fastest way to see where your business
                  stands and what to prioritize next.
                </Text>
              </div>
              <div className="mt-auto">
                <AssessmentCta href={TALLY_ASSESSMENT_URL} variant="primary" size="lg">
                  Get Your Cyber Health Score
                </AssessmentCta>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.08}>
            <Card className="flex h-full flex-col gap-6 border-accent/30 p-8">
              <div>
                <Caption tone="accent">Existing client / urgent</Caption>
                <H3 className="mt-3">Already working with us?</H3>
                <Text tone="secondary" className="mt-3">
                  Reach us directly — no form, no queue.
                </Text>
              </div>
              <div className="mt-auto flex flex-col gap-4">
                <ButtonLink href={HQ_PHONE_TEL} variant="primary" size="lg" className="w-full sm:w-fit">
                  <Icon icon={PhoneCall} size="sm" />
                  Under attack? Call us now
                </ButtonLink>
                <a
                  href={`mailto:${HQ_EMAIL}`}
                  className="inline-flex w-fit items-center gap-2 font-body text-sm text-text-secondary transition-colors duration-150 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
                >
                  <Icon icon={Mail} size="sm" />
                  Or email {HQ_EMAIL}
                </a>
              </div>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
