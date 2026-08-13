import { ClipboardCheck } from "lucide-react";
import { ButtonLink, Caption, H3, Icon, Text } from "../../ui";
import { GlowEffect } from "./glow-effect";
import { HeroSchematicVisual } from "./hero-schematic-visual";

/**
 * CapabilitySpotlight — Services Design Correction prototype
 * (SERVICES_REDESIGN_PROMPT.md), ONE row only (Risk Assessment &
 * Compliance, n=02 — same row as the prior schematic-linework prototype,
 * for direct continuity/comparison). Copy copied verbatim from
 * live-services.tsx, nothing new written.
 *
 * Techniques applied, stated before this was built (see chat):
 *  - Scale (#1) / hero-scale illustration (#3): HeroSchematicVisual, ~40%
 *    larger than the shipped SchematicVisual, is this row's clear focal
 *    point, not a supporting mark beside the text.
 *  - Depth through light (#2): the visual sits in a real nested `env-dark`
 *    panel — a dark, shadow-elevated card floating on this White-
 *    environment row, the trait QClay/Cybershield/Tokenex all share —
 *    plus a `GlowEffect` (21st.dev, adapted) atmospheric layer behind the
 *    hub and a separate SVG-blurred rim glow (HeroSchematicVisual itself).
 *  - 3D icon style (#4/#6), per Mohammad's choice of CSS-simulated over
 *    real 3D-rendered assets: the icon badge is a radial-gradient
 *    "material" fill with layered box-shadow (inner highlight, inner
 *    shadow, outer glow ring) — not literal 3D geometry.
 *  - Large-scale numerals (#5): the row's own real index ("02"), not an
 *    invented stat, oversized and low-opacity behind the panel.
 *  - Charts/dashboards (#7): not applicable to a capability row — no
 *    chart forced in here.
 *
 * Color note: every gradient/glow above uses only the locked accent
 * family (--color-accent-light/--color-accent/--color-accent-strong).
 * white/black appear ONLY as tonal shading mixed into the accent for the
 * icon badge's highlight/shadow (standard material-shading technique, not
 * a new decorative hue) — flagged here per the brief's color note, not
 * applied silently.
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

export function CapabilitySpotlight() {
  return (
    <div className="grid gap-10 py-14 md:grid-cols-2 md:items-center md:gap-16">
      <div
        className="env-dark relative overflow-hidden rounded-3xl border border-border bg-background"
        style={{ boxShadow: "0 30px 80px -24px color-mix(in srgb, var(--color-accent) 45%, transparent)" }}
      >
        <GlowEffect blur="strong" className="opacity-50" />
        <div className="relative px-6 pb-2 pt-8 sm:px-10 sm:pt-10">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 right-4 select-none font-data text-[9rem] font-bold leading-none text-white/[0.04] sm:text-[11rem]"
          >
            {SERVICE.n}
          </span>
          <div className="relative mx-auto max-w-md">
            <HeroSchematicVisual className="w-full" />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[51.5%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, var(--color-accent-light), var(--color-accent) 55%, var(--color-accent-strong) 100%)",
                boxShadow:
                  "inset 0 1.5px 0 0 color-mix(in srgb, white 45%, transparent), inset 0 -8px 14px -6px color-mix(in srgb, black 55%, transparent), 0 0 28px 4px color-mix(in srgb, var(--color-accent) 55%, transparent)",
              }}
            >
              <Icon icon={SERVICE.icon} size="lg" className="text-white" />
            </span>
          </div>
          <p className="relative mt-2 pb-6 text-center font-data text-[10px] uppercase tracking-[0.2em] text-text-muted sm:pb-8">
            FIG.{SERVICE.n} — schematic
          </p>
        </div>
      </div>

      <div>
        <Caption tone="accent">Capability {SERVICE.n}</Caption>
        <H3 className="mt-3">{SERVICE.name}</H3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <ServiceField label="The Challenge">{SERVICE.problem}</ServiceField>
          <ServiceField label="What Oragrol Does">{SERVICE.whatWeDo}</ServiceField>
          <ServiceField label="What You Get">{SERVICE.whatYouGet}</ServiceField>
          <ServiceField label="The Outcome">{SERVICE.outcome}</ServiceField>
        </div>
        <ButtonLink href={SERVICE.cta.href} variant="secondary" size="md" className="mt-8">
          {SERVICE.cta.label}
        </ButtonLink>
      </div>
    </div>
  );
}
