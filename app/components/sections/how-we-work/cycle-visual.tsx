import { Caption, Text } from "../../ui";
import { GlowEffect } from "../services/glow-effect";

/**
 * HowWeWorkCycleVisual — Step 8 prototype, primary hero visual.
 *
 * Reasoning trail (research -> design decision), stated before build per
 * instruction:
 *  - `ui-ux-pro-max --domain chart` ("cyclical process loop repeating
 *    cycle diagram stages") returned Sankey/Process Mining — both
 *    flagged with real accessibility caveats ("poor," "complex graphs
 *    hard to navigate") and built for many-node/many-path data, the same
 *    category of mismatch found and rejected in the Services round for
 *    Capability 08's playbook. Not used.
 *  - `mcp__21st__search` ("cyclical process loop diagram circular stages
 *    methodology hero dark") did not surface a literal closed-loop
 *    component — closest were "Animated Roadmap" (milestones on a
 *    straight/curved PATH, not a closed loop) and "How We Do It" (linear
 *    stage cards). Neither is actually cyclical, so neither was used as
 *    a base.
 *  - No external result matched "four nodes on a closed, directional
 *    loop" well enough to be worth adapting. Built natively instead,
 *    reusing this codebase's own established techniques rather than
 *    forcing a mismatched import: the polar-coordinate SVG math already
 *    proven in `GaugeVisual` (Cyber Health) and the node/connector
 *    language already proven in `HeroSchematicVisual`/`ServicesNetworkVisual`
 *    (Services) — both already-approved, site-native patterns for
 *    "hero-scale illustration in a nested dark, glow-lit panel."
 *  - Per Mohammad's explicit instruction: referenced Capability 08's
 *    connected-phase spine (Services) for the general SPIRIT of a
 *    connected mechanic (numbered nodes + a visible path between them),
 *    but built as a genuinely different shape here — a closed circular
 *    loop at hero scale, not a small linear vertical spine in a compact
 *    card. Capability 08's mechanic doesn't literally reuse; this is a
 *    new component, not an import of that file.
 *  - Motion: a single slow, subtle flowing-dash animation around the
 *    ring reinforces "this repeats" without becoming game-like (Step 18's
 *    own "smooth, controlled, premium... not game-like" rule) — respects
 *    `prefers-reduced-motion` via Tailwind's `motion-reduce:` variant
 *    (same mechanic used for Capability 05's live-pulse indicator); the
 *    static ring/arrows/labels remain fully legible with motion off.
 *
 * Content: stage labels and one-liners are the ALREADY-LOCKED copy from
 * `home/how-we-work.tsx` / `home/approach.tsx` (both approved, live) —
 * reused verbatim, not new or invented text. No other page copy
 * (headline, body, CTA context) is included here — that's pending the
 * actual page copy block, not yet supplied.
 */

const STAGES = [
  { n: "01", label: "Understand", copy: "Assess the business, environment and current security posture.", angle: 270 },
  { n: "02", label: "Prioritize", copy: "Separate critical risks from everything else.", angle: 0 },
  { n: "03", label: "Protect", copy: "Apply the right combination of services and expertise.", angle: 90 },
  { n: "04", label: "Improve", copy: "Continue strengthening security posture.", angle: 180 },
] as const;

const CX = 260;
const CY = 260;
const R = 190;
const NODE_R = 34;

function polar(angleDeg: number, radius: number = R): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

// One arc path per consecutive stage pair, closing the loop from the
// last stage (Improve, 180deg) back to the first (Understand, 270deg) —
// the literal "connects back" Mohammad asked for, not just implied by a
// closed circle underneath.
function arcPath(fromAngle: number, toAngle: number): string {
  const [x1, y1] = polar(fromAngle);
  const [x2, y2] = polar(toAngle);
  return `M ${x1},${y1} A ${R},${R} 0 0 1 ${x2},${y2}`;
}

const ARCS = STAGES.map((stage, i) => {
  const next = STAGES[(i + 1) % STAGES.length];
  return { id: `${stage.n}-${next.n}`, d: arcPath(stage.angle, next.angle) };
});

export function HowWeWorkCycleVisual({ className }: { className?: string }) {
  return (
    <div
      className={
        "group relative overflow-hidden rounded-3xl border border-border bg-background env-dark shadow-2xl shadow-depth/30 " +
        (className ?? "")
      }
    >
      <GlowEffect blur="strong" className="opacity-50" />
      <div className="relative flex flex-col items-center px-6 py-12 sm:px-10 sm:py-16">
        <svg viewBox="0 0 520 520" className="w-full max-w-lg" aria-hidden="true">
          <defs>
            <marker id="hww-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-accent)" />
            </marker>
          </defs>

          {/* static base ring — always visible, motion off or on */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-border)" strokeWidth={2} />

          {/* directional arcs, arrowhead at each segment's end — the
              visible "Improve -> Understand" segment is arcs[3] */}
          {ARCS.map((arc) => (
            <path
              key={arc.id}
              d={arc.d}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              strokeLinecap="round"
              markerEnd="url(#hww-arrow)"
              opacity={0.85}
            />
          ))}

          {/* slow flowing-dash accent reinforcing "this repeats" —
              motion-reduce disables it entirely, static ring/arcs above
              stay fully legible either way */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="14 60"
            opacity={0.6}
            className="motion-safe:animate-[spin_14s_linear_infinite] motion-reduce:hidden"
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />

          {STAGES.map((stage) => {
            const [x, y] = polar(stage.angle);
            return (
              <g key={stage.n}>
                <circle
                  cx={x}
                  cy={y}
                  r={NODE_R}
                  fill="var(--color-background)"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  className="transition-[stroke-width] duration-200 group-hover:stroke-[3]"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-data text-[15px] font-semibold"
                  fill="var(--color-accent)"
                >
                  {stage.n}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-10 grid w-full max-w-lg grid-cols-2 gap-x-8 gap-y-6">
          {STAGES.map((stage) => (
            <div key={stage.n}>
              <Caption tone="accent" size="sm" className="font-data">
                {stage.n}
              </Caption>
              {/* Plain <p>, not <Text>, for the stage label: `Text`'s own
                  base string already carries `font-body` — adding
                  `font-heading` via className would land two conflicting
                  font-family classes on one element via cn()'s plain
                  concatenation (the same documented gotcha D-016/D-019
                  hit before). Caught here before build, not after. */}
              <p className="mt-1 font-heading text-base font-semibold text-text-primary">{stage.label}</p>
              <Text size="sm" tone="secondary" className="mt-1">
                {stage.copy}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
