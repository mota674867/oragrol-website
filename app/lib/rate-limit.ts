// In-memory, per-instance sliding-window rate limiter for API routes.
//
// This is a real first line of defense, not a complete one: on Vercel's
// serverless/edge runtime this Map is per-instance, not shared across
// concurrent lambdas — a distributed attacker can get more than the
// stated limit by hitting different instances. For real launch-day
// protection against a determined attacker, put this behind Vercel's
// own Firewall/rate-limiting (Pro plan) or a shared store such as
// Upstash Redis (`@upstash/ratelimit`) — both need an account/env vars
// only the account owner can set up, so this in-process limiter is the
// stopgap until that's wired in.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Prevents unbounded memory growth if this instance stays warm a long
// time under sustained traffic from many distinct IPs.
const MAX_TRACKED_KEYS = 5000;

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      // Drop the oldest-looking entry rather than let the map grow forever.
      const firstKey = buckets.keys().next().value;
      if (firstKey) buckets.delete(firstKey);
    }
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

// Best-effort client identifier from standard proxy headers (Vercel sets
// x-forwarded-for). Never trust this for anything beyond rate limiting.
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
