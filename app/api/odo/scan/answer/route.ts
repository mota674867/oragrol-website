// POST /api/odo/scan/answer
//
// One interview turn (rebuilt 2026-10-03, Master Reference §37). The visitor
// sends either a typed message or a "Prefer not to answer" skip; ODO judges
// it and replies — next question, a clarification, an answer to the
// visitor's own question, a polite nonsense warning, or one of the endings.
//
// Request:  { session_id, version, message?: string, skip?: true }
//   `version` is the interview version the browser last saw. A mismatch
//   means the browser is behind (another tab, a retried request) and the
//   turn is refused rather than run against state the visitor never saw.
// Response: { status, chat, chat_version, awaiting, pending, progress, message? }

import { after, NextRequest, NextResponse } from "next/server";
import { countForZm77 } from "@/app/lib/odo-zm77";
import { getSession, updateSession, acquireTurnLock, releaseTurnLock, recordLifetimeAiCost } from "@/app/lib/odo-redis";
import { interviewContext, finalizeInsufficient, runEvaluation, reviewerTranscript, type BusinessProfile } from "@/app/lib/odo-pipeline";
import { sendOdoUrgentAlertEmail } from "@/app/lib/odo-email";
import {
  recordVisitorMessage,
  runInterviewTurn,
  publicInterviewView,
  type InterviewState,
  type ChatMessage,
} from "@/app/lib/odo-interviewer";
import { AI_UNAVAILABLE_MESSAGE } from "@/app/lib/odo-playbook";
import type { ResearchFindings } from "@/app/lib/odo-research";
import { EMPTY_USAGE, addClaudeUsage, computeCost, type AiUsageTotals } from "@/app/lib/odo-cost";
import { isScanOverCap, recordScanSpend } from "@/app/lib/odo-spend";

/** A typed answer longer than this is not a real answer — and an unbounded body is an abuse vector. */
const MAX_MESSAGE_CHARS = 2000;

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const sessionId = String(body.session_id || "").trim();
  const skip = body.skip === true;
  const text = typeof body.message === "string" ? body.message.trim() : "";
  const version = typeof body.version === "number" ? body.version : null;

  if (!sessionId) return NextResponse.json({ code: "validation_error", message: "session_id is required." }, { status: 400 });
  if (!skip && !text) return NextResponse.json({ code: "validation_error", message: "Please type an answer, or press “Prefer not to answer”." }, { status: 400 });
  if (text.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ code: "validation_error", message: `Please keep your answer under ${MAX_MESSAGE_CHARS} characters.` }, { status: 400 });
  }

  const session = await getSession(sessionId).catch(() => null);
  if (!session) return NextResponse.json({ code: "session_not_found" }, { status: 404 });
  if (session.status !== "questioning") {
    return NextResponse.json({ code: "invalid_state", message: `Session is in ${session.status} state, not questioning.` }, { status: 409 });
  }

  const findings = session.findings as Record<string, unknown>;
  const interview = findings._interview as InterviewState | undefined;
  const chat = (findings._chat as ChatMessage[] | undefined) ?? [];
  if (!interview?.pending) return NextResponse.json({ code: "invalid_state", message: "No question is waiting for an answer." }, { status: 409 });
  if (version !== null && version !== interview.version) {
    return NextResponse.json({ code: "stale", status: session.status, ...publicInterviewView(interview, chat) }, { status: 409 });
  }

  if (!(await acquireTurnLock(sessionId).catch(() => false))) {
    return NextResponse.json({ code: "busy", message: "ODO is still working on your last message." }, { status: 409 });
  }

  try {
    const input = skip ? { kind: "skip" as const } : { kind: "message" as const, text };

    // 1. Save the visitor's message first — a reload or poll mid-turn shows it.
    const rec = recordVisitorMessage(interview, chat, input);
    await updateSession(sessionId, { findings: { ...findings, _interview: rec.state, _chat: rec.chat }, step: `turn-${rec.state.version}` });

    // 2. ODO's turn.
    const researchFindings = findings as unknown as ResearchFindings;
    const profile: BusinessProfile = {
      industry: (findings._industryDetected as string | undefined) ?? researchFindings.industry ?? null,
      businessSize: (findings._businessSizeDetected as ResearchFindings["businessSize"] | undefined) ?? researchFindings.businessSize ?? null,
    };
    const priorUsage: AiUsageTotals = (findings._aiUsage as AiUsageTotals | undefined) ?? EMPTY_USAGE;
    // While ODO runs a live check (odo-live-checks.ts), show the visitor what
    // it is doing. Same interview version as the saved visitor message — the
    // browser reads `activity` without treating it as a new conversation state.
    let checkCount = 0;
    const onActivity = async (activity: string) => {
      checkCount++;
      await updateSession(sessionId, {
        findings: { ...findings, _interview: { ...rec.state, activity }, _chat: rec.chat },
        step: `turn-${rec.state.version}-check-${checkCount}`,
      });
    };
    const result = await runInterviewTurn(
      interviewContext(researchFindings, session, profile),
      rec.state,
      rec.chat,
      input,
      { spendCapReached: isScanOverCap(priorUsage), onActivity }
    );
    const usage = addClaudeUsage(priorUsage, result.usage);

    // Urgent path (§37.7): alert Mohammad the moment an active incident is
    // first described — never wait for the report. Fires once per scan.
    if (result.state.urgent && !interview.urgent) {
      after(() =>
        sendOdoUrgentAlertEmail({
          companyName: session.visitorCompany,
          visitorName: session.visitorName,
          visitorEmail: session.visitorEmail,
          website: session.visitorWebsite,
          sessionId,
          transcript: reviewerTranscript(result.state, result.chat),
        })
          .then((r) => { if (r.state !== "sent") console.warn(`[ODO] Urgent alert not sent (${r.state}).`); })
          .catch((err) => console.error("[ODO] Urgent alert failed:", err))
      );
    }
    const nextFindings = { ...findings, _interview: result.state, _chat: result.chat, _aiUsage: usage };
    const view = publicInterviewView(result.state, result.chat);

    if (result.outcome === "continue") {
      await updateSession(sessionId, {
        findings: nextFindings,
        status: "questioning",
        phase: "questioning",
        step: `turn-${result.state.version}`,
        questionsAsked: result.state.questionsAsked,
      });
      return NextResponse.json({ status: "questioning", ...view });
    }

    if (result.outcome === "failed") {
      // §37.2: no fixed-question fallback. Stop honestly, no cooldown.
      await updateSession(sessionId, { findings: nextFindings, status: "failed", phase: "failed", step: AI_UNAVAILABLE_MESSAGE });
      await countForZm77("odo_failed");
      const cost = computeCost(usage);
      after(async () => {
        await recordLifetimeAiCost(usage, cost.totalCostUsd).catch(() => {});
        await recordScanSpend(cost.totalCostUsd).catch(() => {});
      });
      return NextResponse.json({ status: "failed", message: AI_UNAVAILABLE_MESSAGE, ...view });
    }

    if (result.outcome === "insufficient") {
      const message = result.state.ended?.message ?? "";
      await updateSession(sessionId, {
        findings: nextFindings,
        status: "insufficient_data",
        condition: "insufficient_data",
        phase: "complete",
        step: message,
        questionsAsked: result.state.questionsAsked,
      });
      after(() =>
        finalizeInsufficient(sessionId, session, result.state, result.chat, usage).catch((err) =>
          console.error("[ODO] finalizeInsufficient failed:", err)
        )
      );
      return NextResponse.json({ status: "insufficient_data", message, ...view });
    }

    // finish → evaluation, kept alive past the response by after().
    await updateSession(sessionId, {
      findings: nextFindings,
      status: "evaluating",
      phase: "evaluating",
      step: "Building your opportunity map...",
      questionsAsked: result.state.questionsAsked,
    });
    after(() =>
      runEvaluation(sessionId, session, nextFindings as unknown as ResearchFindings, profile, usage).catch((err) =>
        console.error("[ODO] Evaluation async failed:", err)
      )
    );
    return NextResponse.json({ status: "evaluating", ...view });
  } catch (err) {
    console.error("[ODO] Interview turn crashed:", err);
    await updateSession(sessionId, { status: "failed", phase: "failed", step: AI_UNAVAILABLE_MESSAGE }).catch(() => {});
    await countForZm77("odo_failed");
    return NextResponse.json({ status: "failed", message: AI_UNAVAILABLE_MESSAGE }, { status: 500 });
  } finally {
    await releaseTurnLock(sessionId).catch(() => {});
  }
}
