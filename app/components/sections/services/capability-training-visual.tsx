import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { Caption, DataText, Icon, Text } from "../../ui";
import { GlowEffect } from "./glow-effect";

/**
 * CapabilityTrainingVisual — Round 7 prototype, Capability 04 (Security
 * Awareness Training) ONLY.
 *
 * Context: Mohammad disapproved the dark-panel + dot-grid + glow-orb SHELL
 * itself for Capabilities 04-08 (not an icon-level swap like 02/03 — the
 * panel formula needs rethinking), with an explicit instruction that each
 * of the 5 gets a treatment suited to what it actually does, not one new
 * repeated formula in place of the old one.
 *
 * Reasoning trail (tool findings -> this decision), stated before build
 * per instruction:
 *  - `ui-ux-pro-max` --domain style ("modern B2B SaaS security marketing
 *    card panel 2025 bento") surfaced "Bento Grids"/"Bento Box Grid" (real,
 *    current, high-compatibility pattern: modular cells sized to their own
 *    content, not one repeated card shape) and "Dimensional Layering"
 *    (elevation via shadow, floating cards) as the two current,
 *    well-supported options here — WCAG AA, "Excellent" performance, high
 *    Tailwind compatibility. Explicitly did NOT reach for "Glassmorphism"
 *    or "Cyberpunk UI" (also returned): glassmorphism was already flagged
 *    a contrast/performance risk in an earlier round's search this same
 *    session, and cyberpunk (neon green/magenta, glitch, scanlines,
 *    "Accessibility: Limited") reads as gamer/hobbyist, not enterprise
 *    B2B security — neither fits "premium, restrained, professional."
 *  - `mcp__21st__search` ("training progress completion checklist card
 *    team people") surfaced real, current dashboard components built
 *    around exactly this content shape: `ProjectProgressCard` (milestone
 *    timeline, completed vs. pending states), `Onboarding Checklist`
 *    (checklist + status), `Skills Progress Dashboard` (compact
 *    completion bars). None were imported wholesale (each pulls in a
 *    separate shadcn/Framer Motion dependency tree not present in this
 *    codebase, the same reason D-021's research didn't import 21st code
 *    directly either) — used as confirmation that "module checklist +
 *    overall completion indicator" is a real, current pattern for
 *    training content, then rebuilt with this codebase's own primitives.
 *  - Bell Business's own service-panel structure was re-checked
 *    (`business.bell.ca/.../professional-services`) and turns out to be
 *    genuinely flat — title + one-line description, no visual variety,
 *    no dashboard elements, hierarchy from indentation/grouping only, not
 *    per-card styling. So Bell is NOT the source for "vary the visual per
 *    capability" here (that's Mohammad's own direction) — it's used only
 *    for its actual pattern: consistent spacing discipline and clear
 *    content hierarchy, same "structure only, not visual skin" precedent
 *    already applied when Bell informed the sidebar/footer.
 *  - Decision: the panel FORMULA changes (checklist + a single completion
 *    ring in place of the orb's node-diagram + icon-badge + ghost
 *    numeral), varying meaningfully from both the orb (01/03) and the
 *    score-gauge card (02/D-021) — a genuinely different composition, not
 *    a third repeated shape. The outer dark elevated-card CONTAINER
 *    (rounded corners, border, shadow-accent, `GlowEffect`) is kept as
 *    the one through-line device across all 8 rows — a page with 8
 *    completely unrelated card containers would read as inconsistent
 *    rather than premium, and "Dimensional Layering"'s own guidance is
 *    elevation/shadow as the depth device, which this already uses. This
 *    is a judgment call, not asserted as the only right one — flagged
 *    for Mohammad to confirm or override specifically.
 *
 * Content governance: no real Oragrol training-completion data exists in
 * any project doc. The 84% figure and the four module names below are
 * NEW illustrative values (not reused from an existing approved example —
 * there's no training-completion precedent to reuse, unlike Capability
 * 02's score card, which reused Cyber Health's already-approved 78/100).
 * Explicitly labeled illustrative; module names are generic, universally-
 * recognized security-awareness topics, not Oragrol-specific curriculum.
 */

type ModuleStatus = "complete" | "in-progress" | "pending";

interface TrainingModule {
  label: string;
  status: ModuleStatus;
}

const TRAINING_MODULES: TrainingModule[] = [
  { label: "Phishing Recognition", status: "complete" },
  { label: "Password Hygiene", status: "complete" },
  { label: "Data Handling", status: "in-progress" },
  { label: "Incident Reporting", status: "pending" },
];

const COMPLETION_PERCENT = 84;

const statusIcon: Record<ModuleStatus, typeof CheckCircle2> = {
  complete: CheckCircle2,
  "in-progress": CircleDot,
  pending: Circle,
};

const statusColorClass: Record<ModuleStatus, string> = {
  complete: "text-accent",
  "in-progress": "text-accent/70",
  pending: "text-text-muted",
};

const RING_RADIUS = 54;
const RING_STROKE = 10;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function CompletionRing({ percent }: { percent: number }) {
  const offset = RING_CIRCUMFERENCE * (1 - percent / 100);
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 140 140" className="h-32 w-32 -rotate-90" aria-hidden="true">
        <circle cx="70" cy="70" r={RING_RADIUS} fill="none" stroke="var(--color-border)" strokeWidth={RING_STROKE} />
        <circle
          cx="70"
          cy="70"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={RING_STROKE}
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <DataText size="lg" tone="accent">
          {percent}%
        </DataText>
      </div>
    </div>
  );
}

export function CapabilityTrainingVisual({ className }: { className?: string }) {
  return (
    <div
      className={
        "group relative overflow-hidden rounded-3xl border border-border bg-background " +
        "env-dark shadow-2xl shadow-accent/30 " +
        "transition-[box-shadow,border-color,transform] duration-200 " +
        "hover:-translate-y-1 hover:border-accent/40 hover:shadow-accent/50 " +
        (className ?? "")
      }
    >
      <GlowEffect blur="strong" className="opacity-50" />
      <div className="relative p-6 sm:p-8">
        <Caption tone="muted" size="sm" className="font-data">
          Training program status
        </Caption>

        <div className="mt-6 flex items-center gap-6">
          <CompletionRing percent={COMPLETION_PERCENT} />
          <div>
            <Text size="sm" tone="secondary">
              Team completion, example org
            </Text>
            <Caption tone="muted" size="sm" className="mt-1">
              Illustrative example — not a real result
            </Caption>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
          {TRAINING_MODULES.map((mod) => (
            <div key={mod.label} className="flex items-center gap-3">
              <Icon icon={statusIcon[mod.status]} size="sm" className={statusColorClass[mod.status]} />
              <Text size="sm" tone={mod.status === "pending" ? "muted" : "primary"}>
                {mod.label}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
