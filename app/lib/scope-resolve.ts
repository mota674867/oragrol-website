import { SERVICE_PACKAGES, INDIVIDUAL_SERVICES } from "../services/services-catalog";
import { BUSINESS_AUTOMATION_JOB_REGISTRY } from "./business-automation-job-registry";
import { OR_ONE_CAPABILITY_BY_CODE } from "./or-one-capability-registry";
import type { ScopeResolvedItem, ScopeArea } from "./hubspot";

/**
 * Server-side selection resolution, per scope-schema.ts's header comment
 * and Section 4: "Never trust browser-supplied prices, titles, tier
 * calculations or codes as authoritative... Resolve IDs on the server
 * against the actual catalog." The client sends only IDs (plus, for OR
 * ONE, capability codes within that one aggregate selection); this file
 * is the ONLY place that turns those IDs into the names/codes that ever
 * reach a PDF, email, or HubSpot note.
 *
 * Unknown/unrecognized IDs are a hard error (UnresolvedSelectionError),
 * never silently dropped — per Section 10's acceptance test "unknown ID
 * ... fail safely," failing safely means rejecting the submission, not
 * quietly proceeding with fewer items than the client actually selected.
 */

export class UnresolvedSelectionError extends Error {
  constructor(public readonly id: string) {
    super(`Unrecognized selection id: ${id}`);
    this.name = "UnresolvedSelectionError";
  }
}

export function resolveSelections(
  selections: { id: string; capabilityCodes?: string[] }[],
): ScopeResolvedItem[] {
  const resolved: ScopeResolvedItem[] = [];

  for (const sel of selections) {
    if (sel.id.startsWith("cyber-package:")) {
      const packageId = sel.id.slice("cyber-package:".length);
      const pkg = SERVICE_PACKAGES.find((p) => p.id === packageId);
      if (!pkg) throw new UnresolvedSelectionError(sel.id);
      resolved.push({ area: "Cybersecurity", code: pkg.id.toUpperCase(), name: `${pkg.name} Package` });
      continue;
    }
    if (sel.id.startsWith("cyber:")) {
      const code = sel.id.slice("cyber:".length);
      const svc = INDIVIDUAL_SERVICES.find((s) => s.code === code);
      if (!svc) throw new UnresolvedSelectionError(sel.id);
      resolved.push({ area: "Cybersecurity", code: svc.code, name: svc.name });
      continue;
    }
    if (sel.id.startsWith("automation:")) {
      const jobId = sel.id.slice("automation:".length);
      const job = BUSINESS_AUTOMATION_JOB_REGISTRY.find((j) => j.id === jobId);
      if (!job) throw new UnresolvedSelectionError(sel.id);
      resolved.push({ area: "Automation", code: job.code, name: job.name });
      continue;
    }
    if (sel.id === "orone:builder") {
      // The OR ONE builder is captured as one selection whose
      // capabilityCodes carry the individually-chosen items — resolve
      // EVERY one against the permanent registry, matching Section F's
      // "carry these identities from selection to server snapshot."
      const codes = sel.capabilityCodes ?? [];
      if (codes.length === 0) throw new UnresolvedSelectionError(sel.id);
      for (const code of codes) {
        const cap = OR_ONE_CAPABILITY_BY_CODE.get(code);
        if (!cap) throw new UnresolvedSelectionError(`orone:builder capability ${code}`);
        resolved.push({ area: "OR ONE", code: cap.code, name: cap.name });
      }
      continue;
    }
    throw new UnresolvedSelectionError(sel.id);
  }

  return resolved;
}

export type { ScopeArea, ScopeResolvedItem };
