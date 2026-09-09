import { Redis } from "@upstash/redis";
import { createHash, randomUUID } from "crypto";

/**
 * Crash-safe storage layer for My Scope, per
 * My_Scope_Final_Ready_For_Claude.md Sections A-C. This is the "durable
 * outbox" the rest of the flow depends on: an action and its jobs are
 * durably recorded here BEFORE any QStash publish is attempted, so a
 * crash between persistence and publish is recoverable by the sweep in
 * app/api/scope/recover, not lost.
 *
 * Requires REDIS_KV_REST_API_URL / REDIS_KV_REST_API_TOKEN — the exact
 * names Vercel's Upstash-for-Redis Marketplace integration auto-creates
 * when connected with a "REDIS" custom prefix (confirmed against the
 * real Vercel project on 2026-09-09: it also creates a bare REDIS_URL,
 * but that's a raw rediss:// connection string for TCP clients, not the
 * HTTPS URL + bearer token pair @upstash/redis's REST client needs —
 * REDIS_KV_REST_API_URL/TOKEN is the correct pair, not REDIS_URL/TOKEN).
 * getRedis() below throws a clear, specific error rather than silently
 * no-op'ing if these are missing, so a misconfigured deploy fails
 * loudly instead of pretending to accept submissions it can't actually
 * persist.
 *
 * Honest status: Redis itself is now provisioned (2026-09-09), but
 * QStash is not yet, and no live traffic has exercised this file —
 * every operation here is reasoned through against the spec's crash-
 * recovery requirements and typechecks correctly, but Section H's
 * must-pass tests (crash-after-persist-before-publish, concurrent
 * workers, expired lease takeover, etc.) still need to actually run
 * before this is a launch claim, not just a code-complete one.
 */

let redisClient: Redis | null = null;
function getRedis(): Redis {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_KV_REST_API_URL;
  const token = process.env.REDIS_KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "REDIS_KV_REST_API_URL / REDIS_KV_REST_API_TOKEN are not configured. My Scope's submission storage cannot " +
        "function without them — see My_Scope_Final_Ready_For_Claude.md Section G for provisioning. Not falling " +
        "back to any in-memory substitute here: that would silently accept submissions this process can't " +
        "actually recover after a crash.",
    );
  }
  redisClient = new Redis({ url, token });
  return redisClient;
}

// --- Types ----------------------------------------------------------

export type ScopeJobType =
  | "pdf_generation"
  | "client_email"
  | "internal_email"
  | "hubspot_contact"
  | "hubspot_note";

export type ScopeJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "retry_scheduled"
  | "manual_attention"
  | "reconciliation_required";

export type ScopeActionStatus = "accepted" | "processing" | "complete" | "manual_attention";

export type ScopeResolvedSelection = {
  area: "Cybersecurity" | "Automation" | "OR ONE";
  code: string;
  name: string;
};

export type ScopeActionRecord = {
  actionId: string;
  requestId: string;
  intent: "pdf_download" | "review_requested";
  payloadHash: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  timeframe?: string;
  context?: string;
  sourcePath: string;
  reference: string;
  disclosureVersion: string;
  acknowledgedAt: string;
  selections: ScopeResolvedSelection[];
  createdAt: string;
  status: ScopeActionStatus;
  /** Set once pdf_generation completes; every email job reads this, never regenerates. */
  pdfChecksum?: string;
};

export type ScopeJobRecord = {
  jobId: string;
  actionId: string;
  type: ScopeJobType;
  status: ScopeJobStatus;
  attempts: number;
  nextAttemptAt: number; // unix ms
  leaseOwner?: string;
  leaseExpiresAt?: number;
  lastError?: string;
  // Populated on completion, per job type:
  providerId?: string; // Resend email ID or HubSpot contact/note ID
  firstAttemptAt?: number; // for Resend's 24h idempotency-window boundary (Section D)
};

// --- Key schema -------------------------------------------------------
// All under a `scope:` prefix so a shared Redis instance (if ever used
// for something else) can't collide, and so a preview/production
// isolation prefix (Section G: "preview must never sweep production
// jobs") can be layered on by changing this one constant if the two
// environments end up sharing a logical namespace.
const PREFIX = "scope:";
const kAction = (actionId: string) => `${PREFIX}action:${actionId}`;
const kActionJobs = (actionId: string) => `${PREFIX}action:${actionId}:jobs`;
const kRequestId = (requestId: string) => `${PREFIX}requestId:${requestId}`;
const kJob = (jobId: string) => `${PREFIX}job:${jobId}`;
const kDueIndex = `${PREFIX}due`; // sorted set: score=nextAttemptAt ms, member=jobId
const kPdf = (actionId: string) => `${PREFIX}pdf:${actionId}`;
const kEmailIdempotency = (actionId: string, role: "client" | "internal") =>
  `${PREFIX}email:${actionId}:${role}`;
const kDownloadToken = (token: string) => `${PREFIX}download:${token}`;

export function hashPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function newReference(): string {
  // Short, human-quotable reference distinct from the internal actionId
  // (which is a full UUID) — shown to the client and used in subject
  // lines, e.g. "SCP-7F2K9Q".
  const bytes = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `SCP-${bytes}`;
}

/**
 * Section B: atomically create the action + its job set + the due-work
 * index entries, BEFORE any QStash publish is attempted. Reusing a
 * requestId with an identical payload hash returns the existing action
 * (safe retry of the same submit click); a different payload under the
 * same requestId is a conflict (a bug in the caller, not a legitimate
 * retry) and must not silently overwrite the original.
 */
export async function createActionAtomically(
  input: Omit<ScopeActionRecord, "actionId" | "createdAt" | "status" | "reference"> & {
    reference?: string;
  },
): Promise<{ action: ScopeActionRecord; jobs: ScopeJobRecord[]; alreadyExisted: boolean }> {
  const redis = getRedis();

  const existingActionId = await redis.get<string>(kRequestId(input.requestId));
  if (existingActionId) {
    const existing = await redis.hgetall<ScopeActionRecord>(kAction(existingActionId));
    if (!existing) {
      throw new Error(
        `Data inconsistency: requestId ${input.requestId} points to actionId ${existingActionId}, but that action record is missing.`,
      );
    }
    if (existing.payloadHash !== input.payloadHash) {
      const err = new Error("REQUEST_ID_CONFLICT") as Error & { code: string };
      err.code = "REQUEST_ID_CONFLICT";
      throw err;
    }
    const jobIds = await redis.smembers(kActionJobs(existingActionId));
    const jobs = jobIds.length
      ? ((await redis.mget(...jobIds.map((id) => kJob(id)))) as (ScopeJobRecord | null)[]).filter(
          (j): j is ScopeJobRecord => !!j,
        )
      : [];
    return { action: existing, jobs, alreadyExisted: true };
  }

  const actionId = randomUUID();
  const reference = input.reference ?? newReference();
  const now = Date.now();
  const action: ScopeActionRecord = {
    ...input,
    actionId,
    reference,
    createdAt: new Date(now).toISOString(),
    status: "accepted",
  };

  const jobTypes: ScopeJobType[] = ["pdf_generation", "client_email", "internal_email", "hubspot_contact"];
  // hubspot_note depends on hubspot_contact's result (needs a real
  // contact ID first) — created by the contact job on completion, not
  // up front, so it never races ahead of a contact ID that doesn't
  // exist yet.
  const jobs: ScopeJobRecord[] = jobTypes.map((type) => ({
    jobId: randomUUID(),
    actionId,
    type,
    status: "pending",
    attempts: 0,
    nextAttemptAt: now,
  }));

  const tx = redis.multi();
  tx.set(kRequestId(input.requestId), actionId);
  tx.hset(kAction(actionId), action as unknown as Record<string, unknown>);
  for (const job of jobs) {
    tx.hset(kJob(job.jobId), job as unknown as Record<string, unknown>);
    tx.sadd(kActionJobs(actionId), job.jobId);
    tx.zadd(kDueIndex, { score: job.nextAttemptAt, member: job.jobId });
  }
  await tx.exec();

  return { action, jobs, alreadyExisted: false };
}

export async function getAction(actionId: string): Promise<ScopeActionRecord | null> {
  const redis = getRedis();
  const record = await redis.hgetall<ScopeActionRecord>(kAction(actionId));
  return record ?? null;
}

export async function getJob(jobId: string): Promise<ScopeJobRecord | null> {
  const redis = getRedis();
  const record = await redis.hgetall<ScopeJobRecord>(kJob(jobId));
  return record ?? null;
}

export async function getActionJobs(actionId: string): Promise<ScopeJobRecord[]> {
  const redis = getRedis();
  const jobIds = await redis.smembers(kActionJobs(actionId));
  if (!jobIds.length) return [];
  const jobs = await redis.mget<ScopeJobRecord[]>(...jobIds.map((id) => kJob(id)));
  return jobs.filter((j): j is ScopeJobRecord => !!j);
}

/**
 * Section C: atomic lease claim with a fencing token. Only the caller
 * holding the returned owner token may finish/renew/release the job.
 * An already-running, not-yet-expired lease refuses a second claim —
 * this is what keeps two concurrent workers (a real QStash retry race,
 * or the recovery sweep firing at the same moment as a normal retry)
 * from both acting on the same job.
 */
export async function claimJob(
  jobId: string,
  leaseMs: number,
): Promise<{ claimed: true; owner: string; job: ScopeJobRecord } | { claimed: false; reason: string }> {
  const redis = getRedis();
  const owner = randomUUID();
  const now = Date.now();

  const job = await getJob(jobId);
  if (!job) return { claimed: false, reason: "job not found" };
  if (job.status === "completed") return { claimed: false, reason: "already completed" };
  if (job.status === "running" && job.leaseExpiresAt && job.leaseExpiresAt > now) {
    return { claimed: false, reason: "lease held by another worker" };
  }
  if (job.nextAttemptAt > now) {
    return { claimed: false, reason: "not yet due" };
  }

  const updated: ScopeJobRecord = {
    ...job,
    status: "running",
    leaseOwner: owner,
    leaseExpiresAt: now + leaseMs,
    firstAttemptAt: job.firstAttemptAt ?? now,
  };
  await redis.hset(kJob(jobId), updated as unknown as Record<string, unknown>);
  return { claimed: true, owner, job: updated };
}

/** Fencing check: only the current lease owner may write a terminal/next-attempt transition. */
async function assertOwnsLease(jobId: string, owner: string): Promise<ScopeJobRecord> {
  const job = await getJob(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);
  if (job.leaseOwner !== owner) {
    throw new Error(`Lease fencing: ${owner} does not hold job ${jobId}'s current lease (held by ${job.leaseOwner ?? "nobody"})`);
  }
  return job;
}

export async function completeJob(jobId: string, owner: string, providerId?: string): Promise<void> {
  const redis = getRedis();
  const job = await assertOwnsLease(jobId, owner);
  const updated: ScopeJobRecord = {
    ...job,
    status: "completed",
    leaseOwner: undefined,
    leaseExpiresAt: undefined,
    providerId: providerId ?? job.providerId,
  };
  const tx = redis.multi();
  tx.hset(kJob(jobId), updated as unknown as Record<string, unknown>);
  tx.zrem(kDueIndex, jobId);
  await tx.exec();
}

// Section C's bounded backoff schedule, in minutes, after each
// successive failed attempt. Index 0 = delay before the 2nd attempt
// (i.e. after the 1st failure), matching "after the first failure,
// target 1 minute, 5 minutes...".
const BACKOFF_MINUTES = [1, 5, 15, 60, 240, 720] as const; // 1m,5m,15m,1h,4h,12h

export async function scheduleRetry(jobId: string, owner: string, error: string): Promise<ScopeJobRecord> {
  const redis = getRedis();
  const job = await assertOwnsLease(jobId, owner);
  const attempts = job.attempts + 1;

  if (attempts > BACKOFF_MINUTES.length) {
    const updated: ScopeJobRecord = {
      ...job,
      status: "manual_attention",
      attempts,
      leaseOwner: undefined,
      leaseExpiresAt: undefined,
      lastError: error.slice(0, 500),
    };
    const tx = redis.multi();
    tx.hset(kJob(jobId), updated as unknown as Record<string, unknown>);
    tx.zrem(kDueIndex, jobId); // stop scheduling — needs a human
    await tx.exec();
    return updated;
  }

  const delayMs = BACKOFF_MINUTES[attempts - 1] * 60_000;
  const nextAttemptAt = Date.now() + delayMs;
  const updated: ScopeJobRecord = {
    ...job,
    status: "retry_scheduled",
    attempts,
    nextAttemptAt,
    leaseOwner: undefined,
    leaseExpiresAt: undefined,
    lastError: error.slice(0, 500),
  };
  const tx = redis.multi();
  tx.hset(kJob(jobId), updated as unknown as Record<string, unknown>);
  tx.zadd(kDueIndex, { score: nextAttemptAt, member: jobId });
  await tx.exec();
  return updated;
}

export async function markReconciliationRequired(jobId: string, owner: string, reason: string): Promise<void> {
  const redis = getRedis();
  const job = await assertOwnsLease(jobId, owner);
  const updated: ScopeJobRecord = {
    ...job,
    status: "reconciliation_required",
    leaseOwner: undefined,
    leaseExpiresAt: undefined,
    lastError: reason.slice(0, 500),
  };
  const tx = redis.multi();
  tx.hset(kJob(jobId), updated as unknown as Record<string, unknown>);
  tx.zrem(kDueIndex, jobId); // needs a human look, not another automatic attempt
  await tx.exec();
}

/**
 * Section B/H: the recovery sweep's core query. Batched with a cursor
 * (ZRANGE BYSCORE with LIMIT) and a bounded max, not a single unbounded
 * scan, per "batch work with a cursor and bounded execution time."
 * Also reclaims jobs whose lease expired while still "running" (a
 * worker crashed mid-attempt) by returning them here too — the caller
 * re-claims them through the normal claimJob path, which the fencing
 * check makes safe even if the original worker somehow wakes back up.
 */
export async function findDueJobIds(nowMs: number, limit: number): Promise<string[]> {
  const redis = getRedis();
  const dueByIndex = await redis.zrange<string[]>(kDueIndex, 0, nowMs, {
    byScore: true,
    offset: 0,
    count: limit,
  });
  return dueByIndex;
}

/** Adds a new job (used for hubspot_note, created only once its contact job completes with a real ID). */
export async function addFollowUpJob(actionId: string, type: ScopeJobType): Promise<ScopeJobRecord> {
  const redis = getRedis();
  const job: ScopeJobRecord = {
    jobId: randomUUID(),
    actionId,
    type,
    status: "pending",
    attempts: 0,
    nextAttemptAt: Date.now(),
  };
  const tx = redis.multi();
  tx.hset(kJob(job.jobId), job as unknown as Record<string, unknown>);
  tx.sadd(kActionJobs(actionId), job.jobId);
  tx.zadd(kDueIndex, { score: job.nextAttemptAt, member: job.jobId });
  await tx.exec();
  return job;
}

export async function updateAction(actionId: string, patch: Partial<ScopeActionRecord>): Promise<void> {
  const redis = getRedis();
  await redis.hset(kAction(actionId), patch as unknown as Record<string, unknown>);
}

// --- PDF artifact storage ---------------------------------------------
// Section A: persist the exact generated bytes once per action, reused
// for the browser download and both email attachments — never
// regenerated per-recipient. Stored as base64 in a single Redis string;
// per the spec this needs the real two-page-maximum artifact size
// measured before trusting this strategy at scale (a follow-up
// verification step, not done here — no live Redis to measure against).

export async function storePdf(actionId: string, bytes: Buffer): Promise<string> {
  const redis = getRedis();
  const checksum = createHash("sha256").update(bytes).digest("hex");
  await redis.set(kPdf(actionId), bytes.toString("base64"));
  await updateAction(actionId, { pdfChecksum: checksum });
  return checksum;
}

export async function getPdf(actionId: string): Promise<Buffer | null> {
  const redis = getRedis();
  const b64 = await redis.get<string>(kPdf(actionId));
  if (!b64) return null;
  return Buffer.from(b64, "base64");
}

// --- Email idempotency (Section D) -------------------------------------

export type EmailIdempotencyRecord = {
  idempotencyKey: string;
  payloadHash: string;
  providerId?: string;
  firstAttemptAt: number;
};

export async function getOrCreateEmailIdempotency(
  actionId: string,
  role: "client" | "internal",
  payloadHash: string,
): Promise<EmailIdempotencyRecord> {
  const redis = getRedis();
  const key = kEmailIdempotency(actionId, role);
  const existing = await redis.hgetall<EmailIdempotencyRecord>(key);
  if (existing && existing.idempotencyKey) return existing;
  const record: EmailIdempotencyRecord = {
    idempotencyKey: `scope/${actionId}/${role}`,
    payloadHash,
    firstAttemptAt: Date.now(),
  };
  await redis.hset(key, record as unknown as Record<string, unknown>);
  return record;
}

export async function recordEmailProviderId(
  actionId: string,
  role: "client" | "internal",
  providerId: string,
): Promise<void> {
  const redis = getRedis();
  await redis.hset(kEmailIdempotency(actionId, role), { providerId });
}

// --- Protected download tokens ------------------------------------------

export async function createDownloadToken(actionId: string, ttlSeconds: number): Promise<string> {
  const redis = getRedis();
  const token = randomUUID();
  await redis.set(kDownloadToken(token), actionId, { ex: ttlSeconds });
  return token;
}

export async function resolveDownloadToken(token: string): Promise<string | null> {
  const redis = getRedis();
  return (await redis.get<string>(kDownloadToken(token))) ?? null;
}
