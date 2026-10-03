// ORAGROL ODO — Abandoned scans are still leads (Master Reference §37.9)
//
// A visitor who gave their name, email and consent, sat through the research
// and then cancelled or walked away is still a warm lead. ODO's job ends at
// handing information to OCS, so here it hands over what it has — contact,
// public research, the conversation so far — exactly once per scan:
//   - HubSpot: client_reference = "abandoned" + a note on the contact
//   - Mohammad: one admin email
// Nothing is ever sent to the visitor, and the session is NOT closed: if the
// visitor comes back within the session's life and finishes, the normal
// report flow runs (and overwrites client_reference).

import {
  getSession,
  listIdleSessions,
  touchActiveSession,
  claimLeadHandoff,
  recordLifetimeAiCost,
  type OdoSession,
} from "./odo-redis";
import { interviewContext, reviewerTranscript } from "./odo-pipeline";
import type { InterviewState, ChatMessage } from "./odo-interviewer";
import type { ResearchFindings } from "./odo-research";
import { sendOdoAdminAbandonedEmail } from "./odo-email";
import { computeCost, EMPTY_USAGE, type AiUsageTotals } from "./odo-cost";
import { recordScanSpend } from "./odo-spend";

/** A live interview with no activity for this long is treated as abandoned. */
export const ABANDON_AFTER_MS = 30 * 60 * 1000;

async function hubspot(contactId: string, note: string): Promise<void> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) return;
  await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ properties: { client_reference: "abandoned" } }),
  }).catch(() => {});
  try {
    const res = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ properties: { hs_note_body: note.slice(0, 60000), hs_timestamp: Date.now().toString() } }),
    });
    if (!res.ok) return;
    const { id } = (await res.json()) as { id: string };
    await fetch(`https://api.hubapi.com/crm/v3/objects/notes/${id}/associations/contact/${contactId}/note_to_contact`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch { /* best effort */ }
}

/** Hand an unfinished scan to OCS. Safe to call repeatedly — only the first call does anything. */
export async function passAbandonedLead(session: OdoSession, how: "cancelled" | "walked_away"): Promise<boolean> {
  // Only scans that reached the interview carry anything worth passing on.
  const findings = session.findings as Record<string, unknown>;
  const interview = findings._interview as InterviewState | undefined;
  const chat = findings._chat as ChatMessage[] | undefined;
  if (!interview || interview.ended) return false;
  if (!(await claimLeadHandoff(session.sessionId).catch(() => false))) return false;

  const research = findings as unknown as ResearchFindings;
  const profile = {
    industry: (findings._industryDetected as string | undefined) ?? research.industry ?? null,
    businessSize: (findings._businessSizeDetected as ResearchFindings["businessSize"] | undefined) ?? research.businessSize ?? null,
  };
  let researchText = "";
  try { researchText = interviewContext(research, session, profile).researchText; } catch { /* keep empty */ }
  const transcript = reviewerTranscript(interview, chat);
  const usage = (findings._aiUsage as AiUsageTotals | undefined) ?? EMPTY_USAGE;
  const cost = computeCost(usage);

  // The money was spent either way — it belongs in the totals.
  await recordLifetimeAiCost(usage, cost.totalCostUsd).catch(() => {});
  await recordScanSpend(cost.totalCostUsd).catch(() => {});

  if (session.hubspotContactId) {
    await hubspot(
      session.hubspotContactId,
      `ODO scan ${how === "cancelled" ? "cancelled by visitor" : "abandoned (visitor stopped replying)"} after ${interview.answered} answer(s).\n` +
        `Industry: ${profile.industry ?? "unknown"}\n\n${transcript}`
    );
  }

  const r = await sendOdoAdminAbandonedEmail({
    companyName: session.visitorCompany,
    visitorName: session.visitorName,
    visitorEmail: session.visitorEmail,
    website: session.visitorWebsite,
    sessionId: session.sessionId,
    how,
    industry: profile.industry,
    researchText,
    transcript,
    costUsd: cost.totalCostUsd,
  }).catch((err) => ({ state: "failed" as const, error: String(err) }));
  if (r.state !== "sent") console.warn(`[ODO] Abandoned-lead email not sent (${r.state}).`);
  console.log(`[ODO] Abandoned lead passed on: ${session.sessionId} (${how})`);
  return true;
}

/** Find interviews idle for 30+ minutes and pass each on once. Bounded per run. */
export async function sweepAbandonedScans(now = Date.now()): Promise<{ checked: number; passed: number }> {
  const ids = await listIdleSessions(now - ABANDON_AFTER_MS, 20).catch(() => [] as string[]);
  let passed = 0;
  for (const id of ids) {
    const session = await getSession(id).catch(() => null);
    // Gone (expired) or no longer in the interview → just drop it from the set.
    if (!session || session.status !== "questioning") {
      await touchActiveSession(id, false).catch(() => {});
      continue;
    }
    if (now - session.updatedAt < ABANDON_AFTER_MS) continue;
    if (await passAbandonedLead(session, "walked_away").catch(() => false)) passed++;
    // Leave the scan open (the visitor may still come back) but stop re-checking it.
    await touchActiveSession(id, false).catch(() => {});
  }
  return { checked: ids.length, passed };
}
