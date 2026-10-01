// GET /api/odo/scan/status?session_id=xxx
// Polling fallback — front-end calls this every 2.5 seconds when SSE drops.
// Returns current scan phase, step, status, and next question if available.

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/odo-redis";
import { buildFindingsSummary } from "@/app/lib/odo-research";

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
  const nextQuestion = findings._nextQuestion as { id: string; text: string; options?: string[] } | undefined;

  // Same end-screen numbers the SSE stream sends on completion (odo/scan
  // events/route.ts) — polling is the required fallback for browsers/
  // deployments without SSE support, so it needs to carry the same data,
  // not just the generic "scan complete" status.
  const isTerminalComplete = session.status === "complete" || session.status === "insufficient_data";

  return NextResponse.json({
    session_id: sessionId,
    status: session.status,
    condition: session.condition,
    phase: session.phase,
    step: session.step,
    questions_asked: session.questionsAsked,
    question: session.status === "questioning" ? nextQuestion : undefined,
    industry: findings._industryDetected || null,
    business_size: findings._businessSizeDetected || null,
    has_findings: Object.keys(findings).filter(k => !k.startsWith("_")).length > 0,
    findings_summary: isTerminalComplete ? buildFindingsSummary(findings) : undefined,
  });
}
