import { Compass, Hammer } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Badge, Card, Caption, Container, DataText, Grid, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { getFunnel, getOneTimeOffers, type OneTimeOffer } from "./packages-data";

/**
 * Project offers (Assessment + Implementation) — 2026-08-21, new section.
 * One-time/project offers, structurally different from the recurring
 * packages below (`RecurringPackages`): a single price, no cadence, no
 * `scope_limits`. Kept visually separate per instruction via its own
 * dashed-border "satellite" card treatment (same language `PentestAddon`
 * established on Solutions for "structurally outside the core tiers") and
 * an explicit "Step 1"/"Step 2" label reflecting the real funnel order
 * (`Assessment → Implementation → Recurring Package → Expansion`) — not a
 * generic 2-up grid that would read the same as the recurring tiers.
 *
 * `id="packages"` is the nav-dropdown's anchor target (this is the first
 * of the two new packages sections on the page).
 */
const OFFER_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Assessment: Compass,
  Implementation: Hammer,
};

function OfferCard({ offer, step }: { offer: OneTimeOffer; step: number }) {
  const icon = OFFER_ICONS[offer.name] ?? Compass;

  return (
    <Card
      variant="surface"
      className="flex h-full flex-col gap-4 rounded-2xl border border-dashed border-border bg-surface p-8"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10"
        >
          <Icon icon={icon} size="sm" className="text-accent" />
        </span>
        <Caption tone="accent">
          Step {step} · {offer.type}
        </Caption>
      </div>

      <h3 className="font-heading text-xl font-semibold text-text-primary">{offer.name}</h3>
      <Text size="sm" tone="secondary">
        {offer.tagline}
      </Text>

      <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-4">
        {offer.services.map((service) => (
          <Badge key={service.code} tone="neutral">
            {service.name}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-border pt-4">
        <DataText size="lg" tone="accent">
          {offer.price}
        </DataText>
        <Text size="sm" tone="muted">
          {offer.type}
        </Text>
      </div>
      {offer.note && (
        <Text size="sm" tone="muted">
          {offer.note}
        </Text>
      )}
    </Card>
  );
}

export function ProjectOffers() {
  const offers = getOneTimeOffers();

  return (
    <Section environment="white">
      <Container id="packages" size="lg" className="scroll-mt-[calc(var(--header-height)+2rem)] py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">How it starts</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">From a one-time engagement to an ongoing package.</H2>
        </Reveal>
        <Reveal delay={0.08}>
          <Text size="sm" tone="muted" className="mt-4 max-w-2xl">
            {getFunnel()}
          </Text>
        </Reveal>

        <Grid cols={{ base: 1, md: 2 }} gap="md" className="mt-14 items-start">
          {offers.map((offer, i) => (
            <Reveal key={offer.name} delay={i * 0.08}>
              <OfferCard offer={offer} step={i + 1} />
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
