import { Laptop, Monitor, Server, Smartphone } from "lucide-react";
import { Caption, DataText, Icon } from "../../ui";
import { GlowEffect } from "./glow-effect";

/**
 * CapabilityFleetMark — Round 10 prototype, Capability 07 (Endpoint
 * Protection / EDR) ONLY.
 *
 * Reasoning trail (tool findings -> design decision), stated before build
 * per instruction:
 *  - `ui-ux-pro-max --domain chart` ("device fleet inventory coverage
 *    protected status count") returned no direct match, so broadened to
 *    the underlying data shape instead ("part to whole coverage
 *    percentage protected total"): surfaced Waffle Chart/Pictogram —
 *    "a grid of units, a subset colored differently for the proportion" —
 *    explicitly flagged as MORE accessible than a pie/donut for this kind
 *    of part-to-whole data. Endpoints are literally discrete, countable
 *    units (devices), so a small grid of device icons — most in the
 *    protected state, one or two not yet — is a direct, literal
 *    pictogram of "coverage across a fleet," not an abstract stand-in.
 *  - `mcp__21st__search` ("device fleet inventory status list endpoint
 *    protected coverage card dark") didn't surface a device-specific
 *    match, but "Card Status List" ("a dynamic list of status-driven
 *    cards... animated status indicators") confirmed the general pattern
 *    of per-item status-differentiated cells, applied here as the
 *    pictogram's individual device cells rather than imported directly.
 *  - Deliberately a new mechanic among the capabilities shipped/
 *    prototyped so far: not a score+ring (Capability 02/04 already use a
 *    ring), not a timestamped feed (05), not a ranked severity list (06)
 *    — a grid of discrete units is a genuinely different shape, and maps
 *    directly onto this capability's own copy ("protection... across
 *    every device on your network").
 *  - Same shared-grid context as 05/06 (D-007 finalizing tier, not a full
 *    row). The `items-start` grid fix (D-025) already covers this too.
 *
 * Content governance: "9 of 10 protected" and the device mix are new
 * illustrative values — a plausible, generic small-fleet example, not a
 * real Oragrol client's device count (none exists in any project doc).
 * Explicitly labeled illustrative.
 */

const TOTAL_DEVICES = 10;
const PROTECTED_COUNT = 9;

// Cycled for visual variety across device types ("every device" — not
// all laptops) — not meant to represent a specific real fleet
// composition, purely decorative variety within the pictogram cells.
const DEVICE_ICONS = [Laptop, Monitor, Smartphone, Server, Laptop, Monitor, Smartphone, Server, Laptop, Monitor];

export function CapabilityFleetMark({ className }: { className?: string }) {
  return (
    <div
      className={
        "env-dark relative overflow-hidden rounded-2xl border border-border bg-background p-4 " +
        (className ?? "")
      }
      style={{ boxShadow: "0 12px 28px -10px color-mix(in srgb, var(--color-accent) 40%, transparent)" }}
    >
      <GlowEffect blur="medium" className="opacity-60" />
      <div className="relative flex items-center justify-between gap-2">
        <Caption tone="muted" size="sm" className="font-data">
          Endpoint coverage
        </Caption>
        <div className="flex items-baseline gap-1">
          <DataText size="md" tone="accent">
            {PROTECTED_COUNT}
          </DataText>
          <DataText size="sm" tone="muted">
            /{TOTAL_DEVICES}
          </DataText>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-5 gap-2">
        {DEVICE_ICONS.map((DeviceIcon, i) => {
          const protected_ = i < PROTECTED_COUNT;
          return (
            <div
              key={i}
              className={
                "flex aspect-square items-center justify-center rounded-lg border " +
                (protected_ ? "border-accent/40 bg-accent/15 text-accent" : "border-border bg-surface text-text-muted")
              }
            >
              <Icon icon={DeviceIcon} size="sm" />
            </div>
          );
        })}
      </div>

      <Caption tone="muted" size="sm" className="relative mt-3">
        Illustrative example
      </Caption>
    </div>
  );
}
