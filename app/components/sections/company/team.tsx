import { Users } from "lucide-react";
import { Caption, Container, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Team — Company page section 3 of 4. Deliberately minimal — a single
 * quiet band, not a padded-out grid implying a headcount that doesn't
 * exist yet. Matches both the content brief's own two-sentence brevity
 * and the explicit instruction this section "can be minimal given it's
 * founder-led today."
 *
 * Used to be bordered top/bottom (`border-y`) rather than full-bleed, as
 * the "brief pause" device between Mission's manifesto and Values' grid.
 * D-069: both of those boundaries are now real color changes (deep-blue
 * in, light out) softened by the atmospheric-transition system instead —
 * a hard border line at either edge would sit directly on top of the new
 * blend and look like the exact seam it's meant to remove. Values' own
 * `transitionFrom="dark"` handles the Team->Values edge; this section
 * only needs to declare its OWN incoming one.
 */
export function TeamSection() {
  return (
    <Section environment="dark" transitionFrom="deep-blue" className="py-16 md:py-20">
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
