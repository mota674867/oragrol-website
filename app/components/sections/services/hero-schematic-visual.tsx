/**
 * HeroSchematicVisual — enlarged variant of SchematicVisual for the
 * Services Design Correction prototype (SERVICES_REDESIGN_PROMPT.md,
 * requirement #1 "Scale" / #3 "hero-scale illustration"). Same hub +
 * orthogonal-connector grammar as the shipped SchematicVisual (D-012) —
 * not a different visual language, just built to function as this row's
 * primary focal point instead of a supporting mark beside the text: bigger
 * hub, thicker connector strokes, an added SVG-blurred rim behind the hub
 * for a second, harder-edged glow layer underneath GlowEffect's softer
 * atmospheric one (composed by the caller, same as SchematicVisual).
 *
 * Left as a separate component rather than resizing SchematicVisual itself
 * — SchematicVisual is shipped/live (D-012); this is an unreviewed
 * prototype and shouldn't touch what's already approved.
 *
 * Same `var(--surface)`/`var(--border)` (not `var(--color-surface)`/
 * `var(--color-border)`) token usage as SchematicVisual, per the D-011
 * fix — correctly resolves dark when nested in an `.env-dark` panel.
 *
 * Pure decoration: aria-hidden, no text content.
 */

const HUB = { cx: 210, cy: 175, r: 62 };
const NODE_A = { cx: 70, cy: 72, r: 8 };
const NODE_B = { cx: 350, cy: 72, r: 8 };
const NODE_C = { cx: 210, cy: 300, r: 8 };

export function HeroSchematicVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 340" aria-hidden="true" className={className}>
      <defs>
        <pattern id="hero-schematic-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="var(--border)" />
        </pattern>
        <filter id="hero-hub-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <rect x="0" y="0" width="420" height="340" fill="url(#hero-schematic-grid)" opacity={0.5} />

      {/* Hard-edged rim glow behind the hub — SVG-blurred, distinct from
          GlowEffect's separate softer atmospheric layer composed by the
          caller. */}
      <circle
        cx={HUB.cx}
        cy={HUB.cy}
        r={HUB.r + 10}
        fill="var(--color-accent)"
        opacity={0.35}
        filter="url(#hero-hub-glow)"
      />

      {/* Connector traces */}
      <path
        d={`M${NODE_A.cx},${NODE_A.cy} V${HUB.cy} H${HUB.cx - HUB.r}`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-accent) 55%, var(--border))"
        strokeWidth={2.5}
      />
      <path
        d={`M${NODE_B.cx},${NODE_B.cy} V${HUB.cy} H${HUB.cx + HUB.r}`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-accent) 55%, var(--border))"
        strokeWidth={2.5}
      />
      <path
        d={`M${NODE_C.cx},${NODE_C.cy} V${HUB.cy + HUB.r}`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-accent) 55%, var(--border))"
        strokeWidth={2.5}
      />

      {[NODE_A, NODE_B, NODE_C].map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="color-mix(in srgb, var(--color-accent) 75%, var(--surface))"
          stroke="var(--color-accent-light)"
          strokeWidth={1.5}
        />
      ))}

      <circle
        cx={HUB.cx}
        cy={HUB.cy}
        r={HUB.r}
        fill="color-mix(in srgb, var(--color-accent) 16%, var(--surface))"
        stroke="var(--color-accent-light)"
        strokeWidth={2}
      />
      <circle cx={HUB.cx} cy={HUB.cy} r={HUB.r - 12} fill="none" stroke="var(--border)" strokeWidth={1} />
    </svg>
  );
}
