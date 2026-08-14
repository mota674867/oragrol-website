import type { ComponentType, SVGProps } from "react";
import { Laptop, Radar, Siren, Target } from "lucide-react";
import { Badge, Card, Caption, Container, H2, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { CapabilitySpotlightMark } from "./capability-spotlight";
import { CapabilityMonitorMark } from "./capability-monitor-mark";
import { CapabilityFindingsMark } from "./capability-findings-mark";
import { CapabilityFleetMark } from "./capability-fleet-mark";

/**
 * Additional Capabilities (5-8) — Step 5. Same one-liners as the Home
 * teaser (locked/confirmed) — condensed treatment, visually secondary to
 * Live Services, no CTA to a specific service (none are operational yet,
 * per PROJECT_MASTER.md status language). The section-level CTA below
 * points to Contact for a general inquiry instead.
 *
 * `n`/card `id` added D-016: LiveServices' CategoryNav (items 05-08) jump-
 * scrolls here — names must stay in sync with that nav's hardcoded list
 * if either changes.
 *
 * D-024/D-025: Capability 05's mark is now `CapabilityMonitorMark` (a
 * live-pulse/activity-feed treatment) in place of the plain
 * `CapabilitySpotlightMark` orb — approved after review at
 * `/services/prototype-v4` (now removed). The grid below gained
 * `items-start` at the same time: the new mark is taller than the plain
 * orb mark, and without `items-start` CSS Grid's default row-stretch
 * behavior would force still-short cards to match the taller one, leaving
 * large empty space — confirmed this doesn't happen post-fix via DOM
 * measurement before shipping (see D-025). That fix covers every
 * capability in this grid, not just 05 — no further grid change needed
 * as more marks are replaced.
 *
 * D-026/D-027: Capability 06's mark is now `CapabilityFindingsMark` (a
 * ranked, severity-tagged example-findings treatment) — approved after
 * review at `/services/prototype-v5` (now removed).
 *
 * D-028/D-029: Capability 07's mark is now `CapabilityFleetMark` (a
 * device-coverage pictogram) — approved after review at
 * `/services/prototype-v6` (now removed). Capability 08 still pending its
 * own individually-researched treatment.
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

/** Per-capability mark selector — same pattern as LiveServices' own
 * `CapabilityVisual`. Falls back to the plain `CapabilitySpotlightMark`
 * orb for any capability that hasn't gotten its own researched treatment
 * yet (08, for now — the last of the 8). */
function CapabilityMark({ service }: { service: FinalizingService }) {
  if (service.n === "05") {
    return <CapabilityMonitorMark />;
  }
  if (service.n === "06") {
    return <CapabilityFindingsMark />;
  }
  if (service.n === "07") {
    return <CapabilityFleetMark />;
  }
  return <CapabilitySpotlightMark icon={service.icon} className="h-14 w-14" />;
}

export function AdditionalCapabilities() {
  return (
    <Section environment="light-blue">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">Additional capabilities</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Expanding the coordinated approach.</H2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {FINALIZING_SERVICES.map((service, i) => (
            <Reveal key={service.name} delay={i * 0.06}>
              <Card
                id={`capability-${service.n}`}
                variant="surface"
                className="flex h-full scroll-mt-28 flex-col gap-3"
              >
                <CapabilityMark service={service} />
                <h3 className="font-heading text-base font-semibold text-text-primary">
                  {service.name}
                </h3>
                <Text size="sm" tone="secondary">
                  {service.copy}
                </Text>
                <Badge className="mt-auto self-start">Capability currently being finalized</Badge>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
