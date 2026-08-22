import { OragrolRing } from "../../brand/oragrol-ring";

/**
 * C01 pilot — bespoke visual objects, one per service (Services Visual
 * Direction brief, section 7: "replace generic dashboard mockups with
 * cybersecurity intelligence visualizations specific to each service").
 * Scoped to C01 only (`c01-showcase.tsx` is the only caller) — every
 * other category keeps its existing `ServiceCategoryRow`/
 * `ServiceCardPremium` treatment untouched, so nothing here can affect
 * C02-C10 or Business Automation's 5 categories.
 *
 * All 4 are plain inline SVG built from the site's own semantic tokens
 * (`var(--color-*)`), the same convention every other bespoke illustration
 * in this codebase already uses (schematic-visual.tsx, network-visual.tsx,
 * the capability-*-mark.tsx family) — no new colors, no image assets, no
 * new dependency. Each uses Burnt Orange in exactly ONE place (brief
 * section 11: "the orange should attract attention because it is rare") —
 * everything else is Warm Off-White / Steel Gray / Border, so the 4
 * visuals read as a family (same restrained language) while each
 * communicates a genuinely different idea, not a recolored copy of the
 * others:
 *
 *  - RiskTopologyVisual (S01, Risk Check): loose layered node cluster,
 *    ONE node lit orange — "the risk that actually matters, found among
 *    the rest."
 *  - ComplianceFrameworkVisual (S02, Compliance Ready): a linear
 *    checkpoint pathway, checkpoints filled in sequence up to the current
 *    one (orange) — "how close you are," not just a static checklist.
 *  - PolicyStructureVisual (S03, Policy Guard): a governance tree, root
 *    to branches — the orange lives on the connecting lines (documented,
 *    active control relationships), not on any single node.
 *  - CisoVantageVisual (S04, Virtual CISO): the one place this pilot uses
 *    OR Boy's ring (brief section 8's own suggestion — leadership/
 *    vantage-point nature, used exactly once across the pilot, not as a
 *    mascot) as a literal vantage point overlooking a small field of
 *    small dots (the org being overseen).
 */

const NEUTRAL = "var(--color-text-secondary)";
const FAINT = "var(--color-border)";
const BRIGHT = "var(--color-text-primary)";
const ACCENT = "var(--color-accent)";

export function RiskTopologyVisual({ className }: { className?: string }) {
  // 3 loose "layers" of nodes (front/mid/back), connected by thin lines —
  // an organizational risk topology, not a literal org chart. The single
  // front-most node (the one prioritized risk) is the only accent point;
  // a soft radial glow sits under it, echoing the reference's restrained
  // under-lighting rather than a flat glowing dot.
  return (
    <svg viewBox="0 0 400 320" className={className} role="presentation" aria-hidden="true">
      <defs>
        <radialGradient id="riskGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* connecting lines, back-to-front */}
      <g stroke={FAINT} strokeWidth="1.25" fill="none">
        <path d="M100 70 L200 140" />
        <path d="M260 60 L200 140" />
        <path d="M320 110 L200 140" />
        <path d="M200 140 L120 210" />
        <path d="M200 140 L230 220" />
        <path d="M120 210 L150 270" />
        <path d="M230 220 L150 270" />
      </g>
      {/* back layer */}
      <circle cx="100" cy="70" r="7" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
      <circle cx="260" cy="60" r="6" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
      <circle cx="320" cy="110" r="8" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
      {/* mid layer */}
      <circle cx="200" cy="140" r="10" fill="none" stroke={BRIGHT} strokeWidth="1.5" />
      {/* front layer */}
      <circle cx="120" cy="210" r="7" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
      <circle cx="230" cy="220" r="7" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
      {/* the one prioritized risk */}
      <circle cx="150" cy="270" r="34" fill="url(#riskGlow)" />
      <circle cx="150" cy="270" r="11" fill={ACCENT} />
      <circle cx="150" cy="270" r="16" fill="none" stroke={ACCENT} strokeWidth="1.25" opacity="0.5" />
    </svg>
  );
}

export function ComplianceFrameworkVisual({ className }: { className?: string }) {
  // A left-to-right checkpoint pathway — 5 checkpoints, the first 3
  // "closed" (filled, met), the 4th the current one (accent ring, the
  // "how close you are" moment), the 5th still open (outline only). A
  // straight connecting line underneath reads as the framework/path
  // itself, not a generic progress bar.
  const points = [40, 130, 220, 310, 390];
  const y = 160;
  return (
    <svg viewBox="0 0 430 260" className={className} role="presentation" aria-hidden="true">
      <line x1={points[0]} y1={y} x2={points[4]} y2={y} stroke={FAINT} strokeWidth="1.5" />
      {points.slice(0, 3).map((x) => (
        <circle key={x} cx={x} cy={y} r="9" fill={BRIGHT} />
      ))}
      {/* current checkpoint */}
      <circle cx={points[3]} cy={y} r="16" fill="none" stroke={ACCENT} strokeWidth="1.5" />
      <circle cx={points[3]} cy={y} r="9" fill={ACCENT} />
      {/* still open */}
      <circle cx={points[4]} cy={y} r="9" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
      {/* checkpoint labels — small vertical ticks above each, reading as a
          structured framework rather than a bare progress dial */}
      {points.map((x, i) => (
        <line key={x} x1={x} y1={y - 34} x2={x} y2={y - 20} stroke={i === 3 ? ACCENT : FAINT} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export function PolicyStructureVisual({ className }: { className?: string }) {
  // A governance tree: one root (the policy set as a whole) branching
  // into 4 documented areas. The orange lives on the branch LINES, not a
  // node — "documented, followed control relationships" as an active
  // structure, not a single highlighted document.
  const root = { x: 200, y: 40 };
  const children = [
    { x: 60, y: 200 },
    { x: 150, y: 230 },
    { x: 250, y: 230 },
    { x: 340, y: 200 },
  ];
  return (
    <svg viewBox="0 0 400 260" className={className} role="presentation" aria-hidden="true">
      <g stroke={ACCENT} strokeWidth="1.25" opacity="0.7" fill="none">
        {children.map((c) => (
          <path key={c.x} d={`M${root.x} ${root.y} C ${root.x} ${(root.y + c.y) / 2}, ${c.x} ${(root.y + c.y) / 2}, ${c.x} ${c.y}`} />
        ))}
      </g>
      <circle cx={root.x} cy={root.y} r="12" fill={BRIGHT} />
      {children.map((c) => (
        <circle key={c.x} cx={c.x} cy={c.y} r="8" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export function CisoVantageVisual({ className }: { className?: string }) {
  // The one OR-ring appearance in this pilot (brief section 8) — a large
  // ring as a literal vantage point, overlooking a small scattered field
  // of dots beneath it (the organization being overseen from a strategic
  // level, not operational). The ring itself is already accent-colored by
  // its own default (OragrolRing) — nothing else here uses orange, so the
  // ring stays the singular highlight. Two plain layered elements (a dots
  // SVG behind, the ring's own standalone SVG in front) rather than
  // nesting one SVG inside another via `foreignObject` — simpler and
  // avoids that combination's cross-browser fragility for no real gain.
  const dots = [
    [40, 210], [90, 230], [140, 205], [190, 235], [240, 200],
    [70, 250], [160, 255], [220, 245], [280, 220], [300, 250],
  ];
  return (
    <div className={`relative ${className ?? ""}`}>
      <svg viewBox="0 0 340 300" className="h-full w-full" role="presentation" aria-hidden="true">
        <g fill={NEUTRAL} opacity="0.6">
          {dots.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" />
          ))}
        </g>
      </svg>
      <div className="absolute left-1/2 top-0 -translate-x-1/2" aria-hidden="true">
        <OragrolRing size={200} />
      </div>
    </div>
  );
}
