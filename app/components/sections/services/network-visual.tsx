/**
 * ServicesNetworkVisual — Services' hero-scale signature illustration
 * (D-008 / D-015, the page's first real hero visual — previously text-
 * only, see hero.tsx history). Deliberately a different composition from
 * CapabilitySpotlightVisual's per-row hub-and-3-node diagram, not a
 * bigger copy of it: 8 nodes — one per capability, matching the H1's own
 * "Eight capabilities" count (a real number already on the page, not
 * invented) — arranged in a dome arc, each a straight converging line
 * into one central hub below, literalizing "one coordinated approach."
 * Same dark/glow/accent material as the rest of the page (color-mix
 * accent fills, rim-lit strokes) — same `var(--surface)`/`var(--border)`
 * token usage as CapabilitySpotlightVisual/HeroSchematicVisual (D-011
 * fix: not `var(--color-surface)`/`var(--color-border)`).
 *
 * Pure decoration: aria-hidden, no text content.
 */

const HUB = { cx: 300, cy: 250, r: 30 };
const NODES = [
  { x: 40, y: 170 },
  { x: 108, y: 128 },
  { x: 176, y: 94 },
  { x: 244, y: 72 },
  { x: 356, y: 72 },
  { x: 424, y: 94 },
  { x: 492, y: 128 },
  { x: 560, y: 170 },
];

export function ServicesNetworkVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 300" aria-hidden="true" className={className}>
      <defs>
        <filter id="services-hub-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <circle
        cx={HUB.cx}
        cy={HUB.cy}
        r={HUB.r + 14}
        fill="var(--color-accent)"
        opacity={0.35}
        filter="url(#services-hub-glow)"
      />

      {NODES.map((n, i) => (
        <line
          key={i}
          x1={n.x}
          y1={n.y}
          x2={HUB.cx}
          y2={HUB.cy}
          stroke="color-mix(in srgb, var(--color-accent) 40%, var(--border))"
          strokeWidth={1.5}
        />
      ))}

      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={7}
          fill="color-mix(in srgb, var(--color-accent) 75%, var(--surface))"
          stroke="var(--color-accent-light)"
          strokeWidth={1.5}
        />
      ))}

      <circle
        cx={HUB.cx}
        cy={HUB.cy}
        r={HUB.r}
        fill="color-mix(in srgb, var(--color-accent) 22%, var(--surface))"
        stroke="var(--color-accent-light)"
        strokeWidth={2}
      />
      <circle cx={HUB.cx} cy={HUB.cy} r={HUB.r - 10} fill="none" stroke="var(--border)" strokeWidth={1} />
    </svg>
  );
}
