import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { Laptop, Radar, Siren, Target } from "lucide-react";
import { Badge, Caption, Card, Section, Text } from "../../components/ui";
import { CapabilitySpotlightMark } from "../../components/sections/services/capability-spotlight";
import { CapabilityMonitorMark } from "../../components/sections/services/capability-monitor-mark";
import { CapabilityFindingsMark } from "../../components/sections/services/capability-findings-mark";
import { CapabilityFleetMark } from "../../components/sections/services/capability-fleet-mark";

// Same convention as every prior prototype route: noindex, not linked
// from nav, deleted once Mohammad's decision is made.
export const metadata: Metadata = {
  title: "Prototype V6 — Capability 07 shell redesign (internal)",
  robots: { index: false, follow: false },
};

/**
 * /services/prototype-v6 — Round 10, Capability 07 (Endpoint Protection /
 * EDR). See `capability-fleet-mark.tsx` for the full reasoning trail
 * (tool findings -> design decision), stated there per instruction.
 *
 * Same whole-4-card-row comparison approach as `/services/prototype-v4`/
 * `v5` — Capabilities 05 and 06 already reflect their shipped treatments
 * (D-025/D-027) in BOTH rows below; only Capability 07 differs.
 *
 * Content/copy for all 4 cards is mirrored exactly from
 * `additional-capabilities.tsx` — not new text. Does not import from or
 * modify that file; nothing live is touched.
 */

interface FinalizingService {
  n: string;
  name: string;
  copy: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const FINALIZING_SERVICES: FinalizingService[] = [
  {
    n: "05",
    name: "Managed Security Services / 24/7 MDR",
    copy: "Ongoing monitoring and rapid response to catch threats as they happen.",
    icon: Radar,
  },
  {
    n: "06",
    name: "Penetration Testing",
    copy: "Simulated attacks that reveal exactly where you're exposed.",
    icon: Target,
  },
  {
    n: "07",
    name: "Endpoint Protection / EDR",
    copy: "Protection and visibility across every device on your network.",
    icon: Laptop,
  },
  {
    n: "08",
    name: "Incident Response",
    copy: "A clear, practiced plan for when something goes wrong.",
    icon: Siren,
  },
];

function CapabilityGrid({ use07Prototype }: { use07Prototype: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
      {FINALIZING_SERVICES.map((service) => (
        <Card key={service.name} variant="surface" className="flex h-full flex-col gap-3">
          {service.n === "05" && <CapabilityMonitorMark />}
          {service.n === "06" && <CapabilityFindingsMark />}
          {service.n === "07" && use07Prototype && <CapabilityFleetMark />}
          {service.n === "07" && !use07Prototype && (
            <CapabilitySpotlightMark icon={service.icon} className="h-14 w-14" />
          )}
          {service.n === "08" && <CapabilitySpotlightMark icon={service.icon} className="h-14 w-14" />}
          <h3 className="font-heading text-base font-semibold text-text-primary">{service.name}</h3>
          <Text size="sm" tone="secondary">
            {service.copy}
          </Text>
          <Badge className="mt-auto self-start">Capability currently being finalized</Badge>
        </Card>
      ))}
    </div>
  );
}

export default function PrototypeV6Page() {
  return (
    <Section environment="light-blue">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 md:px-12">
        <Caption tone="accent">Internal — not linked from live navigation</Caption>
        <h1 className="mt-4 font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Capability 07 — mark redesign, in context
        </h1>
        <Text size="base" tone="secondary" className="mt-4 max-w-2xl">
          Same 4-card row shown twice — Capabilities 05/06 already reflect their shipped treatments (D-025/D-027)
          in both; only Capability 07 differs. Nothing in <code>additional-capabilities.tsx</code> is touched by
          this route.
        </Text>

        <div className="mt-16 flex flex-col gap-16">
          <div className="border-t border-border pt-10">
            <div className="mb-6 flex flex-wrap items-baseline gap-3">
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-accent">
                Current — live
              </span>
              <Text size="sm" tone="muted">
                Capability 07 still uses `CapabilitySpotlightMark`, shell disapproved for 04-08.
              </Text>
            </div>
            <CapabilityGrid use07Prototype={false} />
          </div>

          <div className="border-t border-border pt-10">
            <div className="mb-6 flex flex-wrap items-baseline gap-3">
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-accent">
                Prototype — Capability 07 only
              </span>
              <Text size="sm" tone="muted">
                `CapabilityFleetMark` (new): a device-coverage pictogram, in place of the orb.
              </Text>
            </div>
            <CapabilityGrid use07Prototype={true} />
          </div>
        </div>
      </div>
    </Section>
  );
}
