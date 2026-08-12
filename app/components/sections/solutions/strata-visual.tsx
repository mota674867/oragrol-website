/**
 * StrataVisual — Solutions' page-specific signature graphic (D-008).
 *
 * "Ascending stacked planes/strata": 3 isometric blocks, each offset
 * up-and-right from the last with genuine overlap — step 2 sits partly
 * in front of step 1, step 3 partly in front of step 2 — rather than 3
 * flat rectangles lined up side by side. Each block is drawn as a top
 * diamond face + two shaded side faces (standard isometric-tile
 * construction: a rhombus top, extruded downward by the block's own
 * height), so it reads as a solid terraced plate viewed at an angle, not
 * a bar chart. Height and accent intensity both increase per level,
 * reinforcing "escalating protection depth" spatially.
 *
 * Deliberately NOT a path/route line (reserved for How We Work, D-008)
 * and NOT a closed ring (reserved for Home). Fill progression reuses the
 * `color-mix(in srgb, var(--color-accent) X%, ...)` technique already
 * established in Approach.tsx — side faces get a lower percentage than
 * the top face per block, faking a lit-top/shadowed-side look. The top
 * rim highlight uses `--color-accent-light` (the locked "Light tint"
 * #97CADB token).
 *
 * Pure decoration: aria-hidden, no text content.
 */

// One shared isometric tile unit: top face is a rhombus TILE_WIDTH wide,
// TILE_HALF_HEIGHT*2 tall at its two side points. Side faces extrude
// straight down from the rhombus's left/right edges by the block's own
// height.
const TILE_WIDTH = 120;
const TILE_HALF_HEIGHT = 20;

interface StepConfig {
  /** Left-x of the tile's top diamond. */
  anchorX: number;
  /** Top-y of the tile's top diamond (its highest point). */
  anchorY: number;
  /** How far the side faces extrude downward — the block's "riser". */
  height: number;
}

// Each step offsets +70x/-55y from the previous: TILE_WIDTH is 120, so a
// 70px x-shift leaves ~58% of the next block covering the previous one
// (clear overlap, not a full eclipse) while still rising up the frame.
const STEPS: StepConfig[] = [
  { anchorX: 60, anchorY: 230, height: 55 },
  { anchorX: 130, anchorY: 175, height: 90 },
  { anchorX: 200, anchorY: 120, height: 135 },
];

function points(pairs: Array<[number, number]>): string {
  return pairs.map(([x, y]) => `${x},${y}`).join(" ");
}

function topFace(ax: number, ay: number): string {
  const h = TILE_HALF_HEIGHT;
  return points([
    [ax + TILE_WIDTH / 2, ay],
    [ax + TILE_WIDTH, ay + h],
    [ax + TILE_WIDTH / 2, ay + h * 2],
    [ax, ay + h],
  ]);
}

function leftFace(ax: number, ay: number, height: number): string {
  const h = TILE_HALF_HEIGHT;
  return points([
    [ax, ay + h],
    [ax + TILE_WIDTH / 2, ay + h * 2],
    [ax + TILE_WIDTH / 2, ay + h * 2 + height],
    [ax, ay + h + height],
  ]);
}

function rightFace(ax: number, ay: number, height: number): string {
  const h = TILE_HALF_HEIGHT;
  return points([
    [ax + TILE_WIDTH / 2, ay + h * 2],
    [ax + TILE_WIDTH, ay + h],
    [ax + TILE_WIDTH, ay + h + height],
    [ax + TILE_WIDTH / 2, ay + h * 2 + height],
  ]);
}

export function StrataVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="20 80 340 285"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMax meet"
    >
      {STEPS.map((step, i) => {
        const level = i + 1;
        const topOpacity = 20 + level * 12; // 32 / 44 / 56 — lit top face
        const leftOpacity = 14 + level * 10; // 24 / 34 / 44 — shadowed side
        const rightOpacity = 8 + level * 8; // 16 / 24 / 32 — darkest side
        const rimOpacity = 0.3 + level * 0.2; // 0.5 / 0.7 / 0.9
        return (
          <g key={level}>
            <polygon
              points={leftFace(step.anchorX, step.anchorY, step.height)}
              fill={`color-mix(in srgb, var(--color-accent) ${leftOpacity}%, var(--color-surface))`}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeLinejoin="round"
            />
            <polygon
              points={rightFace(step.anchorX, step.anchorY, step.height)}
              fill={`color-mix(in srgb, var(--color-accent) ${rightOpacity}%, var(--color-surface))`}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeLinejoin="round"
            />
            <polygon
              points={topFace(step.anchorX, step.anchorY)}
              fill={`color-mix(in srgb, var(--color-accent) ${topOpacity}%, var(--color-surface))`}
              stroke="var(--color-accent-light)"
              strokeOpacity={rimOpacity}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
}
