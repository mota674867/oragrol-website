import { Container, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { GlowEffect } from "../services/glow-effect";

/**
 * Company Mission / Story — Company page section 2 of 4. Light-blue
 * environment — distinct from Founder Bio's Dark two-column photo layout,
 * a single-column manifesto treatment instead: the two-sentence opening
 * ("Oragrol was built on a simple idea...") set at display scale as the
 * section's dominant visual (a natural pull-line already — it's given as
 * its own two short sentences in the source, not reworded, just enlarged
 * typographically), the explanatory paragraph in standard body copy
 * below, and the closing trajectory line set apart in accent color.
 *
 * A plain <h2> (not the shared H2 component) carries the display line —
 * H2 has no `size` variant to opt into a larger scale the way H1/H3/
 * Caption do, and overriding its size via className would emit two
 * conflicting text-* utilities at once (this project's own documented
 * cn() gotcha — see typography.tsx's H3/Caption comments and DECISIONS.md
 * D-018, which hit the identical issue and used the same plain-tag fix).
 *
 * A soft ambient glow behind the statement reaches for D-008's original
 * "architectural / light-study abstraction" motif for Company — Founder
 * Bio's premium visual is the real photo; this section has none of its
 * own, so a quiet light-study treatment fills that role here instead.
 */
export function MissionStory() {
  return (
    <Section environment="deep-blue" transitionFrom="dark" className="relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/3 opacity-30"
      >
        <GlowEffect blur="strongest" />
      </div>

      <Container size="md" className="relative text-center">
        <Reveal>
          <p className="font-body text-xs font-medium uppercase tracking-widest text-text-secondary">
            Why Oragrol Exists
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mx-auto mt-6 max-w-2xl font-heading text-4xl font-semibold leading-tight tracking-tight text-text-primary md:text-5xl">
            Oragrol was built on a simple idea. Security should help a business move forward, not
            slow it down.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Text size="lg" tone="secondary" className="mx-auto mt-8 max-w-xl">
            Many growing companies know they need stronger security. Few have the internal team or
            specialist expertise to build it themselves. Oragrol exists to close that gap. We start
            by understanding the business, then find the risks that actually matter, then give a
            clear and practical path to fixing them.
          </Text>
        </Reveal>
        <Reveal delay={0.15}>
          <Text tone="accent" className="mt-10 font-medium">
            We are starting in Canada and expanding across North America from here.
          </Text>
        </Reveal>
      </Container>
    </Section>
  );
}
