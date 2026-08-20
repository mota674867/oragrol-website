import rawData from "../../../data/oragrol-solutions-data.json";

/**
 * Solutions data layer — 2026-08-20. Real content replacing the
 * placeholder "Level 01/02/03" tiers (PROJECT_MASTER.md Step 6's
 * originally-unconfirmed pricing/names, see DECISIONS.md D-003) — imported
 * directly from `oragrol-solutions-data.json` (moved from the repo root
 * into `app/data/`, same convention as Services' data layer) rather than
 * hand-transcribed.
 *
 * Deliberately NOT exposed here: `gross_margin_note` per tier (e.g. "~76%
 * at reference scale") — internal cost/margin data, not customer-facing
 * content, not in any of the 6 build instructions. Excluded from the type
 * below so it can't accidentally get rendered by a future edit.
 */

export interface TierService {
  code: string;
  name: string;
  blurb: string;
  price: string;
  unit: string;
}

export interface SolutionTier {
  name: string;
  tagline: string;
  service_count: number;
  monthly_price: string;
  annual_price: string;
  month_to_month_price: string;
  services: TierService[];
}

export interface AddonService extends TierService {
  reason: string;
}

export interface PentestAddonData {
  code: string;
  name: string;
  official_name: string;
  blurb: string;
  price: string;
  unit: string;
  note: string;
}

interface RawSolutionsData {
  note: string;
  tiers: SolutionTier[];
  addon_menu: { description: string; services: AddonService[] };
  penetration_testing_addon: PentestAddonData;
  pricing_confidence_note: string;
}

// Raw JSON also carries gross_margin_note per tier — present in the file,
// intentionally untyped/unused above (see comment).
const data = rawData as unknown as RawSolutionsData;

export function getSolutionsNote(): string {
  return data.note;
}

export function getTiers(): SolutionTier[] {
  return data.tiers;
}

export function getAddonMenu(): { description: string; services: AddonService[] } {
  return data.addon_menu;
}

export function getPentestAddon(): PentestAddonData {
  return data.penetration_testing_addon;
}

export function getPricingConfidenceNote(): string {
  return data.pricing_confidence_note;
}
