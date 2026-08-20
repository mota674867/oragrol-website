import { Caption, H2, H3, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { CapabilitySpotlightVisual } from "./capability-spotlight";
import { CategoryNav, type CategoryNavItem } from "./category-nav";
import { ServiceCard } from "./service-card";
import {
  categoryNumeral,
  getBusinessAutomationTier2,
  getCategoryIcon,
  getServicesTier1,
  type RawCategory,
} from "./services-data";

/**
 * Services — 2026-08-20 full restructure, superseding the D-007/D-012/
 * D-014 8-capability structure (Virtual CISO, Risk Assessment &
 * Compliance, ...) entirely. Source: `oragrol-services-data.json` (15
 * categories / 64 services, 10 cybersecurity + 5 business automation) —
 * see `services-data.ts` for the data layer and DECISIONS.md for the
 * full restructure decision.
 *
 * Same visual system as the structure this replaces, reused verbatim per
 * the explicit "do not introduce new design elements" instruction:
 * `CapabilitySpotlightVisual`/`HeroSchematicVisual` hero-scale schematic
 * shell (D-013/D-014) now renders once per CATEGORY (15 rows, not 64) —
 * `HeroSchematicVisual`'s fixed 3-node diagram was confirmed NOT
 * parametric for arbitrary node counts before this was built (checked
 * directly, not assumed), so it stays exactly as-is as a decorative
 * motif, never asked to represent a literal per-service count. Individual
 * SERVICES render as compact `ServiceCard`s (reusing `CapabilitySpotlightMark`,
 * the same small-badge treatment `AdditionalCapabilities` used for its 4
 * not-yet-live cards) inside each category row, each linking to its own
 * `/services/[code]` detail page.
 *
 * Two top-level sections (white/light-blue alternation — the same
 * environment pairing this page already used to distinguish "live" vs.
 * "finalizing" capabilities, repurposed here for "Services" (Tier 1,
 * cybersecurity) vs. "Business Automation" (Tier 2), per the explicit
 * instruction). `additional-capabilities.tsx` and its 4 bespoke marks are
 * no longer rendered (removed from app/services/page.tsx) — left on disk
 * unreferenced, this project's existing convention for superseded
 * components, not deleted.
 */

function categoryNavItems(categories: RawCategory[]): CategoryNavItem[] {
  return categories.map((c) => ({
    id: `category-${c.code.toLowerCase()}`,
    n: categoryNumeral(c.code),
    label: c.name,
  }));
}

function CategoryRow({ category, index }: { category: RawCategory; index: number }) {
  const reverse = index % 2 === 1;
  const icon = getCategoryIcon(category.code);
  const n = categoryNumeral(category.code);

  return (
    <div
      id={`category-${category.code.toLowerCase()}`}
      className="grid scroll-mt-28 gap-8 py-14 md:grid-cols-[0.9fr_1.1fr] md:items-start md:gap-16"
    >
      <div className={reverse ? "md:order-2" : undefined}>
        <div className="mx-auto max-w-md">
          <CapabilitySpotlightVisual n={n} icon={icon} />
        </div>
      </div>
      <div className={reverse ? "md:order-1" : undefined}>
        <Caption tone="accent">Category {n}</Caption>
        <H3 size="lg" className="mt-2">
          {category.name}
        </H3>
        <Text size="base" tone="secondary" className="mt-4 max-w-xl">
          {category.tagline}
        </Text>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {category.services.map((service) => (
            <ServiceCard key={service.code} service={service} icon={icon} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TierSection({
  environment,
  eyebrow,
  heading,
  intro,
  categories,
}: {
  environment: "white" | "light-blue";
  eyebrow: string;
  heading: string;
  intro: string;
  categories: RawCategory[];
}) {
  const navItems = categoryNavItems(categories);

  return (
    <Section environment={environment}>
      {/* Asymmetric pt/pb — see the original D-016 comment this pattern is
          carried over from: each row below already carries its own
          py-14 (top AND bottom), so a uniform section py would stack an
          extra gap on top of the last row's own pb-14. */}
      <div className="mx-auto w-full max-w-[1680px] px-6 pb-8 pt-24 md:px-12 md:pb-12 md:pt-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr] lg:items-start lg:gap-16">
          <CategoryNav items={navItems} />

          <div>
            <Reveal>
              <Caption tone="accent">{eyebrow}</Caption>
            </Reveal>
            <Reveal delay={0.05}>
              <H2 className="mt-4 max-w-xl">{heading}</H2>
            </Reveal>
            <Reveal delay={0.1}>
              <Text size="base" tone="secondary" className="mt-4 max-w-xl">
                {intro}
              </Text>
            </Reveal>

            <div className="mt-16 flex flex-col divide-y divide-border border-t border-border">
              {categories.map((category, i) => (
                <Reveal key={category.code} delay={i * 0.06}>
                  <CategoryRow category={category} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function LiveServices() {
  const tier1 = getServicesTier1();
  const tier2 = getBusinessAutomationTier2();

  return (
    <>
      <TierSection
        environment="white"
        eyebrow="Cybersecurity"
        heading="Services"
        intro={`${tier1.length} categories covering the full range of cybersecurity work.`}
        categories={tier1}
      />
      <TierSection
        environment="light-blue"
        eyebrow="AI & Automation"
        heading="Business Automation"
        intro={`${tier2.length} categories using AI and automation to save time and grow revenue.`}
        categories={tier2}
      />
    </>
  );
}
