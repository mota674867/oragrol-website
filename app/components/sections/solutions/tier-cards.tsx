import { Layers, Layers2, Layers3 } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Badge, Card, Caption, Container, DataText, Grid, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { getSolutionsNote, getTiers, type SolutionTier } from "./solutions-data";

/**
 * Solutions tier cards — 2026-08-20, real content replacing the
 * placeholder "Level 01/02/03" labels (see DECISIONS.md D-003, superseded
 * for Solutions by this pass). Same card shell/accent-bar/icon
 * progression as before — no new visual language, just real data filled
 * in where the old placeholder copy was.
 *
 * `TIER_VISUALS` keyed by real tier name (not array index) so a reorder
 * in the source JSON can't silently mismatch a tier with the wrong
 * icon/bar-width — same Layers/Layers2/Layers3 escalation as before.
 *
 * Included services render as a wrapped row of `Badge` pills (name only —
 * "a compact list is fine, doesn't need full service-card detail," per
 * instruction) rather than a vertical bulleted list: Growth/Enterprise
 * carry 23/26 services each, and a 26-item vertical list would make that
 * card enormously taller than Essential's 7-item one. `Grid`'s
 * `items-start` (not the default stretch-to-tallest) is required once
 * card heights diverge this much — same pattern D-024/D-025 established
 * on Services.
 *
 * Deliberately NOT shown: each tier's `gross_margin_note` — internal
 * cost/margin data, excluded at the data-layer level (see
 * solutions-data.ts), not just hidden here.
 */
const TIER_VISUALS: Record<string, { icon: ComponentType<SVGProps<SVGSVGElement>>; barWidthClass: string; accentOpacity: number }> = {
  Essential: { icon: Layers, barWidthClass: "w-8", accentOpacity: 40 },
  Growth: { icon: Layers2, barWidthClass: "w-14", accentOpacity: 65 },
  Enterprise: { icon: Layers3, barWidthClass: "w-20", accentOpacity: 90 },
};

/** tier-01/02/03 — real anchor ids, unchanged from the placeholder version
 *  (nav-dropdown.tsx's SOLUTIONS_DROPDOWN already links to these). */
function tierId(index: number): string {
  return `tier-0${index + 1}`;
}

function TierCard({ tier, index }: { tier: SolutionTier; index: number }) {
  const visual = TIER_VISUALS[tier.name];

  return (
    <Card id={tierId(index)} variant="bordered" className="flex h-full scroll-mt-[calc(var(--header-height)+2rem)] flex-col gap-4">
      <div
        className={`h-1.5 ${visual.barWidthClass} rounded-full bg-accent`}
        style={{ opacity: visual.accentOpacity / 100 }}
        aria-hidden="true"
      />
      <Icon icon={visual.icon} size="md" className="text-text-primary" />
      <h3 className="font-heading text-lg font-semibold text-text-primary">{tier.name}</h3>
      <Text size="sm" tone="secondary">
        {tier.tagline}
      </Text>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-border pt-4">
        <DataText size="lg" tone="primary">
          {tier.monthly_price}
        </DataText>
      </div>
      <Text size="sm" tone="muted">
        {tier.annual_price} billed annually · {tier.month_to_month_price}
      </Text>

      <div className="mt-2 border-t border-border pt-4">
        <Caption tone="muted" size="sm">
          {tier.service_count} services included
        </Caption>
        <div className="mt-3 flex flex-wrap gap-2">
          {tier.services.map((service) => (
            <Badge key={service.code} tone="neutral">
              {service.name}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function TierCards() {
  const tiers = getTiers();

  return (
    <Section environment="deep-blue" transitionFrom="dark">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">The three levels</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Escalating depth, matched to the business.</H2>
        </Reveal>
        <Reveal delay={0.08}>
          <Text size="sm" tone="muted" className="mt-4 max-w-2xl">
            {getSolutionsNote()}
          </Text>
        </Reveal>

        <Grid cols={{ base: 1, md: 3 }} gap="md" className="mt-14 items-start">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08}>
              <TierCard tier={tier} index={i} />
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
