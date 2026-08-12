/**
 * StrataVisual — Solutions' page-specific signature graphic (D-008).
 *
 * "Ascending stacked planes/strata": 3 plates sharing a common baseline,
 * each taller and more accent-saturated than the last, echoing "3 levels,
 * clear progression" spatially instead of only through card labels.
 * Deliberately NOT a path/route line (that motif is reserved for How We
 * Work, D-008) and NOT a closed ring (reserved for Home) — pure stacked
 * geometry only.
 *
 * Fill progression uses the same `color-mix(in srgb, var(--color-accent)
 * X%, ...)` technique already established in Approach.tsx, not a new
 * pattern. The cap highlight is the first use of `--color-accent-light`
 * (the locked "Light tint" #97CADB token) anywhere in the codebase — it's
 * wired into tokens.css but was otherwise unused.
 *
 * Pure decoration: aria-hidden, no text content.
 */
const PLATES = [
  { x: 80, width: 140, height: 90 },
  { x: 260, width: 140, height: 150 },
  { x: 440, width: 140, height: 210 },
] as const;

const BASELINE = 280;

export function StrataVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 320"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMax meet"
    >
      {PLATES.map((plate, i) => {
        const level = i + 1;
        const topY = BASELINE - plate.height;
        const bodyOpacity = 18 + level * 10; // 28 / 38 / 48
        const borderOpacity = 25 + level * 15; // 40 / 55 / 70
        const capOpacity = 0.25 + level * 0.2; // 0.45 / 0.65 / 0.85
        return (
          <g key={level}>
            <rect
              x={plate.x}
              y={topY}
              width={plate.width}
              height={plate.height}
              rx={10}
              fill={`color-mix(in srgb, var(--color-accent) ${bodyOpacity}%, var(--color-surface))`}
              stroke={`color-mix(in srgb, var(--color-accent) ${borderOpacity}%, var(--color-border))`}
              strokeWidth={1}
            />
            <rect
              x={plate.x}
              y={topY}
              width={plate.width}
              height={6}
              rx={3}
              fill="var(--color-accent-light)"
              opacity={capOpacity}
            />
          </g>
        );
      })}
    </svg>
  );
}
