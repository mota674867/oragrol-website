import { Card, DataText, Text } from "../../ui";
import { CapabilitySpotlightMark } from "./capability-spotlight";
import type { LucideIconComponent, RawService } from "./services-data";
import { serviceSlug } from "./services-data";

/**
 * ServiceCard — compact per-service card inside a category row (2026-08-20
 * restructure). Reuses `CapabilitySpotlightMark`, the existing small icon-
 * badge treatment `AdditionalCapabilities` already used for its 4 not-yet-
 * live cards — no new visual language introduced. `<h4>`, not `<h3>`: sits
 * nested under the category row's own `H3` (category name), so this is the
 * next real heading level down, not a skip (same convention D-052 fixed
 * on Resources).
 *
 * Price display: `price`/`unit` concatenated directly when `unit` starts
 * with "/" (e.g. "$500" + "/mo" -> "$500/mo"), space-joined otherwise
 * (e.g. "$4,500" + "one-time" -> "$4,500 one-time") — a formatting choice
 * only; both values are the source JSON's own, nothing invented.
 *
 * `basePath` (2026-08-20 nav split): Business Automation's 25 detail pages
 * moved to `/business-automation/[code]`, so this card's link target now
 * depends on which page it's rendered from, not a fixed `/services/`
 * prefix — the caller (`category-section.tsx`) passes the right root.
 */
function formatPrice(price: string, unit: string): string {
  return unit.startsWith("/") ? `${price}${unit}` : `${price} ${unit}`;
}

export function ServiceCard({
  service,
  icon,
  basePath,
}: {
  service: RawService;
  icon: LucideIconComponent;
  basePath: "/services" | "/business-automation";
}) {
  return (
    <Card
      href={`${basePath}/${serviceSlug(service.code)}`}
      variant="surface"
      interactive
      className="flex h-full flex-col gap-3 p-5"
    >
      <CapabilitySpotlightMark icon={icon} className="h-10 w-10" />
      <h4 className="font-heading text-sm font-semibold text-text-primary">{service.name}</h4>
      <Text size="sm" tone="secondary">
        {service.blurb}
      </Text>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <DataText size="sm" tone="accent">
          {formatPrice(service.price, service.unit)}
        </DataText>
        {/* D-068 follow-up: service codes are technical/data content per
            the brief (IBM Plex Sans), not body copy — `Caption` itself is
            font-body (Manrope) by design, so this is a deliberate one-off
            override to font-data rather than a Caption prop. */}
        <span className="font-data text-[10px] font-normal uppercase tracking-[0.22em] text-text-muted">
          {service.code}
        </span>
      </div>
    </Card>
  );
}
