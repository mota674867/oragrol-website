import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";

/**
 * Durable outbox + assessment ledger for the Cyber Health HubSpot
 * amendment, per Cyber_Health_HubSpot_Claude_Handoff.md. Deliberately
 * a separate key prefix (`cha:`) and separate job queue from My
 * Scope's (`scope:`) rather than merged in — two independent features,
 * kept independent, so a bug in one can't touch the other (the exact
 * lesson from tonight's My Scope debugging).
 *
 * Reuses the same Redis instance/credentials as My Scope
 * (REDIS_KV_REST_API_URL/TOKEN) since they're the same app's same
 * database — just a different logical namespace within it.
 *
 * Honest status: mirrors scope-store.ts's patterns, which have real
 * production traffic behind them tonight (My Scope's job queue,
 * recovery sweep, and getActionJobs bug were all found and fixed
 * against live data). This file itself has not yet been exercised
 * against a live HubSpot sync — needs a real assessment submission and
 * a check of the resulting Redis/HubSpot state before it's a launch
 * claim, not just code-complete.
 */

let redisClient: Redis | null = null;
function getRedis(): Redis {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_KV_REST_API_URL;
  const token = process.env.REDIS_KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "REDIS_KV_REST_API_URL / REDIS_KV_REST_API_TOKEN are not configured. Cyber Health's HubSpot sync cannot " +
        "function without them. Not falling back to any in-memory substitute — that would silently accept " +
        "submissions this process can't actually recover after a crash.",
    );
  }
  redisClient = new Redis({ url, token });
  return redisClient;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// --- Types ----------------------------------------------------------

export type CyberHealthJobType = "cha_contact" | "cha_note_part" | "cha_latest_props";

export type CyberHealthJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "retry_scheduled"
  | "manual_attention"
  | "reconciliation_required";

export type CyberHealthJobRecord = {
  jobId: string;
  assessmentId: string;
  type: CyberHealthJobType;
  status: CyberHealthJobStatus;
  attempts: number;
  nextAttemptAt: number; // unix ms
  leaseOwner?: string;
  leaseExpiresAt?: number;
  lastError?: string;
  providerId?: string; // HubSpot contact/note ID on completion
  firstAttemptAt?: number;
  // Only meaningful for cha_note_part jobs — which part of the (possibly
  // multi-part) note this job is responsible for creating.
  partIndex?: number;
  partTotal?: number;
  partHtml?: string;
  partMarker?: string;
};

// --- Key schema -------------------------------------------------------
const PREFIX = "cha:";
const kJob = (jobId: string) => `${PREFIX}job:${jobId}`;
const kAssessmentJobs = (assessmentId: string) => `${PREFIX}assessment:${assessmentId}:jobs`;
const kDueIndex = `${PREFIX}due`; // sorted set: score=nextAttemptAt ms, member=jobId
const kSnapshot = (assessmentId: string) => `${PREFIX}snapshot:${assessmentId}`; // stored AssessmentSnapshot JSON, for projection
// Ledger: one sorted set per normalized contact identity. score =
// completedAt ms, member = assessmentId. ZADD is naturally idempotent
// (re-adding the same assessmentId never inflates the set), so a
// retry can never double-count. ZCARD gives the true distinct count.
// Same-score ties break by Redis's own lexicographic member ordering
// — a real, deterministic tie-breaker, not an invented one.
const kLedger = (identity: string) => `${PREFIX}ledger:${identity}`;
const kProjectionLock = (identity: string) => `${PREFIX}projlock:${identity}`;

export function normalizeContactIdentity(email: string): string {
  return email.trim().toLowerCase();
}

// --- Snapshot storage (durable record of the full validated submission,
// persisted BEFORE any job is created, so a crash between persistence
// and job creation is recoverable — same "durable outbox" principle
// as My Scope's action record) -------------------------------------

export async function storeAssessmentSnapshot(assessmentId: string, snapshotJson: string): Promise<void> {
  const redis = getRedis();
  await redis.set(kSnapshot(assessmentId), snapshotJson);
}

export async function getAssessmentSnapshotJson(assessmentId: string): Promise<string | null> {
  const redis = getRedis();
  return (await redis.get<string>(kSnapshot(assessmentId))) ?? null;
}

// --- Job creation -----------------------------------------------------

/**
 * Creates the cha_contact job for a newly-accepted assessment. Note
 * parts are NOT created here — they're added as follow-up jobs once
 * the contact job confirms a real contact ID (addCyberHealthNoteJobs
 * below), same "never race ahead of an ID that doesn't exist yet"
 * principle as My Scope's hubspot_note.
 *
 * assessmentId is the caller's durable, already-persisted identifier
 * — never generated here, so a retry of the same request reuses it
 * rather than minting a new one (this is what makes the ledger's
 * distinct-ID counting correct).
 */
export async function createContactJob(assessmentId: string): Promise<CyberHealthJobRecord> {
  const redis = getRedis();
  const now = Date.now();
  const job: CyberHealthJobRecord = {
    jobId: randomUUID(),
    assessmentId,
    type: "cha_contact",
    status: "pending",
    attempts: 0,
    nextAttemptAt: now,
  };
  const tx = redis.multi();
  tx.hset(kJob(job.jobId), stripUndefined(job as unknown as Record<string, unknown>));
  tx.sadd(kAssessmentJobs(assessmentId), job.jobId);
  tx.zadd(kDueIndex, { score: job.nextAttemptAt, member: job.jobId });
  await tx.exec();
  return job;
}

/** One job per note part — created only after the contact job completes. */
export async function addCyberHealthNoteJobs(
  assessmentId: string,
  parts: Array<{ part: number; totalParts: number; marker: string; html: string }>,
): Promise<CyberHealthJobRecord[]> {
  const redis = getRedis();
  const now = Date.now();
  const jobs: CyberHealthJobRecord[] = parts.map((p) => ({
    jobId: randomUUID(),
    assessmentId,
    type: "cha_note_part",
    status: "pending",
    attempts: 0,
    nextAttemptAt: now,
    partIndex: p.part,
    partTotal: p.totalParts,
    partHtml: p.html,
    partMarker: p.marker,
  }));
  const tx = redis.multi();
  for (const job of jobs) {
    tx.hset(kJob(job.jobId), stripUndefined(job as unknown as Record<string, unknown>));
    tx.sadd(kAssessmentJobs(assessmentId), job.jobId);
    tx.zadd(kDueIndex, { score: job.nextAttemptAt, member: job.jobId });
  }
  await tx.exec();
  return jobs;
}

/** Created once all note parts for this assessment have completed. */
export async function addLatestPropsJob(assessmentId: string): Promise<CyberHealthJobRecord> {
  const redis = getRedis();
  const now = Date.now();
  const job: CyberHealthJobRecord = {
    jobId: randomUUID(),
    assessmentId,
    type: "cha_latest_props",
    status: "pending",
    attempts: 0,
    nextAttemptAt: now,
  };
  const tx = redis.multi();
  tx.hset(kJob(job.jobId), stripUndefined(job as unknown as Record<string, unknown>));
  tx.sadd(kAssessmentJobs(assessmentId), job.jobId);
  tx.zadd(kDueIndex, { score: job.nextAttemptAt, member: job.jobId });
  await tx.exec();
  return job;
}

export async function getJob(jobId: string): Promise<CyberHealthJobRecord | null> {
  const redis = getRedis();
  const record = await redis.hgetall<CyberHealthJobRecord>(kJob(jobId));
  return record ?? null;
}

export async function getAssessmentJobs(assessmentId: string): Promise<CyberHealthJobRecord[]> {
  const redis = getRedis();
  const jobIds = await redis.smembers(kAssessmentJobs(assessmentId));
  if (!jobIds.length) return [];
  // Job records are Hashes — MGET only works on String-type keys (the
  // exact bug found and fixed in My Scope's getActionJobs tonight).
  // Fetch each job the same way getJob() does.
  const jobs = await Promise.all(jobIds.map((id) => getJob(id)));
  return jobs.filter((j): j is CyberHealthJobRecord => !!j);
}

// --- Lease claim / completion / retry (identical mechanics to
// scope-store.ts's proven pattern) ------------------------------------

export async function claimJob(
  jobId: string,
  leaseMs: number,
): Promise<{ claimed: true; owner: string; job: CyberHealthJobRecord } | { claimed: false; reason: string }> {
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

  const updated: CyberHealthJobRecord = {
    ...job,
    status: "running",
    leaseOwner: owner,
    leaseExpiresAt: now + leaseMs,
    firstAttemptAt: job.firstAttemptAt ?? now,
  };
  await redis.hset(kJob(jobId), stripUndefined(updated as unknown as Record<string, unknown>));
  return { claimed: true, owner, job: updated };
}

async function assertOwnsLease(jobId: string, owner: string): Promise<CyberHealthJobRecord> {
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
  const updated: CyberHealthJobRecord = {
    ...job,
    status: "completed",
    leaseOwner: undefined,
    leaseExpiresAt: undefined,
    providerId: providerId ?? job.providerId,
  };
  const tx = redis.multi();
  tx.hset(kJob(jobId), stripUndefined(updated as unknown as Record<string, unknown>));
  tx.zrem(kDueIndex, jobId);
  await tx.exec();
}

const BACKOFF_MINUTES = [1, 5, 15, 60, 240, 720] as const; // 1m,5m,15m,1h,4h,12h

export async function scheduleRetry(jobId: string, owner: string, error: string): Promise<CyberHealthJobRecord> {
  const redis = getRedis();
  const job = await assertOwnsLease(jobId, owner);
  const attempts = job.attempts + 1;

  if (attempts > BACKOFF_MINUTES.length) {
    const updated: CyberHealthJobRecord = {
      ...job,
      status: "manual_attention",
      attempts,
      leaseOwner: undefined,
      leaseExpiresAt: undefined,
      lastError: error.slice(0, 500),
    };
    const tx = redis.multi();
    tx.hset(kJob(jobId), stripUndefined(updated as unknown as Record<string, unknown>));
    tx.zrem(kDueIndex, jobId);
    await tx.exec();
    return updated;
  }

  const delayMs = BACKOFF_MINUTES[attempts - 1] * 60_000;
  const nextAttemptAt = Date.now() + delayMs;
  const updated: CyberHealthJobRecord = {
    ...job,
    status: "retry_scheduled",
    attempts,
    nextAttemptAt,
    leaseOwner: undefined,
    leaseExpiresAt: undefined,
    lastError: error.slice(0, 500),
  };
  const tx = redis.multi();
  tx.hset(kJob(jobId), stripUndefined(updated as unknown as Record<string, unknown>));
  tx.zadd(kDueIndex, { score: nextAttemptAt, member: jobId });
  await tx.exec();
  return updated;
}

export async function markReconciliationRequired(jobId: string, owner: string, reason: string): Promise<void> {
  const redis = getRedis();
  const job = await assertOwnsLease(jobId, owner);
  const updated: CyberHealthJobRecord = {
    ...job,
    status: "reconciliation_required",
    leaseOwner: undefined,
    leaseExpiresAt: undefined,
    lastError: reason.slice(0, 500),
  };
  const tx = redis.multi();
  tx.hset(kJob(jobId), stripUndefined(updated as unknown as Record<string, unknown>));
  tx.zrem(kDueIndex, jobId);
  await tx.exec();
}

export async function findDueJobIds(nowMs: number, limit: number): Promise<string[]> {
  const redis = getRedis();
  return await redis.zrange<string[]>(kDueIndex, 0, nowMs, { byScore: true, offset: 0, count: limit });
}

// --- Assessment ledger (concurrency-safe distinct count + latest) -----

/**
 * Records this assessment in its contact's ledger. Idempotent — ZADD
 * on an already-present member just updates the score (harmless if
 * completedAt is identical on a retry, which it always is since
 * completedAt comes from the persisted report, not "now"). Returns the
 * new distinct count via ZCARD, computed from the ledger itself, never
 * from reading-then-incrementing HubSpot's own stored number (which
 * concurrent retries would inflate).
 */
export async function recordAssessmentInLedger(
  identity: string,
  assessmentId: string,
  completedAtMs: number,
): Promise<{ distinctCount: number }> {
  const redis = getRedis();
  await redis.zadd(kLedger(identity), { score: completedAtMs, member: assessmentId });
  const distinctCount = await redis.zcard(kLedger(identity));
  return { distinctCount };
}

/** The assessmentId with the latest completedAt currently in this contact's ledger. */
export async function getLatestLedgerAssessmentId(identity: string): Promise<string | null> {
  const redis = getRedis();
  const top = await redis.zrange<string[]>(kLedger(identity), 0, 0, { rev: true });
  return top[0] ?? null;
}

export async function getLedgerDistinctCount(identity: string): Promise<number> {
  const redis = getRedis();
  return await redis.zcard(kLedger(identity));
}

/**
 * Per-contact lock for the "write latest properties" projection step.
 * Per the handoff: "Serialize Contact projection jobs per contact...
 * each job reads the current ledger's latest snapshot/count" — without
 * this lock, two concurrent projection jobs for the same contact could
 * both read the ledger, then write in reverse order, leaving a stale
 * result even though each individual read was correct. SET NX with a
 * short TTL; the lock self-expires if a worker crashes mid-projection
 * rather than deadlocking the contact forever.
 */
export async function withProjectionLock<T>(identity: string, fn: () => Promise<T>): Promise<T | { locked: true }> {
  const redis = getRedis();
  const lockKey = kProjectionLock(identity);
  const owner = randomUUID();
  const acquired = await redis.set(lockKey, owner, { nx: true, ex: 30 });
  if (!acquired) return { locked: true };
  try {
    return await fn();
  } finally {
    // Only release if we still own it (best-effort; a 30s TTL bounds
    // the worst case either way if this check itself races).
    const current = await redis.get<string>(lockKey);
    if (current === owner) await redis.del(lockKey);
  }
}
