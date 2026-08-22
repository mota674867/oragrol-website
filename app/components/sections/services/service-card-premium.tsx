import { ArrowUpRight } from "lucide-react";
import { Card, DataText, Icon, Text } from "../../ui";
import type { LucideIconComponent, RawService } from "./services-data";
import { serviceSlug } from "./services-data";

/**
 * ServiceCardPremium — Services-page-only redesign (Services Visual
 * Redesign brief, structural-scaffolding phase). Deliberately a NEW,
 * separate component, not an edit to the shared `ServiceCard`
 * (`service-card.tsx`): that component is still used by
 * `/business-automation` via `CategorySection`, and this brief is
 * explicit — Services page only, every other page (Business Automation
 * included) untouched. `ServiceCard`/`CategorySection`/
 * `CapabilitySpotlightMark` are left completely alone; this file and
 * `service-category-row.tsx` are the fork that replaces them for
 * `/services` specifically (wired in `live-services.tsx`).
 *
 * Card anatomy, per the brief's own spec (section 12), each piece on its
 * own semantic token — no new colors invented, this is composition/
 * hierarchy work, not a palette change:
 *  - code label: IBM Plex Sans (font-data), Burnt Orange (text-accent)
 *  - icon: neutral Warm Off-White by default, Burnt Orange on hover —
 *    the existing shared `Icon` primitive already inherits `currentColor`
 *    (see icon-wrapper.tsx), so a plain `group-hover:text-accent` on the
 *    icon's own wrapper is enough; no new icon component needed.
 *  - title: Space Grotesk 600 (font-heading), Warm Off-White
 *  - description: Manrope 400 (font-body), Steel Gray
 *  - interaction indicator: a small arrow, Burnt Orange, that shifts on
 *    hover — restrained, not a decorative flourish
 *
 * Card surface: Violet-Gray (`bg-surface`, already what `--surface`
 * resolves to in `env-dark`) with a low-opacity Steel Gray border
 * (`border-border/40`) — replaces the flat, harder-bordered original.
 *
 * Hover (brief section 13): subtle lift (`-translate-y-0.5`), a
 * restrained ambient orange glow via a plain low-opacity box-shadow (NOT
 * the shared `GlowEffect` component, which defaults to a Deep-Blue wash
 * per D-068/D-069 — exactly the "page must not look blue" problem this
 * brief is correcting), and the border/icon/arrow shifting toward accent.
 * No scale, no bounce, `duration-200` only.
 *
 * `featured`: when true, the card reads larger — bigger icon, bigger
 * title, wider description column, bigger price — and (via
 * `service-category-row.tsx`'s own grid classes, not this file) spans
 * more grid columns. Padding stays the same as every other card (D-070 —
 * see the className comment below for why an earlier version that also
 * bumped padding on `featured` cards was removed, not just fixed) — used
 * by `service-category-row.tsx` for the one asymmetric "large featured
 * service" per category (brief sections 11/14), decided there from real
 * per-category service counts, not hardcoded here.
 */
export function ServiceCardPremium({
  service,
  icon,
  basePath,
  featured = false,
}: {
  service: RawService;
  icon: LucideIconComponent;
  basePath: "/services" | "/business-automation";
  featured?: boolean;
}) {
  return (
    <Card
      href={`${basePath}/${serviceSlug(service.code)}`}
      variant="surface"
      // Not using Card's own `interactive` flag: it adds a
      // `hover:border-text-secondary` rule that would sit alongside this
      // card's own `hover:border-accent/30` on the same property — cn()
      // is plain concatenation (see cn.ts's own documented caveat), so
      // two classes for the same property don't reliably resolve in
      // string order. Building the interactive treatment directly here
      // instead keeps exactly one hover:border rule.
      //
      // D-070 fix: this used to fight Card's own base `p-6` with an
      // inner `-m-6 h-[calc(100%+3rem)]` wrapper so `featured` cards
      // could get more padding — that arbitrary-value string was missing
      // Tailwind's required underscore-escaped spaces around `+`
      // (`calc(100%_+_3rem)`), so the browser never applied a valid
      // height to it. The wrapper's height silently fell back to its
      // natural content height while `-m-6` still pulled its box 24px
      // outside Card's own edges on every side, misaligning it against
      // Card's actual (unrelated, correctly-sized) box and spilling its
      // content into the row below — the "dark shape covering the price
      // text" damage. Root-caused and removed the whole margin/height
      // workaround rather than fixing the escaping: `featured` now gets
      // its extra visual weight entirely from content (2-col grid span,
      // larger icon/title/price) instead of extra padding, so this
      // layout classes sit directly on Card's own className — same `p-6`
      // Card's base already declares (identical value, so even that
      // isn't a real conflict) — with no second wrapper element, no
      // margin cancellation, nothing that can misalign from Card's own
      // box again.
      className="group relative flex h-full flex-col justify-between gap-6 rounded-2xl border border-border/40 p-6 transition-[transform,box-shadow,border-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_16px_40px_-20px_var(--color-accent)]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <span className="font-data text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {service.code}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center text-text-primary transition-colors duration-200 group-hover:text-accent">
            <Icon icon={icon} size={featured ? "lg" : "md"} />
          </span>
        </div>

        <div>
          <h4
            className={`font-heading font-semibold leading-snug text-text-primary ${
              featured ? "text-2xl" : "text-lg"
            }`}
          >
            {service.name}
          </h4>
          <Text size="sm" tone="secondary" className={featured ? "mt-3 max-w-md" : "mt-2"}>
            {service.blurb}
          </Text>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-border/40 pt-4">
        <DataText size={featured ? "lg" : "sm"} tone="primary">
          {formatPrice(service.price, service.unit)}
        </DataText>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-text-muted transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
    </Card>
  );
}

// Same formatting rule as the original ServiceCard — both values are the
// source JSON's own, nothing invented.
function formatPrice(price: string, unit: string): string {
  return unit.startsWith("/") ? `${price}${unit}` : `${price} ${unit}`;
}
