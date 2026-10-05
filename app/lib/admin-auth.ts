/**
 * One shared gate for the private admin endpoints (cost, cooldown reset, chat-usage, outbound tool, HubSpot bootstrap).
 *
 * Before: each route compared `?key=` with a plain `!==` and had no limit on wrong guesses.
 * Now:    constant-time comparison + a shared Redis ceiling on WRONG guesses per IP per day.
 *
 * The owner's workflow does not change: the key is still accepted as `?key=` (or the `x-admin-key` header).
 * Wrong guesses are counted; a correct key never touches the counter. Redis problems fail open for the owner
 * (a monitoring hiccup must never lock you out of your own admin pages) but never let a wrong key through.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { getClientIp } from "./rate-limit";
import { chatRedis } from "./odo-redis";

export const ADMIN_WRONG_GUESSES_PER_DAY = 20;

/** Constant-time string comparison (hashes first, so length differences don't leak either). */
export function sameSecret(a: string, b: string): boolean {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

const day = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

/** True only when the request carries the right key (query `key` or header `x-admin-key`) for the given env var. */
export async function adminKeyOk(req: Request, envName: "ODO_ADMIN_KEY" | "ADMIN_ACTION_SECRET", queryParam = "key"): Promise<boolean> {
  const secret = process.env[envName];
  if (!secret) return false; // fails closed when the secret is not configured
  const provided = new URL(req.url).searchParams.get(queryParam) ?? req.headers.get("x-admin-key") ?? "";
  const key = `odo:adminwrong:${day()}:${getClientIp(req)}`;

  // Already locked out for today? Even the right key waits until tomorrow (the owner will not hit 20 wrong guesses).
  try {
    const n = Number((await chatRedis().get<number>(key)) ?? 0) || 0;
    if (n >= ADMIN_WRONG_GUESSES_PER_DAY) return false;
  } catch {
    /* Redis unavailable: fall through to the plain comparison */
  }

  if (provided && sameSecret(provided, secret)) return true;

  try {
    const r = chatRedis();
    const n = await r.incr(key);
    if (n === 1) await r.expire(key, 24 * 60 * 60);
  } catch {
    /* ignore */
  }
  return false;
}
