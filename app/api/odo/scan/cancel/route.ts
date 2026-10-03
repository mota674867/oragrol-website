// POST /api/odo/scan/cancel
// Marks a session as cancelled. No cooldown penalty. If the visitor had
// reached the interview, the research + conversation so far are passed on
// as a lead (odo-abandoned.ts).

import { after, NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/app/lib/odo-redis";
import { passAbandonedLead } from "@/app/lib/odo-abandoned";

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
    // §37.9: a cancelled interview is still a lead — hand it on once.
    if (session.status === "questioning") {
      after(() => passAbandonedLead(session, "cancelled").catch((err) => console.error("[ODO] Abandoned lead failed:", err)));
    }
  }

  return NextResponse.json({ status: "cancelled" }, { status: 200 });
}
