// QStash (Upstash) delayed callbacks for the chat's 15-minutes-of-silence close.
// Optional: with QSTASH_TOKEN unset the chat still works; transcripts then go
// out on the once-daily cron sweep instead. Signature check is done here with
// node:crypto (HS256 JWT in the Upstash-Signature header) — no extra package.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { CHAT_IDLE_MS } from "./chat-session";

export const SWEEP_PATH = "/api/chat-sweep";

/** Ask QStash to call /api/chat-sweep once, 15 minutes from now. Never throws. */
export async function scheduleChatSweep(origin: string, sessionId: string, version: number): Promise<boolean> {
  const token = process.env.QSTASH_TOKEN;
  if (!token) return false;
  try {
    // Newer Upstash accounts get a regional endpoint (shown as QSTASH_URL in the console); older ones use the default.
    const base = (process.env.QSTASH_URL || "https://qstash.upstash.io").replace(/\/+$/, "");
    const res = await fetch(`${base}/v2/publish/${origin}${SWEEP_PATH}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Upstash-Delay": `${Math.round(CHAT_IDLE_MS / 1000)}s` },
      body: JSON.stringify({ sessionId, version }),
    });
    return res.ok;
  } catch (err) {
    console.error("[chat-qstash] schedule failed:", err);
    return false;
  }
}

const b64url = (buf: Buffer) => buf.toString("base64url");

/** Verify an Upstash-Signature JWT for this raw body, against either signing key. */
export function verifyQstashSignature(signature: string | null, rawBody: string, keys: (string | undefined)[], nowSec = Math.floor(Date.now() / 1000)): boolean {
  if (!signature) return false;
  const parts = signature.split(".");
  if (parts.length !== 3) return false;
  const [h, p, sig] = parts;
  let claims: { iss?: string; sub?: string; exp?: number; nbf?: number; body?: string };
  try {
    claims = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
  } catch {
    return false;
  }
  if (claims.iss !== "Upstash") return false;
  if (typeof claims.exp !== "number" || nowSec > claims.exp) return false;
  if (typeof claims.nbf === "number" && nowSec < claims.nbf - 30) return false;
  try {
    if (!claims.sub || new URL(claims.sub).pathname !== SWEEP_PATH) return false;
  } catch {
    return false;
  }
  const bodyHash = b64url(createHash("sha256").update(rawBody).digest()).replace(/=+$/, "");
  if ((claims.body ?? "").replace(/=+$/, "") !== bodyHash) return false;
  const given = Buffer.from(sig, "base64url");
  return keys.filter((k): k is string => Boolean(k)).some((key) => {
    const expected = createHmac("sha256", key).update(`${h}.${p}`).digest();
    return expected.length === given.length && timingSafeEqual(expected, given);
  });
}
