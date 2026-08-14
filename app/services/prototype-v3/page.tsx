import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { ButtonLink, Caption, H3, Section, Text } from "../../components/ui";
import { CapabilitySpotlightVisual } from "../../components/sections/services/capability-spotlight";
import { CapabilityTrainingVisual } from "../../components/sections/services/capability-training-visual";

// Same convention as D-013/D-021's prototype routes: noindex, not linked
// from any real nav, deleted once Mohammad's decision is made.
export const metadata: Metadata = {
  title: "Prototype V3 — Capability 04 shell redesign (internal)",
  robots: { index: false, follow: false },
};

/**
 * /services/prototype-v3 — Round 7, item: Capabilities 04-08 shell
 * rethink, prototyped on Capability 04 (Security Awareness Training)
 * first. See `capability-training-visual.tsx` for the full reasoning
 * trail (tool findings -> design decision), stated there per instruction.
 *
 * Same exact row copy on both variants (Capability 04's real content,
 * mirrored from live-services.tsx — not new text) so the only variable
 * being compared is the visual treatment. Does not import from or modify
 * live-services.tsx — this route touches nothing live. Capabilities
 * 01-03 and 05-08 are untouched.
 */

const CAPABILITY_04 = {
  n: "04",
  name: "Security Awareness Training",
  icon: GraduationCap,
  problem: "Most breaches start with a person, not a piece of technology.",
  whatWeDo:
    "We train teams to recognize and respond to real-world threats through ongoing, practical training — not a one-off, check-the-box course.",
  whatYouGet: "A workforce that can spot phishing and social-engineering attempts before they become incidents.",
  outcome: "Your team becomes an active layer of defense, not the weakest link.",
  cta: { label: "Talk to Oragrol", href: "/contact" },
};

function ServiceField({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <Caption tone="muted" size="sm">
        {label}
      </Caption>
      <Text size="base" tone="secondary" className="mt-1.5">
        {children}
      </Text>
    </div>
  );
}

function ComparisonRow({
  variant,
  variantNote,
  children,
}: {
  variant: string;
  variantNote: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-10">
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-accent">
          {variant}
        </span>
        <Text size="sm" tone="muted">
          {variantNote}
        </Text>
      </div>
      <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start md:gap-16">{children}</div>
    </div>
  );
}

export default function PrototypeV3Page() {
  const s = CAPABILITY_04;
  return (
    <Section environment="white">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 md:px-12">
        <Caption tone="accent">Internal — not linked from live navigation</Caption>
        <h1 className="mt-4 font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Capability 04 — shell redesign comparison
        </h1>
        <Text size="base" tone="secondary" className="mt-4 max-w-2xl">
          Same row, same copy, two different panel treatments. Capabilities 01-03 and 05-08 are untouched — this
          route exists only for this comparison.
        </Text>

        <div className="mt-16 flex flex-col gap-16">
          <ComparisonRow
            variant="Current — live"
            variantNote="CapabilitySpotlightVisual (D-013/D-014): dark panel, dot-grid, node diagram, glow orb. Shell disapproved for Capabilities 04-08."
          >
            <div className="mx-auto max-w-md">
              <CapabilitySpotlightVisual n={s.n} icon={s.icon} />
              <ButtonLink href={s.cta.href} variant="secondary" size="md" className="mt-6">
                {s.cta.label}
              </ButtonLink>
            </div>
            <div>
              <Caption tone="accent">Capability {s.n}</Caption>
              <H3 size="lg" className="mt-2">
                {s.name}
              </H3>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <ServiceField label="The Challenge">{s.problem}</ServiceField>
                <ServiceField label="What Oragrol Does">{s.whatWeDo}</ServiceField>
                <ServiceField label="What You Get">{s.whatYouGet}</ServiceField>
                <ServiceField label="The Outcome">{s.outcome}</ServiceField>
              </div>
            </div>
          </ComparisonRow>

          <ComparisonRow
            variant="Prototype — Training progress dashboard"
            variantNote="CapabilityTrainingVisual (new). Module checklist + completion ring, in place of the node-diagram/orb formula. Reasoning trail in the component's own file comment."
          >
            <div className="mx-auto max-w-md">
              <CapabilityTrainingVisual />
              <ButtonLink href={s.cta.href} variant="secondary" size="md" className="mt-6">
                {s.cta.label}
              </ButtonLink>
            </div>
            <div>
              <Caption tone="accent">Capability {s.n}</Caption>
              <H3 size="lg" className="mt-2">
                {s.name}
              </H3>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <ServiceField label="The Challenge">{s.problem}</ServiceField>
                <ServiceField label="What Oragrol Does">{s.whatWeDo}</ServiceField>
                <ServiceField label="What You Get">{s.whatYouGet}</ServiceField>
                <ServiceField label="The Outcome">{s.outcome}</ServiceField>
              </div>
            </div>
          </ComparisonRow>
        </div>
      </div>
    </Section>
  );
}
