import type { ComponentType, SVGProps } from "react";
import { Bug, ClipboardCheck, GraduationCap, UserRound } from "lucide-react";
import { ButtonLink, Caption, H2, H3, Section, Text } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { CapabilitySpotlightVisual } from "./capability-spotlight";
import { CategoryNav, type CategoryNavItem } from "./category-nav";

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
 *
 * D-016 (item 1 + item 3, resolved together): the outer wrapper widened
 * from a standard `Container size="lg"` (1280px) to a custom 1680px one
 * with a `[220px_1fr]` grid — CategoryNav now occupies real width in what
 * was previously just empty margin at 1920/2560px viewports, instead of
 * trying to fix "dead space" by chasing the max-width number itself
 * (mathematically can't reach zero gutter while capped — confirmed with
 * Mohammad before this approach). Row content's own width is effectively
 * unchanged (~1280px-equivalent minus the nav column + gap).
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

/**
 * Nav items for all 8 capabilities — 01-04 here, 05-08 render in
 * AdditionalCapabilities below (D-007's finalizing tier). Names for 05-08
 * are copied verbatim from additional-capabilities.tsx's FINALIZING_SERVICES
 * — keep both lists in sync if either changes; not extracted to a shared
 * module since the two sections' own data shapes differ (full copy vs.
 * name+one-liner) and duplicating just the label/id pair here is simpler
 * than a shared indirection for 4 static strings.
 */
const NAV_ITEMS: CategoryNavItem[] = [
  ...LIVE_SERVICES.map((s) => ({ id: `capability-${s.n}`, n: s.n, label: s.name })),
  { id: "capability-05", n: "05", label: "Managed Security Services / 24/7 MDR" },
  { id: "capability-06", n: "06", label: "Penetration Testing" },
  { id: "capability-07", n: "07", label: "Endpoint Protection / EDR" },
  { id: "capability-08", n: "08", label: "Incident Response" },
];

function ServiceField({ label, children }: { label: string; children: string }) {
  return (
    <div>
      {/* size="sm" — hierarchy fix (D-015/D-016): quieter than the
          headline, not competing with it. */}
      <Caption tone="muted" size="sm">
        {label}
      </Caption>
      {/* size="base" (was "sm") — D-016: body copy needs to read as its
          own distinct tier, not visually adjacent to the tiny label. */}
      <Text size="base" tone="secondary" className="mt-1.5">
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
      <div className="mx-auto w-full max-w-[1680px] px-6 pb-8 pt-24 md:px-12 md:pb-12 md:pt-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr] lg:items-start lg:gap-16">
          <CategoryNav items={NAV_ITEMS} />

          <div>
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
                    <div
                      id={`capability-${service.n}`}
                      className="grid scroll-mt-28 gap-8 py-14 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-16"
                    >
                      <div className={reverse ? "md:order-2" : undefined}>
                        {/* Design Correction treatment (D-013/D-014) —
                            hero-scale illustration in a nested dark,
                            glow-lit, shadow-elevated panel; hover motion
                            (D-016). Capped narrower (D-018, item 3) — was
                            filling its whole grid column; now gives the
                            content column more room, per Mohammad's
                            explicit "scale down a bit, don't redesign"
                            instruction (all internal elements/proportions
                            untouched, just a max-width cap). */}
                        <CapabilitySpotlightVisual n={service.n} icon={service.icon} className="mx-auto max-w-md" />
                        <ButtonLink href={service.cta.href} variant="secondary" size="md" className="mt-6">
                          {service.cta.label}
                        </ButtonLink>
                      </div>
                      <div className={reverse ? "md:order-1" : undefined}>
                        {/* Large content-area headline (D-018, item 1):
                            D-016's H3 lived only in the visual column,
                            beside the graphic — the content area itself
                            (this column) had no headline at all, just the
                            small field labels immediately above body
                            text, which is what actually read as "no
                            hierarchy." Same capability name already shown
                            in the sidebar, not new copy. Three tiers now
                            unambiguous within this one column: this
                            headline > ServiceField's body text >
                            ServiceField's category label. */}
                        <Caption tone="accent">Capability {service.n}</Caption>
                        <H3 size="lg" className="mt-2">
                          {service.name}
                        </H3>
                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
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
          </div>
        </div>
      </div>
    </Section>
  );
}
