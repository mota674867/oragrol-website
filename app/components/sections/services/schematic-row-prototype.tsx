import { ClipboardCheck } from "lucide-react";
import { ButtonLink, Caption, H3, Icon, Text } from "../../ui";
import { SchematicVisual } from "./schematic-visual";

/**
 * Prototype 2 (blueprint E-2, D-008 retrofit) — ONE Services capability row
 * rebuilt with the schematic-linework treatment, for review before it's
 * applied to all 8 rows on the live /services page. Not wired into
 * live-services.tsx yet — lives only on the noindex /services/prototype
 * preview route (app/services/prototype/page.tsx) until approved.
 *
 * Copy below is copied verbatim from live-services.tsx's "Risk Assessment &
 * Compliance" entry (n: "02") — nothing new written or invented for this
 * prototype, only the left-column visual treatment changes.
 */
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

export function SchematicRowPrototype() {
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
