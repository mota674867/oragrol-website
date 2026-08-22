import { CheckCircle2, MessageCircle, Scale, Users } from "lucide-react";
import { Caption, Container, Grid, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Trust / Evidence — Step 4. Brief: "credible proof, evidence and trust
 * signals without inventing claims, statistics, certifications, customer
 * logos or partner details." With none of the usual social-proof elements
 * available yet, this deliberately builds trust from process/philosophy —
 * how Oragrol operates — rather than external validation that doesn't
 * exist yet. No testimonials, logos, or certification badges are rendered;
 * flagged in the Step 4 report as intentionally deferred, not missed.
 */

const PILLARS = [
  {
    title: "Clear, honest communication",
    copy: "No jargon, no fear-based sales tactics — just a clear picture of where you stand.",
    icon: MessageCircle,
  },
  {
    title: "Practical over theoretical",
    copy: "Recommendations you can actually act on, prioritized by what matters most.",
    icon: CheckCircle2,
  },
  {
    title: "A methodology, not a one-off report",
    copy: "Every engagement follows the same Understand → Prioritize → Protect → Improve approach.",
    icon: Scale,
  },
  {
    title: "Built for how SMBs actually operate",
    copy: "Security guidance sized and paced for real teams and real budgets.",
    icon: Users,
  },
];

export function Trust() {
  return (
    <Section environment="dark">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Why Businesses Work With Oragrol</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Straightforward security, without the scare tactics.</H2>
        </Reveal>

        <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="lg" className="mt-16">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <div className="flex flex-col gap-3">
                <Icon icon={pillar.icon} size="md" className="text-text-primary" />
                <h3 className="font-heading text-base font-semibold text-text-primary">
                  {pillar.title}
                </h3>
                <Text size="sm" tone="secondary">
                  {pillar.copy}
                </Text>
              </div>
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
