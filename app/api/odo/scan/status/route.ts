// GET /api/odo/scan/status?session_id=xxx
// Polling fallback — front-end calls this every 2.5 seconds when SSE drops.
// Returns current scan phase, step, status, and next question if available.

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/odo-redis";
import { publicInterviewView, type InterviewState, type ChatMessage } from "@/app/lib/odo-interviewer";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ code: "missing_session_id", message: "session_id is required." }, { status: 400 });
  }

  const session = await getSession(sessionId).catch(() => null);
  if (!session) {
    return NextResponse.json({ code: "session_not_found", message: "Scan session not found or expired." }, { status: 404 });
  }

  const findings = session.findings as Record<string, unknown>;

  // The conversation (Master Reference §37.6) — ODO's and the visitor's
  // messages only. ODO's judgements, extracted evidence and internal reasons
  // never leave the server (publicInterviewView strips them).
  const view = publicInterviewView(findings._interview as InterviewState | undefined, findings._chat as ChatMessage[] | undefined);
  const terminalMessage =
    session.status === "insufficient_data" || session.status === "failed" ? session.step : undefined;

  return NextResponse.json({
    session_id: sessionId,
    status: session.status,
    condition: session.condition,
    phase: session.phase,
    step: session.step,
    questions_asked: session.questionsAsked,
    ...(terminalMessage ? { message: terminalMessage } : {}),
    ...view,
  });
}
