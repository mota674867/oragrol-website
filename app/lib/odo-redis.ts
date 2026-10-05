// ORAGROL ODO — Redis store
// Handles rate limiting (7-day email, 30-day URL) and session state.
// Uses the same Upstash Redis instance as scope-store and cyber-health.
// Env vars: REDIS_KV_REST_API_URL / REDIS_KV_REST_API_TOKEN

import { Redis } from "@upstash/redis";
import { createHash, randomUUID } from "crypto";
import type { AiUsageTotals } from "./odo-cost";

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_KV_REST_API_URL;
  const token = process.env.REDIS_KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "REDIS_KV_REST_API_URL / REDIS_KV_REST_API_TOKEN are not configured. " +
      "ODO rate limiting and session storage cannot function without them."
    );
  }
  redisClient = new Redis({ url, token });
  return redisClient;
}

// --- Types ---

export type OdoScanStatus =
  | "intake"
  | "researching"
  | "questioning"
  | "evaluating"
  | "complete"
  | "insufficient_data"
  | "failed"
  | "cancelled";

export type OdoScanCondition = "complete" | "insufficient_data" | null;

export type OdoSession = {
  sessionId: string;
  emailHash: string;
  domainHash: string;
  visitorName: string;
  visitorEmail: string;
  visitorCompany: string;
  visitorWebsite: string | null;
  hasWebsite: boolean;
  consentTimestamp: number;
  status: OdoScanStatus;
  condition: OdoScanCondition;
  phase: string;
  step: string;
  questionsAsked: number;
  findings: Record<string, unknown>;
  swot: Record<string, unknown> | null;
  serviceMatches: unknown[];
  hubspotContactId: string | null;
  createdAt: number;
  updatedAt: number;
};

// --- Key helpers ---

const EMAIL_COOLDOWN_PREFIX = "odo:cooldown:email:";
const DOMAIN_COOLDOWN_PREFIX = "odo:cooldown:domain:";
const SESSION_PREFIX = "odo:session:";
const INCOMPLETE_PREFIX = "odo:incomplete:";

function hashEmail(email: string): string {
  return createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 32);
}

function hashDomain(url: string): string {
  try {
    const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
    return createHash("sha256").update(domain).digest("hex").slice(0, 32);
  } catch {
    return createHash("sha256").update(url.toLowerCase().trim()).digest("hex").slice(0, 32);
  }
}

export function generateSessionId(): string {
  return `odo_${Date.now()}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

// --- Rate limiting ---

const EMAIL_COOLDOWN_SECONDS = 7 * 24 * 60 * 60;   // 7 days
const DOMAIN_COOLDOWN_SECONDS = 30 * 24 * 60 * 60;  // 30 days
const INCOMPLETE_TTL_SECONDS = 7 * 24 * 60 * 60;    // 7 days then auto-clear

export type CooldownCheckResult =
  | { allowed: true }
  | { allowed: false; reason: "email_cooldown"; nextAvailableAt: number; previousScanDate: string }
  | { allowed: false; reason: "domain_cooldown"; nextAvailableAt: number; previousScanDate: string; domain: string };

export async function checkCooldowns(
  email: string | null,
  website: string | null
): Promise<CooldownCheckResult> {
  const redis = getRedis();

  // Check email cooldown (skipped when no email was given — the admin
  // cooldown-lookup tool, Phase 5, can search by URL alone per Master Ref
  // §26; the live scan-start flow always passes a real email, so this is
  // additive and never changes that path's behavior).
  const emailRecord = email
    ? await redis.get<{ completedAt: number }>(`${EMAIL_COOLDOWN_PREFIX}${hashEmail(email)}`)
    : null;
  if (emailRecord) {
    const nextAvailableAt = emailRecord.completedAt + EMAIL_COOLDOWN_SECONDS * 1000;
    return {
      allowed: false,
      reason: "email_cooldown",
      nextAvailableAt,
      previousScanDate: new Date(emailRecord.completedAt).toLocaleDateString("en-CA", {
        timeZone: "America/Toronto", year: "numeric", month: "long", day: "numeric",
      }),
    };
  }

  // Check domain cooldown (only if website provided)
  if (website) {
    const domainHash = hashDomain(website);
    const domainKey = `${DOMAIN_COOLDOWN_PREFIX}${domainHash}`;
    const domainRecord = await redis.get<{ completedAt: number; domain: string }>(domainKey);
    if (domainRecord) {
      const nextAvailableAt = domainRecord.completedAt + DOMAIN_COOLDOWN_SECONDS * 1000;
      return {
        allowed: false,
        reason: "domain_cooldown",
        nextAvailableAt,
        previousScanDate: new Date(domainRecord.completedAt).toLocaleDateString("en-CA", {
          timeZone: "America/Toronto", year: "numeric", month: "long", day: "numeric",
        }),
        domain: domainRecord.domain,
      };
    }
  }

  return { allowed: true };
}

export async function activateCooldowns(email: string, website: string | null): Promise<void> {
  const redis = getRedis();
  const now = Date.now();
  const emailHash = hashEmail(email);

  await redis.set(
    `${EMAIL_COOLDOWN_PREFIX}${emailHash}`,
    { completedAt: now },
    { ex: EMAIL_COOLDOWN_SECONDS }
  );

  if (website) {
    const domainHash = hashDomain(website);
    let domain = website;
    try { domain = new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, ""); } catch { /* keep raw */ }
    await redis.set(
      `${DOMAIN_COOLDOWN_PREFIX}${domainHash}`,
      { completedAt: now, domain },
      { ex: DOMAIN_COOLDOWN_SECONDS }
    );
  }
}

export async function clearCooldowns(email: string | null, website: string | null, authorizedBy: string, reason: string): Promise<void> {
  const redis = getRedis();
  if (email) await redis.del(`${EMAIL_COOLDOWN_PREFIX}${hashEmail(email)}`);
  if (website) await redis.del(`${DOMAIN_COOLDOWN_PREFIX}${hashDomain(website)}`);
  // Log the reset for ZM77 audit trail. ZM77 itself doesn't exist yet (same
  // stop-gap noted in odo-email.ts) — this Redis record is the real audit
  // trail today; app/api/odo/admin/cooldown/route.ts (Phase 5) is the only
  // caller, and it also emails Mohammad a copy of the same note so the
  // reset is never ONLY in a Redis key nobody reads.
  const auditKey = `odo:reset:audit:${Date.now()}`;
  await redis.set(auditKey, { email, website, authorizedBy, reason, resetAt: Date.now() }, { ex: 365 * 24 * 60 * 60 });
}

/** Admin-tool read: every logged cooldown-reset audit entry, newest first — used so the reset tool can show Mohammad a history of past resets, not just perform new ones. Best-effort key scan (Upstash `keys` is fine at ODO's volume; this is an occasional admin lookup, never called from the scan hot path). */
export async function listCooldownResetAudit(limit = 50): Promise<Array<{ email: string | null; website: string | null; authorizedBy: string; reason: string; resetAt: number }>> {
  const redis = getRedis();
  const keys = await redis.keys("odo:reset:audit:*");
  keys.sort().reverse();
  const top = keys.slice(0, limit);
  if (!top.length) return [];
  const records = await redis.mget<Array<{ email: string | null; website: string | null; authorizedBy: string; reason: string; resetAt: number } | null>>(...top);
  return records.filter((r): r is NonNullable<typeof r> => r != null);
}

// --- Session management ---

export async function createSession(data: Omit<OdoSession, "sessionId" | "createdAt" | "updatedAt">): Promise<OdoSession> {
  const redis = getRedis();
  const sessionId = generateSessionId();
  const now = Date.now();
  const session: OdoSession = { ...data, sessionId, createdAt: now, updatedAt: now };
  const sessionKey = `${SESSION_PREFIX}${sessionId}`;
  // Sessions live for 48 hours
  await redis.set(sessionKey, session, { ex: 48 * 60 * 60 });
  // Track as incomplete until completed
  const incompleteKey = `${INCOMPLETE_PREFIX}${hashEmail(data.visitorEmail)}`;
  await redis.set(incompleteKey, { sessionId, createdAt: now }, { ex: INCOMPLETE_TTL_SECONDS });
  return session;
}

export async function getSession(sessionId: string): Promise<OdoSession | null> {
  const redis = getRedis();
  return redis.get<OdoSession>(`${SESSION_PREFIX}${sessionId}`);
}

export async function updateSession(sessionId: string, updates: Partial<OdoSession>): Promise<void> {
  const redis = getRedis();
  const session = await getSession(sessionId);
  if (!session) throw new Error(`ODO session not found: ${sessionId}`);
  const updated = { ...session, ...updates, updatedAt: Date.now() };
  await redis.set(`${SESSION_PREFIX}${sessionId}`, updated, { ex: 48 * 60 * 60 });
  // Only a live interview can be abandoned; every other status leaves the set.
  await touchActiveSession(sessionId, updated.status === "questioning").catch(() => {});
}

export async function markSessionComplete(session: OdoSession): Promise<void> {
  const redis = getRedis();
  // Remove the incomplete flag
  const incompleteKey = `${INCOMPLETE_PREFIX}${hashEmail(session.visitorEmail)}`;
  await redis.del(incompleteKey);
  // Activate cooldowns
  await activateCooldowns(session.visitorEmail, session.visitorWebsite);
  // Update session status
  await updateSession(session.sessionId, { status: "complete" });
}

export async function getIncompleteSession(email: string): Promise<{ sessionId: string; createdAt: number } | null> {
  const redis = getRedis();
  const incompleteKey = `${INCOMPLETE_PREFIX}${hashEmail(email)}`;
  return redis.get<{ sessionId: string; createdAt: number }>(incompleteKey);
}

// --- Lifetime AI cost tracking (odo-cost.ts) ---
//
// A running, all-time total of every dollar ODO has actually spent on Jev +
// Claude, so Mohammad can check cumulative spend without having to add up
// every scan's log line by hand. Read-modify-write (not atomic) — fine here
// because ODO scans complete one at a time in practice; a lost increment
// under real concurrent load would undercount by at most one scan's cost,
// never overcount, and never blocks a scan either way (best-effort, like
// every other logging path in ODO).

const LIFETIME_COST_KEY = "odo:cost:lifetime";

export type LifetimeAiCost = {
  totalCostUsd: number;
  scanCount: number;
  usage: AiUsageTotals;
  since: string;
  lastUpdatedAt: string;
};

export async function recordLifetimeAiCost(usage: AiUsageTotals, costUsd: number): Promise<void> {
  const redis = getRedis();
  const current = await redis.get<LifetimeAiCost>(LIFETIME_COST_KEY);
  const now = new Date().toISOString();
  const next: LifetimeAiCost = current
    ? {
        totalCostUsd: Math.round((current.totalCostUsd + costUsd) * 1_000_000) / 1_000_000,
        scanCount: current.scanCount + 1,
        usage: {
          jevInputTokens: current.usage.jevInputTokens + usage.jevInputTokens,
          jevOutputTokens: current.usage.jevOutputTokens + usage.jevOutputTokens,
          jevCalls: current.usage.jevCalls + usage.jevCalls,
          claudeInputTokens: current.usage.claudeInputTokens + usage.claudeInputTokens,
          claudeOutputTokens: current.usage.claudeOutputTokens + usage.claudeOutputTokens,
          claudeCalls: current.usage.claudeCalls + usage.claudeCalls,
          opusInputTokens: (current.usage.opusInputTokens ?? 0) + (usage.opusInputTokens ?? 0),
          opusOutputTokens: (current.usage.opusOutputTokens ?? 0) + (usage.opusOutputTokens ?? 0),
          opusCalls: (current.usage.opusCalls ?? 0) + (usage.opusCalls ?? 0),
        },
        since: current.since,
        lastUpdatedAt: now,
      }
    : { totalCostUsd: costUsd, scanCount: 1, usage, since: now, lastUpdatedAt: now };
  await redis.set(LIFETIME_COST_KEY, next); // no TTL — this total should never expire
}

export async function getLifetimeAiCost(): Promise<LifetimeAiCost | null> {
  const redis = getRedis();
  return redis.get<LifetimeAiCost>(LIFETIME_COST_KEY);
}

// --- Daily AI spend tracking + per-IP daily limit (odo-spend.ts, odo-gate.ts) ---
//
// ADDED 2026-10-01 — Mohammad's explicit requirement after approving the
// ODO brain rebuild: at ~$2/scan, an unfiltered bot or prankster running
// many scans is real money, not a theoretical risk. This is the money-side
// half of the entry gate: a per-IP daily cap (stops one source looping the
// form) and a global daily spend ceiling that pauses all scans and alerts
// Mohammad the moment it's crossed (odo-spend.ts), independent of any
// single scan's own $2 cap.
//
// Dates are keyed in America/Toronto (ORAGROL's home market) so "today"
// resets at a time that matches Mohammad's own day, not UTC midnight.

const DAILY_SPEND_PREFIX = "odo:spend:daily:";
const DAILY_SPEND_ALERTED_PREFIX = "odo:spend:alerted:";
const IP_DAILY_LIMIT_PREFIX = "odo:iplimit:daily:";

/** "YYYY-MM-DD" in America/Toronto — the key every daily counter below rolls over on. */
export function torontoDateKey(d: Date = new Date()): string {
  return d.toLocaleDateString("en-CA", { timeZone: "America/Toronto" }); // en-CA = YYYY-MM-DD
}

/** Adds costUsd to today's running total. Read-modify-write is fine here — same tolerance as recordLifetimeAiCost: a lost increment under real concurrency undercounts by at most one scan, never overcounts, and this is a safety margin, not a billing ledger. */
export async function recordDailySpend(costUsd: number): Promise<number> {
  const redis = getRedis();
  const key = `${DAILY_SPEND_PREFIX}${torontoDateKey()}`;
  const next = await redis.incrbyfloat(key, costUsd);
  // First write of the day sets the expiry; redundant on later writes but
  // harmless and avoids a separate "is this the first write" branch.
  await redis.expire(key, 2 * 24 * 60 * 60); // 2 days — comfortably outlives "today" in any timezone skew
  return next;
}

export async function getDailySpend(): Promise<number> {
  const redis = getRedis();
  const val = await redis.get<number | string>(`${DAILY_SPEND_PREFIX}${torontoDateKey()}`);
  return val ? Number(val) : 0;
}

/**
 * Returns true only the FIRST time this is called on a given day (sets an
 * NX flag) — so the daily-cap-crossed alert email fires once per day, not
 * once per scan that tries to start while already paused.
 */
export async function claimDailyCapAlert(): Promise<boolean> {
  const redis = getRedis();
  const key = `${DAILY_SPEND_ALERTED_PREFIX}${torontoDateKey()}`;
  const result = await redis.set(key, "1", { nx: true, ex: 2 * 24 * 60 * 60 });
  return result === "OK";
}

/** Per-IP daily scan-start count. Supplements the existing in-memory 15/hour limiter (rate-limit.ts) with a real, shared, Redis-backed daily ceiling that survives across serverless instances. */
export async function checkIpDailyLimit(ip: string, limit: number): Promise<{ ok: boolean; count: number }> {
  const redis = getRedis();
  const key = `${IP_DAILY_LIMIT_PREFIX}${torontoDateKey()}:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 24 * 60 * 60);
  return { ok: count <= limit, count };
}

// --- Interview turn lock (Master Reference §37) ---
//
// One interview turn per session at a time. A double-click, a second tab, or
// a retried request must never run two Claude turns against the same state —
// that is how an answer gets judged twice or a question gets skipped. The
// lock self-expires so a crashed turn can never block a scan forever.

const TURN_LOCK_PREFIX = "odo:turnlock:";

export async function acquireTurnLock(sessionId: string): Promise<boolean> {
  const redis = getRedis();
  const res = await redis.set(`${TURN_LOCK_PREFIX}${sessionId}`, "1", { nx: true, ex: 90 });
  return res === "OK";
}

export async function releaseTurnLock(sessionId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`${TURN_LOCK_PREFIX}${sessionId}`);
}

// --- Abandoned-scan tracking (odo-abandoned.ts) ---
//
// Every session in the interview is kept in a sorted set scored by its last
// activity, so a sweep can find visitors who walked away without cancelling.
// A lead is passed on at most once per session (SET NX claim).

const ACTIVE_SET_KEY = "odo:active";
const LEAD_CLAIM_PREFIX = "odo:lead:";

export async function touchActiveSession(sessionId: string, active: boolean): Promise<void> {
  const redis = getRedis();
  if (active) await redis.zadd(ACTIVE_SET_KEY, { score: Date.now(), member: sessionId });
  else await redis.zrem(ACTIVE_SET_KEY, sessionId);
}

export async function listIdleSessions(idleSinceMs: number, limit = 20): Promise<string[]> {
  const redis = getRedis();
  return redis.zrange<string[]>(ACTIVE_SET_KEY, 0, idleSinceMs, { byScore: true, offset: 0, count: limit });
}

export async function claimLeadHandoff(sessionId: string): Promise<boolean> {
  const redis = getRedis();
  const ok = await redis.set(`${LEAD_CLAIM_PREFIX}${sessionId}`, Date.now(), { nx: true, ex: 7 * 24 * 60 * 60 });
  return ok === "OK";
}

/** Hidden admin passcode attempts per IP per day — a shared Redis ceiling so the passcode can't be brute-forced from the scan page's name box. Separate from the scan-start limit so guessing never eats a real visitor's quota. */
export async function checkAdminAuthAttempts(ip: string, limit: number): Promise<{ ok: boolean; count: number }> {
  const redis = getRedis();
  const key = `odo:adminauth:${torontoDateKey()}:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 24 * 60 * 60);
  return { ok: count <= limit, count };
}

// --- Live chat guards (Mohammad, 2026-10-05) ---------------------------------
// $5/day ceiling on the website chat's AI spend, a per-IP daily message cap,
// and a small per-day usage log (messages + tokens + cost) for the admin view.

export async function recordChatUsage(costUsd: number, usage: { input: number; output: number; cacheRead: number; cacheWrite: number }): Promise<void> {
  const redis = getRedis();
  const day = torontoDateKey();
  await redis.incrbyfloat(`chat:spend:${day}`, costUsd);
  await redis.expire(`chat:spend:${day}`, 40 * 24 * 60 * 60);
  const key = `chat:usage:${day}`;
  await redis.hincrby(key, "messages", 1);
  await redis.hincrby(key, "inputTokens", usage.input);
  await redis.hincrby(key, "outputTokens", usage.output);
  await redis.hincrby(key, "cacheReadTokens", usage.cacheRead);
  await redis.hincrby(key, "cacheWriteTokens", usage.cacheWrite);
  await redis.expire(key, 40 * 24 * 60 * 60);
}

export async function getChatSpend(): Promise<number> {
  const val = await getRedis().get<number | string>(`chat:spend:${torontoDateKey()}`);
  return val ? Number(val) : 0;
}

export async function getChatUsageDay(day: string): Promise<{ spendUsd: number; usage: Record<string, number> }> {
  const redis = getRedis();
  const spend = await redis.get<number | string>(`chat:spend:${day}`);
  const usage = (await redis.hgetall<Record<string, number | string>>(`chat:usage:${day}`)) ?? {};
  return { spendUsd: spend ? Number(spend) : 0, usage: Object.fromEntries(Object.entries(usage).map(([k, v]) => [k, Number(v)])) };
}

/** True only the first time on a given day — the "chat cap reached" email fires once per day. */
export async function claimChatCapAlert(): Promise<boolean> {
  const result = await getRedis().set(`chat:capalert:${torontoDateKey()}`, "1", { nx: true, ex: 2 * 24 * 60 * 60 });
  return result === "OK";
}

export async function checkChatIpDaily(ip: string, limit: number): Promise<{ ok: boolean; count: number }> {
  const redis = getRedis();
  const key = `chat:ipday:${torontoDateKey()}:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 24 * 60 * 60);
  return { ok: count <= limit, count };
}

/** Shared Upstash client for the chat-session store (chat-session.ts). */
export function chatRedis(): Redis {
  return getRedis();
}
