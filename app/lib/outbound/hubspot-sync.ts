// ORAGROL Outbound engine — write a lead to HubSpot (OFF by default).
//
// Only runs when OUTBOUND_HUBSPOT_WRITE=1 and HUBSPOT_ACCESS_TOKEN is set.
// Uses only HubSpot's default contact properties for the upsert (email, first
// name, last name, job title, company, phone, website, city, state) and puts
// every other detail (proof page, grade, source, findings) in a note, same
// pattern as the Cyber Health sync. The custom outbound fields listed in the
// build checklist are not created yet.
//
// NEEDS VERIFICATION against the live HubSpot portal before it is switched on.
// Marketing-contact status is not set here: these are not marketing contacts
// until a reply.

import type { Lead } from "./store";

const API = "https://api.hubapi.com";

export function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().replace(/^(dr|mr|mrs|ms|mx|prof)\.?\s+/i, "").split(/\s+/);
  return { first: parts[0] ?? full, last: parts.slice(1).join(" ") };
}

export function leadNoteBody(l: Lead): string {
  return [
    `ODO Outbound lead (${l.foundOn}) — NOT CONTACTED YET`,
    `Business: ${l.businessName} — ${l.website}`,
    `Address: ${l.address ?? "not published"} | Main phone: ${l.phone ?? "not published"}`,
    `Person: ${l.personName}, ${l.personTitle} (${l.roleType}) — ${l.email}`,
    `Grade: ${l.grade}${l.needsHumanCheck ? " (needs a human check)" : ""}`,
    `Proof: ${l.proofUrl} | snippet: "${l.proofSnippet.slice(0, 200)}" | page hash ${l.proofPageSha256 ?? "n/a"}`,
    `Source: ${l.source} ${l.sourceId} | Area/sector: ${l.areaId}/${l.sectorId}`,
    `Findings: ${l.findings.length ? l.findings.map((f) => `${f.fact} [${f.proof}]`).join(" / ") : "none"}`,
    `Status: ${l.status}`,
  ].join("\n");
}

export function makeHubSpotLeadWriter(token: string, fetchImpl: typeof fetch = fetch): (l: Lead) => Promise<void> {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  return async (l) => {
    const { first, last } = splitName(l.personName);
    const up = await fetchImpl(`${API}/crm/v3/objects/contacts/batch/upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: [{
          idProperty: "email",
          id: l.email,
          properties: {
            email: l.email, firstname: first, lastname: last, jobtitle: l.personTitle, company: l.businessName,
            phone: l.phone ?? "", website: l.website, city: l.city ?? "", state: l.province ?? "",
          },
        }],
      }),
    });
    if (!up.ok) throw new Error(`HubSpot contact upsert HTTP ${up.status}`);
    const data = (await up.json()) as { results?: Array<{ id?: string }> };
    const contactId = data.results?.[0]?.id;
    if (!contactId) throw new Error("HubSpot returned no contact id");
    const note = await fetchImpl(`${API}/crm/v3/objects/notes`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        properties: { hs_timestamp: new Date().toISOString(), hs_note_body: leadNoteBody(l) },
        associations: [{ to: { id: contactId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }] }],
      }),
    });
    if (!note.ok) throw new Error(`HubSpot note HTTP ${note.status}`);
  };
}
