import rawData from "../../../data/oragrol-tier2-packages-data.json";

/**
 * Business Automation packages data layer — 2026-08-21. Real content from
 * `oragrol-tier2-packages-data.json` (moved from the repo root into
 * `app/data/`, same convention as `services-data.ts`/`solutions-data.ts`)
 * imported directly rather than hand-transcribed.
 *
 * Two structurally different offer types, kept as separate exported
 * shapes/getters (not unioned into one "package" type) so a component
 * can't accidentally render a one-time offer next to a recurring price
 * without deliberately choosing to:
 *  - `one_time_and_project_offers` (Assessment, Implementation) — single
 *    `price`, no `scope_limits`, no recurring cadence.
 *  - `recurring_packages` (Starter/Growth/Scale/Enterprise) — monthly/
 *    annual/month-to-month pricing + `scope_limits`.
 *
 * Enterprise/Custom's `display_note` says to show "Contact us" on the page
 * instead of its calculated price — the calculated `monthly_price`/
 * `annual_price` fields exist in the JSON only for internal sanity-
 * checking. `hasContactUsPricing()` below checks for `display_note`
 * presence (not a hardcoded name match on "Enterprise"), so a future
 * rename or reorder of the tiers can't silently break this.
 *
 * Deliberately NOT exposed: `reference_scale_note` (internal methodology —
 * "scaled to 50 employees before summing," not customer-facing) — same
 * exclude-at-the-data-layer discipline D-064 used for Solutions'
 * `gross_margin_note`.
 */

export interface PackageService {
  code: string;
  name: string;
  blurb: string;
  price: string;
  unit: string;
}

export interface OneTimeOffer {
  name: string;
  type: string;
  tagline: string;
  services: PackageService[];
  price: string;
  note?: string;
}

export interface ScopeLimits {
  included_users: number | string;
  included_active_workflows: number | string;
  included_integrations: number | string;
  support_level: string;
  overage_per_workflow: string;
  overage_per_integration: string;
}

export interface RecurringPackage {
  name: string;
  featured?: boolean;
  tagline: string;
  services: PackageService[];
  monthly_price: string;
  annual_price: string;
  month_to_month_price: string;
  display_note?: string;
  scope_limits: ScopeLimits;
}

export interface ContractTerms {
  annual: string;
  monthly: string;
  implementation: string;
  expansion: string;
}

interface RawPackagesData {
  pricing_confidence_note: string;
  contract_terms: ContractTerms;
  funnel: string;
  one_time_and_project_offers: OneTimeOffer[];
  recurring_packages: RecurringPackage[];
  individual_services_note: string;
  category_narrative: Record<string, string>;
}

// Raw JSON also carries `reference_scale_note` — present in the file,
// intentionally untyped/unused above (see comment).
const data = rawData as unknown as RawPackagesData;

export function getOneTimeOffers(): OneTimeOffer[] {
  return data.one_time_and_project_offers;
}

export function getRecurringPackages(): RecurringPackage[] {
  return data.recurring_packages;
}

export function getFunnel(): string {
  return data.funnel;
}

export function getContractTerms(): ContractTerms {
  return data.contract_terms;
}

export function getCategoryNarrative(): Record<string, string> {
  return data.category_narrative;
}

export function getIndividualServicesNote(): string {
  return data.individual_services_note;
}

export function getPricingConfidenceNote(): string {
  return data.pricing_confidence_note;
}

/** True for a package whose price should render as "Contact us" rather
 *  than its calculated `monthly_price`/`annual_price` (currently
 *  Enterprise/Custom) — checked via `display_note` presence, not name. */
export function hasContactUsPricing(pkg: RecurringPackage): boolean {
  return Boolean(pkg.display_note);
}

/**
 * "Discover → Automate → Understand → Operate → Grow" — derived from
 * `category_narrative`'s own values (each "<Word> — <detail>"), not
 * hand-typed, so it can't drift from the source data. Relies on the JSON's
 * real key order (C11-C15) rather than sorting, same as every other
 * source-order-preserving list on this site.
 */
export function getCategoryStoryLine(): string {
  return Object.values(getCategoryNarrative())
    .map((value) => value.split(" — ")[0].trim())
    .join(" → ");
}
