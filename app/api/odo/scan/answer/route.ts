// POST /api/odo/scan/answer
// Receives visitor's answer to ODO's targeted question.
// Updates session, generates next question or moves to evaluation phase.

import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/app/lib/odo-redis";

const MAX_QUESTIONS = 20;

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const sessionId = String(body.session_id || "").trim();
  const questionId = String(body.question_id || "").trim();
  const answer = String(body.answer || "").trim();

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

  const newQuestionsAsked = session.questionsAsked + 1;

  // Update industry/size from answers if ODO asked about them
  if (questionId === "q_industry") {
    findings._industryDetected = answer;
  }
  if (questionId === "q_staff_count") {
    const sizeMap: Record<string, string> = { "1–10": "micro", "11–50": "small", "51–200": "medium", "200+": "large" };
    findings._businessSizeDetected = sizeMap[answer] || null;
  }

  findings._answers = answers;
  findings._nextQuestion = undefined; // Clear current question

  // Check if we've hit max questions or have enough data
  const shouldEvaluate = newQuestionsAsked >= MAX_QUESTIONS || hasEnoughData(answers, findings);

  if (shouldEvaluate) {
    // Move to evaluation phase
    await updateSession(sessionId, {
      questionsAsked: newQuestionsAsked,
      findings,
      status: "evaluating",
      phase: "evaluating",
      step: "Building your opportunity map...",
    });

    // Kick off evaluation async
    runEvaluationAsync(sessionId, session.visitorCompany, findings, session.hubspotContactId).catch(err => {
      console.error("[ODO] Evaluation async failed:", err);
    });

    return NextResponse.json({
      status: "evaluating",
      phase: "evaluating",
      step: "Building your opportunity map...",
      questions_asked: newQuestionsAsked,
    });
  }

  // Generate next question
  const nextQuestion = generateNextQuestion(questionId, answer, answers, findings, newQuestionsAsked);

  await updateSession(sessionId, {
    questionsAsked: newQuestionsAsked,
    findings: { ...findings, _nextQuestion: nextQuestion },
    status: "questioning",
    step: `Question ${newQuestionsAsked + 1}`,
  });

  return NextResponse.json({
    status: "questioning",
    phase: "questioning",
    step: `Question ${newQuestionsAsked + 1}`,
    question: nextQuestion,
    questions_asked: newQuestionsAsked,
  });
}

function hasEnoughData(answers: Record<string, string>, findings: Record<string, unknown>): boolean {
  const requiredAnswered = ["q_industry", "q_biggest_challenge"].every(q => answers[q]);
  const hasResearchData = Object.keys(findings).filter(k => !k.startsWith("_")).length > 0;
  return requiredAnswered && (hasResearchData || Object.keys(answers).length >= 5);
}

function generateNextQuestion(
  lastQuestionId: string,
  lastAnswer: string,
  allAnswers: Record<string, string>,
  findings: Record<string, unknown>,
  questionsAsked: number
): { id: string; text: string; options?: string[] } {
  // Simple sequential question logic — Jev will make this intelligent
  const asked = new Set(Object.keys(allAnswers));

  if (!asked.has("q_industry")) return { id: "q_industry", text: "What industry or sector does your business operate in?", options: ["Healthcare", "Legal", "Finance & Accounting", "Technology", "Retail", "Construction", "Food & Beverage", "Education", "Marketing & Advertising", "Consulting", "Manufacturing", "Other"] };
  if (!asked.has("q_staff_count")) return { id: "q_staff_count", text: "Approximately how many people work at your company?", options: ["1–10", "11–50", "51–200", "200+"] };
  if (!asked.has("q_biggest_challenge")) return { id: "q_biggest_challenge", text: "What is your biggest operational challenge right now?", options: ["Cybersecurity and data protection", "Day-to-day efficiency and automation", "Growing the business", "Managing costs", "Customer experience", "Compliance and regulations"] };
  if (!asked.has("q_current_security")) return { id: "q_current_security", text: "Do you currently have any cybersecurity protection in place for your business?", options: ["Yes, we have a dedicated IT/security team", "Yes, we use some security software", "Basic antivirus only", "Nothing formal in place", "I'm not sure"] };
  if (!asked.has("q_data_sensitivity")) return { id: "q_data_sensitivity", text: "What type of data does your business handle?", options: ["Customer personal information (names, addresses, emails)", "Payment or financial data", "Medical or health records", "Employee records", "Proprietary business data", "Mostly public information"] };

  return {
    id: `q_custom_${questionsAsked}`,
    text: "Is there anything else about your business operations or challenges you'd like us to know?",
  };
}

async function runEvaluationAsync(
  sessionId: string,
  businessName: string,
  findings: Record<string, unknown>,
  hubspotContactId: string | null
): Promise<void> {
  const { updateSession, markSessionComplete, getSession } = await import("@/app/lib/odo-redis");

  try {
    await updateSession(sessionId, { step: "Analyzing findings..." });
    await new Promise(r => setTimeout(r, 2000)); // Simulate Jev evaluation time

    await updateSession(sessionId, { step: "Generating SWOT analysis..." });
    await new Promise(r => setTimeout(r, 2000));

    // Build SWOT from findings (Jev placeholder)
    const swot = buildSwotPlaceholder(findings, businessName);

    // Build service matches
    const serviceMatches = buildServiceMatches(findings);

    // Determine condition
    const answers = (findings._answers as Record<string, string> | undefined) || {};
    const hasEnoughForReport = Object.keys(answers).length >= 2 || Object.keys(findings).filter(k => !k.startsWith("_")).length >= 3;
    const condition = hasEnoughForReport ? "complete" as const : "insufficient_data" as const;

    await updateSession(sessionId, {
      swot,
      serviceMatches,
      condition,
      status: condition === "complete" ? "complete" : "insufficient_data",
      phase: "complete",
      step: "Scan complete",
      findings,
    });

    // Activate cooldowns only on completed scans
    const session = await getSession(sessionId);
    if (session && condition === "complete") {
      await markSessionComplete(session);
    }

    // Notify ZM77 (placeholder — ZM77 webhook endpoint)
    await notifyZM77(sessionId, businessName, findings, swot, serviceMatches, condition, hubspotContactId, answers).catch(err => {
      console.error("[ODO] ZM77 notification failed:", err);
    });

    // Update HubSpot
    if (hubspotContactId && process.env.HUBSPOT_ACCESS_TOKEN) {
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${hubspotContactId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          properties: {
            odo_scan_status: condition,
            odo_scan_condition: condition,
            odo_service_matches: serviceMatches.map((m: Record<string, unknown>) => m.service).join(", "),
          },
        }),
      }).catch(() => {});
    }

  } catch (err) {
    console.error("[ODO] Evaluation failed:", err);
    await updateSession(sessionId, { status: "failed", step: "Evaluation failed. Our team has been notified." }).catch(() => {});
  }
}

function buildSwotPlaceholder(findings: Record<string, unknown>, businessName: string): Record<string, unknown> {
  // Placeholder SWOT — Jev will produce real analysis
  return {
    strengths: [`${businessName} has an established online presence`],
    weaknesses: ["Security posture requires review", "Digital marketing gaps identified"],
    opportunities: ["Automation opportunities available in current workflows", "Cybersecurity investment could prevent costly breaches"],
    threats: ["Competitors in the space are investing in security", "Regulatory compliance requirements increasing"],
    generatedBy: "placeholder",
    generatedAt: Date.now(),
  };
}

function buildServiceMatches(findings: Record<string, unknown>): Record<string, unknown>[] {
  const matches: Record<string, unknown>[] = [];
  const f = findings as import("@/app/lib/odo-research").ResearchFindings;

  if (!f.emailSecurity?.spf || !f.emailSecurity?.dmarc || f.breachHistory?.breached) {
    matches.push({ service: "Cybersecurity Services", priority: "high", reason: "Email security gaps and/or breach history detected" });
  }
  if (f.ssl?.grade && ["C", "D", "F"].includes(f.ssl.grade)) {
    matches.push({ service: "Cybersecurity Services", priority: "high", reason: `SSL grade: ${f.ssl.grade}` });
  }
  const answers = (findings._answers as Record<string, string> | undefined) || {};
  if (answers.q_biggest_challenge?.includes("efficiency") || answers.q_biggest_challenge?.includes("automation")) {
    matches.push({ service: "Business Automation", priority: "medium", reason: "Visitor identified efficiency as primary challenge" });
  }
  if (answers.q_biggest_challenge?.includes("Growing") || !f.paidAds?.runningFacebookAds) {
    matches.push({ service: "OR ONE", priority: "medium", reason: "Growth challenge identified — AI agent support recommended" });
  }

  return matches;
}

async function notifyZM77(
  sessionId: string,
  businessName: string,
  findings: Record<string, unknown>,
  swot: Record<string, unknown>,
  serviceMatches: Record<string, unknown>[],
  condition: "complete" | "insufficient_data",
  hubspotContactId: string | null,
  answers: Record<string, string>
): Promise<void> {
  const zm77Webhook = process.env.ZM77_WEBHOOK_URL;
  if (!zm77Webhook) {
    console.warn("[ODO] ZM77_WEBHOOK_URL not configured — skipping ZM77 notification");
    return;
  }

  const payload = {
    source: "ODO",
    event: "scan_complete",
    sessionId,
    businessName,
    condition,
    requiresApproval: true,
    hubspotContactId,
    findings: {
      industry: findings._industryDetected || null,
      businessSize: findings._businessSizeDetected || null,
      securityFindings: {
        ssl: (findings as import("@/app/lib/odo-research").ResearchFindings).ssl,
        emailSecurity: (findings as import("@/app/lib/odo-research").ResearchFindings).emailSecurity,
        breachHistory: (findings as import("@/app/lib/odo-research").ResearchFindings).breachHistory,
        shodan: (findings as import("@/app/lib/odo-research").ResearchFindings).shodan,
      },
      researchErrors: findings._researchErrors || [],
    },
    answers,
    swot,
    serviceMatches,
    generatedAt: new Date().toISOString(),
    note: condition === "insufficient_data"
      ? "INSUFFICIENT DATA — ZM77 to engage supplementary agents and present to Mohammad for decision."
      : "Complete scan — awaiting Mohammad approval before any client communication.",
  };

  await fetch(zm77Webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-ODO-Source": "oragrol-odo-v1" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });
}
