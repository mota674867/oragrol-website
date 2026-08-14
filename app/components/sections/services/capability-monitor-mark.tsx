import { Radar } from "lucide-react";
import { Caption, Icon, Text } from "../../ui";
import { GlowEffect } from "./glow-effect";

/**
 * CapabilityMonitorMark — Round 8 prototype, Capability 05 (Managed
 * Security Services / 24/7 MDR) ONLY.
 *
 * Reasoning trail (tool findings -> design decision), stated before build
 * per instruction:
 *  - `ui-ux-pro-max --domain chart` ("real-time monitoring live activity
 *    feed alerts status") recommended a real-time/streaming visualization
 *    for this data type, but explicitly flagged flashing elements as an
 *    accessibility risk needing restraint ("provide pause button, high
 *    contrast"). Informs using a single, slow, subtle live-pulse
 *    (`motion-safe:animate-ping` around a static dot — Tailwind's
 *    built-in `motion-safe:` variant already respects
 *    `prefers-reduced-motion` via plain CSS, no client component/JS hook
 *    needed) rather than a literal streaming chart or ticker.
 *  - `mcp__21st__search` ("live activity feed alert log status indicator
 *    compact card dark") surfaced "Chrono Board" (its own description:
 *    "a concise activity timeline that surfaces recent system events...
 *    with clear status colors") as the closest real, current pattern —
 *    confirmed "a short list of recent, timestamped events with a live
 *    indicator" is the right shape for MDR content. Not imported directly
 *    (separate dependency tree, same reasoning as every prior round's
 *    research) — rebuilt with this codebase's own primitives.
 *  - This capability currently lives in `additional-capabilities.tsx`'s
 *    compact 4-column card grid (D-007's "finalizing, not live yet"
 *    tier), NOT a full `LiveServices` row. Deliberately kept in that
 *    format here — only the visual mark was asked to be redesigned, not
 *    the page architecture/CTA/copy-depth that distinguishes "live" rows
 *    from "finalizing" cards. Flagged explicitly for Mohammad in case he
 *    meant to promote this capability to a full row instead.
 *
 * Content governance: the two example alert rows are illustrative,
 * generic, non-client-specific placeholder events — explicitly labeled,
 * not real Oragrol monitoring data (same category as D-022's training
 * figures: a new illustrative value with no existing precedent to reuse).
 */

interface AlertExample {
  time: string;
  event: string;
}

const ALERT_EXAMPLES: AlertExample[] = [
  { time: "2m ago", event: "Suspicious login blocked" },
  { time: "14m ago", event: "Anomaly investigated & resolved" },
];

export function CapabilityMonitorMark({ className }: { className?: string }) {
  return (
    <div
      className={
        "env-dark relative overflow-hidden rounded-2xl border border-border bg-background p-4 " +
        (className ?? "")
      }
      style={{ boxShadow: "0 12px 28px -10px color-mix(in srgb, var(--color-accent) 40%, transparent)" }}
    >
      <GlowEffect blur="medium" className="opacity-60" />
      <div className="relative flex items-center gap-2">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <Caption tone="muted" size="sm" className="font-data">
          24/7 monitoring — live
        </Caption>
        <Icon icon={Radar} size="sm" className="ml-auto text-accent" />
      </div>

      <div className="relative mt-4 flex flex-col gap-2.5">
        {ALERT_EXAMPLES.map((alert) => (
          <div key={alert.event} className="flex items-baseline justify-between gap-3">
            <Text size="sm" tone="primary">
              {alert.event}
            </Text>
            <span className="shrink-0 font-data text-[10px] text-text-muted">{alert.time}</span>
          </div>
        ))}
      </div>

      <Caption tone="muted" size="sm" className="relative mt-3">
        Illustrative example
      </Caption>
    </div>
  );
}
