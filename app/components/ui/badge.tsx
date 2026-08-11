import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * Badges / status elements — Step 3.
 *
 * Badge: general-purpose label pill (neutral or accent tone).
 * RiskBadge: severity indicator using the risk-tier colors from
 * tokens.css. Those colors are functional-only per the brief — RiskBadge
 * is the one place components should reach for `risk-*`; don't reuse them
 * as decoration elsewhere.
 */

export type BadgeTone = "neutral" | "accent";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border bg-surface text-text-secondary",
  accent: "border-accent/30 bg-accent/10 text-accent",
};

export interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-body text-xs font-medium uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type RiskTier = "critical" | "high" | "medium" | "low";

const riskDotClasses: Record<RiskTier, string> = {
  critical: "bg-risk-critical",
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

const riskTextClasses: Record<RiskTier, string> = {
  critical: "text-risk-critical",
  high: "text-risk-high",
  medium: "text-risk-medium",
  low: "text-risk-low",
};

const riskLabels: Record<RiskTier, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export interface RiskBadgeProps {
  tier: RiskTier;
  /** Override the default tier label (e.g. a translated string). */
  label?: string;
  className?: string;
}

export function RiskBadge({ tier, label, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 font-body text-xs font-medium",
        riskTextClasses[tier],
        className,
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full", riskDotClasses[tier])}
        aria-hidden="true"
      />
      {label ?? riskLabels[tier]}
    </span>
  );
}
