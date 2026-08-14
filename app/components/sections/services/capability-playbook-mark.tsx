import { Caption, cn, Text } from "../../ui";
import { GlowEffect } from "./glow-effect";

/**
 * CapabilityPlaybookMark — Round 11 prototype, Capability 08 (Incident
 * Response) ONLY — the last of the 8.
 *
 * Reasoning trail (tool findings -> design decision), stated before build
 * per instruction:
 *  - `ui-ux-pro-max --domain chart` ("process sequence steps playbook
 *    stages workflow") returned Process Map/Sankey — both flagged with
 *    real accessibility caveats ("complex graphs hard to navigate,"
 *    "poor, provide a table alternative") and built for many-node/many-
 *    path data, not a simple 4-step linear plan. Not used. The UX-domain
 *    search ("step sequence timeline stages process indicator")
 *    confirmed the simpler, right-sized pattern instead: a numbered step
 *    sequence ("Step 2 of 4"-style indicator).
 *  - `mcp__21st__search` ("incident response playbook timeline stages
 *    process steps card dark") surfaced "How It Works" and "How We Do It
 *    — Process Overview" — both real, current "connected step cards"
 *    patterns for exactly this shape (a short sequence of phases) —
 *    confirmed a connected/numbered step sequence is the right, current
 *    pattern; not imported directly (separate dependency tree, same
 *    reasoning as every prior round), rebuilt with this codebase's own
 *    primitives, reusing the "connecting spine between steps" TECHNIQUE
 *    Cyber Health's `Flow` component already established on this site
 *    (same idea, different scale/context — a 4-step compact card here vs.
 *    Cyber Health's full 7-step page section).
 *  - Genuinely the 5th distinct mechanic among the capabilities addressed
 *    (not a ring: 02/04; not a feed: 05; not a ranked list: 06; not a
 *    grid: 07) — a connected linear sequence, which is what "a clear,
 *    practiced PLAN" (the row's own copy) actually calls for.
 *  - Deliberately did NOT show one phase as "in progress"/"active": an
 *    early draft considered it, but showing a live "currently
 *    responding" state on a marketing page risks reading as an actual,
 *    ongoing incident rather than an illustrative plan overview —
 *    flagged and dropped before building, not caught after. All four
 *    phases render as an equal-weight static sequence instead.
 *  - Same shared-grid context as 05-07 (D-007 finalizing tier, not a full
 *    row). Checked the shared-layout risk before building: this mark's
 *    height is comparable to the fleet pictogram (07), not taller — no
 *    new grid change expected, confirmed via the in-context screenshot.
 *
 * Content governance: "Detect / Contain / Recover / Review" is a
 * generic, plain-language description of what incident response
 * conceptually involves — not a named framework/standard (e.g. not
 * citing NIST SP 800-61 by name) and not asserted as Oragrol's own
 * documented internal playbook, which isn't confirmed in any project
 * doc. Labeled "Illustrative example," same governance precedent as
 * every other capability's example content this round.
 */

const PHASES = ["Detect", "Contain", "Recover", "Review"];

export function CapabilityPlaybookMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "env-dark relative overflow-hidden rounded-2xl border border-border bg-background p-4",
        className,
      )}
      style={{ boxShadow: "0 12px 28px -10px color-mix(in srgb, var(--color-accent) 40%, transparent)" }}
    >
      <GlowEffect blur="medium" className="opacity-60" />
      <Caption tone="muted" size="sm" className="relative font-data">
        Response phases
      </Caption>

      <div className="relative mt-4 flex flex-col">
        {PHASES.map((phase, i) => {
          const isLast = i === PHASES.length - 1;
          return (
            <div key={phase} className="relative flex items-center gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[11px] top-6 h-[calc(100%-0.75rem)] w-px bg-border"
                />
              )}
              <span
                aria-hidden="true"
                className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/15 font-data text-[10px] font-medium text-accent"
              >
                {i + 1}
              </span>
              <Text size="sm" tone="primary">
                {phase}
              </Text>
            </div>
          );
        })}
      </div>

      <Caption tone="muted" size="sm" className="relative mt-1">
        Illustrative example
      </Caption>
    </div>
  );
}
