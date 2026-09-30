// GET /api/odo/admin/cost?key=YOUR_ODO_ADMIN_KEY
//
// Read-only view of ODO's real, all-time AI spend (Jev + Claude), built
// entirely from actual per-scan token usage — never an estimate. Gated by
// ODO_ADMIN_KEY (set it in Vercel → Settings → Environment Variables, any
// long random string you pick) so it isn't public. If that env var isn't
// set at all, this route refuses every request — fail closed, not open.
//
// Open this URL in a browser with ?key=<your key> appended to check total
// spend at any time, e.g.:
//   https://orgro.ca/api/odo/admin/cost?key=your-secret-here

import { NextRequest, NextResponse } from "next/server";
import { getLifetimeAiCost } from "@/app/lib/odo-redis";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminKey = process.env.ODO_ADMIN_KEY;
  const suppliedKey = req.nextUrl.searchParams.get("key");
  if (!adminKey || suppliedKey !== adminKey) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const lifetime = await getLifetimeAiCost();
  if (!lifetime) {
    return NextResponse.json({ totalCostUsd: 0, scanCount: 0, averagePerScanUsd: 0, note: "No completed scans have recorded AI cost yet." });
  }

  return NextResponse.json({
    totalCostUsd: lifetime.totalCostUsd,
    scanCount: lifetime.scanCount,
    averagePerScanUsd: lifetime.scanCount > 0 ? Math.round((lifetime.totalCostUsd / lifetime.scanCount) * 1_000_000) / 1_000_000 : 0,
    usage: lifetime.usage,
    trackingSince: lifetime.since,
    lastUpdatedAt: lifetime.lastUpdatedAt,
  });
}
