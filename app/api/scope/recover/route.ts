import { NextRequest, NextResponse } from "next/server";
import { verifyQstashRequest } from "../../../lib/scope-qstash";
import { findDueJobIds, getJob } from "../../../lib/scope-store";
import { publishJobRetry } from "../../../lib/scope-qstash";

/**
 * POST /api/scope/recover — signed QStash scheduled recovery, every
 * five minutes per Section A. This is what makes the whole system
 * crash-safe rather than just "usually works": if a job was durably
 * persisted (Section B, always happens before any publish attempt) but
 * its QStash publish never happened or its response was lost, this
 * sweep is what eventually finds and republishes it — not a promise
 * that the original request's own publish call succeeded.
 *
 * Bounded: BATCH_LIMIT per invocation, not an unbounded scan, per
 * Section A ("batch work with a cursor and bounded execution time").
 * Republishing an already-published-but-still-due job is safe — the
 * job's own state (claimJob's lease check) is what prevents double
 * processing, not this route trying to avoid re-publishing.
 */

const BATCH_LIMIT = 100;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("upstash-signature");

  const verified = await verifyQstashRequest({ signature, rawBody, path: "/api/scope/recover" });
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const now = Date.now();
  const dueJobIds = await findDueJobIds(now, BATCH_LIMIT);

  let republished = 0;
  let skipped = 0;
  for (const jobId of dueJobIds) {
    const job = await getJob(jobId);
    // Recovery must never itself reset a job that's actually finished —
    // per Section B ("must never reset accepted email jobs or completed
    // CRM jobs to pending"). It doesn't reset anything here at all; it
    // only republishes jobs the due-index already says are due. A job
    // reaching `completed` removes itself from the due-index in the
    // same transaction (see scope-store.ts's completeJob), so a
    // genuinely finished job should never appear in this scan — this
    // check is a defensive backstop against that invariant somehow not
    // holding, not the primary mechanism.
    if (!job || job.status === "completed") {
      skipped++;
      continue;
    }
    await publishJobRetry(jobId, job.attempts).catch(() => null);
    republished++;
  }

  return NextResponse.json({
    scanned: dueJobIds.length,
    republished,
    skipped,
    hasMore: dueJobIds.length === BATCH_LIMIT,
  });
}
