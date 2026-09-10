import { NextRequest, NextResponse } from "next/server";
import { verifyCyberHealthQstashRequest, publishCyberHealthJobRetry } from "../../../lib/cyber-health-hubspot-qstash";
import { findDueJobIds, getJob } from "../../../lib/cyber-health-hubspot-store";

/**
 * POST /api/cyber-health/hubspot-recover — signed QStash scheduled
 * recovery for the Cyber Health HubSpot job queue. Mirrors
 * /api/scope/recover exactly, INCLUDING the fix already learned
 * tonight for that queue: logging a swallowed publish failure instead
 * of silently discarding it (the earlier version of that pattern in
 * My Scope hid the actual root cause of a stuck job for hours).
 *
 * Registration is a separate one-time setup step
 * (ensureCyberHealthRecoverySchedule) — deliberately its OWN QStash
 * schedule, not reusing My Scope's, so the two queues stay
 * independently recoverable.
 */

const BATCH_LIMIT = 100;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("upstash-signature");

  const verified = await verifyCyberHealthQstashRequest({
    signature,
    rawBody,
    path: "/api/cyber-health/hubspot-recover",
  });
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const now = Date.now();
  const dueJobIds = await findDueJobIds(now, BATCH_LIMIT);

  let republished = 0;
  let skipped = 0;
  for (const jobId of dueJobIds) {
    const job = await getJob(jobId);
    if (!job || job.status === "completed") {
      skipped++;
      continue;
    }
    await publishCyberHealthJobRetry(jobId, job.attempts).catch((err) => {
      console.error(
        `[cyber-health-hubspot] QStash publish failed in recovery sweep for job ${jobId} (attempt ${job.attempts}):`,
        err instanceof Error ? err.message : err,
      );
      return null;
    });
    republished++;
  }

  return NextResponse.json({
    scanned: dueJobIds.length,
    republished,
    skipped,
    hasMore: dueJobIds.length === BATCH_LIMIT,
  });
}
