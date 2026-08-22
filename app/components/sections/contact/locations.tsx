import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Badge, Card, Caption, cn, Container, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { LOCATIONS, PENDING, type Location, type LocationField } from "./locations-data";

/**
 * LocationsSection — Step 12. Two labeled locations, deliberately NOT
 * equal-weight: Toronto renders as the larger, primary card (real
 * `Operations` label, own `border-accent`/glow-tint treatment) since
 * that's where clients actually reach Oragrol day to day, per the
 * brief. Thunder Bay renders smaller/secondary, explicitly labeled
 * "Registered Office" so it never reads as the main call-us number.
 *
 * Every Toronto field is `[pending]` in the source content — rendered
 * as a "Coming soon" `Badge` per field (not blank, not invented), so
 * the card still shows its full real structure (Address/Phone/Email/
 * Hours) rather than one vague placeholder line.
 */

interface FieldRow {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: LocationField;
  href?: (value: string) => string;
}

function FieldValue({ value, href }: { value: LocationField; href?: (value: string) => string }) {
  if (value === PENDING) {
    return (
      <Badge tone="neutral" className="normal-case tracking-normal">
        Coming soon
      </Badge>
    );
  }
  if (href) {
    return (
      <a
        href={href(value)}
        className="text-text-primary underline decoration-text-secondary/50 decoration-1 underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
      >
        {value}
      </a>
    );
  }
  return <Text tone="primary">{value}</Text>;
}

function LocationCard({ location }: { location: Location }) {
  const rows: FieldRow[] = [
    { icon: MapPin, label: "Address", value: location.address },
    { icon: Phone, label: "Phone", value: location.phone, href: (v) => `tel:${v.replace(/[^\d+]/g, "")}` },
    { icon: Mail, label: "Email", value: location.email, href: (v) => `mailto:${v}` },
    { icon: Clock, label: "Hours", value: location.hours },
  ];

  return (
    <Card
      className={
        location.primary
          ? "flex flex-col gap-6 border-accent/40 bg-accent/[0.03] p-8 md:p-10"
          : "flex flex-col gap-6 p-8"
      }
    >
      <div>
        <Caption tone={location.primary ? "accent" : "muted"}>{location.tag}</Caption>
        {/* Plain heading, not the shared `H3` component: H3 bakes its own
            font-size into a fixed per-`size`-prop table (see
            typography.tsx's own comment on why weight/size live per-tier,
            never as a post-hoc className override) — this card needs a
            size between H3's two existing tiers, so overriding via
            className would emit two conflicting text-* utilities for the
            same element (the exact plain-cn()-concatenation gotcha this
            codebase's own cn.ts warns about). A plain heading with its
            own complete, non-conflicting class string sidesteps that. */}
        <h3
          className={cn(
            "font-heading font-semibold leading-snug tracking-tight text-text-primary",
            location.primary ? "mt-3 text-2xl md:text-3xl" : "mt-3 text-xl",
          )}
        >
          {location.name}
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <Icon icon={row.icon} size="sm" className="mt-0.5 shrink-0 text-text-primary" />
            <div>
              <Caption size="sm" tone="muted">
                {row.label}
              </Caption>
              <div className="mt-1">
                <FieldValue value={row.value} href={row.href} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function LocationsSection() {
  // Toronto first (visually primary), Thunder Bay second — deliberately
  // not source order, since LOCATIONS lists Toronto first already, but
  // spelled out here so the render order can never silently drift from
  // the "Toronto is primary" requirement if the data array is reordered.
  const toronto = LOCATIONS.find((l) => l.id === "toronto")!;
  const thunderBay = LOCATIONS.find((l) => l.id === "thunder-bay")!;

  return (
    // transitionFrom="light" (D-069): softens the boundary from
    // GeneralInquiry. transitionTo="dark": this is Contact's LAST
    // section before the shared SiteFooter (always dark, rendered from
    // the root layout — it has no way to know this page's own last
    // section, so the blend has to live here instead, on the trailing
    // edge, not on the footer's leading edge).
    <Section environment="deep-blue" transitionFrom="light" transitionTo="dark">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Locations</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Where to find us.</H2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <Reveal delay={0.1}>
            <LocationCard location={toronto} />
          </Reveal>
          <Reveal delay={0.15}>
            <LocationCard location={thunderBay} />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
