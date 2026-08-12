/**
 * GaugeVisual — Cyber Health's page-specific signature graphic (D-008).
 *
 * "Instrument-panel data visuals": a 4-segment 180° arc (a half-donut, not
 * a closed circle — closed rings are reserved for Home per D-008/the
 * existing "never invent a similar ring" rule) plus a needle, read as a
 * diagnostic dial rather than decoration. Segments use the risk-tier
 * tokens (--color-risk-critical/high/medium/low) — a legitimate functional
 * use per tokens.css's own rule ("never use them decoratively"), since
 * this gauge IS a risk-tier data visualization, not ornamentation.
 *
 * The needle position and the "78/Medium" figures shown alongside it are
 * the exact same illustrative example already approved on the Home
 * teaser (CyberHealth.tsx) — reused, not a new number invented. Segment
 * boundaries (four equal 45° arcs) are a visual-design choice for this
 * decorative gauge, not a claim about Oragrol's real scoring formula/
 * bands, which isn't confirmed anywhere in the project docs.
 *
 * Pure decoration: aria-hidden, no text content (the actual score/tier
 * are rendered as real text elsewhere, not baked into the SVG).
 */

const CX = 200;
const CY = 190;
const R_OUTER = 160;
const R_INNER = 108;
const NEEDLE_LENGTH = 140;
const NEEDLE_ANGLE_DEG = 60; // within the "Medium" segment (90°-45°), leaning toward "Low"

const SEGMENTS = [
  { start: 180, end: 135, color: "var(--color-risk-critical)" },
  { start: 135, end: 90, color: "var(--color-risk-high)" },
  { start: 90, end: 45, color: "var(--color-risk-medium)" },
  { start: 45, end: 0, color: "var(--color-risk-low)" },
] as const;

function polar(radius: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY - radius * Math.sin(rad)];
}

function segmentPath(startAngle: number, endAngle: number): string {
  const [x1, y1] = polar(R_OUTER, startAngle);
  const [x2, y2] = polar(R_OUTER, endAngle);
  const [x3, y3] = polar(R_INNER, endAngle);
  const [x4, y4] = polar(R_INNER, startAngle);
  const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
  return `M ${x1},${y1} A ${R_OUTER},${R_OUTER} 0 ${largeArc} 1 ${x2},${y2} L ${x3},${y3} A ${R_INNER},${R_INNER} 0 ${largeArc} 0 ${x4},${y4} Z`;
}

export function GaugeVisual({ className }: { className?: string }) {
  const [needleX, needleY] = polar(NEEDLE_LENGTH, NEEDLE_ANGLE_DEG);

  return (
    <svg viewBox="0 0 400 220" aria-hidden="true" className={className}>
      {SEGMENTS.map((seg) => (
        <path
          key={seg.start}
          d={segmentPath(seg.start, seg.end)}
          fill={seg.color}
          opacity={0.85}
          stroke="var(--color-background)"
          strokeWidth={2}
        />
      ))}
      <line
        x1={CX}
        y1={CY}
        x2={needleX}
        y2={needleY}
        stroke="var(--color-text-primary)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r={11} fill="var(--color-text-primary)" />
      <circle cx={CX} cy={CY} r={5} fill="var(--color-background)" />
    </svg>
  );
}
