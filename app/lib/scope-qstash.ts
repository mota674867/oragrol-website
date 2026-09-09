import { Client, Receiver } from "@upstash/qstash";

/**
 * QStash dispatch + signature verification for My Scope, per
 * My_Scope_Final_Ready_For_Claude.md Section A/C. QStash is the
 * ACCELERATION path (publish a job for near-immediate processing) —
 * the durable outbox in scope-store.ts is the real record of pending
 * work, so if publish itself fails or is never attempted (a crash
 * right after Redis persistence), the recovery sweep in
 * app/api/scope/recover finds and republishes the job. Losing this
 * file's ability to publish is degraded, not broken.
 *
 * Requires QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY,
 * QSTASH_NEXT_SIGNING_KEY, and SCOPE_CALLBACK_ORIGIN (the approved
 * origin QStash should call back into — never inferred from a request's
 * own Host header, per Section C's explicit warning about that).
 */

let qstashClient: Client | null = null;
function getQstashClient(): Client {
  if (qstashClient) return qstashClient;
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    throw new Error(
      "QSTASH_TOKEN is not configured. See My_Scope_Final_Ready_For_Claude.md Section G for provisioning.",
    );
  }
  qstashClient = new Client({ token });
  return qstashClient;
}

let qstashReceiver: Receiver | null = null;
function getQstashReceiver(): Receiver {
  if (qstashReceiver) return qstashReceiver;
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!currentSigningKey || !nextSigningKey) {
    throw new Error(
      "QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY are not configured. " +
        "Refusing to accept unsigned QStash callbacks rather than skipping verification.",
    );
  }
  qstashReceiver = new Receiver({ currentSigningKey, nextSigningKey });
  return qstashReceiver;
}

function callbackOrigin(): string {
  const origin = process.env.SCOPE_CALLBACK_ORIGIN;
  if (!origin) {
    throw new Error(
      "SCOPE_CALLBACK_ORIGIN is not configured. Deliberately not derived from the request's Host header — " +
        "per Section C, that's spoofable and must not decide where signed retries get published to.",
    );
  }
  return origin;
}

/**
 * Publishes a single job for near-immediate processing. Uses an
 * attempt-aware deduplication ID (jobId + attempt count) — per Section
 * D, QStash's own 10-minute dedup window must not accidentally suppress
 * a legitimate LATER retry of the same job just because it shares the
 * same jobId as an earlier, already-resolved attempt.
 */
export async function publishJobRetry(jobId: string, attempt: number): Promise<{ messageId: string }> {
  const client = getQstashClient();
  const res = await client.publishJSON({
    url: `${callbackOrigin()}/api/scope/retry`,
    body: { jobId },
    deduplicationId: `scope-job-${jobId}-attempt-${attempt}`,
    retries: 3, // QStash's own transport-level retry for delivery/crash failures only (Section C) — not the application-level backoff, that's scope-store's job
  });
  return { messageId: res.messageId };
}

/**
 * Verifies an incoming QStash callback's signature against the ORIGINAL
 * raw request body (must be read as text before any JSON parsing — a
 * re-serialized body will not match the signature) and this app's own
 * confirmed callback URL, using current + next signing keys so a key
 * rotation doesn't briefly reject legitimate in-flight requests.
 */
export async function verifyQstashRequest(params: {
  signature: string | null;
  rawBody: string;
  path: "/api/scope/retry" | "/api/scope/recover";
}): Promise<boolean> {
  if (!params.signature) return false;
  try {
    return await getQstashReceiver().verify({
      signature: params.signature,
      body: params.rawBody,
      url: `${callbackOrigin()}${params.path}`,
    });
  } catch {
    // Receiver.verify throws SignatureError on an invalid signature in
    // some SDK versions rather than returning false — treat any
    // exception here as "not verified," never as "verified."
    return false;
  }
}

/**
 * Creates the one recurring recovery-sweep schedule (Section A: "ONE
 * recurring recovery sweep... every five minutes... no separate Vercel
 * Cron required"). Idempotent to call more than once against the same
 * scheduleId — QStash's schedule API upserts by ID rather than creating
 * duplicates. Intended to be run once during setup, not on every
 * request; not wired into any request path.
 */
export async function ensureRecoverySchedule(): Promise<{ scheduleId: string }> {
  const client = getQstashClient();
  const res = await client.schedules.create({
    destination: `${callbackOrigin()}/api/scope/recover`,
    cron: "*/5 * * * *",
    scheduleId: "scope-recovery-sweep",
  });
  return { scheduleId: res.scheduleId };
}
