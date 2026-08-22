import type { CSSProperties } from "react";
import { Container, Grid, H2, H3, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { GlowEffect } from "../services/glow-effect";
import { VALUES, VALUES_SUMMARY } from "./values-data";

// Same radial-gradient "material" icon badge as Services' CapabilitySpotlight
// (D-013) — genuine visual reuse of an already-approved premium element,
// not a new invented style. Colors are environment-constant (--color-accent
// family, per tokens.css), so this reads identically on this White section.
const ICON_BADGE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle at 35% 30%, var(--color-accent-light), var(--color-accent) 55%, var(--color-accent-strong) 100%)",
  boxShadow:
    "inset 0 1.5px 0 0 color-mix(in srgb, white 45%, transparent), inset 0 -6px 12px -6px color-mix(in srgb, black 55%, transparent), 0 0 20px 3px color-mix(in srgb, var(--color-accent) 45%, transparent)",
};

/**
 * Values / Differentiators — Company page section 4 of 4. A 3-item
 * icon-led grid (not a fourth stacked text block) plus the one-line
 * summary rendered as a distinct closing statement bar — a nested
 * env-dark elevated panel, the same "dark panel floating on a White
 * section" technique Services' capability rows use (D-013) — so the
 * section has a clear beginning/end instead of running straight into the
 * page footer.
 */
export function ValuesSection() {
  return (
    <Section environment="light" transitionFrom="dark" className="py-24 md:py-32">
      <Container size="xl">
        <Reveal>
          <H2 className="text-center">Our Difference</H2>
        </Reveal>

        <Grid cols={{ base: 1, md: 3 }} gap="lg" className="mt-14">
          {VALUES.map((value, i) => (
            <Reveal key={value.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-surface p-8">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={ICON_BADGE_STYLE}
                >
                  <Icon icon={value.icon} size="md" className="text-white" />
                </span>
                <H3 className="mt-6">{value.title}</H3>
                <Text tone="secondary" className="mt-3">
                  {value.body}
                </Text>
              </div>
            </Reveal>
          ))}
        </Grid>

        <Reveal delay={0.3}>
          <div className="env-dark relative mt-14 overflow-hidden rounded-2xl border border-border bg-background px-8 py-10 text-center">
            <GlowEffect blur="strong" className="opacity-40" />
            <Text size="lg" tone="primary" className="relative mx-auto max-w-3xl">
              {VALUES_SUMMARY}
            </Text>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
