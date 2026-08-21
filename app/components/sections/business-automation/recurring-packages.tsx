import { Layers, Layers2, Layers3 } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Badge, ButtonLink, Card, Caption, Container, DataText, Grid, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import {
  getCategoryStoryLine,
  getPricingConfidenceNote,
  getRecurringPackages,
  hasContactUsPricing,
  type RecurringPackage,
  type ScopeLimits,
} from "./packages-data";

/**
 * Recurring packages (Starter / Growth / Scale / Enterprise-Custom) —
 * 2026-08-21, new section. Same tier-card system Solutions' `TierCards`
 * already established (`Card`/`Badge`/`DataText`/`Grid` `items-start`, one
 * icon per tier escalating in visual weight) — no new primitives, just
 * extended to 4 tiers and to a per-tier `scope_limits` block Solutions'
 * tiers don't have.
 *
 * `TIER_VISUALS` keyed by real tier name (not array index), same
 * drift-proofing reason as Solutions' — a reorder in the source JSON can't
 * silently mismatch a tier with the wrong icon. Scale and Enterprise both
 * use `Layers3` (there's no natural 4th "more than Layers3" Lucide icon in
 * this family) — differentiated by bar width/opacity instead of a 4th,
 * unrelated icon shape.
 *
 * Growth is `featured` (per the source data) — highlighted with a "
 * Recommended" badge + accent ring. The ring (`ring-2 ring-accent`, a
 * box-shadow-based property) is used instead of overriding the card's own
 * `border-border` class via `className`, per this component set's own
 * documented caution in `cn.ts` against stacking two classes that target
 * the same CSS property with plain concatenation (no tailwind-merge here).
 *
 * Enterprise/Custom's calculated `monthly_price`/`annual_price` are never
 * rendered — its `display_note` (checked via `hasContactUsPricing`, not a
 * name match) swaps the price block for "Contact us" + a `/contact` CTA,
 * per the source data's own instruction that the calculated figure is for
 * internal reference only.
 */
const TIER_VISUALS: Record<string, { icon: ComponentType<SVGProps<SVGSVGElement>>; barWidthClass: string; accentOpacity: number }> = {
  Starter: { icon: Layers, barWidthClass: "w-8", accentOpacity: 35 },
  Growth: { icon: Layers2, barWidthClass: "w-14", accentOpacity: 60 },
  Scale: { icon: Layers3, barWidthClass: "w-20", accentOpacity: 80 },
  "Enterprise / Custom": { icon: Layers3, barWidthClass: "w-24", accentOpacity: 100 },
};

function ScopeRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <Text size="sm" tone="muted">
        {label}
      </Text>
      <Text size="sm" tone="secondary" className="text-right font-medium">
        {value}
      </Text>
    </div>
  );
}

function ScopeLimitsBlock({ scope }: { scope: ScopeLimits }) {
  return (
    <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-4">
      <Caption tone="muted" size="sm">
        Scope &amp; limits
      </Caption>
      <ScopeRow label="Included users" value={scope.included_users} />
      <ScopeRow label="Active workflows" value={scope.included_active_workflows} />
      <ScopeRow label="Integrations" value={scope.included_integrations} />
      <ScopeRow label="Support" value={scope.support_level} />
      <Text size="sm" tone="muted" className="mt-1 border-t border-border pt-2">
        Overage: {scope.overage_per_workflow} per extra workflow · {scope.overage_per_integration} per extra
        integration
      </Text>
    </div>
  );
}

function TierCard({ tier }: { tier: RecurringPackage }) {
  const visual = TIER_VISUALS[tier.name];
  const contactUs = hasContactUsPricing(tier);

  return (
    <Card
      variant="bordered"
      className={
        tier.featured
          ? "relative flex h-full flex-col gap-4 ring-2 ring-accent"
          : "relative flex h-full flex-col gap-4"
      }
    >
      {tier.featured && (
        <Badge tone="accent" className="absolute -top-3 right-6">
          Recommended
        </Badge>
      )}

      <div
        className={`h-1.5 ${visual.barWidthClass} rounded-full bg-accent`}
        style={{ opacity: visual.accentOpacity / 100 }}
        aria-hidden="true"
      />
      <Icon icon={visual.icon} size="md" className="text-accent" />
      <h3 className="font-heading text-lg font-semibold text-text-primary">{tier.name}</h3>
      <Text size="sm" tone="secondary">
        {tier.tagline}
      </Text>

      {contactUs ? (
        <div className="mt-2 flex flex-col items-start gap-3 border-t border-border pt-4">
          <DataText size="lg" tone="accent">
            Contact us
          </DataText>
          <Text size="sm" tone="muted">
            Custom pricing based on scope.
          </Text>
          <ButtonLink href="/contact" variant="secondary" size="sm">
            Talk to Oragrol
          </ButtonLink>
        </div>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-border pt-4">
            <DataText size="lg" tone="accent">
              {tier.monthly_price}
            </DataText>
          </div>
          <Text size="sm" tone="muted">
            {tier.annual_price} billed annually · {tier.month_to_month_price} month-to-month
          </Text>
        </>
      )}

      <div className="mt-2 border-t border-border pt-4">
        <Caption tone="muted" size="sm">
          {tier.services.length} services included
        </Caption>
        <div className="mt-3 flex flex-wrap gap-2">
          {tier.services.map((service) => (
            <Badge key={service.code} tone="neutral">
              {service.name}
            </Badge>
          ))}
        </div>
      </div>

      <ScopeLimitsBlock scope={tier.scope_limits} />
    </Card>
  );
}

export function RecurringPackages() {
  const packages = getRecurringPackages();

  return (
    <Section environment="white" className="border-t border-border">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Recurring packages</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">One package, five layers of automation.</H2>
        </Reveal>
        <Reveal delay={0.08}>
          <Text size="sm" tone="secondary" className="mt-4 max-w-2xl">
            Every package draws from Oragrol&apos;s five automation categories: {getCategoryStoryLine()}.
          </Text>
        </Reveal>

        <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="md" className="mt-14 items-start">
          {packages.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.06}>
              <TierCard tier={tier} />
            </Reveal>
          ))}
        </Grid>

        <Reveal delay={0.2}>
          <Text size="sm" tone="muted" className="mt-14 max-w-2xl border-t border-border pt-6">
            {getPricingConfidenceNote()}
          </Text>
        </Reveal>
      </Container>
    </Section>
  );
}
