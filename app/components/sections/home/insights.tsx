import { BrainCircuit, Building2, ScaleIcon, ShieldCheck, Users2 } from "lucide-react";
import { Badge, Caption, Container, Grid, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Insights — Step 4. Brief: editorial, spacious, content-led; topics are
 * confirmed, but no actual articles exist yet (no CMS, no published
 * content — that's the dedicated Resources/Insights page, later phase).
 * Rather than inventing fake headlines/authors/dates, this teases the
 * confirmed topic pillars with an honest "coming soon" status.
 */

const TOPICS = [
  { label: "Cybersecurity", icon: ShieldCheck },
  { label: "AI & Security", icon: BrainCircuit },
  { label: "SMB Security", icon: Building2 },
  { label: "Risk & Compliance", icon: ScaleIcon },
  { label: "Leadership", icon: Users2 },
];

export function Insights() {
  return (
    <Section environment="white">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Insights</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Perspective on security that&rsquo;s actually useful.</H2>
        </Reveal>
        <Reveal delay={0.1}>
          <Text tone="secondary" size="lg" className="mt-6 max-w-xl">
            Our insights library is currently being finalized. Here&rsquo;s where we&rsquo;ll be
            writing.
          </Text>
        </Reveal>

        <Grid cols={{ base: 2, sm: 3, lg: 4 }} gap="md" className="mt-14">
          {TOPICS.map((topic, i) => (
            <Reveal key={topic.label} delay={i * 0.06}>
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6">
                <Icon icon={topic.icon} size="md" className="text-accent" />
                <Text size="sm" className="font-medium">
                  {topic.label}
                </Text>
                <Badge tone="neutral">Coming soon</Badge>
              </div>
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
