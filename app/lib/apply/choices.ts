// Pick lists and ranges for the application and setup forms (decided with Mohammad, 2026-11-04): clients choose from options instead of typing
// exact numbers, every list can carry an "Other" box, and every list ends (added by the engine) with "I would rather discuss this with you".
// The ranges for staff follow our plan limits so we can still size a plan from the answer.
import type { Cond, Field } from "./types";

export const OTHER = "Other (write it)";

export const band = (id: string, label: string, options: readonly string[], o: Partial<Field> = {}): Field =>
  ({ id, label, kind: "select", choice: true, required: true, options: [...options], ...o });
export const pickMany = (id: string, label: string, options: readonly string[], o: Partial<Field> = {}): Field =>
  ({ id, label, kind: "multiselect", choice: true, required: true, options: [...options], ...o });
/** The small box that opens when "Other (write it)" is chosen. */
export const otherBox = (of: Field): Field =>
  ({ id: `${of.id}_other`, label: `${of.label} (other)`, kind: "text", required: false, discuss: false, group: of.group,
     showIf: (of.kind === "multiselect" ? { field: of.id, has: OTHER } : { field: of.id, is: OTHER }) as Cond });
/** A pick list plus its "Other" box. */
export const withOther = (of: Field): Field[] => [of, otherBox(of)];

export const PROVINCES = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon", "Outside Canada"] as const;

// ---- ranges
export const STAFF = ["1 to 7", "8 to 19", "20 to 29", "30 to 39", "40 to 99", "100 or more"] as const;
export const YEARS = ["Less than 1 year", "1 to 2 years", "3 to 5 years", "6 to 10 years", "More than 10 years"] as const;
export const ENTITIES = ["1", "2", "3", "4 to 5", "6 to 10", "More than 10"] as const;
export const HOURS = ["Under 5 hours", "5 to 10 hours", "11 to 20 hours", "21 to 40 hours", "More than 40 hours"] as const;
export const VOLUME = ["Under 50", "50 to 200", "201 to 1,000", "1,001 to 5,000", "More than 5,000"] as const;
export const CUSTOMERS = ["1 to 20", "21 to 100", "101 to 500", "501 to 2,500", "More than 2,500"] as const;
export const HIRES = ["0 to 2", "3 to 5", "6 to 10", "11 to 25", "More than 25"] as const;
export const STOCK = ["I do not hold stock", "1 to 50", "51 to 250", "251 to 1,000", "More than 1,000"] as const;
export const DEVICES_EACH = ["1", "2", "3", "4 or more"] as const;
export const DEVICES_TOTAL = ["1 to 10", "11 to 25", "26 to 50", "51 to 100", "More than 100"] as const;
export const SUPPLIERS = ["1 to 10", "11 to 25", "26 to 50", "51 to 100", "More than 100"] as const;
export const ORDERS = ["Under 10", "10 to 50", "51 to 200", "201 to 1,000", "More than 1,000"] as const;
export const LICENCES = ["1 to 3", "4 to 10", "11 to 25", "More than 25"] as const;
export const KPIS = ["1 to 5", "6 to 10", "11 to 20", "More than 20"] as const;
export const CALL_MINUTES = ["Not applicable", "Under 300", "300 to 1,000", "1,001 to 3,000", "3,001 to 10,000", "More than 10,000"] as const;
export const AD_SPEND = ["Under $1,500", "$1,500 to $3,000", "$3,001 to $7,500", "$7,501 to $15,000", "More than $15,000"] as const;
export const PAGES = ["1 to 5", "6 to 10", "11 to 25", "More than 25"] as const;
export const LANGUAGE_COUNT = ["1", "2", "3", "4 or more"] as const;
export const APPROVAL_SPEED = ["Within a few hours", "Within one day", "Within two to three days", "Within a week", "It varies"] as const;
export const START = ["As soon as possible", "Within one month", "In one to three months", "In three to six months", "Not decided yet"] as const;

export const INDUSTRIES = ["Professional services", "Health and dental", "Construction and trades", "Retail and e-commerce", "Manufacturing and wholesale", "Hospitality and food",
  "Real estate", "Education and non-profit", "Technology", "Transportation and logistics", "Financial services", OTHER];
