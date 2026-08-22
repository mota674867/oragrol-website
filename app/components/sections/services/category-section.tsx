import { Caption, Container, H2, H3, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { CapabilitySpotlightVisual } from "./capability-spotlight";
import { CategoryNav, type CategoryNavItem } from "./category-nav";
import { ServiceCard } from "./service-card";
import { getCategoryIcon, type RawCategory } from "./services-data";

/**
 * CategorySection / CategoryRow — extracted from `live-services.tsx`
 * (2026-08-20 nav split) so `/services` and the new `/business-automation`
 * page share one row-rendering implementation instead of two copies that
 * can drift. Same visual system as before this extraction — schematic
 * shell, `ServiceCard`s, environment alternation — nothing redesigned,
 * only made reusable.
 *
 * `basePath` and `numeralFor` are the only two things that differ between
 * the two pages: `/services`' 10 categories keep their real 01-10
 * numbering (from the source `code`); `/business-automation`'s 5
 * categories get page-local 01-05 display numbering (real `code`s C11-C15
 * stay the source of truth for slugs/lookups, unaffected — see
 * `services-data.ts`'s `businessAutomationDisplayNumeral`).
 */

function categoryNavItems(categories: RawCategory[], numeralFor: (c: RawCategory, i: number) => string): CategoryNavItem[] {
  return categories.map((c, i) => ({
    id: `category-${c.code.toLowerCase()}`,
    n: numeralFor(c, i),
    label: c.name,
  }));
}

function CategoryRow({
  category,
  index,
  basePath,
  numeral,
}: {
  category: RawCategory;
  index: number;
  basePath: "/services" | "/business-automation";
  numeral: string;
}) {
  const reverse = index % 2 === 1;
  const icon = getCategoryIcon(category.code);

  return (
    <div
      id={`category-${category.code.toLowerCase()}`}
      className="grid scroll-mt-[calc(var(--header-height)+2rem)] gap-8 py-14 md:grid-cols-[0.9fr_1.1fr] md:items-start md:gap-16"
    >
      <div className={reverse ? "md:order-2" : undefined}>
        <div className="mx-auto max-w-md">
          <CapabilitySpotlightVisual n={numeral} icon={icon} />
        </div>
      </div>
      <div className={reverse ? "md:order-1" : undefined}>
        <Caption tone="accent">Category {numeral}</Caption>
        <H3 size="lg" className="mt-2">
          {category.name}
        </H3>
        <Text size="base" tone="secondary" className="mt-4 max-w-xl">
          {category.tagline}
        </Text>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {category.services.map((service) => (
            <ServiceCard key={service.code} service={service} icon={icon} basePath={basePath} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategorySection({
  environment,
  transitionFrom,
  eyebrow,
  heading,
  intro,
  categories,
  basePath,
  numeralFor,
}: {
  environment: "dark" | "deep-blue";
  /** D-069: same reasoning as FinalCta's own — this component is shared
   *  between /services (LiveServices, always dark-after-dark, no
   *  transition needed) and /business-automation (Categories, which comes
   *  right after the deep-blue RecurringPackages and needs one). Optional,
   *  left undefined by default. */
  transitionFrom?: "dark" | "deep-blue";
  eyebrow: string;
  heading: string;
  intro: string;
  categories: RawCategory[];
  basePath: "/services" | "/business-automation";
  numeralFor: (category: RawCategory, index: number) => string;
}) {
  const navItems = categoryNavItems(categories, numeralFor);

  return (
    <Section environment={environment} transitionFrom={transitionFrom}>
      {/* Asymmetric pt/pb — each row below already carries its own py-14
          (top AND bottom), so a uniform section py would stack an extra
          gap on top of the last row's own pb-14 (D-016).

          `size="2xl"` (2026-08-22): this used to be a standalone
          `max-w-[1680px]` div, bypassing `Container` entirely with its
          own undocumented one-off cap — a second, wider ceiling nothing
          else in the site shared, and one that also never grew past
          1680px at 24"+ viewports (part of the wide-viewport dead-space
          bug). Now uses `Container`'s own `2xl` tier (fluid, formalized
          in container.tsx) instead of a bespoke number, so this sidebar+
          grid layout — which genuinely benefits from more room than the
          standard `xl` tier, given the 220px nav rail eating into the
          content column — scales the same fluid way every other page
          does, through the one shared system. */}
      <Container size="2xl" className="pb-8 pt-24 md:pb-12 md:pt-32">
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
                  <CategoryRow category={category} index={i} basePath={basePath} numeral={numeralFor(category, i)} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
