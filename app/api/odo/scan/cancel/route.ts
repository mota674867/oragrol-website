// POST /api/odo/scan/cancel
// Marks a session as cancelled. No cooldown penalty — abandoned scans
// are cleared from Redis after 7 days automatically.

import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/app/lib/odo-redis";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const sessionId = String(body.session_id || "").trim();
  if (!sessionId) {
    return NextResponse.json({ code: "missing_session_id" }, { status: 400 });
  }

  const session = await getSession(sessionId).catch(() => null);
  if (!session) {
    return NextResponse.json({}, { status: 200 }); // Already gone — that's fine
  }

  if (!["complete", "insufficient_data"].includes(session.status)) {
    await updateSession(sessionId, {
      status: "cancelled",
      phase: "cancelled",
      step: "Scan cancelled by visitor",
    }).catch(() => {});
  }

  return NextResponse.json({ status: "cancelled" }, { status: 200 });
}
