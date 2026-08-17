import { Layers, Layers2, Layers3 } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Card, Caption, Container, H2, Icon, Grid, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Solutions tier cards — Step 6. Deliberately generic level labels only
 * (no branded tier names) — PROJECT_MASTER.md Step 6 is explicit that
 * names/inclusions/pricing are unconfirmed and must not be locked on the
 * live site. Copy reused verbatim from the existing Home teaser
 * (Solutions.tsx) — already-approved, not new.
 *
 * Each card's `barWidth` is a small echo of its plate in StrataVisual
 * (same width/intensity progression, just rendered as a single bar
 * instead of the full multi-plate composition) — ties the cards back to
 * the hero graphic without repeating it.
 */
interface Tier {
  /** Real, stable anchor id — added for the nav dropdown's
   *  `SOLUTIONS_DROPDOWN` (`/solutions#tier-0N`, see nav-dropdown.tsx). No
   *  anchor existed on this page before; purely structural (id +
   *  `scroll-mt-28`, the same header-offset convention Services' capability
   *  rows already use), no visual/content change. */
  id: string;
  n: string;
  copy: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  barWidthClass: string;
  accentOpacity: number;
}

const TIERS: Tier[] = [
  {
    id: "tier-01",
    n: "Level 01",
    copy: "Foundational protection and visibility.",
    icon: Layers,
    barWidthClass: "w-8",
    accentOpacity: 40,
  },
  {
    id: "tier-02",
    n: "Level 02",
    copy: "Expanded protection with active monitoring.",
    icon: Layers2,
    barWidthClass: "w-14",
    accentOpacity: 65,
  },
  {
    id: "tier-03",
    n: "Level 03",
    copy: "Full strategic partnership and rapid response.",
    icon: Layers3,
    barWidthClass: "w-20",
    accentOpacity: 90,
  },
];

export function TierCards() {
  return (
    <Section environment="white">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">The three levels</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Escalating depth, matched to the business.</H2>
        </Reveal>

        <Grid cols={{ base: 1, md: 3 }} gap="md" className="mt-14">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.n} delay={i * 0.08}>
              <Card id={tier.id} variant="bordered" className="flex h-full scroll-mt-28 flex-col gap-4">
                <div
                  className={`h-1.5 ${tier.barWidthClass} rounded-full bg-accent`}
                  style={{ opacity: tier.accentOpacity / 100 }}
                  aria-hidden="true"
                />
                <Icon icon={tier.icon} size="md" className="text-accent" />
                <h3 className="font-heading text-lg font-semibold text-text-primary">{tier.n}</h3>
                <Text size="sm" tone="secondary">
                  {tier.copy}
                </Text>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
