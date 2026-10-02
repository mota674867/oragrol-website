// ORAGROL ODO — SSRF guard for outbound fetches to visitor-supplied URLs
//
// ADDED 2026-10-02 — CodeQL flagged two CRITICAL server-side request forgery
// findings: odo-gate.ts's checkWebsiteValidity() (fetches whatever domain a
// visitor types into the "website" field) and odo-evidence.ts's
// fetchOrDetermine() (ODO's shared page fetcher, reused across the whole
// research pipeline — including odo-crawl.ts following links discovered ON
// the scanned business's own site). All three fetch a visitor- or
// visitor's-website-controlled URL server-side with no check on WHERE it
// actually points.
//
// Why the existing DNS check (odo-gate.ts's dnsResolves) didn't catch this:
// it only confirms the domain resolves to *something*. Nothing stops a free
// domain's A record from pointing at 127.0.0.1, at 169.254.169.254 (the
// cloud-metadata address — the classic SSRF-to-stolen-credentials target),
// or at an internal address on Vercel's own network. Submit that domain as
// a "business website" and ODO's own server fetches it, server-side, same
// as it would any real business's homepage.
//
// Why fetch's own redirect:"follow" isn't enough either: it validates
// nothing about where a redirect actually leads. A domain can resolve to a
// perfectly public IP, pass a check done once up front, and then 302 the
// request somewhere internal. Every hop has to be re-validated, so this
// guard follows redirects itself instead of letting fetch do it blind.
//
// Fails CLOSED (blocks) on anything unresolvable or clearly private/
// reserved — consistent with the rest of odo-gate.ts's stated philosophy,
// but note the difference: a *real* business website essentially never
// resolves to a private address, so this should never wrongly catch a
// genuine visitor the way an overly strict content check might.

import { Resolver } from "node:dns/promises";
import { isIP } from "node:net";

export class SsrfBlockedError extends Error {}

const resolver = new Resolver({ timeout: 2000, tries: 1 });
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return true; // malformed — treat as unsafe
  const [a, b, c] = parts;
  if (a === 0) return true; // "this network"
  if (a === 10) return true; // RFC1918
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local — includes cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 0 && c === 0) return true; // IETF protocol assignments
  if (a === 192 && b === 0 && c === 2) return true; // TEST-NET-1
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a === 198 && b === 51 && c === 100) return true; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return true; // TEST-NET-3
  if (a >= 224) return true; // multicast (224-239) + reserved (240-255)
  return false;
}

function isPrivateOrReservedIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // loopback / unspecified
  if (/^fe[89ab]/.test(lower)) return true; // fe80::/10 link-local
  if (/^f[cd]/.test(lower)) return true; // fc00::/7 unique local
  if (lower.startsWith("::ffff:")) {
    // IPv4-mapped address — check the embedded v4 address, not the wrapper.
    const v4 = lower.split(":").pop()!;
    return isIP(v4) === 4 ? isPrivateOrReservedIPv4(v4) : true; // can't parse — treat as unsafe
  }
  return false; // best-effort: real business sites are essentially always IPv4
}

async function resolveAllIps(hostname: string): Promise<string[]> {
  if (isIP(hostname)) return [hostname]; // literal IP typed directly (e.g. "http://127.0.0.1")
  const ips: string[] = [];
  try { ips.push(...(await resolver.resolve4(hostname))); } catch { /* no A records / resolver error — fine if AAAA has some */ }
  try { ips.push(...(await resolver.resolve6(hostname))); } catch { /* no AAAA records / resolver error */ }
  return ips;
}

async function assertHostnameIsPublic(hostname: string): Promise<void> {
  const ips = await resolveAllIps(hostname);
  if (ips.length === 0) throw new SsrfBlockedError(`${hostname} did not resolve to any address`);
  for (const ip of ips) {
    const version = isIP(ip);
    if (version === 4 && isPrivateOrReservedIPv4(ip)) throw new SsrfBlockedError(`${hostname} resolves to a private/reserved address (${ip})`);
    if (version === 6 && isPrivateOrReservedIPv6(ip)) throw new SsrfBlockedError(`${hostname} resolves to a private/reserved address (${ip})`);
  }
}

/**
 * Drop-in replacement for `fetch()` when the URL (or its host) came from a
 * visitor — a submitted website, or a link discovered while crawling one.
 * Validates the resolved IP(s) of every hostname involved, including every
 * redirect hop, before making the request to it. Throws SsrfBlockedError
 * (never a generic fetch rejection) when a hop resolves to a private/
 * reserved address, so callers can keep treating it as "not determined"
 * the same way they already treat a timeout or a DNS failure — this is
 * meant to fail closed on the request, not crash the scan.
 */
export async function safeFetch(inputUrl: string, init: RequestInit = {}, maxRedirects = 5): Promise<Response> {
  let current = inputUrl;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const parsed = new URL(current);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new SsrfBlockedError(`Unsupported protocol: ${parsed.protocol}`);
    }
    await assertHostnameIsPublic(parsed.hostname);
    const res = await fetch(current, { ...init, redirect: "manual" });
    const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (location) {
      current = new URL(location, current).toString();
      continue;
    }
    return res;
  }
  throw new SsrfBlockedError("Too many redirects");
}
