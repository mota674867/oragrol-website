// Shared (Upstash Redis) rate limiter for public API routes, so one limit holds across every serverless instance.
// Same Redis instance and env vars as the chat and ODO limits (REDIS_KV_REST_API_URL / REDIS_KV_REST_API_TOKEN).
//
// Fixed window: the first hit starts the window, later hits count up until it expires. The counter and its expiry are set
// in one atomic MULTI, so a crash can never leave a key that never expires (PEXPIRE NX only sets the expiry once).
// Keys are hashed before they reach Redis, so emails used as keys are never stored in plain text.
//
// Fails over to the per-instance in-memory limiter (rate-limit.ts) if Redis is unset, slow or erroring, so a Redis
// outage (see D-088) never takes a public form down and never leaves it unlimited either.
import { createHash } from "crypto";
import { chatRedis } from "./odo-redis";
import { rateLimit } from "./rate-limit";

export type SharedLimitResult = { ok: boolean; remaining: number; resetAt: number };

const REDIS_TIMEOUT_MS = 1500;

export async function rateLimitShared(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<SharedLimitResult> {
  try {
    const redis = chatRedis();
    const redisKey = `rl:${createHash("sha256").update(key).digest("hex").slice(0, 32)}`;
    const run = redis.multi().incr(redisKey).pexpire(redisKey, opts.windowMs, "NX").pttl(redisKey).exec<[number, number, number]>();
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("redis timeout")), REDIS_TIMEOUT_MS));
    const [count, , ttl] = await Promise.race([run, timeout]);
    const resetAt = Date.now() + (ttl > 0 ? ttl : opts.windowMs);
    return { ok: count <= opts.limit, remaining: Math.max(0, opts.limit - count), resetAt };
  } catch (err) {
    console.warn("[rate-limit-shared] Redis unavailable, using the per-instance limiter:", err instanceof Error ? err.message : err);
    return rateLimit(key, opts);
  }
}
