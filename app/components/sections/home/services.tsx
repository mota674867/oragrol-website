import type { ComponentType, SVGProps } from "react";
import {
  Bug,
  ClipboardCheck,
  GraduationCap,
  Laptop,
  Radar,
  Siren,
  Target,
  UserRound,
} from "lucide-react";
import { Badge, Caption, Card, Container, Grid, H2, Icon, NavLink, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";

/**
 * Services — Step 4. All 8 confirmed categories (brief section 8). The 4
 * live ones get a larger, more prominent tile (asymmetric span); the 4
 * "additional capabilities" are visually secondary and carry the exact
 * required status badge — never implied as operational. This is a Home-page
 * teaser (name + one-liner); full problem/solution/outcome depth per
 * service belongs on the dedicated Services page (later build phase).
 */

interface ServiceEntry {
  name: string;
  copy: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  live: boolean;
}

const LIVE_SERVICES: ServiceEntry[] = [
  {
    name: "Virtual CISO",
    copy: "Senior security leadership and strategic guidance, without a full-time hire.",
    icon: UserRound,
    live: true,
  },
  {
    name: "Risk Assessment & Compliance",
    copy: "Understand where you stand against the frameworks that matter to your business.",
    icon: ClipboardCheck,
    live: true,
  },
  {
    name: "Vulnerability Assessment & Management",
    copy: "Find and fix the weaknesses attackers would look for first.",
    icon: Bug,
    live: true,
  },
  {
    name: "Security Awareness Training",
    copy: "Turn your team into your first line of defense.",
    icon: GraduationCap,
    live: true,
  },
];

const FINALIZING_SERVICES: ServiceEntry[] = [
  {
    name: "Managed Security Services / 24/7 MDR",
    copy: "Ongoing monitoring and rapid response to catch threats as they happen.",
    icon: Radar,
    live: false,
  },
  {
    name: "Penetration Testing",
    copy: "Simulated attacks that reveal exactly where you're exposed.",
    icon: Target,
    live: false,
  },
  {
    name: "Endpoint Protection / EDR",
    copy: "Protection and visibility across every device on your network.",
    icon: Laptop,
    live: false,
  },
  {
    name: "Incident Response",
    copy: "A clear, practiced plan for when something goes wrong.",
    icon: Siren,
    live: false,
  },
];

export function Services() {
  return (
    <Section environment="dark" transitionFrom="deep-blue">
      <Container size="xl" className="py-24 md:py-32">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <Caption tone="accent">Services</Caption>
            </Reveal>
            <Reveal delay={0.05}>
              <H2 className="mt-4 max-w-xl">Eight capabilities. One coordinated approach.</H2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <NavLink href="/services" className="text-base">
              View all services →
            </NavLink>
          </Reveal>
        </div>

        <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="md" className="mt-14">
          {LIVE_SERVICES.map((service, i) => (
            <Reveal
              key={service.name}
              delay={i * 0.06}
              className={i === 0 ? "md:col-span-2 md:row-span-2" : undefined}
            >
              <Card
                variant="bordered"
                interactive
                href="/services"
                className={i === 0 ? "flex h-full flex-col justify-between p-8" : "flex h-full flex-col justify-between"}
              >
                <Icon icon={service.icon} size={i === 0 ? "lg" : "md"} className="text-text-primary" />
                <div className="mt-6">
                  <h3
                    className={
                      i === 0
                        ? "font-heading text-2xl font-semibold text-text-primary"
                        : "font-heading text-lg font-semibold text-text-primary"
                    }
                  >
                    {service.name}
                  </h3>
                  <Text size="sm" tone="secondary" className="mt-2">
                    {service.copy}
                  </Text>
                </div>
              </Card>
            </Reveal>
          ))}
        </Grid>

        <div className="mt-16 border-t border-border pt-10">
          <Reveal>
            <Caption tone="muted">Additional capabilities</Caption>
          </Reveal>
          <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="md" className="mt-6">
            {FINALIZING_SERVICES.map((service, i) => (
              <Reveal key={service.name} delay={i * 0.06}>
                <Card variant="surface" className="flex h-full flex-col gap-3">
                  <Icon icon={service.icon} size="sm" className="text-text-secondary" />
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
          </Grid>
        </div>
      </Container>
    </Section>
  );
}
