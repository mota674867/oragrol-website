import { Client, Receiver } from "@upstash/qstash";

/**
 * QStash dispatch + signature verification for the Cyber Health
 * HubSpot amendment's job queue. Mirrors scope-qstash.ts's proven
 * pattern exactly, reusing the SAME QSTASH_TOKEN/signing keys and the
 * SAME SCOPE_CALLBACK_ORIGIN (it's the same app's same confirmed
 * callback origin — no reason to introduce a second env var for it),
 * but its own destination routes so this queue's recovery sweep is
 * registered as its own separate QStash schedule, independent of My
 * Scope's. Requires a second `ensureCyberHealthRecoverySchedule()`
 * call during setup, same one-time manual step as My Scope's.
 */

let qstashClient: Client | null = null;
function getQstashClient(): Client {
  if (qstashClient) return qstashClient;
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    throw new Error("QSTASH_TOKEN is not configured. Cyber Health's HubSpot job queue cannot dispatch without it.");
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
        "that's spoofable and must not decide where signed retries get published to.",
    );
  }
  return origin;
}

export async function publishCyberHealthJobRetry(jobId: string, attempt: number): Promise<{ messageId: string }> {
  const client = getQstashClient();
  const res = await client.publishJSON({
    url: `${callbackOrigin()}/api/cyber-health/hubspot-retry`,
    body: { jobId },
    deduplicationId: `cha-job-${jobId}-attempt-${attempt}`,
    retries: 3,
  });
  return { messageId: res.messageId };
}

export async function verifyCyberHealthQstashRequest(params: {
  signature: string | null;
  rawBody: string;
  path: "/api/cyber-health/hubspot-retry" | "/api/cyber-health/hubspot-recover";
}): Promise<boolean> {
  if (!params.signature) return false;
  try {
    return await getQstashReceiver().verify({
      signature: params.signature,
      body: params.rawBody,
      url: `${callbackOrigin()}${params.path}`,
    });
  } catch {
    return false;
  }
}

/**
 * One-time setup call, same as My Scope's ensureRecoverySchedule — a
 * SEPARATE schedule from My Scope's (different scheduleId, different
 * destination), not reused, so the two queues stay independently
 * recoverable. Idempotent to call more than once against the same
 * scheduleId.
 */
export async function ensureCyberHealthRecoverySchedule(): Promise<{ scheduleId: string }> {
  const client = getQstashClient();
  const res = await client.schedules.create({
    destination: `${callbackOrigin()}/api/cyber-health/hubspot-recover`,
    cron: "*/5 * * * *",
    scheduleId: "cha-recovery-sweep",
  });
  return { scheduleId: res.scheduleId };
}
