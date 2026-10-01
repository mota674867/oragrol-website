// POST /api/odo/scan/answer
// Receives visitor's answer to ODO's targeted question.
// Updates session, asks ODO's adaptive selector for the next question, or
// moves to evaluation once questioning is over (odo-pipeline.ts).

import { after, NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/app/lib/odo-redis";
import { pickNextQuestion, runEvaluation, type BusinessProfile } from "@/app/lib/odo-pipeline";
import type { NextQuestionDecision } from "@/app/lib/odo-questions";
import type { ResearchFindings } from "@/app/lib/odo-research";
import { EMPTY_USAGE, addJevUsage, type AiUsageTotals } from "@/app/lib/odo-cost";

const MAX_QUESTIONS = 20;

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const sessionId = String(body.session_id || "").trim();
  const questionId = String(body.question_id || "").trim();
  // Multi-select questions (odo-questions.ts's multiSelect flag) send an
  // array of chosen options — join them the same way the frontend and
  // odo-ledger.ts's answerEvidence() expect: " | "-delimited, as one string.
  const rawAnswer = body.answer;
  const answer = Array.isArray(rawAnswer)
    ? rawAnswer.map((a) => String(a).trim()).filter(Boolean).join(" | ")
    : String(rawAnswer || "").trim();

  if (!sessionId || !questionId || !answer) {
    return NextResponse.json({ code: "validation_error", message: "session_id, question_id, and answer are required." }, { status: 400 });
  }

  const session = await getSession(sessionId).catch(() => null);
  if (!session) {
    return NextResponse.json({ code: "session_not_found" }, { status: 404 });
  }
  if (session.status !== "questioning") {
    return NextResponse.json({ code: "invalid_state", message: `Session is in ${session.status} state, not questioning.` }, { status: 409 });
  }

  const findings = session.findings as Record<string, unknown>;
  const answers = (findings._answers as Record<string, string> | undefined) || {};
  answers[questionId] = answer;

  const questionOrder = [...((findings._questionOrder as string[] | undefined) || []), questionId];
  const questionMethods = { ...((findings._questionMethods as Record<string, string> | undefined) || {}) };

  const newQuestionsAsked = session.questionsAsked + 1;

  // A stated industry/size answer overrides (or fills a gap in) what
  // research alone could tell — resolved below via profile, same as
  // odo-questions.ts's own "ask industry/size first when unknown" rule.
  if (questionId === "q_industry") {
    findings._industryDetected = answer;
  }
  if (questionId === "q_staff_count") {
    const sizeMap: Record<string, string> = { "1–10": "micro", "11–50": "small", "51–200": "medium", "200+": "large" };
    findings._businessSizeDetected = sizeMap[answer] || null;
  }

  findings._answers = answers;
  findings._questionOrder = questionOrder;
  findings._nextQuestion = undefined; // Clear current question

  const researchFindings = findings as unknown as ResearchFindings;
  const profile: BusinessProfile = {
    industry: (findings._industryDetected as string | undefined) ?? researchFindings.industry ?? null,
    businessSize: (findings._businessSizeDetected as ResearchFindings["businessSize"] | undefined) ?? researchFindings.businessSize ?? null,
  };

  const decision: NextQuestionDecision =
    newQuestionsAsked >= MAX_QUESTIONS
      ? { done: true, reason: "question cap reached", method: "fallback", jevUsage: null }
      : await pickNextQuestion(researchFindings, profile, session.hasWebsite, answers, questionOrder);

  // Real Jev usage keeps accumulating across every answer in this scan
  // (odo-cost.ts) — findings._aiUsage carries the running total from
  // /api/odo/scan/start through every /api/odo/scan/answer call, so the
  // figure runEvaluation ends with is the scan's exact, complete cost.
  const priorAiUsage: AiUsageTotals = (findings._aiUsage as AiUsageTotals | undefined) ?? EMPTY_USAGE;
  const aiUsageSoFar = addJevUsage(priorAiUsage, decision.jevUsage);
  findings._aiUsage = aiUsageSoFar;

  if (decision.done) {
    // Move to evaluation phase
    await updateSession(sessionId, {
      questionsAsked: newQuestionsAsked,
      findings,
      status: "evaluating",
      phase: "evaluating",
      step: "Building your opportunity map...",
    });

    // FIXED 2026-09-29 — same bug as /api/odo/scan/start: a bare
    // fire-and-forget call has no guarantee it keeps running once this
    // handler's response is sent on Vercel's serverless runtime. Without
    // after(), a scan could answer its last question, get told
    // "evaluating," and then sit there forever because the function
    // generating the report was frozen mid-flight. after() keeps it alive
    // until this actually finishes.
    after(() =>
      runEvaluation(sessionId, session, researchFindings, profile, answers, questionOrder, Object.values(questionMethods), aiUsageSoFar).catch(err => {
        console.error("[ODO] Evaluation async failed:", err);
      })
    );

    return NextResponse.json({
      status: "evaluating",
      phase: "evaluating",
      step: "Building your opportunity map...",
      questions_asked: newQuestionsAsked,
    });
  }

  // Not done — one more question.
  questionMethods[decision.question.id] = decision.method;
  findings._questionMethods = questionMethods;

  await updateSession(sessionId, {
    questionsAsked: newQuestionsAsked,
    findings: { ...findings, _nextQuestion: decision.question },
    status: "questioning",
    step: `Question ${newQuestionsAsked + 1}`,
  });

  return NextResponse.json({
    status: "questioning",
    phase: "questioning",
    step: `Question ${newQuestionsAsked + 1}`,
    question: decision.question,
    questions_asked: newQuestionsAsked,
  });
}
