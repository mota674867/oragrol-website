import type { ComponentType, SVGProps } from "react";
import { Bug, ClipboardCheck, GraduationCap, UserRound } from "lucide-react";
import { ButtonLink, Caption, Container, H2, H3, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { CapabilitySpotlightVisual } from "./capability-spotlight";

/**
 * Live Services (1-4) — Step 5.
 *
 * DRAFT COPY — the one-liners are locked (Home teaser, brief-confirmed);
 * the problem/what-we-do/what-you-get/outcome breakdown below is new copy
 * written for this page, not yet reviewed/approved. Deliberately generic
 * and non-specific: no named frameworks/standards, no tool names, no
 * stats, no client counts, no certifications — nothing beyond what's
 * already confirmed elsewhere in the project docs.
 *
 * Full-width alternating feature rows, not a card grid — a 4-field
 * breakdown per service (problem/what we do/what you get/outcome) needs
 * more room than a card comfortably gives, and this page already has a
 * card-grid Services teaser on Home; repeating that pattern here at a
 * larger scale would be the exact "identical cards" the brief calls out
 * to avoid. `divide-y` borders (same device as Faq.tsx) instead of boxed
 * Cards, for an editorial rather than boxy read.
 */

interface LiveService {
  n: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  problem: string;
  whatWeDo: string;
  whatYouGet: string;
  outcome: string;
  cta: { label: string; href: string };
}

const LIVE_SERVICES: LiveService[] = [
  {
    n: "01",
    name: "Virtual CISO",
    icon: UserRound,
    problem:
      "Most small and mid-sized businesses need senior security leadership and direction, but can't justify a full-time executive hire.",
    whatWeDo:
      "Oragrol provides ongoing strategic security guidance — risk prioritization, planning, and reporting — on a schedule that fits the business.",
    whatYouGet:
      "A dedicated point of security leadership and regular, clear guidance on where to focus next.",
    outcome: "Security decisions get made with real strategic rigor, without a full-time cost.",
    cta: { label: "Talk to Oragrol", href: "/contact" },
  },
  {
    n: "02",
    name: "Risk Assessment & Compliance",
    icon: ClipboardCheck,
    problem:
      "Businesses often don't have a clear picture of where they actually stand against the frameworks that matter to them.",
    whatWeDo:
      "We assess the current environment against what's relevant to the business and translate findings into a prioritized, practical plan.",
    whatYouGet: "A clear risk picture and a prioritized roadmap — not a report that sits unread.",
    outcome: "You know exactly where you stand, and what to fix first.",
    cta: { label: "Get Your Cyber Health Score", href: "/cyber-health" },
  },
  {
    n: "03",
    name: "Vulnerability Assessment & Management",
    icon: Bug,
    problem:
      "Attackers look for the easiest way in — most businesses don't know where those weaknesses are until it's too late.",
    whatWeDo:
      "We identify and help prioritize remediation of vulnerabilities across the environment on an ongoing basis, not a one-time scan.",
    whatYouGet: "Regular visibility into exposure, prioritized by real risk, with practical next steps.",
    outcome: "Fewer open doors for attackers, and a clear record of what's been fixed.",
    cta: { label: "Talk to Oragrol", href: "/contact" },
  },
  {
    n: "04",
    name: "Security Awareness Training",
    icon: GraduationCap,
    problem: "Most breaches start with a person, not a piece of technology.",
    whatWeDo:
      "We train teams to recognize and respond to real-world threats through ongoing, practical training — not a one-off, check-the-box course.",
    whatYouGet: "A workforce that can spot phishing and social-engineering attempts before they become incidents.",
    outcome: "Your team becomes an active layer of defense, not the weakest link.",
    cta: { label: "Talk to Oragrol", href: "/contact" },
  },
];

function ServiceField({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <Caption tone="muted">{label}</Caption>
      <Text size="sm" tone="secondary" className="mt-1.5">
        {children}
      </Text>
    </div>
  );
}

export function LiveServices() {
  return (
    <Section environment="white">
      {/*
        Asymmetric pt/pb, not the usual py-24/32: each row below already
        carries its own py-14 (top AND bottom padding, for the divide-y
        rhythm between rows). A uniform py-24/32 here would stack its own
        bottom padding on top of the last row's already-present pb-14,
        producing a much bigger gap before the next section than the
        entrance gap before the first row — confirmed as the reported
        "excessive blank gap" before Additional Capabilities. Top padding
        stays the standard 24/32 (unaffected, wasn't part of the report);
        bottom is cut down since the last row's own pb-14 already covers
        most of that space.
      */}
      <Container size="lg" className="pt-24 pb-8 md:pt-32 md:pb-12">
        <Reveal>
          <Caption tone="accent">Live capabilities</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Available today.</H2>
        </Reveal>

        <div className="mt-16 flex flex-col divide-y divide-border border-t border-border">
          {LIVE_SERVICES.map((service, i) => {
            const reverse = i % 2 === 1;
            return (
              <Reveal key={service.name} delay={i * 0.06}>
                <div className="grid gap-8 py-14 md:grid-cols-2 md:items-center md:gap-16">
                  <div className={reverse ? "md:order-2" : undefined}>
                    {/* Design Correction treatment (D-013/D-014) — bigger
                        hero-scale illustration in a nested dark, glow-lit,
                        shadow-elevated panel, replacing D-012's flatter
                        schematic-linework mark. */}
                    <CapabilitySpotlightVisual n={service.n} icon={service.icon} />
                    <H3 className="mt-6">{service.name}</H3>
                    <ButtonLink href={service.cta.href} variant="secondary" size="md" className="mt-6">
                      {service.cta.label}
                    </ButtonLink>
                  </div>
                  <div className={reverse ? "md:order-1" : undefined}>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <ServiceField label="The Challenge">{service.problem}</ServiceField>
                      <ServiceField label="What Oragrol Does">{service.whatWeDo}</ServiceField>
                      <ServiceField label="What You Get">{service.whatYouGet}</ServiceField>
                      <ServiceField label="The Outcome">{service.outcome}</ServiceField>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
