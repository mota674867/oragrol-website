import { Caption, H3, Icon, Text } from "../../ui";
import { ServiceCardPremium } from "./service-card-premium";
import type { LucideIconComponent, RawCategory } from "./services-data";

/**
 * ServiceCategoryRow — Services-page-only (structural-scaffolding phase
 * of the Services Visual Redesign brief). Replaces `CategoryRow`
 * (`category-section.tsx`, shared with `/business-automation` — left
 * untouched) for `/services` specifically.
 *
 * Category visual (brief section 10's "visual indicator"): deliberately
 * a plain, minimal icon badge here, NOT the elaborate `CapabilitySpotlightVisual`
 * schematic-diagram-in-a-glowing-panel treatment the old row used — that
 * component's ambient wash defaults to Deep Blue (D-068/D-069's
 * `GlowEffect`), exactly the "page must not look blue" problem this brief
 * exists to fix, and its composition is a glow/hero-style decision the
 * brief says to make from the reference image, not guess at now. This is
 * the placeholder for that pass — clean, on-token, minimal — not the
 * final treatment.
 *
 * Asymmetric grid (brief sections 11/14 — "large featured service,
 * smaller supporting services... not force every service into identical
 * cards"): decided from each category's REAL service count, not a fixed
 * layout. Categories with 3+ services feature the first one at roughly
 * double width; 1-2 service categories stay uniform — forcing asymmetry
 * on a 2-item row has nothing to be asymmetric relative TO and would just
 * look arbitrary. (Real counts checked against the live data before
 * choosing this threshold: categories range from 1 to 5 services.)
 */
export function ServiceCategoryRow({
  category,
  icon,
  basePath,
  numeral,
}: {
  category: RawCategory;
  icon: LucideIconComponent;
  basePath: "/services" | "/business-automation";
  numeral: string;
}) {
  const hasFeatured = category.services.length >= 3;

  return (
    <div id={`category-${category.code.toLowerCase()}`} className="scroll-mt-[calc(var(--header-height)+2rem)] py-14">
      <div className="flex items-start gap-5">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-surface text-text-primary"
        >
          <Icon icon={icon} size="lg" />
        </span>
        <div>
          <Caption tone="accent">Category {numeral}</Caption>
          <H3 size="lg" className="mt-2">
            {category.name}
          </H3>
          <Text size="base" tone="secondary" className="mt-3 max-w-2xl">
            {category.tagline}
          </Text>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.services.map((service, i) => (
          <div key={service.code} className={hasFeatured && i === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}>
            <ServiceCardPremium service={service} icon={icon} basePath={basePath} featured={hasFeatured && i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
