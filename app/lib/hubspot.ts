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

/**
 * Upserts a HubSpot contact for a chat-widget escalation (see
 * app/api/chat/route.ts) and attaches a note tagged with the lead
 * source/channel so it's obvious in the CRM this didn't come from the
 * Contact form or Cyber Health — same upsert-by-email + note pattern as
 * syncCyberHealthLeadToHubSpot below, deliberately not shared code
 * since the two payloads are different shapes.
 */
export async function syncChatLeadToHubSpot(params: {
  name: string;
  email: string;
  reason: "urgent" | "human-requested";
  transcript: { role: "visitor" | "oragrol"; text: string }[];
}): Promise<HubSpotSyncResult> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return { ok: false, error: "HUBSPOT_ACCESS_TOKEN is not set — skipping CRM sync." };
  }

  const nameParts = params.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? params.name;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  try {
    const upsertRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/batch/upsert`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: [
          {
            idProperty: "email",
            id: params.email,
            properties: { email: params.email, firstname: firstName, lastname: lastName },
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
    if (!contactId) return { ok: false, error: "HubSpot contact upsert returned no contact id." };

    const noteBody = [
      `Lead source: ORAGROL Chat Widget`,
      `Reason flagged: ${params.reason === "urgent" ? "Urgent / possible incident" : "Requested a human"}`,
      ``,
      `Transcript:`,
      ...params.transcript.map((m) => `  [${m.role === "visitor" ? "Visitor" : "ORAGROL"}] ${m.text}`),
    ].join("\n");

    const noteRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/notes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: { hs_note_body: noteBody, hs_timestamp: Date.now() },
        associations: [
          { to: { id: contactId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }] },
        ],
      }),
    });

    if (!noteRes.ok) {
      const text = await noteRes.text().catch(() => "");
      return { ok: true, contactId, error: `Contact synced, but the note failed to attach: ${noteRes.status} ${text}`.slice(0, 500) };
    }

    return { ok: true, contactId };
  } catch (err) {
    return { ok: false, error: `HubSpot chat sync threw: ${err instanceof Error ? err.message : String(err)}` };
  }
}

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
      `Recommended next step: ${report.nextStep.label}`,
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

/**
 * My Scope's HubSpot sync (2026-09-09) — deliberately a NEW function with
 * its own result type, not a change to HubSpotSyncResult or the two
 * functions above. Per My_Scope_Final_Ready_For_Claude.md Section E:
 * "Prefer a scope-specific structured result (contact state / note
 * state) over changing a shared ok flag without adapting Cyber Health
 * and chat... Do not add unsolicited behavioural changes to those flows."
 *
 * The bug this avoids repeating: both functions above return `ok: true`
 * even when the Note attach fails ("Contact synced, but the note failed
 * to attach" gets folded into ok:true) — a caller checking `.ok` alone
 * cannot tell a full success from a half-failure. Fixing that for Cyber
 * Health/chat is explicitly out of scope here; this function just
 * doesn't repeat the mistake in new code.
 *
 * Contact + Note only, per Section 1 — no Deal, no pipeline stage, no
 * marketing enrollment, no Company object. Company is saved as a plain
 * Contact property (HubSpot's default `company`), same as Cyber Health.
 */

export type ScopeArea = "Cybersecurity" | "Automation" | "OR ONE";

export type ScopeResolvedItem = {
  area: ScopeArea;
  code: string;
  name: string;
};

// "Automation" internally -> "Business Automation" in any client-facing
// text (note body, emails), matching Section 4's mapping requirement.
const AREA_LABEL: Record<ScopeArea, string> = {
  Cybersecurity: "Cybersecurity",
  Automation: "Business Automation",
  "OR ONE": "OR ONE",
};
// Fixed display order for the note's "Selected items" section and its
// "Selected areas" summary line, independent of selection order.
const AREA_ORDER: ScopeArea[] = ["Cybersecurity", "Automation", "OR ONE"];

/**
 * Split into two independent functions (syncScopeContact / syncScopeNote
 * + findScopeNoteByActionId) rather than one combined call, per
 * My_Scope_Final_Ready_For_Claude.md Section C: "Model jobs separately:
 * ... hubspot_contact, hubspot_note ... note depends on confirmed
 * contact ID." The job worker (scope-worker.ts) only ever calls
 * syncScopeNote once hubspot_contact has actually completed with a real
 * stored contactId — never speculatively in the same call.
 */

export type ScopeContactSyncResult =
  | { state: "synced"; contactId: string }
  | { state: "failed"; error: string };

export async function syncScopeContact(client: {
  name: string;
  email: string;
  phone: string;
  company: string;
}): Promise<ScopeContactSyncResult> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return { state: "failed", error: "HUBSPOT_ACCESS_TOKEN is not set — skipping CRM sync." };
  }

  const { firstName, lastName } = splitName(client.name);

  try {
    const upsertRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/batch/upsert`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: [
          {
            idProperty: "email",
            id: client.email,
            properties: {
              email: client.email,
              firstname: firstName,
              lastname: lastName,
              phone: client.phone,
              company: client.company,
            },
          },
        ],
      }),
    });

    if (!upsertRes.ok) {
      const text = await upsertRes.text().catch(() => "");
      return { state: "failed", error: `HubSpot contact upsert failed: ${upsertRes.status} ${text}`.slice(0, 500) };
    }

    const upsertData = await upsertRes.json();
    const contactId = upsertData?.results?.[0]?.id;
    if (!contactId) {
      return { state: "failed", error: "HubSpot contact upsert returned no contact id." };
    }
    return { state: "synced", contactId };
  } catch (err) {
    return { state: "failed", error: `HubSpot contact sync threw: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export function buildScopeNoteBody(params: {
  actionId: string;
  reference: string;
  intent: "pdf_download" | "review_requested";
  submittedAt: string;
  sourcePath: string;
  client: { name: string; email: string; phone: string; company: string };
  items: ScopeResolvedItem[];
  context?: string;
  timeframe?: string;
  disclosureVersion: string;
  acknowledgedAt: string;
}): string {
  const areasPresent = AREA_ORDER.filter((a) => params.items.some((i) => i.area === a));
  const intentLabel = params.intent === "pdf_download" ? "PDF Download Only" : "Review Requested";
  const priorityLabel =
    params.intent === "pdf_download" ? "LOW - gentle follow-up" : "HIGH - prompt personal follow-up";

  const noteLines: string[] = [
    "Lead source: My Scope",
    `Intent: ${intentLabel}`,
    `Follow-up priority: ${priorityLabel}`,
    `Scope reference: ${params.reference}`,
    `Action ID: ${params.actionId}`,
    `Submitted at: ${params.submittedAt}`,
    `Source page: ${params.sourcePath}`,
    `Selected areas: ${areasPresent.map((a) => AREA_LABEL[a]).join(", ")}`,
    "",
    "Client",
    `Full name: ${params.client.name}`,
    `Email: ${params.client.email}`,
    `Phone: ${params.client.phone}`,
    `Company: ${params.client.company}`,
    "",
    "Selected items",
  ];
  for (const area of areasPresent) {
    noteLines.push(AREA_LABEL[area]);
    for (const item of params.items.filter((i) => i.area === area)) {
      noteLines.push(`- ${item.code} | ${item.name}`);
    }
  }
  noteLines.push(
    "",
    `Context: ${params.context?.trim() || "Not provided"}`,
    `Timeframe: ${params.timeframe?.trim() || "Not provided"}`,
    `Disclosure: ${params.disclosureVersion} (acknowledged ${params.acknowledgedAt})`,
  );
  return noteLines.join("\n");
}

export type ScopeNoteSyncResult =
  | { state: "created"; noteId: string }
  | { state: "failed"; error: string };

/**
 * Section E: "embed a stable Action ID in the note body" — done by
 * buildScopeNoteBody always including "Action ID: {actionId}" as its
 * own line, which findScopeNoteByActionId (below) greps for during
 * recovery.
 */
export async function syncScopeNote(contactId: string, noteBody: string): Promise<ScopeNoteSyncResult> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return { state: "failed", error: "HUBSPOT_ACCESS_TOKEN is not set — skipping CRM sync." };
  }
  try {
    const noteRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/notes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: { hs_note_body: noteBody, hs_timestamp: Date.now() },
        associations: [
          { to: { id: contactId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }] },
        ],
      }),
    });
    if (!noteRes.ok) {
      const text = await noteRes.text().catch(() => "");
      return { state: "failed", error: `HubSpot note create failed: ${noteRes.status} ${text}`.slice(0, 500) };
    }
    const data = await noteRes.json();
    const noteId = data?.id;
    if (!noteId) return { state: "failed", error: "HubSpot note create returned no note id." };
    return { state: "created", noteId };
  } catch (err) {
    return { state: "failed", error: `HubSpot note sync threw: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Section E's recovery path: "If the response is lost after possible
 * creation, first inspect the known contact's associated notes and
 * match the exact Action ID, paginating as necessary." Returns the
 * note's real ID if a note containing this exact actionId already
 * exists on this contact, so the worker can record it as already-done
 * instead of creating a duplicate. Returns null (not an error) when no
 * matching note is found — the caller decides what that means (a
 * genuinely fresh attempt vs. reconciliation_required) based on whether
 * this is being called after a real ambiguous-response event.
 */
export async function findScopeNoteByActionId(contactId: string, actionId: string): Promise<string | null> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) return null;
  const needle = `Action ID: ${actionId}`;
  let after: string | undefined;
  // Bounded pagination — a contact accumulating unbounded notes over
  // time shouldn't turn a reconciliation check into an unbounded scan.
  for (let page = 0; page < 10; page++) {
    const url = new URL(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}/associations/notes`);
    if (after) url.searchParams.set("after", after);
    const assocRes = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!assocRes.ok) return null;
    const assocData = await assocRes.json();
    const noteIds: string[] = (assocData?.results ?? []).map((r: { toObjectId?: string; id?: string }) => r.toObjectId ?? r.id).filter(Boolean);
    for (const noteId of noteIds) {
      const noteRes = await fetch(
        `${HUBSPOT_API_BASE}/crm/v3/objects/notes/${noteId}?properties=hs_note_body`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!noteRes.ok) continue;
      const noteData = await noteRes.json();
      const body: string = noteData?.properties?.hs_note_body ?? "";
      if (body.includes(needle)) return noteId;
    }
    after = assocData?.paging?.next?.after;
    if (!after) break;
  }
  return null;
}
