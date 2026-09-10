import { NextRequest, NextResponse } from "next/server";
import { verifyCyberHealthQstashRequest } from "../../../lib/cyber-health-hubspot-qstash";
import { processCyberHealthJob } from "../../../lib/cyber-health-hubspot-worker";

/**
 * POST /api/cyber-health/hubspot-retry — signed QStash worker for the
 * Cyber Health HubSpot amendment's job queue. Mirrors
 * /api/scope/retry exactly: body carries only a jobId, no client PII;
 * no unsigned manual-retry path exists.
 */

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("upstash-signature");

  const verified = await verifyCyberHealthQstashRequest({
    signature,
    rawBody,
    path: "/api/cyber-health/hubspot-retry",
  });
  if (!verified) {
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

  const result = await processCyberHealthJob(jobId);
  // Always 200 for a verified, well-formed request once processing has
  // run, including retry-scheduled outcomes — a non-200 here would
  // make QStash's own transport retry pile a second retry schedule on
  // top of the one already durably recorded in Redis.
  return NextResponse.json({ jobId, ...result });
}
