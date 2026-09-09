import { NextRequest, NextResponse } from "next/server";
import { scopeSubmissionSchema } from "../../lib/scope-schema";
import { resolveSelections, UnresolvedSelectionError } from "../../lib/scope-resolve";
import { createActionAtomically, hashPayload, createDownloadToken } from "../../lib/scope-store";
import { publishJobRetry } from "../../lib/scope-qstash";

/**
 * POST /api/scope — per My_Scope_Final_Ready_For_Claude.md Section A.
 * Validate -> resolve selections against the real catalog -> durably
 * persist the action + its jobs (BEFORE any QStash publish, per Section
 * B) -> publish each job for near-immediate processing -> return a
 * protected status/download reference. The recovery sweep
 * (/api/scope/recover) is what actually guarantees delivery if this
 * request's own publish step never completes — this route's job is to
 * get the durable record written safely, not to guarantee the
 * publishes below succeed.
 */

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = scopeSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  let selections;
  try {
    selections = resolveSelections(input.selections);
  } catch (err) {
    if (err instanceof UnresolvedSelectionError) {
      return NextResponse.json({ error: `Unrecognized selection: ${err.id}` }, { status: 400 });
    }
    throw err;
  }
  if (selections.length === 0) {
    return NextResponse.json({ error: "Select at least one item before submitting." }, { status: 400 });
  }

  const payloadForHash = {
    requestId: input.requestId,
    intent: input.intent,
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    timeframe: input.timeframe,
    context: input.context,
    selections: input.selections,
    sourcePath: input.sourcePath,
    disclosureVersion: input.disclosureVersion,
  };
  const payloadHash = hashPayload(payloadForHash);

  let created;
  try {
    created = await createActionAtomically({
      requestId: input.requestId,
      intent: input.intent,
      payloadHash,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      timeframe: input.timeframe,
      context: input.context,
      sourcePath: input.sourcePath,
      disclosureVersion: input.disclosureVersion,
      acknowledgedAt: new Date().toISOString(),
      selections,
    });
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === "REQUEST_ID_CONFLICT") {
      return NextResponse.json(
        { error: "This requestId was already used for a different submission. Generate a new one for a new action." },
        { status: 409 },
      );
    }
    throw err;
  }

  const { action, jobs, alreadyExisted } = created;

  // Publish every still-pending job. Best-effort here on purpose: if a
  // publish call itself fails or this whole request crashes right now,
  // the jobs are already durably in the due-index (created atomically
  // above) — the recovery sweep finds and republishes them within its
  // interval. Not awaiting failures individually as fatal to the
  // response; the durable record, not this loop, is the real guarantee.
  await Promise.allSettled(
    jobs
      .filter((j) => j.status === "pending")
      .map((j) => publishJobRetry(j.jobId, j.attempts).catch(() => null)),
  );

  const downloadToken = await createDownloadToken(action.actionId, 60 * 60 * 24); // 24h, matches Resend's own idempotency window as a reasonable, non-arbitrary default — revisit under Section G's retention policy review

  return NextResponse.json(
    {
      reference: action.reference,
      actionId: action.actionId,
      alreadyExisted,
      status: "accepted",
      downloadToken,
    },
    { status: alreadyExisted ? 200 : 201 },
  );
}
