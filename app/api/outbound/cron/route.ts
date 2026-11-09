// GET /api/outbound/cron — one slice of the nightly Outbound run.
//
// Does as much as fits in about 4.5 minutes, saves progress, and returns. The
// scheduler calls it again until the day's run is finished (70 valid leads,
// 400 sites read, the cost cap, or the plan is exhausted). It NEVER sends email.
//
// Locked: needs CRON_SECRET (fails closed when it is not set) and only runs
// when OUTBOUND_ENGINE_ENABLED=1. Returns counts only, never contact data.
//
// NOT SCHEDULED YET: no entry in vercel.json. The schedule (QStash or Vercel
// cron, about 2 AM Toronto, repeating until done) is added when Mohammad
// switches the engine on.

import { NextRequest, NextResponse } from "next/server";
import { engineEnabled } from "@/app/lib/outbound/config";
import { runEngineSlice } from "@/app/lib/outbound/engine";
import { makeLiveDeps } from "@/app/lib/outbound/live";
import { RedisStore } from "@/app/lib/outbound/store";

export const maxDuration = 300;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }
  if (!engineEnabled()) return NextResponse.json({ code: "engine-off" });

  try {
    const store = RedisStore.fromEnv();
    const deps = makeLiveDeps(store, { log: (m) => console.log(`[outbound] ${m}`) });
    const { run, batch, processedThisSlice } = await runEngineSlice(deps, { deadline: Date.now() + 270_000 });
    return NextResponse.json({
      date: run.date,
      status: run.status,
      stoppedBecause: run.stoppedBecause,
      processedThisSlice,
      scanned: run.scanned,
      valid: run.valid,
      costUsd: Math.round(run.costUsd * 10000) / 10000,
      batchReady: !!batch,
    });
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e).replace(/sk-[A-Za-z0-9_\-]+/g, "[redacted]").slice(0, 200);
    console.error(`[outbound] slice failed: ${msg}`);
    return NextResponse.json({ code: "error", message: msg }, { status: 500 });
  }
}
