// GET /api/outbound/report?date=YYYY-MM-DD — data for the staff Outbound page.
//
// Server-to-server only (the staff dashboard calls it with OUTBOUND_API_SECRET;
// fails closed when the secret is not set). Returns the daily report and up to
// 5 sample emails from today's batch for the approval card.

import { NextRequest, NextResponse } from "next/server";
import { buildDailyReport } from "@/app/lib/outbound/report";
import { RedisStore } from "@/app/lib/outbound/store";
import { torontoDate } from "@/app/lib/outbound/engine";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.OUTBOUND_API_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }
  const q = req.nextUrl.searchParams.get("date");
  const date = q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : torontoDate(new Date());
  try {
    const store = RedisStore.fromEnv();
    const report = await buildDailyReport(store, date);
    const batch = await store.getBatch(date);
    const ids = [...(batch?.leadIds ?? [])].sort(() => Math.random() - 0.5).slice(0, 5);
    const samples = [];
    for (const id of ids) {
      const l = await store.getLead(id);
      if (l) samples.push({ id: l.id, business: l.businessName, city: l.city, person: l.personName, title: l.personTitle, grade: l.grade, needsHumanCheck: l.needsHumanCheck, proofUrl: l.proofUrl, emails: l.emails });
    }
    return NextResponse.json({ report, samples });
  } catch (e) {
    return NextResponse.json({ code: "error", message: String(e instanceof Error ? e.message : e).slice(0, 200) }, { status: 500 });
  }
}
