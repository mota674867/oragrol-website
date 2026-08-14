import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { ButtonLink, Caption, H3, Section, Text } from "../../components/ui";
import { CapabilitySpotlightVisual } from "../../components/sections/services/capability-spotlight";
import { CapabilityDashboardVisual } from "../../components/sections/services/capability-dashboard-visual";

// Recreated for Round 6 (D-021), same convention as the original D-013
// prototype: noindex, not linked from any real nav, deleted once
// Mohammad's decision is made either way.
export const metadata: Metadata = {
  title: "Prototype V2 — Capability 02 comparison (internal)",
  robots: { index: false, follow: false },
};

/**
 * /services/prototype-v2 — Round 6, item 2.
 *
 * Side-by-side comparison of the CURRENT, shipped Capability 02 treatment
 * (`CapabilitySpotlightVisual` — the glow-orb-in-card motif, D-013/D-014,
 * live on all 8 rows) against a new prototype (`CapabilityDashboardVisual`
 * — a real risk-score dashboard mockup, see that file's own comment for
 * the full rationale and where its content came from). Same exact row
 * copy on both (Capability 02's real content, mirrored from
 * live-services.tsx — not new text) so the ONLY variable being compared
 * is the visual treatment itself. Does not import from or modify
 * live-services.tsx — this route touches nothing live.
 */

const CAPABILITY_02 = {
  n: "02",
  name: "Risk Assessment & Compliance",
  icon: ClipboardCheck,
  problem:
    "Businesses often don't have a clear picture of where they actually stand against the frameworks that matter to them.",
  whatWeDo:
    "We assess the current environment against what's relevant to the business and translate findings into a prioritized, practical plan.",
  whatYouGet: "A clear risk picture and a prioritized roadmap — not a report that sits unread.",
  outcome: "You know exactly where you stand, and what to fix first.",
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

export default function PrototypeV2Page() {
  const s = CAPABILITY_02;
  return (
    <Section environment="white">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 md:px-12">
        <Caption tone="accent">Internal — not linked from live navigation</Caption>
        <h1 className="mt-4 font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Capability 02 — treatment comparison
        </h1>
        <Text size="base" tone="secondary" className="mt-4 max-w-2xl">
          Same row, same copy, two different visual treatments. Rows 3-8 and the live `/services` page are
          untouched — this route exists only for this comparison.
        </Text>

        <div className="mt-16 flex flex-col gap-16">
          <ComparisonRow variant="Current — live" variantNote="CapabilitySpotlightVisual (D-013/D-014), shipped on all 8 rows today.">
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
            variant="Prototype B — Dashboard mockup"
            variantNote="CapabilityDashboardVisual (new). Reuses Cyber Health's already-approved score/risk-breakdown card, re-themed into Services' dark panel shell."
          >
            <div className="mx-auto max-w-md">
              <CapabilityDashboardVisual />
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
