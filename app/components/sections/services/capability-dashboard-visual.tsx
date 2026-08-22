import { Caption, DataText, RiskBadge, Text, type RiskTier } from "../../ui";
import { GlowEffect } from "./glow-effect";

/**
 * CapabilityDashboardVisual — Round 6 prototype, Capability 02 ONLY.
 *
 * Mohammad rejected the repeated glow-orb-in-card treatment
 * (`CapabilitySpotlightVisual`, D-013/D-014) as generic/templated when the
 * same abstract icon+node motif repeats identically across all 8 rows —
 * flagged as matching known "repeated abstract icon = looks templated"
 * guidance. Direction: each capability's visual should relate to what
 * that capability actually does, favoring real interface/dashboard-style
 * mockups over abstract icons — the original SERVICES_REDESIGN_PROMPT.md
 * brief's own "mixed-chart dashboards, large-scale data typography"
 * guidance, never actually built (the project converged on one repeated
 * icon treatment instead).
 *
 * Rather than pulling in an external dashboard-card component wholesale
 * (checked 21st.dev — closest match, "Financial Score Cards" id 5409, is
 * built on a whole separate "liquid glass" system: turbulence-displaced
 * backdrop-filter, shadcn Badge/Button primitives, HSL strength colors —
 * none of which exist in or matches this codebase's flat/matte brand
 * direction, and this session's own earlier ui-ux-pro-max style search
 * flagged that exact "Liquid Glass" category as moderate-poor performance
 * and a contrast risk, not a strong choice here), this reuses a pattern
 * that's *already built and approved* in this exact codebase: Cyber
 * Health's `OutputShape` illustrative-report card (score figure, risk-tier
 * badge, category risk-bar breakdown) — genuinely a "dashboard-style
 * mockup with data typography," which is exactly what the brief asked
 * for, just not yet applied to Services. Re-themed into Services' own
 * dark `env-dark` elevated-panel shell (same border/radius/shadow/glow
 * language as `CapabilitySpotlightVisual`, for site cohesion between rows
 * that keep the orb treatment and this one) rather than OutputShape's
 * original light-blue card.
 *
 * Content governance: the 78/100 score, "Medium" tier, and all four
 * category names/tiers/fill percentages below are copied EXACTLY from
 * `OutputShape`'s own already-approved illustrative example — not new
 * numbers invented for this prototype. Explicitly labeled illustrative,
 * same as the source.
 */

interface RiskExample {
  label: string;
  tier: RiskTier;
  fillPercent: number;
}

const RISK_EXAMPLES: RiskExample[] = [
  { label: "Access Control", tier: "high", fillPercent: 70 },
  { label: "Patch Management", tier: "medium", fillPercent: 50 },
  { label: "Employee Training", tier: "medium", fillPercent: 45 },
  { label: "Backup & Recovery", tier: "low", fillPercent: 25 },
];

const riskFillClasses: Record<RiskTier, string> = {
  critical: "bg-risk-critical",
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

export function CapabilityDashboardVisual({ className }: { className?: string }) {
  return (
    <div
      className={
        "group relative overflow-hidden rounded-3xl border border-border bg-background " +
        "env-dark shadow-2xl shadow-depth/30 " +
        "transition-[box-shadow,border-color,transform] duration-200 " +
        "hover:-translate-y-1 hover:border-accent/40 hover:shadow-accent/50 " +
        (className ?? "")
      }
    >
      <GlowEffect blur="strong" className="opacity-50" />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <Caption tone="muted" size="sm" className="font-data">
            Risk &amp; compliance snapshot
          </Caption>
          <RiskBadge tier="medium" />
        </div>

        <div className="mt-6 flex items-baseline gap-2">
          <DataText size="xl" tone="primary">
            78
          </DataText>
          <DataText size="lg" tone="secondary">
            /100
          </DataText>
        </div>
        <Caption tone="muted" size="sm" className="mt-1">
          Illustrative example — not a real result
        </Caption>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
          <Text size="sm" tone="secondary">
            Top risks (example)
          </Text>
          {RISK_EXAMPLES.map((risk) => (
            <div key={risk.label}>
              <Text size="sm" tone="primary">
                {risk.label}
              </Text>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full rounded-full ${riskFillClasses[risk.tier]}`}
                  style={{ width: `${risk.fillPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
