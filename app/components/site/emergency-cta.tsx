import { PhoneCall } from "lucide-react";
import { Icon } from "../ui";

/**
 * EmergencyCta — floating "Under attack?" pill (Footer overhaul, D-017,
 * site-wide since it's rendered from RootLayout alongside SiteFooter).
 * Fixed bottom-right, separate from the main footer grid, per the brief.
 * Stays inside the locked cyan/navy palette — no red/urgency color
 * introduced, matching the instruction not to add a new decorative hue.
 *
 * PLACEHOLDER NUMBER — +60 18-377-2761, supplied by Mohammad in-session
 * as temporary, explicitly flagged as needing replacement with a real
 * Canadian contact line before public launch. Do not remove this comment
 * or the number without confirming the real line first.
 */
const EMERGENCY_PHONE_DISPLAY = "+60 18-377-2761";
const EMERGENCY_PHONE_TEL = "+60183772761";

export function EmergencyCta() {
  return (
    <div className="env-dark fixed bottom-6 right-6 z-40">
      <a
        href={`tel:${EMERGENCY_PHONE_TEL}`}
        className="flex items-center gap-2 rounded-full border border-accent/40 bg-background px-4 py-3 font-body text-sm font-medium text-text-primary shadow-lg shadow-accent/20 transition-colors duration-150 hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Icon icon={PhoneCall} size="sm" className="text-accent" />
        <span>
          Under attack? <span className="text-text-secondary">{EMERGENCY_PHONE_DISPLAY}</span>
        </span>
      </a>
    </div>
  );
}
