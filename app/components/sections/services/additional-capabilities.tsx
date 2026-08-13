import type { ComponentType, SVGProps } from "react";
import { Laptop, Radar, Siren, Target } from "lucide-react";
import { Badge, Card, Caption, Container, H2, Icon, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { SchematicMark } from "./schematic-visual";

/**
 * Additional Capabilities (5-8) — Step 5. Same one-liners as the Home
 * teaser (locked/confirmed) — condensed treatment, visually secondary to
 * Live Services, no CTA to a specific service (none are operational yet,
 * per PROJECT_MASTER.md status language). The section-level CTA below
 * points to Contact for a general inquiry instead.
 */

interface FinalizingService {
  name: string;
  copy: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const FINALIZING_SERVICES: FinalizingService[] = [
  {
    name: "Managed Security Services / 24/7 MDR",
    copy: "Ongoing monitoring and rapid response to catch threats as they happen.",
    icon: Radar,
  },
  {
    name: "Penetration Testing",
    copy: "Simulated attacks that reveal exactly where you're exposed.",
    icon: Target,
  },
  {
    name: "Endpoint Protection / EDR",
    copy: "Protection and visibility across every device on your network.",
    icon: Laptop,
  },
  {
    name: "Incident Response",
    copy: "A clear, practiced plan for when something goes wrong.",
    icon: Siren,
  },
];

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

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FINALIZING_SERVICES.map((service, i) => (
            <Reveal key={service.name} delay={i * 0.06}>
              <Card variant="surface" className="flex h-full flex-col gap-3">
                {/* Compact schematic-linework mark (D-008/D-011 retrofit,
                    approved from Prototype 2) — same visual language as
                    LiveServices' full SchematicVisual, scaled down for this
                    card. Kept visually lighter than the live rows (smaller
                    mark, muted icon tone, badge) — these 4 aren't live yet,
                    and that distinction is deliberate (D-007), not an
                    oversight. */}
                <div className="relative h-12 w-12">
                  <SchematicMark className="h-full w-full" />
                  <span
                    className="absolute left-1/2 top-[53%] flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                    aria-hidden="true"
                  >
                    <Icon icon={service.icon} size="sm" className="text-text-secondary" />
                  </span>
                </div>
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
