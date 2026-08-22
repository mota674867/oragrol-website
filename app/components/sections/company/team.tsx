import { Users } from "lucide-react";
import { Caption, Container, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Team — Company page section 3 of 4. Deliberately minimal — a single
 * quiet band, not a padded-out grid implying a headcount that doesn't
 * exist yet. Matches both the content brief's own two-sentence brevity
 * and the explicit instruction this section "can be minimal given it's
 * founder-led today." Bordered top/bottom rather than a full-bleed
 * background, so it reads as a brief pause between Mission's manifesto
 * and Values' grid rather than a fourth competing block.
 */
export function TeamSection() {
  return (
    <Section environment="dark" className="border-y border-border py-16 md:py-20">
      <Container size="md">
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-primary"
            >
              <Icon icon={Users} size="md" />
            </span>
            <Caption tone="secondary">Team</Caption>
            <H2 className="max-w-lg">Founder Led, Built to Scale</H2>
            <Text tone="secondary" size="lg" className="max-w-xl">
              Oragrol is founder led today. We work with specialist technology and delivery
              partners where it makes sense, rather than building out a large team before there is
              a real reason to.
            </Text>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
