import { NextRequest, NextResponse } from "next/server";
import { verifyQstashRequest } from "../../../lib/scope-qstash";
import { processJob } from "../../../lib/scope-worker";

/**
 * POST /api/scope/retry — signed QStash worker, per Section A/C.
 * "Handle job IDs only; load trusted state from Redis" — the request
 * body carries nothing but a jobId, never email addresses, scope
 * contents, or PDF bytes (Section C's explicit requirement), so there's
 * nothing sensitive in this endpoint's own payload even before
 * signature verification runs.
 *
 * No unsigned manual-retry path exists anywhere in this file or
 * exported from it — the only way a job gets processed outside a valid
 * QStash signature is the recovery sweep publishing a new signed
 * message, never a direct call into processJob from an unauthenticated
 * route.
 */

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("upstash-signature");

  const verified = await verifyQstashRequest({ signature, rawBody, path: "/api/scope/retry" });
  if (!verified) {
    // No mutation attempted before this check — an invalid/missing
    // signature does nothing at all, per Section C.
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let jobId: string;
  try {
    const parsed = JSON.parse(rawBody);
    if (typeof parsed?.jobId !== "string" || !parsed.jobId) {
      return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
    }
    jobId = parsed.jobId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await processJob(jobId);
  // Always 200 for a verified, well-formed request once processJob has
  // run — including "not claimed" (already complete, or another worker
  // holds the lease) and "failed, retry scheduled" outcomes. Per
  // Section C: "once an application failure has been durably recorded
  // with its nextAttemptAt, return success for that transport
  // invocation" — a non-200 here would make QStash's OWN transport
  // retry pile a second retry schedule on top of scope-store's already-
  // recorded one.
  return NextResponse.json({ jobId, ...result });
}
