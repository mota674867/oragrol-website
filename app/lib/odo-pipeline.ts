// ORAGROL ODO — Interview context + evaluation pipeline
//
// The one place that turns research findings into the interviewer's context
// and, once the interview ends, turns (findings + judged answers) into the
// finished report — or, when the answers can't be relied on, into the honest
// "not enough reliable information" ending (Master Reference §37.4), which
// produces no report, no offers, and stops all further AI spend.
//
// Shared by /api/odo/scan/start (opening turn) and /api/odo/scan/answer
// (every later turn), so there is exactly one evaluation path to get right.

import { updateSession, markSessionComplete, getSession, type OdoSession } from "./odo-redis";
import { buildLedger, ledgerAsText } from "./odo-ledger";
import type { InterviewContext, InterviewState, ChatMessage } from "./odo-interviewer";
import { matchServices } from "./odo-matching";
import { buildSwot } from "./odo-swot";
import { buildOutcomeNarrative } from "./odo-outcome";
import { buildReport, type OdoReport } from "./odo-report";
import type { ResearchFindings } from "./odo-research";
import { attachReportPdfToHubSpot } from "./odo-hubspot-report";
import { sendOdoAdminReportEmail, sendOdoAdminInsufficientEmail } from "./odo-email";
import { EMPTY_USAGE, addJevUsage, mergeUsage, computeCost, type AiUsageTotals } from "./odo-cost";
import { recordLifetimeAiCost } from "./odo-redis";
import { recordScanSpend } from "./odo-spend";
import { buildBenchmark } from "./odo-benchmark";

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export type BusinessProfile = { industry: string | null; businessSize: ResearchFindings["businessSize"] };

/** Everything the interviewer reads about this business — research only, client-audience only. */
export function interviewContext(
  findings: ResearchFindings,
  session: Pick<OdoSession, "visitorCompany" | "visitorWebsite">,
  profile: BusinessProfile
): InterviewContext {
  // Research-only ledger: interview evidence is passed to the model through
  // its own judged transcript, never twice.
  const raw = findings as unknown as Record<string, unknown>;
  const researchOnly = { ...raw, _interview: undefined } as unknown as ResearchFindings;
  return {
    company: session.visitorCompany,
    website: session.visitorWebsite,
    industry: profile.industry,
    businessSize: profile.businessSize,
    profile: findings.businessProfile ?? null,
    complianceSignals: findings.complianceSignals ?? null,
    researchText: ledgerAsText(buildLedger(researchOnly), { includeInternal: false }),
  };
}

/** Plain-text transcript with ODO's judgement of every turn — for Mohammad's review email only. */
export function reviewerTranscript(state: InterviewState | undefined, chat: ChatMessage[] | undefined): string {
  if (!state || !chat) return "(no interview)";
  const lines = chat.map((m) => (m.role === "odo" ? `ODO: ${m.text}` : m.kind === "skip" ? "VISITOR: [Prefer not to answer]" : `VISITOR: ${m.text}`));
  const judged = state.judged.map((j, i) => `${i + 1}. ${j.type}${j.quality ? ` / ${j.quality}` : ""} — "${j.visitorText.slice(0, 160)}"${j.note ? ` — ${j.note}` : ""}`);
  return [
    `Questions asked: ${state.questionsAsked} · answers: ${state.answered} · skips: ${state.skips} · nonsense: ${state.nonsense} · visitor questions: ${state.visitorQuestions}${state.urgent ? " · ⚠ URGENT INCIDENT DESCRIBED" : ""}`,
    `Ending: ${state.ended ? `${state.ended.outcome} — ${state.ended.reason}` : "in progress"}`,
    "",
    "── How ODO judged each turn ──",
    ...judged,
    "",
    ...(state.liveChecks?.length
      ? ["", "── Live checks ODO ran during the interview ──", ...state.liveChecks.map((c) => `• ${c.tool} ${c.input}\n  ${c.result.replace(/\n/g, "\n  ")}`)]
      : []),
    "",
    "── Full conversation ──",
    ...lines,
  ].join("\n");
}

/**
 * The interview ended as "not enough reliable information" (§37.4): no
 * report, no offers, no further AI calls. Records the spend already incurred,
 * marks the HubSpot contact, and tells Mohammad why — with the transcript —
 * so he can judge whether ODO was right to stop.
 */
export async function finalizeInsufficient(
  sessionId: string,
  session: Pick<OdoSession, "visitorCompany" | "visitorEmail" | "hubspotContactId">,
  state: InterviewState,
  chat: ChatMessage[],
  aiUsage: AiUsageTotals
): Promise<void> {
  const cost = computeCost(aiUsage);
  await recordLifetimeAiCost(aiUsage, cost.totalCostUsd).catch((err) => console.error("[ODO] Failed to record lifetime AI cost:", err));
  await recordScanSpend(cost.totalCostUsd).catch((err) => console.error("[ODO] Failed to record scan spend:", err));
  console.log(`[ODO Cost] ${sessionId} — insufficient ending, total $${cost.totalCostUsd.toFixed(6)}`);

  if (session.hubspotContactId && HUBSPOT_TOKEN) {
    await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${session.hubspotContactId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ properties: { client_reference: "insufficient_data" } }),
    }).catch(() => {});
  }

  await sendOdoAdminInsufficientEmail({
    companyName: session.visitorCompany,
    visitorEmail: session.visitorEmail,
    sessionId,
    reason: state.ended?.reason ?? "insufficient",
    transcript: reviewerTranscript(state, chat),
    costUsd: cost.totalCostUsd,
  })
    .then((r) => { if (r.state !== "sent") console.warn(`[ODO] Insufficient-ending admin email not sent (${r.state}).`); })
    .catch((err) => console.error("[ODO] Insufficient-ending admin email failed:", err));
}

/**
 * Questioning is over — build the evidence ledger, match services, write
 * the SWOT, assemble the report, and save it to the session. The session
 * is the only place the report lives for now (no Postgres/S3 provisioned
 * yet) — see /api/odo/scan/report for how it's read back.
 */
export async function runEvaluation(
  sessionId: string,
  session: Pick<OdoSession, "visitorCompany" | "visitorWebsite" | "visitorEmail" | "hubspotContactId">,
  findings: ResearchFindings,
  profile: BusinessProfile,
  /** Real AI usage already spent before evaluation (research, business profile, every interview turn) — so the final per-scan cost is exact, not just the evaluation-phase portion (odo-cost.ts). */
  priorAiUsage: AiUsageTotals = EMPTY_USAGE
): Promise<void> {
  // The judged interview lives on the session findings (odo-interviewer.ts).
  const raw = findings as unknown as Record<string, unknown>;
  const interview = raw._interview as InterviewState | undefined;
  const chat = raw._chat as ChatMessage[] | undefined;
  const answers: Record<string, string> = Object.fromEntries(
    (interview?.judged ?? [])
      .filter((j) => j.type === "answer" || j.type === "answer_and_question")
      .map((j) => [j.questionId, j.visitorText])
  );
  try {
    await updateSession(sessionId, { step: "Building your evidence ledger..." });
    const ledger = buildLedger(findings);

    await updateSession(sessionId, { step: "Matching services against the evidence..." });
    const matching = await matchServices(ledger, {
      industry: profile.industry,
      businessSize: profile.businessSize,
    });

    await updateSession(sessionId, { step: "Writing your summary..." });
    const competitorNames = (findings.competitorProfiles ?? [])
      .filter((c) => c.classification === "confirmed_competitor" || c.classification === "probable_competitor")
      .map((c) => c.name);
    const { swot, usage: swotUsage } = await buildSwot(ledger, matching, {
      business: session.visitorCompany,
      industry: profile.industry,
      businessSize: profile.businessSize,
      competitorNames,
    });

    await updateSession(sessionId, { step: "Writing your outlook and next steps..." });
    const { outcome: outcomeNarrative, usage: outcomeUsage } = await buildOutcomeNarrative(ledger, matching, {
      business: session.visitorCompany,
      industry: profile.industry,
      businessSize: profile.businessSize,
    });

    // Exact per-scan AI cost (odo-cost.ts) — real token usage from every Jev
    // call (question selection + service matching + custom-flag) and every
    // Claude call (SWOT + outcome narrative) this scan actually made, priced
    // at each vendor's verified rate. Never an estimate.
    const totalUsage = mergeUsage(
      mergeUsage(priorAiUsage, addJevUsage(EMPTY_USAGE, matching.jevUsage)),
      { ...EMPTY_USAGE, claudeInputTokens: (swotUsage?.input_tokens ?? 0) + (outcomeUsage?.input_tokens ?? 0), claudeOutputTokens: (swotUsage?.output_tokens ?? 0) + (outcomeUsage?.output_tokens ?? 0), claudeCalls: (swotUsage ? 1 : 0) + (outcomeUsage ? 1 : 0) }
    );
    const aiCost = computeCost(totalUsage);

    // "Must be able to find nothing" (§2 #9) applies to DATA, not outcome —
    // insufficient_data means the ledger itself is too thin to say anything
    // responsible, which is different from a thick ledger that says "looks
    // fine." Client-audience evidence (any polarity) is the bar.
    const clientEvidenceCount = ledger.filter((e) => e.audience === "client").length;
    const condition: "complete" | "insufficient_data" = clientEvidenceCount >= 3 ? "complete" : "insufficient_data";

    // §37.7 competitor benchmark — passive DNS only, aggregate only, never blocks the report.
    const benchmark = await buildBenchmark(session.visitorWebsite, findings.competitorProfiles ?? null).catch(() => null);

    const report = await buildReport({
      sessionId,
      benchmark,
      quickWin: interview?.quickWin ?? null,
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
      questionMethod: [],
      aiCost,
    });

    console.log(
      `[ODO Cost] ${report.reference} — total $${aiCost.totalCostUsd.toFixed(6)} ` +
      `(Jev $${aiCost.jevCostUsd.toFixed(6)} / ${totalUsage.jevCalls} calls, ${totalUsage.jevInputTokens} in tokens; ` +
      `Claude $${aiCost.claudeCostUsd.toFixed(6)} / ${totalUsage.claudeCalls} calls, ${totalUsage.claudeInputTokens} in + ${totalUsage.claudeOutputTokens} out tokens)`
    );
    await recordLifetimeAiCost(totalUsage, aiCost.totalCostUsd).catch((err) => {
      console.error("[ODO] Failed to record lifetime AI cost:", err);
    });
    // Daily global spend ceiling (odo-spend.ts) — approved 2026-10-01
    // alongside the per-scan $2 cap. Recorded once per scan, here, so the
    // next scan's entry-gate check (checkDailySpendGate in
    // /api/odo/scan/start) sees today's real running total.
    await recordScanSpend(aiCost.totalCostUsd);

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

    // Stop-gap so Mohammad can actually see the finished PDF right away
    // (odo-email.ts) — ZM77 doesn't exist yet and the HubSpot
    // approval-gate rework is on hold, so this is the fastest real path
    // until one of those replaces it. Internal-only; never blocks or fails
    // the scan on error — but IS awaited (unlike a bare fire-and-forget
    // call), because this whole function only keeps running past its
    // caller's response thanks to Vercel's after() wrapping it one level up
    // (api/odo/scan/answer/route.ts) — the same bug class as the ZM77/
    // HubSpot calls already fixed here once before: an unawaited promise
    // has no guarantee the function stays alive long enough to finish it.
    await sendOdoAdminReportEmail({
      report,
      companyName: session.visitorCompany,
      visitorEmail: session.visitorEmail,
      sessionId,
      condition,
      transcript: reviewerTranscript(interview, chat),
      urgent: interview?.urgent === true,
    })
      .then((result) => {
        if (result.state !== "sent") console.warn(`[ODO] Admin report email not sent (${result.state}):`, "reason" in result ? result.reason : result.error);
      })
      .catch((err) => console.error("[ODO] Admin report email failed:", err));

    const serviceMatchesSummary = matching.flagged.map((m) => m.simpleName).join(", ");

    if (session.hubspotContactId && HUBSPOT_TOKEN) {
      // Confirmed 2026-09-30: the portal's free CRM plan was already at
      // 10/10 custom contact properties, so ODO doesn't create a new one.
      // Instead it repurposes "client_reference" (internal name
      // client_reference) — verified dead via a full grep of this repo (zero
      // hits), 0% fill / 0 "Used In" in HubSpot, and n8n (the only other
      // thing that could write to it) being fully retired in favor of this
      // codebase. It carries "in_progress" (set at scan start) through to
      // "complete" / "insufficient_data" here, and doubles as the membership
      // filter for the "ODO Scan Leads" list. odo_service_matches never
      // became a real property either — that detail goes in the note below
      // instead (attachReportPdfToHubSpot), same fix as the mid-scan update
      // in scan/start/route.ts.
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${session.hubspotContactId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          properties: { client_reference: condition },
        }),
      }).catch(() => {});

      // Render + upload the report PDF and attach it to the contact's
      // timeline. Best-effort and fire-and-forget by design (see
      // odo-hubspot-report.ts) — a PDF/HubSpot hiccup must never fail an
      // otherwise-successful scan.
      await attachReportPdfToHubSpot(session.hubspotContactId, report, serviceMatchesSummary).catch(() => {});
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
