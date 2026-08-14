import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { Laptop, Radar, Siren, Target } from "lucide-react";
import { Badge, Caption, Card, Section, Text } from "../../components/ui";
import { CapabilitySpotlightMark } from "../../components/sections/services/capability-spotlight";
import { CapabilityMonitorMark } from "../../components/sections/services/capability-monitor-mark";

// Same convention as every prior prototype route (D-013/D-021/D-022):
// noindex, not linked from nav, deleted once Mohammad's decision is made.
export const metadata: Metadata = {
  title: "Prototype V4 — Capability 05 shell redesign (internal)",
  robots: { index: false, follow: false },
};

/**
 * /services/prototype-v4 — Round 8, Capability 05 (Managed Security
 * Services / 24/7 MDR). See `capability-monitor-mark.tsx` for the full
 * reasoning trail (tool findings -> design decision), stated there per
 * instruction.
 *
 * Unlike Capabilities 01-04 (each its own full LiveServices row),
 * Capabilities 05-08 share ONE 4-column card grid in
 * `additional-capabilities.tsx`. A stacked two-variant comparison (like
 * `/services/prototype-v2`/`v3`) wouldn't show the real question here —
 * whether the new mark looks right sitting next to its still-unconverted
 * siblings — so this shows the WHOLE 4-card row twice instead: once
 * exactly as shipped today, once with only Capability 05 swapped.
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

function CapabilityGrid({ use05Prototype, itemsStart }: { use05Prototype: boolean; itemsStart: boolean }) {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${itemsStart ? "lg:items-start" : ""}`}>
      {FINALIZING_SERVICES.map((service) => (
        <Card key={service.name} variant="surface" className="flex h-full flex-col gap-3">
          {service.n === "05" && use05Prototype ? (
            <CapabilityMonitorMark />
          ) : (
            <CapabilitySpotlightMark icon={service.icon} className="h-14 w-14" />
          )}
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

export default function PrototypeV4Page() {
  return (
    <Section environment="light-blue">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 md:px-12">
        <Caption tone="accent">Internal — not linked from live navigation</Caption>
        <h1 className="mt-4 font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Capability 05 — mark redesign, in context
        </h1>
        <Text size="base" tone="secondary" className="mt-4 max-w-2xl">
          Same 4-card row shown twice — once as shipped today, once with only Capability 05&rsquo;s mark swapped —
          so the comparison includes its still-unconverted siblings (06-08), not just the one card in isolation.
          Nothing in <code>additional-capabilities.tsx</code> is touched by this route.
        </Text>

        <div className="mt-16 flex flex-col gap-16">
          <div className="border-t border-border pt-10">
            <div className="mb-6 flex flex-wrap items-baseline gap-3">
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-accent">
                Current — live
              </span>
              <Text size="sm" tone="muted">
                All 4 cards use `CapabilitySpotlightMark` (D-013/D-014), shell disapproved for 05-08.
              </Text>
            </div>
            <CapabilityGrid use05Prototype={false} itemsStart={false} />
          </div>

          <div className="border-t border-border pt-10">
            <div className="mb-6 flex flex-wrap items-baseline gap-3">
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-accent">
                Prototype — Capability 05 only
              </span>
              <Text size="sm" tone="muted">
                `CapabilityMonitorMark` (new): live-pulse indicator + illustrative alert feed, in place of the orb.
              </Text>
            </div>
            <CapabilityGrid use05Prototype={true} itemsStart={true} />
            <Text size="sm" tone="muted" className="mt-6">
              Note: this grid uses `items-start` instead of the live grid&rsquo;s default stretch behavior — the new
              mark is taller than the plain icon mark, and without this the whole row would stretch 06-08 to match,
              leaving large empty space in their cards. Flagged as a real follow-up needed on the live file if this
              direction is approved, not applied there yet.
            </Text>
          </div>
        </div>
      </div>
    </Section>
  );
}
