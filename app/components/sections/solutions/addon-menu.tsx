import { Plus } from "lucide-react";
import { Card, Caption, Container, DataText, Grid, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { getAddonMenu, type AddonService } from "./solutions-data";

/**
 * Available add-ons — 2026-08-20, new section. 12 real specialist services
 * (`addon_menu` in the source data), separate from the 3 core subscription
 * tiers, per instruction. Same visual system as the rest of this page —
 * `Card`/`Grid`/`DataText`/`Caption` — no new primitives.
 *
 * Icon: a plain circled `Plus`, reusing the "+" concept `PentestAddon`
 * already established on this page for "this sits outside the core
 * tiers," rather than picking 12 new one-off Lucide icons per service
 * (would be 12 new content/design choices, not a reuse of anything
 * already here). Deliberately simpler than PentestAddon's own icon
 * (which pairs a meaningful base icon — Target — with a Plus badge): with
 * 12 different services here, there's no single meaningful base icon that
 * would apply to all of them, so just the Plus signal is used, uniformly.
 */
function formatPrice(price: string, unit: string): string {
  return unit.startsWith("/") ? `${price}${unit}` : `${price} ${unit}`;
}

function AddonCard({ addon }: { addon: AddonService }) {
  return (
    <Card variant="bordered" className="flex h-full flex-col gap-3">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10"
      >
        <Icon icon={Plus} size="sm" className="text-accent" />
      </span>
      <h3 className="font-heading text-base font-semibold text-text-primary">{addon.name}</h3>
      <Text size="sm" tone="secondary">
        {addon.blurb}
      </Text>
      <DataText size="sm" tone="accent" className="mt-1">
        {formatPrice(addon.price, addon.unit)}
      </DataText>
      <Text size="sm" tone="muted" className="mt-auto border-t border-border pt-3">
        {addon.reason}
      </Text>
    </Card>
  );
}

export function AddonMenu() {
  const { description, services } = getAddonMenu();

  return (
    <Section environment="white" className="border-t border-border">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Available add-ons</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Layer on what your business specifically needs.</H2>
        </Reveal>
        <Reveal delay={0.08}>
          <Text size="sm" tone="secondary" className="mt-4 max-w-2xl">
            {description}
          </Text>
        </Reveal>

        {/* xl:6 (2026-08-22): 12 add-ons total — `lg:4` (3 rows) held flat
            all the way to 2560px+, leaving cards oversized instead of
            denser. 12 divides evenly into 6, so widescreens get 2 rows
            of 6 instead of 3 rows of 4. */}
        <Grid cols={{ base: 1, sm: 2, lg: 4, xl: 6 }} gap="md" className="mt-14 items-start">
          {services.map((addon, i) => (
            <Reveal key={addon.code} delay={i * 0.03}>
              <AddonCard addon={addon} />
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
