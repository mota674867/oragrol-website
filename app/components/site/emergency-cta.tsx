import { PhoneCall } from "lucide-react";
import Link from "next/link";
import { Icon } from "../ui";

/**
 * EmergencyCta — floating "Under attack?" pill (Footer overhaul, D-017,
 * site-wide since it's rendered from RootLayout alongside SiteFooter).
 * Fixed bottom-right, separate from the main footer grid, per the brief.
 * Stays inside the locked cyan/navy palette — no red/urgency color
 * introduced, matching the instruction not to add a new decorative hue.
 *
 * Previously a `tel:` link to a placeholder Malaysian mobile number
 * (supplied by Mohammad in-session as temporary — see DECISIONS.md D-017
 * for the number itself, kept out of source now that it's retired). No
 * real Canadian line exists yet, so this now routes to `/contact`
 * instead of showing any phone number — text-only CTA, same pill
 * styling/icon/position, per explicit instruction. Re-add a real `tel:`
 * link here once a real Canadian emergency line is confirmed.
 */
export function EmergencyCta() {
  return (
    <div className="env-dark fixed bottom-6 right-6 z-40">
      <Link
        href="/contact"
        className="flex items-center gap-2 rounded-full border border-accent/40 bg-background px-4 py-3 font-body text-sm font-medium text-text-primary shadow-lg shadow-accent/20 transition-colors duration-150 hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Icon icon={PhoneCall} size="sm" className="text-accent" />
        <span>Under attack? Contact us now</span>
      </Link>
    </div>
  );
}
