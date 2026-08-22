import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Caption, DataText, H3, Icon, Text } from "../../ui";
import type { LucideIconComponent, RawCategory, RawService } from "./services-data";
import { serviceSlug } from "./services-data";
import { CisoVantageVisual, ComplianceFrameworkVisual, PolicyStructureVisual, RiskTopologyVisual } from "./c01-visuals";

/**
 * C01Showcase — pilot-only replacement for `ServiceCategoryRow` on
 * exactly one category (C01, "Know & manage your risk" — Services
 * Visual Direction brief). Wired in `live-services.tsx` with a single
 * `category.code === "C01"` branch; every other category (C02-C10, plus
 * Business Automation's 5) keeps rendering through the unmodified
 * `ServiceCategoryRow`/`ServiceCardPremium` — nothing in this file is
 * imported anywhere else, so it cannot affect them.
 *
 * Brief section 6's own explicit pattern, one scene per service, no two
 * alike:
 *  - S01 Risk Check: visual floats right (unframed, per section 10 — not
 *    every visual needs its own rounded box), text left.
 *  - S02 Compliance Ready: mirrored — visual left, text right.
 *  - S03 Policy Guard: large visual in the pilot's one actual rounded
 *    backdrop plate (section 10's "use rounded containers primarily for
 *    major visual blocks"), centered, with text offset to the right
 *    below it rather than centered under it.
 *  - S04 Virtual CISO: the OR ring (section 8 — used exactly once across
 *    the pilot, not as a mascot), text offset to the LEFT below it
 *    (opposite side from S03, so the two centered-visual scenes don't
 *    read as the same layout twice).
 *
 * No absolutely-positioned text ever overlaps a visual here — D-070 (the
 * prior pricing-clipping bug) was a direct lesson in how a clever
 * overlapping-layout shortcut can silently misrender; every asymmetry in
 * this file comes from alignment/offset within normal document flow
 * instead (`ml-auto`/`mr-auto` on a narrower column), not stacking.
 *
 * Preserves everything the brief requires untouched: real service
 * codes/names/blurbs/prices from the same data source every other
 * category uses, the same `/services/[slug]` detail-page link, and the
 * D-069/D-070 background-layering fix (this file adds no Section,
 * environment, or transition props of its own — it renders inside
 * `LiveServices`' existing single `<Section environment="dark">`
 * exactly like every other category row does).
 */

function ServiceMeta({ service }: { service: RawService }) {
  return (
    <>
      <span className="font-data text-xs font-medium uppercase tracking-[0.18em] text-accent">{service.code}</span>
      <H3 className="mt-3">{service.name}</H3>
      <Text tone="secondary" className="mt-3 max-w-md">
        {service.blurb}
      </Text>
      <div className="mt-6 flex items-center gap-3">
        <DataText size="lg" tone="primary">
          {formatPrice(service.price, service.unit)}
        </DataText>
        <Link
          href={`/services/${serviceSlug(service.code)}`}
          className="group inline-flex items-center gap-1.5 rounded-sm font-body text-sm text-text-secondary transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Explore
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </Link>
      </div>
    </>
  );
}

function formatPrice(price: string, unit: string): string {
  return unit.startsWith("/") ? `${price}${unit}` : `${price} ${unit}`;
}

export function C01Showcase({
  category,
  icon,
  numeral,
}: {
  category: RawCategory;
  icon: LucideIconComponent;
  numeral: string;
}) {
  const [s01, s02, s03, s04] = category.services;

  return (
    <div id={`category-${category.code.toLowerCase()}`} className="scroll-mt-[calc(var(--header-height)_+_2rem)] py-14">
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

      <div className="mt-16 flex flex-col gap-24 md:gap-32">
        {/* S01 — visual first in DOM (mobile-first, leads with the object),
            pushed to the right at desktop via lg:order-2. */}
        {s01 && (
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex justify-center lg:order-2 lg:justify-end">
              <RiskTopologyVisual className="w-full max-w-sm" />
            </div>
            <div className="lg:order-1">
              <ServiceMeta service={s01} />
            </div>
          </div>
        )}

        {/* S02 — mirrored: visual stays first/left at every width, no
            order override needed. */}
        {s02 && (
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex justify-center lg:justify-start">
              <ComplianceFrameworkVisual className="w-full max-w-sm" />
            </div>
            <div>
              <ServiceMeta service={s02} />
            </div>
          </div>
        )}

        {/* S03 — the pilot's one actual rounded backdrop plate, centered;
            text offset to the RIGHT beneath it, not centered under it. */}
        {s03 && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-lg rounded-[2rem] border border-border/40 bg-surface/50 p-10 md:p-14">
              <PolicyStructureVisual className="w-full" />
            </div>
            <div className="mt-10 w-full max-w-lg md:ml-auto md:max-w-sm md:text-right">
              <ServiceMeta service={s03} />
            </div>
          </div>
        )}

        {/* S04 — the OR ring, centered and unframed; text offset to the
            LEFT beneath it (opposite side from S03, so these two
            centered-visual scenes don't repeat the same shape). */}
        {s04 && (
          <div className="flex flex-col items-center">
            <CisoVantageVisual className="aspect-[340/300] w-full max-w-md" />
            <div className="mt-10 w-full max-w-lg md:mr-auto md:max-w-sm">
              <ServiceMeta service={s04} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
