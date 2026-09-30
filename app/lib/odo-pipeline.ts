// ORAGROL ODO — Question selection + evaluation pipeline
//
// The one place that turns (findings, answers-so-far) into "what to ask
// next" and, once questioning ends, turns (findings, all answers) into the
// finished report. Shared by both /api/odo/scan/start (the rare case where
// research alone already covers everything — zero questions needed) and
// /api/odo/scan/answer (the normal case — questioning ends after N
// answers). Keeping this in one file means there is exactly one evaluation
// path to get right, not two copies that can drift.
//
// Every AI step underneath (Jev via odo-questions/odo-matching, Claude via
// odo-swot) has a deterministic fallback — see those files — so nothing
// here can hard-fail a scan just because a vendor API is slow or down.

import { updateSession, markSessionComplete, getSession, type OdoSession } from "./odo-redis";
import { buildLedger, ledgerAsText } from "./odo-ledger";
import { nextQuestion, type NextQuestionDecision } from "./odo-questions";
import { matchServices } from "./odo-matching";
import { buildSwot } from "./odo-swot";
import { buildOutcomeNarrative } from "./odo-outcome";
import { buildReport, type OdoReport } from "./odo-report";
import type { ResearchFindings } from "./odo-research";

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export type BusinessProfile = { industry: string | null; businessSize: ResearchFindings["businessSize"] };

/**
 * Ask ODO's adaptive selector what to ask next, given everything known so
 * far (research + answers). Wraps buildLedger + nextQuestion so callers
 * never assemble the ledger by hand. Never throws.
 */
export async function pickNextQuestion(
  findings: ResearchFindings,
  profile: BusinessProfile,
  hasWebsite: boolean,
  answers: Record<string, string>,
  answerOrder: string[]
): Promise<NextQuestionDecision> {
  const ledger = buildLedger(findings, answers, answerOrder);
  return nextQuestion({
    industry: profile.industry,
    businessSize: profile.businessSize,
    hasWebsite,
    answers,
    knownText: ledgerAsText(ledger, { includeInternal: false }),
  });
}

/**
 * Questioning is over — build the evidence ledger, match services, write
 * the SWOT, assemble the report, and save it to the session. The session
 * is the only place the report lives for now (no Postgres/S3 provisioned
 * yet) — see /api/odo/scan/report for how it's read back.
 */
export async function runEvaluation(
  sessionId: string,
  session: Pick<OdoSession, "visitorCompany" | "visitorWebsite" | "hubspotContactId">,
  findings: ResearchFindings,
  profile: BusinessProfile,
  answers: Record<string, string>,
  questionOrder: string[],
  questionMethod: string[]
): Promise<void> {
  try {
    await updateSession(sessionId, { step: "Building your evidence ledger..." });
    const ledger = buildLedger(findings, answers, questionOrder);

    await updateSession(sessionId, { step: "Matching services against the evidence..." });
    const matching = await matchServices(ledger, {
      industry: profile.industry,
      businessSize: profile.businessSize,
      answers,
    });

    await updateSession(sessionId, { step: "Writing your summary..." });
    const competitorNames = (findings.competitorProfiles ?? [])
      .filter((c) => c.classification === "confirmed_competitor" || c.classification === "probable_competitor")
      .map((c) => c.name);
    const swot = await buildSwot(ledger, matching, {
      business: session.visitorCompany,
      industry: profile.industry,
      businessSize: profile.businessSize,
      competitorNames,
    });

    await updateSession(sessionId, { step: "Writing your outlook and next steps..." });
    const outcomeNarrative = await buildOutcomeNarrative(ledger, matching, {
      business: session.visitorCompany,
      industry: profile.industry,
      businessSize: profile.businessSize,
    });

    // "Must be able to find nothing" (§2 #9) applies to DATA, not outcome —
    // insufficient_data means the ledger itself is too thin to say anything
    // responsible, which is different from a thick ledger that says "looks
    // fine." Client-audience evidence (any polarity) is the bar.
    const clientEvidenceCount = ledger.filter((e) => e.audience === "client").length;
    const condition: "complete" | "insufficient_data" = clientEvidenceCount >= 3 ? "complete" : "insufficient_data";

    const report = await buildReport({
      sessionId,
      company: session.visitorCompany,
      website: session.visitorWebsite,
      industry: profile.industry,
      businessSize: profile.businessSize,
      findings,
      ledger,
      matching,
      swot,
      outcomeNarrative,
      condition,
      answers,
      questionMethod,
    });

    await updateSession(sessionId, {
      swot: swot as unknown as Record<string, unknown>,
      serviceMatches: matching.matches as unknown[],
      condition,
      status: condition === "complete" ? "complete" : "insufficient_data",
      phase: "complete",
      step: "Scan complete",
      findings: { ...(findings as unknown as Record<string, unknown>), _report: report },
    });

    // Cooldowns only activate on a genuinely complete scan — an
    // insufficient-data run should not block the visitor from trying again.
    const full = await getSession(sessionId);
    if (full && condition === "complete") await markSessionComplete(full);

    await notifyZM77(report).catch((err) => {
      console.error("[ODO] ZM77 notification failed:", err);
    });

    if (session.hubspotContactId && HUBSPOT_TOKEN) {
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${session.hubspotContactId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          properties: {
            odo_scan_status: condition,
            odo_scan_condition: condition,
            odo_service_matches: matching.flagged.map((m) => m.simpleName).join(", "),
          },
        }),
      }).catch(() => {});
    }
  } catch (err) {
    console.error("[ODO] Evaluation failed:", err);
    await updateSession(sessionId, { status: "failed", step: "Evaluation failed. Our team has been notified." }).catch(() => {});
  }
}

/**
 * ZM77 is Mohammad's own review agent — not built yet. This stays a no-op
 * until ZM77_WEBHOOK_URL is configured (his call, his project). When it is,
 * the whole report goes over, including `internal` — ZM77/Mohammad's
 * review is exactly the audience that field exists for. Nothing here
 * changes the §28 approval gate: every report is still "draft_pending_review".
 */
async function notifyZM77(report: OdoReport): Promise<void> {
  const zm77Webhook = process.env.ZM77_WEBHOOK_URL;
  if (!zm77Webhook) {
    console.warn("[ODO] ZM77_WEBHOOK_URL not configured — skipping ZM77 notification");
    return;
  }
  await fetch(zm77Webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-ODO-Source": "oragrol-odo-v1" },
    body: JSON.stringify({
      source: "ODO",
      event: "scan_complete",
      requiresApproval: true,
      report,
    }),
    signal: AbortSignal.timeout(10000),
  });
}
