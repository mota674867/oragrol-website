/**
 * SchematicVisual — Services' page-specific signature graphic (D-008,
 * Prototype 2 / blueprint E-2).
 *
 * "Systems/schematic linework": a central hub node with two inputs
 * converging from the top corners and a single output dropping from the
 * bottom — orthogonal (right-angle) connector traces, not curves, for a
 * blueprint/circuit-diagram read rather than an organic one. A faint dot
 * grid sits behind it, the way blueprint paper has a grid. The hub is
 * where each capability row's own Lucide icon sits (composed by the
 * caller as an absolutely-positioned HTML overlay at the hub's center —
 * this component stays pure SVG/decorative, same convention as
 * StrataVisual and GaugeVisual).
 *
 * Two inputs converging into one output is a deliberate, generic
 * abstraction of every row's own Challenge+What-We-Do -> Outcome shape,
 * without duplicating or inventing any of that row's actual copy inside
 * the SVG. Same composition for every row (this is the page-level motif,
 * applied uniformly — same pattern as Solutions' one strata / Cyber
 * Health's one gauge, not a different diagram per service).
 *
 * Fill/stroke reuse the established `color-mix(in srgb, var(--color-accent)
 * X%, ...))` technique from StrataVisual/Approach.tsx — but mixed against
 * `var(--surface)`/`var(--border)` (the raw semantic tokens), NOT
 * `var(--color-surface)`/`var(--color-border)` (the Tailwind `@theme
 * inline` names). Found while building this component: the `--color-*`
 * names don't reliably track a Section's per-environment override
 * (--surface/--border differ between Dark/White/Light-blue, see tokens.css
 * section 3) when read directly via `var()` outside Tailwind's own
 * utility-class generation — confirmed by computed-style inspection,
 * rendered as a solid-black hub on this White-environment page instead of
 * the intended light accent-tinted panel. StrataVisual/GaugeVisual never
 * hit this because both only ever render inside `environment="dark"`,
 * where Dark's values happen to equal the (buggy) fallback. `--accent`/
 * `--accent-light` are unaffected — they're constant across all three
 * environments by design, not repointed per-Section. Logged as D-011.
 *
 * Pure decoration: aria-hidden, no text content.
 *
 * See also `SchematicMark` below — the compact variant used by
 * AdditionalCapabilities' smaller cards.
 */

const HUB = { cx: 150, cy: 130, r: 42 };
const NODE_A = { cx: 54, cy: 58, r: 6 }; // input
const NODE_B = { cx: 246, cy: 58, r: 6 }; // input
const NODE_C = { cx: 150, cy: 214, r: 6 }; // output

export function SchematicVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 240" aria-hidden="true" className={className}>
      <defs>
        <pattern id="schematic-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--border)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="300" height="240" fill="url(#schematic-grid)" opacity={0.5} />

      {/* Connector traces — orthogonal routing, drawn under the nodes. */}
      <path
        d={`M${NODE_A.cx},${NODE_A.cy} V${HUB.cy} H${HUB.cx - HUB.r}`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-accent) 45%, var(--border))"
        strokeWidth={1.5}
      />
      <path
        d={`M${NODE_B.cx},${NODE_B.cy} V${HUB.cy} H${HUB.cx + HUB.r}`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-accent) 45%, var(--border))"
        strokeWidth={1.5}
      />
      <path
        d={`M${NODE_C.cx},${NODE_C.cy} V${HUB.cy + HUB.r}`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-accent) 45%, var(--border))"
        strokeWidth={1.5}
      />

      {/* Input/output nodes — small solid terminals. */}
      {[NODE_A, NODE_B, NODE_C].map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="color-mix(in srgb, var(--color-accent) 70%, var(--surface))"
          stroke="var(--color-accent)"
          strokeWidth={1}
        />
      ))}

      {/* Hub — the row's icon sits on top of this, composed by the caller. */}
      <circle
        cx={HUB.cx}
        cy={HUB.cy}
        r={HUB.r}
        fill="color-mix(in srgb, var(--color-accent) 12%, var(--surface))"
        stroke="var(--color-accent-light)"
        strokeWidth={1.5}
      />
      <circle cx={HUB.cx} cy={HUB.cy} r={HUB.r - 8} fill="none" stroke="var(--border)" strokeWidth={1} />
    </svg>
  );
}

/**
 * SchematicMark — compact variant of SchematicVisual for AdditionalCapabilities'
 * smaller cards (D-008/D-011 retrofit). Same hub + orthogonal-connector
 * language, reduced to a single pair of short corner ticks (no dot grid, no
 * third output node) — the full diagram doesn't fit a compact card's icon
 * slot proportionately. Icon overlay composed by the caller, same pattern
 * as SchematicVisual.
 */
const MARK_HUB = { cx: 32, cy: 34, r: 16 };

export function SchematicMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path
        d={`M8,8 V${MARK_HUB.cy} H${MARK_HUB.cx - MARK_HUB.r}`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-accent) 45%, var(--border))"
        strokeWidth={1.25}
      />
      <path
        d={`M56,8 V${MARK_HUB.cy} H${MARK_HUB.cx + MARK_HUB.r}`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-accent) 45%, var(--border))"
        strokeWidth={1.25}
      />
      <circle cx="8" cy="8" r="2.5" fill="color-mix(in srgb, var(--color-accent) 70%, var(--surface))" stroke="var(--color-accent)" strokeWidth={0.75} />
      <circle cx="56" cy="8" r="2.5" fill="color-mix(in srgb, var(--color-accent) 70%, var(--surface))" stroke="var(--color-accent)" strokeWidth={0.75} />
      <circle
        cx={MARK_HUB.cx}
        cy={MARK_HUB.cy}
        r={MARK_HUB.r}
        fill="color-mix(in srgb, var(--color-accent) 12%, var(--surface))"
        stroke="var(--color-accent-light)"
        strokeWidth={1}
      />
    </svg>
  );
}
