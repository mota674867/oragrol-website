// The website's server talking to OCS for the private forms. Browsers never call OCS: this runs on the server only.
// Every call is signed (HMAC-SHA256 over "<timestamp>.<body>", 5-minute window) with OCS_APPLY_SECRET, a key that opens
// nothing except this one door (see ocs/docs/APPLICATIONS_DOOR.md). Settings: OCS_APPLY_URL (OCS origin) and OCS_APPLY_SECRET (32+ characters).
import { createHmac, timingSafeEqual } from "node:crypto";

export interface OcsApplyConfig { readonly base: string; readonly secret: string }
export interface OcsReply { readonly status: number; readonly body: Record<string, unknown> | null }
export interface ClientMeta { readonly address: string | null; readonly agent: string | null }

export function ocsApplyConfig(env: Record<string, string | undefined> = process.env): OcsApplyConfig | null {
  const url = env.OCS_APPLY_URL;
  const secret = env.OCS_APPLY_SECRET;
  if (!url || !secret || secret.length < 32) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.hostname !== "localhost" && u.hostname !== "127.0.0.1") return null;
    if (u.username || u.password) return null;
    return { base: u.origin, secret };
  } catch { return null; }
}

export const sign = (secret: string, timestamp: string, raw: string): string =>
  "sha256=" + createHmac("sha256", secret).update(`${timestamp}.${raw}`, "utf8").digest("hex");

/** Posts one signed request. Returns null if OCS cannot be reached; the caller shows a plain "try again later". */
export async function ocsApply(path: "/v1/apply/open" | "/v1/apply/save" | "/v1/apply/submit", payload: object, config: OcsApplyConfig,
  fetchImpl: typeof fetch = fetch, nowSeconds: () => number = () => Math.floor(Date.now() / 1000)): Promise<OcsReply | null> {
  const raw = JSON.stringify(payload);
  const ts = String(nowSeconds());
  try {
    const response = await fetchImpl(`${config.base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-ocs-timestamp": ts, "x-ocs-signature": sign(config.secret, ts, raw) },
      body: raw,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    return { status: response.status, body: body && typeof body === "object" ? body : null };
  } catch { return null; }
}

/**
 * Proof of which form a link belongs to, so the browser cannot choose a lenient form for its own link.
 * The page (which asked OCS) hands the browser this token; save and submit must send it back unchanged.
 */
export const formToken = (secret: string, code: string, formId: string): string =>
  createHmac("sha256", secret).update(`form.${code}.${formId}`, "utf8").digest("base64url");
export function formTokenOk(secret: string, code: string, formId: string, token: unknown): boolean {
  if (typeof token !== "string") return false;
  const expected = Buffer.from(formToken(secret, code, formId));
  const given = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const LINK_CODE = /^[A-Za-z0-9_-]{43}$/;
