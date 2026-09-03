/**
 * Minimal HubSpot integration for the Cyber Health lead pipeline — a
 * direct server-to-server call to HubSpot's REST API using a Private App
 * access token (`HUBSPOT_ACCESS_TOKEN`), NOT this session's own HubSpot
 * MCP connection (that connection is for interactive use in chat only;
 * the live website's backend needs its own credential, created in
 * HubSpot under Settings -> Integrations -> Private Apps, with the
 * `crm.objects.contacts.write` and `crm.objects.notes.write` scopes).
 *
 * Deliberately uses only guaranteed-to-exist default Contact properties
 * (email, firstname, lastname, phone, company) for the upsert, then adds
 * the full assessment context — industry, employees, platform, score,
 * tier, package, category breakdown — as a Note associated with the
 * contact. This avoids depending on custom contact properties that may
 * not exist in Mohammad's HubSpot portal, which a Private App token
 * cannot reliably create on its own.
 *
 * This has NOT been tested against a live HubSpot portal (no token is
 * configured in this environment) — it follows HubSpot's documented v3
 * CRM API, but should be verified against a real account before being
 * relied on for production lead capture.
 */
import type { CyberHealthReport } from "./cyber-health-report";

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export interface HubSpotSyncResult {
  ok: boolean;
  error?: string;
  contactId?: string;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

export async function syncCyberHealthLeadToHubSpot(report: CyberHealthReport): Promise<HubSpotSyncResult> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return { ok: false, error: "HUBSPOT_ACCESS_TOKEN is not set — skipping CRM sync." };
  }

  const { profile } = report;
  const { firstName, lastName } = splitName(profile.name);

  try {
    const upsertRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/batch/upsert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [
          {
            idProperty: "email",
            id: profile.email,
            properties: {
              email: profile.email,
              firstname: firstName,
              lastname: lastName,
              phone: profile.phone,
              company: profile.company,
            },
          },
        ],
      }),
    });

    if (!upsertRes.ok) {
      const text = await upsertRes.text().catch(() => "");
      return { ok: false, error: `HubSpot contact upsert failed: ${upsertRes.status} ${text}`.slice(0, 500) };
    }

    const upsertData = await upsertRes.json();
    const contactId: string | undefined = upsertData?.results?.[0]?.id;

    if (!contactId) {
      return { ok: false, error: "HubSpot contact upsert returned no contact id." };
    }

    const noteBody = [
      `Cyber Health Assessment completed — ${report.reportId} (${report.clientReference})`,
      ``,
      `Score: ${report.score}/100 — Risk tier: ${report.tier} — Maturity: ${report.maturity}`,
      `Industry: ${profile.industry} — Company size: ${profile.employees} — Cloud platform: ${profile.platform}`,
      `Recommended package: ${report.recommendedPackage}`,
      ``,
      `Category groups:`,
      ...report.groups.map((g) => `  - ${g.name}: ${g.score}%`),
      ``,
      `Top risks:`,
      ...(report.topRisks.length ? report.topRisks.map((f) => `  - [${f.severity}] ${f.title}`) : ["  - None — all assessed areas scored at or above the healthy threshold."]),
    ].join("\n");

    const noteRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: Date.now(),
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }], // note-to-contact
          },
        ],
      }),
    });

    if (!noteRes.ok) {
      const text = await noteRes.text().catch(() => "");
      // Contact was still created/updated successfully — the note is
      // supplementary context, not the primary record, so this is a
      // partial success, not a hard failure.
      return { ok: true, contactId, error: `Contact synced, but the note failed to attach: ${noteRes.status} ${text}`.slice(0, 500) };
    }

    return { ok: true, contactId };
  } catch (err) {
    return { ok: false, error: `HubSpot sync threw: ${err instanceof Error ? err.message : String(err)}` };
  }
}
