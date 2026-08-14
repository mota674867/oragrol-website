import { Caption, Icon, RiskBadge, Text, type RiskTier } from "../../ui";
import { GlowEffect } from "./glow-effect";
import { Target } from "lucide-react";

/**
 * CapabilityFindingsMark — Round 9 prototype, Capability 06 (Penetration
 * Testing) ONLY.
 *
 * Reasoning trail (tool findings -> design decision), stated before build
 * per instruction:
 *  - `ui-ux-pro-max --domain chart` ("vulnerability findings severity
 *    list ranked report" / "categorical distribution severity tags")
 *    recommended "Compare Categories" data get a sorted (descending),
 *    labeled bar/list treatment — informs a ranked findings list, ordered
 *    by severity, each with a visible severity label, rather than an
 *    unordered icon grid or a single aggregate score.
 *  - `mcp__21st__search` ("vulnerability findings report card security
 *    scan results severity" / "exposed issues ranked list severity tag
 *    badge report card") mostly surfaced small severity-badge/chip
 *    primitives (Astryx Badge, Status Badge, Chip) rather than one
 *    complete "findings report" block to pull wholesale — used as
 *    confirmation that a small severity tag per row is the right atomic
 *    unit, then composed into a full ranked list with this codebase's
 *    OWN `RiskBadge` (already the governance-approved component for
 *    exactly this kind of severity data, tokens.css's own "risk-* colors
 *    are functional-only, RiskBadge is the one place to reach for them"
 *    rule) rather than importing a new badge component.
 *  - Deliberately differentiated from Capability 02's score-card
 *    (`CapabilityDashboardVisual` — one aggregate score + evenly-weighted
 *    category bars) and Capability 05's activity feed
 *    (`CapabilityMonitorMark` — live-pulse + timestamped events, no
 *    severity labels at all): this is a RANKED LIST, sorted by severity,
 *    no score number, no timestamps — a genuinely different composition,
 *    not a third re-skin of either.
 *  - Like Capability 05, this lives in `additional-capabilities.tsx`'s
 *    shared compact-card grid (D-007's finalizing tier), not a full row.
 *    Kept in that format. The grid's `items-start` fix (D-025) already
 *    covers any future capability whose mark is taller than the plain
 *    orb mark — no new grid change needed for this one.
 *
 * Content governance: the four example findings are new illustrative
 * values — generic, universally-recognized vulnerability CLASSES (OWASP-
 * style technical categories, not a named framework/standard and not
 * client-specific), explicitly labeled illustrative. No real Oragrol
 * engagement findings exist in any project doc to reuse.
 */

interface FindingExample {
  label: string;
  tier: RiskTier;
}

// Sorted descending by severity, per the chart-domain "Compare
// Categories... sorted descending" guidance above. Kept short
// deliberately — this card is narrow (finalizing-tier grid, ~4 across),
// and the first pass ("Outdated TLS Configuration", "Weak Password
// Policy") truncated illegibly next to the RiskBadge's own width;
// confirmed visually before shortening, not guessed.
const FINDING_EXAMPLES: FindingExample[] = [
  { label: "SQL Injection", tier: "critical" },
  { label: "Outdated TLS", tier: "high" },
  { label: "Weak Passwords", tier: "medium" },
  { label: "Verbose Errors", tier: "low" },
];

export function CapabilityFindingsMark({ className }: { className?: string }) {
  return (
    <div
      className={
        "env-dark relative overflow-hidden rounded-2xl border border-border bg-background p-4 " +
        (className ?? "")
      }
      style={{ boxShadow: "0 12px 28px -10px color-mix(in srgb, var(--color-accent) 40%, transparent)" }}
    >
      <GlowEffect blur="medium" className="opacity-60" />
      <div className="relative flex items-center gap-2">
        <Icon icon={Target} size="sm" className="text-accent" />
        <Caption tone="muted" size="sm" className="font-data">
          Scan findings, ranked
        </Caption>
      </div>

      <div className="relative mt-4 flex flex-col gap-2.5">
        {FINDING_EXAMPLES.map((finding) => (
          <div key={finding.label} className="flex items-start justify-between gap-3">
            {/* Row 4 (D-026 fix): a fixed single-line `truncate` clipped
                illegibly on the two rows with the widest badge text
                ("Critical"/"Medium" leave less room than "High"/"Low") —
                confirmed visually, not assumed. Wrapping to two lines
                when needed reads better than an ellipsis mid-word in this
                narrow card; the card's height is already flexible
                (h-full flex column, not fixed), so a taller row here
                doesn't break anything. */}
            <Text size="sm" tone="primary" className="min-w-0">
              {finding.label}
            </Text>
            <RiskBadge tier={finding.tier} className="shrink-0" />
          </div>
        ))}
      </div>

      <Caption tone="muted" size="sm" className="relative mt-3">
        Illustrative example
      </Caption>
    </div>
  );
}
