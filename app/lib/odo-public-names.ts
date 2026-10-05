// ORAGROL ODO — public product names (Mohammad, 2026-10-05)
//
// Anything a prospect or visitor can read — the outbound report, the cold-email
// PDF, the visitor scan's SWOT / summary — may only name things that are on the
// live site: the 4 packages, the individual services, the specialist
// engagements (/services), the 5 Business Automation bundles (/business-automation)
// and OR ONE. The 67-code internal catalog uses its own shorthand ("Trust Guard",
// "Flow Automator"); those names never reach a reader. This module is the one
// place that turns a catalog code into what the site actually calls it.
//
// Audit 2026-10-05: all 41 security codes (C02–C10) already exist on the page
// under some name; C01-S01 is the free tool and is never recommended. All 25
// automation items (C11–C15) roll up into a bundle or OR ONE. So nothing is
// backend-only today — the Foundation fallback below only guards the future.

import { SERVICE_BY_CODE } from "./odo-services";
import { BUNDLE_BY_ID, DEFAULT_BUNDLE_MAP } from "./odo-automation-bundles";
import { SERVICE_PACKAGES, INDIVIDUAL_SERVICES, SPECIALIST_ENGAGEMENTS } from "@/app/[locale]/services/services-catalog";

/** Every service name the live /services page prints. */
export const PAGE_SERVICE_NAMES: ReadonlySet<string> = new Set<string>([
  ...SERVICE_PACKAGES.flatMap((p) => [...p.services]),
  ...INDIVIDUAL_SERVICES.map((s) => s.name),
  ...SPECIALIST_ENGAGEMENTS.map((s) => s.name),
]);

/** The page's own label where it differs from both catalog names (package item for C02-S01). */
const PAGE_NAME_OVERRIDES: Record<string, string> = { "C02-S01": "Security Weakness Check" };

/** The /services page name for a security code, or null when the page has no match (never for a real code today). */
export function pageServiceName(code: string): string | null {
  const svc = SERVICE_BY_CODE[code];
  if (!svc || svc.group !== "security") return null;
  for (const candidate of [PAGE_NAME_OVERRIDES[code], svc.officialName, svc.simpleName]) {
    if (candidate && PAGE_SERVICE_NAMES.has(candidate)) return candidate;
  }
  return null;
}

/** The label a reader may see for any catalog code: a page name, a BA bundle, OR ONE — or the Foundation package when a security code has no page match. */
export function publicServiceLabel(code: string): string {
  const svc = SERVICE_BY_CODE[code];
  if (!svc) return "Foundation package";
  if (svc.group === "security") return pageServiceName(code) ?? "Foundation package";
  const bundleId = DEFAULT_BUNDLE_MAP[code];
  return bundleId ? `Business Automation: ${BUNDLE_BY_ID[bundleId].name}` : "OR ONE";
}

/** Distinct reader-safe labels for a list of codes, order kept. */
export function publicServiceLabels(codes: string[]): string[] {
  return [...new Set(codes.map(publicServiceLabel))];
}
