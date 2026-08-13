import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { ButtonLink, Caption, Container, H2, H3, Icon, Section, Text } from "../../components/ui";
import { SchematicVisual } from "../../components/sections/services/schematic-visual";
import { CapabilitySpotlight } from "../../components/sections/services/capability-spotlight";

// Internal, disposable review page — Services Design Correction round
// (SERVICES_REDESIGN_PROMPT.md). Shows the currently-shipped "Risk
// Assessment & Compliance" row (D-012, schematic-linework) next to the new
// prototype (CapabilitySpotlight: bigger hero-scale illustration, nested
// dark glow-lit elevated panel, soft-3D icon, large background numeral),
// benchmarked against 3 Dribbble references, for review before this
// replaces anything live. Not linked from navigation; delete once the
// retrofit decision is made.

export const metadata: Metadata = {
  title: "Prototype — Design Correction",
  robots: { index: false, follow: false },
};

const SERVICE = {
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
};

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

/** The row exactly as shipped on the live /services page today (D-012). */
function ShippedRow() {
  return (
    <div className="grid gap-8 py-14 md:grid-cols-2 md:items-center md:gap-16">
      <div>
        <div className="relative mx-auto max-w-sm">
          <SchematicVisual className="w-full" />
          <span className="absolute left-2 top-2 font-data text-[10px] tracking-wider text-text-muted">
            FIG.{SERVICE.n}
          </span>
          <span
            className="absolute left-1/2 top-[54.2%] flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/40 bg-surface"
            aria-hidden="true"
          >
            <Icon icon={SERVICE.icon} size="md" className="text-accent" />
          </span>
        </div>
        <H3 className="mt-6">{SERVICE.name}</H3>
        <ButtonLink href={SERVICE.cta.href} variant="secondary" size="md" className="mt-6">
          {SERVICE.cta.label}
        </ButtonLink>
      </div>
      <div>
        <div className="grid gap-6 sm:grid-cols-2">
          <ServiceField label="The Challenge">{SERVICE.problem}</ServiceField>
          <ServiceField label="What Oragrol Does">{SERVICE.whatWeDo}</ServiceField>
          <ServiceField label="What You Get">{SERVICE.whatYouGet}</ServiceField>
          <ServiceField label="The Outcome">{SERVICE.outcome}</ServiceField>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPrototypePage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <Section environment="white">
        <Container size="lg" className="py-16">
          <Caption tone="accent">Design Correction — Prototype</Caption>
          <H2 className="mt-4 max-w-2xl">One Services row, benchmarked against the references.</H2>
          <Text tone="secondary" size="lg" className="mt-4 max-w-2xl">
            Same row, same copy — &ldquo;Risk Assessment &amp; Compliance&rdquo; (n=02) — shown
            twice against the current shipped version, benchmarked against the 3 references
            below.
          </Text>
          <div className="mt-8 grid gap-3 text-sm text-text-secondary sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="font-data text-[10px] uppercase tracking-wider text-text-muted">
                Ref 1 — QClay
              </p>
              <p className="mt-1.5">
                Dark atmospheric panel, sweeping gradient/glow light, glowing pill badges.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="font-data text-[10px] uppercase tracking-wider text-text-muted">
                Ref 2 — Cybershield
              </p>
              <p className="mt-1.5">
                Dark elevated cards with real shadow, icon-in-circle badges, stat numbers.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="font-data text-[10px] uppercase tracking-wider text-text-muted">
                Ref 3 — Tokenex
              </p>
              <p className="mt-1.5">
                Dark card on a gradient canvas, one large radial illustration as signature.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section environment="white" className="border-t border-border">
        <Container size="lg" className="py-4">
          <Caption tone="muted">Currently shipped — D-012, live on /services</Caption>
          <div className="mt-2 border-t border-border">
            <ShippedRow />
          </div>
        </Container>
      </Section>

      <Section environment="white" className="border-t border-border">
        <Container size="lg" className="py-4">
          <Caption tone="accent">Prototype — Capability Spotlight (Design Correction)</Caption>
          <div className="mt-2 border-t border-border">
            <CapabilitySpotlight />
          </div>
        </Container>
      </Section>
    </div>
  );
}
