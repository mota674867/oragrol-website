// ORAGROL ODO — Automation-lane recommendation logic
//
// Mohammad's decision (2026-09-30): Business Automation isn't sold as 25
// granular à la carte items the way cybersecurity is — it's 5 named, fixed
// bundles (Sales / Customer Service / Finance / IT / Marketing), each one
// build fee + one monthly fee (Master Pricing §2), plus a catch-all for work
// that doesn't fit any of the five. ODO's internal C11-C15 taxonomy (25
// items) is correct and stays — it's the AI's own reasoning granularity —
// but the CLIENT-facing report must always headline a real, sellable name:
// a bundle, or "Tailored Automation" (renamed from "Custom Job" per
// Mohammad, 2026-09-30) when nothing bundle-sized fits.
//
// Automation lane, 3-way:
//   1. Broad/coordinated need (OR ONE flag from odo-packages.ts)  → OR ONE
//   2. Signals concentrate in one bundle                          → that bundle
//   3. Real but small/scattered, doesn't fit a bundle             → Tailored Automation
//
// Bundle assignment: a static rules-fallback table (below) that always
// works, refined at runtime by Jev for the codes whose right bundle is a
// genuine judgment call given the specific evidence (§6.1 "Jev makes the
// judgment call" — same pattern as everywhere else in ODO). C11 (discovery/
// strategy: AI Ready, Process Finder, AI Opportunities, AI Roadmap, AI
// Optimizer) is intentionally unmapped — it's cross-cutting interest, not a
// bundle signal on its own, and C12-S04 is the OR ONE coordination signal,
// also unmapped here.

import { askJev, jevConfigured, type JevQuestion } from "./jev";
import type { OrOneFlag } from "./odo-packages";

export type BundleId = "sales" | "customer_service" | "finance" | "it" | "marketing";

export type AutomationBundle = { id: BundleId; name: string; tagline: string };

export const BUNDLES: AutomationBundle[] = [
  { id: "sales", name: "Sales", tagline: "Lead-to-Close Automation" },
  { id: "customer_service", name: "Customer Service", tagline: "Always-On Customer Support" },
  { id: "finance", name: "Finance", tagline: "Know Your Numbers" },
  { id: "it", name: "IT", tagline: "Outsourced IT Operations" },
  { id: "marketing", name: "Marketing", tagline: "Grow & Retain" },
];
export const BUNDLE_BY_ID: Record<BundleId, AutomationBundle> = Object.fromEntries(BUNDLES.map((b) => [b.id, b])) as Record<BundleId, AutomationBundle>;

/** "Custom Job" in the pricing doc, renamed for anything client-facing per Mohammad (2026-09-30). */
export const TAILORED_AUTOMATION = { name: "Tailored Automation", tagline: "Scoped to your exact requirement — priced after a short scoping conversation." };

/** Deterministic rules-fallback: C11-* (discovery/strategy) and C12-S04 (OR ONE signal) are deliberately absent — never bundle-mapped. */
const DEFAULT_BUNDLE_MAP: Partial<Record<string, BundleId>> = {
  "C12-S01": "it", "C12-S02": "it", "C12-S03": "it", "C12-S05": "it",
  "C13-S01": "it", "C13-S03": "it",
  "C13-S02": "finance", "C13-S04": "finance", "C13-S05": "finance",
  "C14-S01": "it", "C14-S02": "it", "C14-S03": "it", "C14-S04": "it", "C14-S05": "it",
  "C15-S02": "sales", "C15-S05": "sales",
  "C15-S01": "customer_service", "C15-S03": "customer_service",
  "C15-S04": "marketing",
};

/** Codes whose default mapping is a genuine judgment call, not a clean 1:1 — Jev gets first crack at these when available; DEFAULT_BUNDLE_MAP is the fallback. */
const AMBIGUOUS_CODES = new Set(["C12-S01", "C12-S02", "C12-S03", "C12-S05", "C13-S01", "C13-S03"]);

const BUNDLE_CRITERIA: Record<string, string> = Object.fromEntries(BUNDLES.map((b) => [b.id, `${b.name} — ${b.tagline}`]));

type FlaggedAutomationItem = { code: string; category: string; tier: "recommended" | "worth_exploring"; reason: string };

/** Ask Jev to pick the better-fit bundle for codes whose default mapping is ambiguous, given this client's specific evidence. Falls back silently to DEFAULT_BUNDLE_MAP per-code on any failure. */
async function classifyAmbiguousCodes(items: FlaggedAutomationItem[]): Promise<Record<string, BundleId>> {
  const overrides: Record<string, BundleId> = {};
  const ambiguous = items.filter((m) => AMBIGUOUS_CODES.has(m.code));
  if (!ambiguous.length || !jevConfigured()) return overrides;

  const qs: Record<string, JevQuestion> = {};
  for (const m of ambiguous) {
    qs[m.code.replace(/-/g, "_")] = {
      type: "choice",
      instructions: `A small/medium business shows this specific automation-relevant evidence: "${m.reason}". Which ORAGROL Business Automation bundle best fits closing THIS gap? Pick the department that actually owns this work, not a generic default.`,
      criteria: BUNDLE_CRITERIA,
    };
  }
  const res = await askJev("Classifying automation findings into the right ORAGROL Business Automation bundle.", qs, { label: "ba-bundle-classify", timeoutMs: 8000 });
  if (!res) return overrides;
  for (const m of ambiguous) {
    const a = res.answers[m.code.replace(/-/g, "_")];
    if (a?.type === "choice" && a.confidence >= 0.55 && (a.choice as BundleId) in BUNDLE_BY_ID) overrides[m.code] = a.choice as BundleId;
  }
  return overrides;
}

export type AutomationRecommendation =
  | { kind: "or_one"; reason: string }
  | { kind: "bundle"; bundle: AutomationBundle; matchedCodes: string[]; reason: string }
  | { kind: "tailored"; matchedCodes: string[]; reason: string }
  | { kind: "none" };

/** Below this weighted signal, there's nothing material enough to name a product for at all. */
const MIN_WEIGHT_FOR_ANY_RECOMMENDATION = 1;
/** The top bundle must hold at least this share of the weighted signal to be a confident single pick — otherwise the need is real but too scattered to call one bundle, and Tailored Automation is the honest answer. */
const BUNDLE_DOMINANCE_RATIO = 0.5;

export async function recommendAutomationLane(flagged: FlaggedAutomationItem[], orOne: OrOneFlag): Promise<AutomationRecommendation> {
  if (orOne.raised) return { kind: "or_one", reason: orOne.reason };

  // C11-* (discovery/strategy) and C12-S04 (OR ONE-only signal) never pick a bundle by themselves —
  // but they still count as real automation interest, so they fall through to the Tailored
  // Automation branch below rather than an early "nothing to recommend" exit.
  const bundleable = flagged.filter((m) => !m.code.startsWith("C11-") && m.code !== "C12-S04");

  const overrides = await classifyAmbiguousCodes(bundleable);

  const weights: Partial<Record<BundleId, number>> = {};
  const codesByBundle: Partial<Record<BundleId, string[]>> = {};
  let totalWeight = 0;
  for (const m of bundleable) {
    const bundleId = overrides[m.code] ?? DEFAULT_BUNDLE_MAP[m.code];
    if (!bundleId) continue;
    const w = m.tier === "recommended" ? 1 : 0.5;
    weights[bundleId] = (weights[bundleId] ?? 0) + w;
    (codesByBundle[bundleId] ??= []).push(m.code);
    totalWeight += w;
  }

  if (totalWeight < MIN_WEIGHT_FOR_ANY_RECOMMENDATION) {
    // Only unmapped/weak signals (e.g. C11-only discovery interest) — real, but not enough to name a product.
    return flagged.length > 0
      ? { kind: "tailored", matchedCodes: flagged.map((m) => m.code), reason: "There's early interest in automation, but not yet enough specific detail to point at one bundle — worth a short conversation to scope what would actually help." }
      : { kind: "none" };
  }

  const ranked = (Object.entries(weights) as Array<[BundleId, number]>).sort((a, b) => b[1] - a[1]);
  const [topId, topWeight] = ranked[0];
  if (topWeight / totalWeight >= BUNDLE_DOMINANCE_RATIO) {
    const bundle = BUNDLE_BY_ID[topId];
    const matched = codesByBundle[topId]!;
    return {
      kind: "bundle", bundle, matchedCodes: matched,
      reason: `The automation opportunities found line up most with ${bundle.name} (${bundle.tagline}) — ${matched.length} specific finding${matched.length === 1 ? "" : "s"} point there.`,
    };
  }

  return {
    kind: "tailored", matchedCodes: bundleable.map((m) => m.code),
    reason: "The automation opportunities found are real but spread across areas that don't concentrate in one bundle — a short scoping conversation gets a plan tailored to exactly what's needed instead of forcing it into one package.",
  };
}
