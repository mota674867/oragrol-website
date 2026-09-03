/**
 * Contact page location data — Step 12. Copied verbatim from
 * `Oragrol_Contact_Page_Content.md`: addresses, phone, email, and hours
 * are real, confirmed values for Thunder Bay; every Toronto field is
 * explicitly `[pending]` in the source and stays that way here — no
 * value invented, nothing duplicated from Thunder Bay to fill the gap.
 *
 * `PENDING` is a typed sentinel (not an empty string) so
 * `LocationsSection` can render an explicit "Coming soon" state per
 * field instead of a blank/missing-looking row.
 */

export const PENDING = "pending" as const;

export type LocationField = string | typeof PENDING;

export interface Location {
  id: "toronto" | "thunder-bay";
  /** Display name, e.g. "Toronto Branch" or "HQ — Thunder Bay, ON". */
  name: string;
  /** Short label clarifying what this location is — "Operations" /
   * "Registered Office" — never left implicit. */
  tag: string;
  /** Toronto is visually primary (where clients actually reach Oragrol
   * day to day); Thunder Bay is secondary/legal, per the brief. */
  primary: boolean;
  address: LocationField;
  phone: LocationField;
  email: LocationField;
  hours: LocationField;
}

export const LOCATIONS: Location[] = [
  {
    id: "toronto",
    name: "Toronto Branch",
    tag: "Operations",
    primary: true,
    address: PENDING,
    phone: PENDING,
    email: PENDING,
    hours: PENDING,
  },
  {
    id: "thunder-bay",
    name: "HQ — Thunder Bay, ON",
    tag: "Registered Office",
    primary: false,
    address: "180 Park Ave, Thunder Bay, ON P7B 6J4",
    phone: "+1 (613) 315-0328",
    // No live oragrolglobal.com or orgro.ca mailbox yet — PENDING rather
    // than a bounce-prone address (see app/lib/site-config.ts).
    email: PENDING,
    hours: "Mon–Fri, 10am–8pm",
  },
];
