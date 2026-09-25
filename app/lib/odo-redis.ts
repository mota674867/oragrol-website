// ORAGROL ODO — Redis store
// Handles rate limiting (7-day email, 30-day URL) and session state.
// Uses the same Upstash Redis instance as scope-store and cyber-health.
// Env vars: REDIS_KV_REST_API_URL / REDIS_KV_REST_API_TOKEN

import { Redis } from "@upstash/redis";
import { createHash, randomUUID } from "crypto";

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
  email: string,
  website: string | null
): Promise<CooldownCheckResult> {
  const redis = getRedis();
  const emailHash = hashEmail(email);

  // Check email cooldown
  const emailKey = `${EMAIL_COOLDOWN_PREFIX}${emailHash}`;
  const emailRecord = await redis.get<{ completedAt: number }>(emailKey);
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

export async function clearCooldowns(email: string, website: string | null, authorizedBy: string, reason: string): Promise<void> {
  const redis = getRedis();
  const emailHash = hashEmail(email);
  await redis.del(`${EMAIL_COOLDOWN_PREFIX}${emailHash}`);
  if (website) {
    const domainHash = hashDomain(website);
    await redis.del(`${DOMAIN_COOLDOWN_PREFIX}${domainHash}`);
  }
  // Log the reset for ZM77 audit trail
  const auditKey = `odo:reset:audit:${Date.now()}`;
  await redis.set(auditKey, { email, website, authorizedBy, reason, resetAt: Date.now() }, { ex: 365 * 24 * 60 * 60 });
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
