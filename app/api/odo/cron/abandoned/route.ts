// GET /api/odo/cron/abandoned
//
// Daily safety-net sweep for interviews the visitor walked away from
// (odo-abandoned.ts). The same sweep also runs in the background every time
// a new scan starts, so on a busy day leads go out within minutes; this cron
// only guarantees nothing waits longer than a day on a quiet one.
// Vercel sends `Authorization: Bearer $CRON_SECRET` when that env var is set;
// without it the endpoint stays harmless — it only ever passes each idle
// scan on once, and returns counts, never data.

import { NextRequest, NextResponse } from "next/server";
import { sweepAbandonedScans } from "@/app/lib/odo-abandoned";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }
  const result = await sweepAbandonedScans();
  return NextResponse.json(result);
}
