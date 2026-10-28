// Server-side human check (Cloudflare Turnstile) for public forms: contact, newsletter, Cyber Health, My Scope, chat, careers.
// Enforced only once TURNSTILE_SECRET_KEY is set. Until then the forms keep working and a warning is logged, so a deploy
// before the keys exist does not break sign-up. Once set, a missing or failed token is refused (fail closed).
import { getClientIp } from "./rate-limit";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function humanCheckEnforced(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function passesHumanCheck(request: Request, token: unknown): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[human-check] TURNSTILE_SECRET_KEY not set: form accepted without a bot check.");
    return true;
  }
  if (typeof token !== "string" || token.length < 10 || token.length > 2048) return false;
  const ip = getClientIp(request);
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip !== "unknown") form.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const HUMAN_CHECK_REFUSAL = "Please complete the security check and try again.";
