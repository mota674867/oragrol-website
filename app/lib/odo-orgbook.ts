// ORAGROL ODO — OrgBook BC: British Columbia business-registry lookup
//
// Section 33, Area 12 (registry & brand). OrgBook BC is the Province of
// British Columbia's public registry API (orgbook.gov.bc.ca, v4). Free, no
// API key.
//
// LICENCE — confirmed 2026-09-29, no application or written approval needed.
// Data is published under the Open Government Licence – British Columbia
// (OGL-BC v2.0): worldwide, royalty-free, commercial use permitted. API use
// is governed by BC's "API Terms of Use for Information provided under the
// OGL-BC" (accepted by use). The one obligation: anything that shows this
// data to a viewer (client report, PDF) must carry the attribution line in
// ORGBOOK_ATTRIBUTION below. This module only fetches and normalizes.
//
// SCOPE — read before scoring anything from this module.
// OrgBook covers organizations REGISTERED IN BC only: BC-incorporated
// companies, and out-of-province companies (e.g. Ontario/federal) that have
// extra-provincially registered to do business in BC (entity_type "A").
// ORAGROL's ICP is Toronto SMBs, most of which will never appear here.
// So `absent` means exactly "no BC registration under this name" — it is
// NEVER a negative finding about the prospect and must never be scored as a
// gap or surface in a report as bad news. Its only real value:
//   - observed + entity_type "A"  → prospect operates in BC too (multi-
//     province footprint: BC privacy law PIPA applies alongside PIPEDA)
//   - observed + BC home jurisdiction → verified legal name, registration
//     date (business age), active/historical status
//
// MATCHING — strict on purpose. A fuzzy name match that attaches another
// company's registry record to the prospect would be a fabricated fact,
// exactly what the evidence rule forbids. We only accept a result whose
// normalized name equals the prospect's normalized name. Results that exist
// but don't match exactly return `not_determined`, not a guess.
//
// Endpoints verified against bcgov/orgbook-bc-api-docs (docs/api.md,
// 2026-09-29): GET /api/v4/search/autocomplete?q=… then
// GET /api/v4/search/topic?q=<source_id>. NOT live-tested from the build
// sandbox (no outbound access to orgbook.gov.bc.ca) — verify post-deploy.

import { type Determination, observed, absent, notDetermined } from "./odo-evidence";

export const ORGBOOK_ATTRIBUTION =
  "Contains information licensed under the Open Government Licence – British Columbia.";

const BASE = "https://orgbook.gov.bc.ca/api/v4";
const SOURCE = "orgbook-bc:v4";

export type OrgBookRecord = {
  /** BC Registries number, e.g. BC0772006 or A0012345. */
  registrationId: string;
  legalName: string;
  /** Raw OrgBook code: "ACT" active, "HIS" historical. */
  entityStatus: string | null;
  active: boolean | null;
  /** Raw OrgBook code, e.g. "BC" (BC company), "A" (extraprovincial), "SP", "GP", "ULC". */
  entityType: string | null;
  /** True when entity_type is "A" — an out-of-province company registered to operate in BC. */
  extraProvincial: boolean;
  homeJurisdiction: string | null;
  registrationDate: string | null;
  /** Public OrgBook page for the reviewer to verify by hand. */
  orgbookUrl: string;
};

// Legal suffixes stripped before comparing names — only suffix noise is removed,
// the distinctive part of the name must match exactly. If two BC entities
// collapse to the same normalized name, lookupOrgBook reports "ambiguous".
const SUFFIXES = [
  "INCORPORATED", "INC", "LIMITED", "LTD", "LTEE", "CORPORATION", "CORP",
  "COMPANY", "CO", "LLP", "LP", "ULC", "PLC", "LLC",
];

export function normalizeOrgName(name: string): string {
  let n = name
    .toUpperCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Strip trailing legal suffixes (possibly more than one, e.g. "CO LTD").
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of SUFFIXES) {
      if (n.endsWith(` ${s}`)) {
        n = n.slice(0, -(s.length + 1)).trim();
        changed = true;
      }
    }
  }
  return n.replace(/^THE /, "");
}

type AutocompleteResult = {
  type?: string;
  sub_type?: string;
  value?: string;
  topic_source_id?: string;
};

type TopicResult = {
  source_id?: string;
  names?: Array<{ text?: string; type?: string }>;
  attributes?: Array<{ type?: string; value?: string }>;
  inactive?: boolean;
  effective_date?: string | null;
};

async function getJson<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; reason: string }> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "ORAGROL-ODO/1.0 (+https://orgro.ca)" },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 403 || res.status === 429) return { ok: false, reason: `blocked by origin (HTTP ${res.status})` };
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? (err.name === "TimeoutError" ? "timeout" : err.message) : String(err) };
  }
}

export async function lookupOrgBook(businessName: string): Promise<Determination<OrgBookRecord>> {
  const target = normalizeOrgName(businessName);
  if (!target) return notDetermined<OrgBookRecord>("empty business name after normalization", SOURCE);

  // Step 1 — name search. Include historical entities so a dissolved BC
  // registration is visible to the reviewer rather than silently missing.
  const ac = await getJson<{ results?: AutocompleteResult[] }>(
    `${BASE}/search/autocomplete?q=${encodeURIComponent(businessName)}&inactive=true&revoked=false`
  );
  if (!ac.ok) return notDetermined<OrgBookRecord>(ac.reason, SOURCE);

  const nameHits = (ac.data.results ?? []).filter((r) => r.type === "name" && r.value && r.topic_source_id);
  if (nameHits.length === 0) return absent<OrgBookRecord>(SOURCE);

  const exact = nameHits.filter((r) => normalizeOrgName(r.value!) === target);
  if (exact.length === 0) {
    return notDetermined<OrgBookRecord>(
      `no exact name match among ${nameHits.length} OrgBook result(s) — not guessing`,
      SOURCE
    );
  }
  const distinctIds = [...new Set(exact.map((r) => r.topic_source_id!))];
  if (distinctIds.length > 1) {
    return notDetermined<OrgBookRecord>(
      `ambiguous: ${distinctIds.length} BC registrations share this name (${distinctIds.slice(0, 3).join(", ")})`,
      SOURCE
    );
  }
  const registrationId = distinctIds[0];

  // Step 2 — registration detail for that one topic.
  const topic = await getJson<{ results?: TopicResult[] }>(
    `${BASE}/search/topic?q=${encodeURIComponent(registrationId)}&inactive=true&revoked=false`
  );
  if (!topic.ok) return notDetermined<OrgBookRecord>(`topic lookup: ${topic.reason}`, SOURCE);

  const rec = (topic.data.results ?? []).find((t) => t.source_id === registrationId);
  if (!rec) return notDetermined<OrgBookRecord>(`topic ${registrationId} not returned by topic search`, SOURCE);

  const attr = (type: string): string | null =>
    rec.attributes?.find((a) => a.type === type)?.value ?? null;

  const entityStatus = attr("entity_status");
  const entityType = attr("entity_type");
  const legalName =
    rec.names?.find((n) => n.type === "entity_name")?.text ??
    rec.names?.[0]?.text ??
    exact[0].value!;

  return observed<OrgBookRecord>(
    {
      registrationId,
      legalName,
      entityStatus,
      active: entityStatus ? entityStatus === "ACT" : rec.inactive === undefined ? null : !rec.inactive,
      entityType,
      extraProvincial: entityType === "A",
      homeJurisdiction: attr("home_jurisdiction"),
      registrationDate: attr("registration_date") ?? rec.effective_date ?? null,
      orgbookUrl: `https://orgbook.gov.bc.ca/entity/${encodeURIComponent(registrationId)}`,
    },
    SOURCE
  );
}
