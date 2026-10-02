// ORAGROL ODO — Entry gate
//
// ADDED 2026-10-01 — Mohammad, approving the ODO brain rebuild: "need only
// real visitor use it, not a person for fun." At ~$2/scan (odo-spend.ts),
// every check in this file runs BEFORE any paid AI call, in /api/odo/scan/
// start, so a bot or prankster is rejected for close to $0, not after
// burning real research + question + analysis spend.
//
// Layers, in the order Mohammad approved:
//   1. Cloudflare Turnstile captcha (proves a human submitted the form)
//   2. Website must be real and reachable, not parked/for-sale/empty
//   3. Domain must not have been registered within the last 48h (a same-
//      day throwaway domain is a strong bot/prank signal; a genuine
//      business essentially never scans the literal day it registers)
//   4. A cheap AI read of the homepage confirms it looks like an actual
//      operating business, not a placeholder page
//   5. Disposable/temp-mail addresses are blocked outright
//   6. Email domain must match the website's domain, OR be a well-known
//      free provider (Gmail etc.) — a mismatched custom domain (neither
//      the visitor's own business nor a known free provider) is rejected
//
// NOTE on scope (told to Mohammad): a 6-digit-code verification step for
// free-email visitors (Gmail/Yahoo/etc.) is the one piece of the approved
// design NOT built in this pass — it needs a new frontend step, and
// odo-scan.tsx has already had two real race-condition bugs this
// engagement, so it's safer as its own small, carefully tested follow-up
// than rushed into this change. Free-email visitors currently pass this
// layer unverified, same as before this gate existed — every OTHER layer
// here (captcha, URL/domain checks, AI business check, per-IP + per-scan +
// daily spend caps) still applies to them in full.
//
// Every check here fails CLOSED (rejects) on a clear negative signal, but
// fails OPEN (allows the scan to proceed) when a check itself can't run —
// a DNS hiccup, a timed-out fetch, Anthropic being down — because the goal
// is to stop bots and pranksters, not to add a new way for a real visitor
// to be wrongly blocked by an unrelated outage. The spend caps are the
// backstop if a bad actor ever does get through.

import { Resolver } from "node:dns/promises";
import Anthropic from "@anthropic-ai/sdk";
import disposableDomains from "disposable-email-domains/index.json";
import { normalizeDomain } from "./odo-dns";
import { safeFetch } from "./odo-ssrf-guard";

// --- 1. Turnstile captcha ---

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Not configured — fail open so a missing env var in a preview/staging
    // deploy never silently blocks every scan; production must set this.
    console.error("[ODO Gate] TURNSTILE_SECRET_KEY not configured — captcha check skipped.");
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[ODO Gate] Turnstile verification request failed — failing open:", err);
    return true;
  }
}

// --- 2 & 3. Website reality + domain-age check ---

export type WebsiteCheckResult =
  | { valid: true; finalUrl: string; domainAgeDays: number | null; bodyText: string }
  | { valid: false; reason: string };

const PARKED_PAGE_SIGNATURES = [
  /domain (is|may be) (for sale|parked)/i,
  /buy this domain/i,
  /this domain (is )?for sale/i,
  /godaddy\.com\/domainfind/i,
  /sedo\.com/i,
  /hugedomains\.com/i,
  /future home of something (quite )?cool/i,
  /this (web)?site can.?t be reached/i,
  /is this your domain\?/i,
  /domain parking/i,
];

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function dnsResolves(domain: string): Promise<boolean> {
  const r = new Resolver({ timeout: 2000, tries: 1 });
  r.setServers(["1.1.1.1", "8.8.8.8"]);
  try {
    await r.resolve4(domain);
    return true;
  } catch {
    try {
      await r.resolve6(domain);
      return true;
    } catch {
      return false;
    }
  }
}

/** RDAP (rdap.org) — free, keyless domain-registration lookup. Best-effort: an unsupported TLD or a slow registry returns null (not a block), never a false reject. */
async function lookupDomainAgeDays(domain: string): Promise<number | null> {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "application/rdap+json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { events?: Array<{ eventAction: string; eventDate: string }> };
    const reg = data.events?.find((e) => e.eventAction === "registration");
    if (!reg?.eventDate) return null;
    const registeredAt = new Date(reg.eventDate).getTime();
    if (Number.isNaN(registeredAt)) return null;
    return Math.floor((Date.now() - registeredAt) / (24 * 60 * 60 * 1000));
  } catch {
    return null; // RDAP down, unsupported registry, timeout — not determined, never a block
  }
}

/** Minimum domain age to be allowed to scan. Below this, the domain was registered essentially today/yesterday — see file header. Adjust here if real visitors ever get wrongly caught. */
const MIN_DOMAIN_AGE_DAYS = 2;

export async function checkWebsiteValidity(rawWebsite: string): Promise<WebsiteCheckResult> {
  const domain = normalizeDomain(rawWebsite);
  if (!domain || !domain.includes(".")) {
    return { valid: false, reason: "That doesn't look like a valid website address." };
  }

  const resolves = await dnsResolves(domain);
  if (!resolves) {
    return { valid: false, reason: "We couldn't find that website — please double-check the address." };
  }

  let finalUrl = "";
  let html = "";
  let fetchOk = false;
  for (const candidate of [`https://${domain}`, `https://www.${domain}`]) {
    try {
      // safeFetch (odo-ssrf-guard.ts) — CRITICAL SSRF fix 2026-10-02: a
      // plain fetch() here would happily request whatever IP this
      // visitor-typed domain resolves to, including an internal/metadata
      // address, and would follow a redirect to one too. A
      // SsrfBlockedError falls into the same catch as any other
      // unreachable-site failure below — deliberately indistinguishable
      // to the visitor from "that site doesn't work right now".
      const res = await safeFetch(candidate, {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; OragrolODO/1.0; +https://orgro.ca)" },
      });
      if (res.ok) {
        finalUrl = res.url;
        html = await res.text();
        fetchOk = true;
        break;
      }
    } catch {
      // try next candidate (covers SsrfBlockedError, timeout, DNS failure, etc.)
    }
  }
  if (!fetchOk) {
    return { valid: false, reason: "That website isn't reachable right now — please double-check the address." };
  }

  const bodyText = stripHtml(html);
  if (bodyText.length < 80) {
    return { valid: false, reason: "That website doesn't appear to have any content yet." };
  }
  if (PARKED_PAGE_SIGNATURES.some((re) => re.test(html))) {
    return { valid: false, reason: "That domain appears to be parked or not yet an active business site." };
  }

  const domainAgeDays = await lookupDomainAgeDays(domain);
  if (domainAgeDays !== null && domainAgeDays < MIN_DOMAIN_AGE_DAYS) {
    return { valid: false, reason: "That domain was registered too recently for us to scan yet — please contact us directly at info@orgro.ca." };
  }

  return { valid: true, finalUrl, domainAgeDays, bodyText };
}

// --- 4. Cheap AI "is this a real operating business" check ---

const GATE_MODEL = "claude-haiku-4-5-20251001";

export type BusinessCheckResult = { looksReal: boolean; reason: string } | null; // null = inconclusive (AI unavailable/erroring) — caller treats as pass

export async function checkIsRealBusiness(bodyText: string, companyName: string): Promise<BusinessCheckResult> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create(
      {
        model: GATE_MODEL,
        max_tokens: 150,
        system:
          "You are a quick fraud/spam filter for a B2B lead form. Given a claimed company name and the visible text of its homepage, decide if this looks like a real, currently operating business (any size, any industry — a one-person shop is fine). Answer ONLY with compact JSON: {\"looksReal\": true|false, \"reason\": \"<one short sentence>\"}. Say false only for: placeholder/template text never replaced, a page unrelated to the claimed company, a page offering something illegal, or content suggesting this is a test/joke submission. When genuinely unsure, say true — this is a light filter, not a verdict.",
        messages: [
          { role: "user", content: `Claimed company name: ${companyName}\n\nHomepage text (truncated):\n${bodyText.slice(0, 3000)}` },
        ],
      },
      { timeout: 10000 }
    );
    const text = msg.content.find((b) => b.type === "text")?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as { looksReal?: boolean; reason?: string };
    if (typeof parsed.looksReal !== "boolean") return null;
    return { looksReal: parsed.looksReal, reason: parsed.reason || "" };
  } catch (err) {
    console.error("[ODO Gate] Real-business AI check failed — failing open:", err);
    return null;
  }
}

// --- 5. Disposable email block ---

const DISPOSABLE_DOMAIN_SET = new Set((disposableDomains as string[]).map((d) => d.toLowerCase()));

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  return DISPOSABLE_DOMAIN_SET.has(domain);
}

// --- 6. Email domain must match website, or be a known free provider ---

export const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.ca", "outlook.com", "hotmail.com",
  "hotmail.ca", "live.com", "msn.com", "icloud.com", "me.com", "aol.com", "protonmail.com",
  "proton.me", "mail.com",
]);

export function emailDomainMatchesWebsite(email: string, website: string): boolean {
  const emailDomain = email.split("@")[1]?.toLowerCase().trim();
  if (!emailDomain) return false;
  const siteDomain = normalizeDomain(website);
  if (!siteDomain) return false;
  // Match the registrable domain loosely (exact match or either is a
  // subdomain of the other) — covers mail.company.com vs company.com.
  return emailDomain === siteDomain || emailDomain.endsWith(`.${siteDomain}`) || siteDomain.endsWith(`.${emailDomain}`);
}

export function isFreeEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return !!domain && FREE_EMAIL_DOMAINS.has(domain);
}
