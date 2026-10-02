// ORAGROL ODO — Security-lane recommendation logic
//
// Source: ORAGROL_Master_Pricing_Structure_2026-09-08.md §1 (locked pricing,
// 2026-09-08). Package composition is nested (Advanced = Foundation + 6 more,
// etc.) and item counts self-validate against the source doc (6/12/22/25).
// "Security Weakness Check" (source doc's item name) has no literal catalog
// match — mapped by concept to C02-S01 "Vuln Watch" (Vulnerability Assessment
// & Management); every other item matches a catalog simpleName exactly.
//
// Mohammad's decisions (2026-09-30, two rounds):
//   1. Recommend a fixed PACKAGE, not a wall of individual codes, when a
//      client's flagged security gaps substantially overlap one.
//   2. Codes are for ORAGROL's own/AI's clarity, never the client-facing
//      headline — the headline is always a real, findable product name
//      (a package, or an exact à la carte / C10 item name).
//   3. Three-way security branch: (a) gaps concentrate in a package → offer
//      that package; (b) gaps are real but too small/scattered to justify a
//      package → default to Foundation, the cheapest on-ramp; (c) a gap is
//      one of the 12 dedicated à la carte-only items (never sold inside any
//      package) → offer that exact item, never Foundation, since Foundation
//      wouldn't even include it. C10 items always offer by exact item too.

import { SERVICE_CATALOG, type Billing } from "./odo-services";

export type PackageId = "foundation" | "advanced" | "comprehensive" | "elite";

export type ServicePackage = {
  id: PackageId;
  name: string;
  itemCount: number;
  codes: string[];
  priceMonthly: number;
  priceAnnual: number;
};

const FOUNDATION_CODES = ["C01-S03", "C02-S01", "C04-S01", "C04-S02", "C04-S03", "C05-S02"];
const ADVANCED_ADDS = ["C01-S02", "C02-S02", "C03-S01", "C03-S03", "C05-S01", "C05-S04"];
const COMPREHENSIVE_ADDS = ["C06-S01", "C06-S02", "C06-S03", "C06-S05", "C07-S01", "C07-S02", "C07-S03", "C08-S01", "C08-S02", "C08-S04"];
const ELITE_ADDS = ["C03-S02", "C03-S04", "C08-S05"];

const ADVANCED_CODES = [...FOUNDATION_CODES, ...ADVANCED_ADDS];
const COMPREHENSIVE_CODES = [...ADVANCED_CODES, ...COMPREHENSIVE_ADDS];
const ELITE_CODES = [...COMPREHENSIVE_CODES, ...ELITE_ADDS];

export const PACKAGES: ServicePackage[] = [
  { id: "foundation", name: "Foundation", itemCount: 6, codes: FOUNDATION_CODES, priceMonthly: 2756, priceAnnual: 33066 },
  { id: "advanced", name: "Advanced", itemCount: 12, codes: ADVANCED_CODES, priceMonthly: 6038, priceAnnual: 72459 },
  { id: "comprehensive", name: "Comprehensive", itemCount: 22, codes: COMPREHENSIVE_CODES, priceMonthly: 11706, priceAnnual: 140471 },
  { id: "elite", name: "Elite", itemCount: 25, codes: ELITE_CODES, priceMonthly: 13133, priceAnnual: 157600 },
];

export const PACKAGE_BY_ID: Record<PackageId, ServicePackage> = Object.fromEntries(PACKAGES.map((p) => [p.id, p])) as Record<PackageId, ServicePackage>;

/** C01-S01 (Cyber Health Check) is the free discovery assessment itself — never a paid recommendation. */
const FREE_CODES = new Set(["C01-S01"]);

/**
 * The 12 items that are ONLY sold à la carte — never bundled into any
 * package. Derived from the catalog rather than hand-listed so it can never
 * drift from PACKAGES/ELITE_CODES: any non-C10, non-free security code that
 * Elite doesn't include is, by construction, à la carte-only (self-validates
 * to exactly 12 against the pricing doc: 38 C01-C09 codes − 25 in Elite − 1
 * free = 12).
 */
export const ALACARTE_ONLY_CODES: string[] = SERVICE_CATALOG
  .filter((s) => s.group === "security" && s.category !== "Certified Specialist Services" && !FREE_CODES.has(s.code) && !ELITE_CODES.includes(s.code))
  .map((s) => s.code);

/** Minimum coverage of the client's flagged package-eligible gaps a package must hit to be worth bundling instead of defaulting to Foundation. */
const COVERAGE_THRESHOLD = 0.7;
/** Below this many flagged package-eligible codes, a specific package pick isn't worth it — Foundation is the simpler default. */
const MIN_FLAGGED_FOR_PACKAGE_PICK = 3;

type PackageMatch = { pkg: ServicePackage; coveredCodes: string[]; coveragePct: number };

/** Smallest package covering ≥COVERAGE_THRESHOLD of the given package-eligible codes, or null if none clears the bar. */
function bestPackageMatch(packageEligibleCodes: string[]): PackageMatch | null {
  const flagged = [...new Set(packageEligibleCodes)];
  if (flagged.length < MIN_FLAGGED_FOR_PACKAGE_PICK) return null;
  for (const pkg of PACKAGES) {
    const pkgSet = new Set(pkg.codes);
    const covered = flagged.filter((c) => pkgSet.has(c));
    const pct = covered.length / flagged.length;
    if (pct >= COVERAGE_THRESHOLD) return { pkg, coveredCodes: covered, coveragePct: Math.round(pct * 100) };
  }
  return null;
}

export type SecurityRecommendation =
  | { kind: "package"; pkg: ServicePackage; matchedCodes: string[]; coveragePct: number; reason: string }
  | { kind: "foundation_default"; pkg: ServicePackage; matchedCodes: string[]; reason: string }
  | { kind: "none"; reason: string };

export type IndividualOffer = {
  code: string;
  simpleName: string;
  // The name actually listed on orgro.ca/services — the PDF tells clients
  // to search by name there, so this (not simpleName) is what must be shown
  // as the item's title. See odo-report.ts's ReportPriority for the same fix.
  officialName: string;
  category: string;
  billing: Billing;
  tier: "recommended" | "worth_exploring";
  why: string;
};

export type SecurityLane = {
  recommendation: SecurityRecommendation;
  /** Items never sold inside a package (the 12 à la carte-only codes, plus any flagged C10 item) — always offered by their exact name/code regardless of the package pick above. */
  individualOffers: IndividualOffer[];
};

type FlaggedItem = { code: string; simpleName: string; category: string; group: "security" | "automation"; tier: "recommended" | "worth_exploring"; reason: string };

/**
 * Builds the whole security-lane recommendation: the one primary
 * package/Foundation-default pick (driven by Recommended-tier,
 * package-eligible gaps only) plus the individual items that are never sold
 * inside a package and so are always offered by exact name regardless of
 * the primary pick.
 */
export function recommendSecurityLane(flagged: FlaggedItem[], serviceByCode: Record<string, { billing: Billing; officialName?: string }>): SecurityLane {
  const security = flagged.filter((m) => m.group === "security" && !FREE_CODES.has(m.code));
  const alacarteOnlySet = new Set(ALACARTE_ONLY_CODES);

  const individualOffers: IndividualOffer[] = security
    .filter((m) => m.category === "Certified Specialist Services" || alacarteOnlySet.has(m.code))
    .map((m) => ({ code: m.code, simpleName: m.simpleName, officialName: serviceByCode[m.code]?.officialName ?? m.simpleName, category: m.category, billing: serviceByCode[m.code]?.billing ?? "recurring", tier: m.tier, why: m.reason }));

  const packageEligible = security
    .filter((m) => m.tier === "recommended" && m.category !== "Certified Specialist Services" && !alacarteOnlySet.has(m.code))
    .map((m) => m.code);

  if (packageEligible.length === 0) {
    return { recommendation: { kind: "none", reason: "No security gaps were found that a package or add-on would address." }, individualOffers };
  }

  const match = bestPackageMatch(packageEligible);
  if (match) {
    return {
      recommendation: {
        kind: "package", pkg: match.pkg, matchedCodes: match.coveredCodes, coveragePct: match.coveragePct,
        reason: `${match.coveredCodes.length} of ${packageEligible.length} identified security gaps are already covered by the ${match.pkg.name} package's ${match.pkg.itemCount} included services — bundling costs less than the alternative and is simpler to manage.`,
      },
      individualOffers,
    };
  }

  const foundation = PACKAGE_BY_ID.foundation;
  return {
    recommendation: {
      kind: "foundation_default", pkg: foundation, matchedCodes: packageEligible,
      reason: `The gaps found don't concentrate enough to justify a larger package on their own — ${foundation.name} is ORAGROL's entry point and the simplest, most cost-effective way to close them, with room to add more as needs grow.`,
    },
    individualOffers,
  };
}

// --- OR ONE flag -----------------------------------------------------------
//
// Mohammad's decision (2026-09-30): when the findings suggest a broad,
// multi-department, coordinated automation need rather than a handful of
// point fixes, the automation lane leads with "OR ONE" (no fixed code — a
// custom Points-based build) instead of a single BA bundle. Evaluated here;
// consumed by odo-automation-bundles.ts as the first branch of the
// automation-lane decision.

export type OrOneFlag = { raised: boolean; reason: string; categories: string[] };

/** C12-S04 (Intelligent Process Orchestration) and C11-S04 (AI Transformation Roadmap) are themselves signals of a coordination need, not a point fix. */
const COORDINATION_SIGNAL_CODES = ["C12-S04", "C11-S04"];
const MIN_AUTOMATION_CATEGORIES_FOR_OR_ONE = 3;

export function evaluateOrOneFlag(flaggedCodes: { code: string; category: string; tier: "recommended" | "worth_exploring" }[]): OrOneFlag {
  const automation = flaggedCodes.filter((m) => m.code.startsWith("C1") && !m.code.startsWith("C10-"));
  const categories = [...new Set(automation.map((m) => m.category))];
  const hasCoordinationSignal = automation.some((m) => m.tier === "recommended" && COORDINATION_SIGNAL_CODES.includes(m.code));
  const broadNeed = categories.length >= MIN_AUTOMATION_CATEGORIES_FOR_OR_ONE;

  if (!hasCoordinationSignal && !broadNeed) return { raised: false, reason: "", categories };

  const reason = hasCoordinationSignal
    ? "The findings point to a need for coordination across multiple systems or departments, not a single automation, which is what OR ONE's custom-built approach is designed for."
    : `Automation opportunities were found across ${categories.length} different areas (${categories.join(", ")}) — at that breadth, a coordinated OR ONE build is usually more effective and cost-efficient than stacking several standalone automations.`;

  return { raised: true, reason, categories };
}
