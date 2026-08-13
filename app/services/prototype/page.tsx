import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { ButtonLink, Caption, Container, H2, H3, Icon, Section, Text } from "../../components/ui";
import { SchematicRowPrototype } from "../../components/sections/services/schematic-row-prototype";

// Internal, disposable review page — Visual Redesign Blueprint (D-009),
// Prototype 2. Shows the current live "Risk Assessment & Compliance" row
// next to the same row rebuilt with the schematic-linework treatment
// (SchematicVisual, D-008 Services retrofit), so the direction can be
// judged before it's applied to all 8 rows on the live /services page.
// Not linked from navigation; delete once the retrofit decision is made.

export const metadata: Metadata = {
  title: "Prototype — Schematic Linework",
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

/** The row exactly as it renders on the live /services page today — copied
 * here rather than imported, since live-services.tsx renders all 4 rows as
 * a list and this page needs just the one, in isolation, for comparison. */
function CurrentRow() {
  return (
    <div className="grid gap-8 py-14 md:grid-cols-2 md:items-center md:gap-16">
      <div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
          <Icon icon={SERVICE.icon} size="lg" className="text-accent" />
        </span>
        <span className="mt-6 block font-data text-xs text-text-muted">{SERVICE.n}</span>
        <H3 className="mt-1">{SERVICE.name}</H3>
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
          <Caption tone="accent">Visual Redesign Blueprint — Prototype 2</Caption>
          <H2 className="mt-4 max-w-2xl">
            One Services row, schematic-linework treatment.
          </H2>
          <Text tone="secondary" size="lg" className="mt-4 max-w-2xl">
            Same copy, same row — &ldquo;Risk Assessment &amp; Compliance&rdquo; (n=02) — shown
            twice: as it renders live today, then rebuilt with the D-008 schematic-linework
            motif (SchematicVisual). For review before this is applied to all 8 capability rows.
          </Text>
        </Container>
      </Section>

      <Section environment="white" className="border-t border-border">
        <Container size="lg" className="py-4">
          <Caption tone="muted">Current — live on /services</Caption>
          <div className="mt-2 border-t border-border">
            <CurrentRow />
          </div>
        </Container>
      </Section>

      <Section environment="white" className="border-t border-border">
        <Container size="lg" className="py-4">
          <Caption tone="accent">Prototype — schematic-linework</Caption>
          <div className="mt-2 border-t border-border">
            <SchematicRowPrototype />
          </div>
        </Container>
      </Section>
    </div>
  );
}
