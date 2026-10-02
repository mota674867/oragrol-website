// ORAGROL ODO — Evidence determination states
//
// WHY THIS EXISTS
// ODO's core rule is that it must refuse to invent conclusions. A boolean
// cannot express that rule: `spf: false` is indistinguishable from "we did
// not manage to check". The previous email-security fetcher returned
// `{ spf: false, dkim: false, dmarc: false }` whenever its API key was
// missing, which meant every single scan reported the prospect as having no
// email authentication at all — a fabricated security finding about the exact
// thing ORAGROL sells.
//
// Three states, never two:
//   observed       — we looked and the thing is there
//   absent         — we looked and it is genuinely not there (a real finding)
//   not_determined — we could not establish either way (NOT a finding)
//
// A `not_determined` result must never be scored as a gap, must never appear
// in the client report as a finding, and must be visible to the reviewer so
// coverage problems surface instead of hiding as bad news about the prospect.

import { safeFetch } from "./odo-ssrf-guard";

export type Determination<T> =
  | { state: "observed"; value: T; source: string; collectedAt: string }
  | { state: "absent"; source: string; collectedAt: string }
  | { state: "not_determined"; reason: string; source: string; collectedAt: string };

const now = () => new Date().toISOString();

export function observed<T>(value: T, source: string): Determination<T> {
  return { state: "observed", value, source, collectedAt: now() };
}

export function absent<T>(source: string): Determination<T> {
  return { state: "absent", source, collectedAt: now() };
}

export function notDetermined<T>(reason: string, source: string): Determination<T> {
  return { state: "not_determined", reason, source, collectedAt: now() };
}

/** True only when we positively established the thing is missing. */
export function isRealGap<T>(d: Determination<T>): boolean {
  return d.state === "absent";
}

/** Value if observed, otherwise null. Never conflate with `absent`. */
export function valueOf<T>(d: Determination<T>): T | null {
  return d.state === "observed" ? d.value : null;
}

/**
 * DNS error classification.
 *
 * ENODATA / ENOTFOUND are authoritative answers: the record genuinely is not
 * published. Everything else — timeouts, SERVFAIL, refused, network errors —
 * means the resolver did not give us an answer, which is not the same thing.
 */
const AUTHORITATIVE_ABSENCE = new Set(["ENODATA", "ENOTFOUND", "NXDOMAIN"]);

export function classifyDnsError(err: unknown): "absent" | "not_determined" {
  const code = (err as { code?: string })?.code;
  return code && AUTHORITATIVE_ABSENCE.has(code) ? "absent" : "not_determined";
}

/**
 * Run a DNS lookup with retries, returning a Determination rather than
 * throwing. Only the not_determined class is retried — an authoritative
 * "no such record" is already a final answer and retrying it wastes time.
 */
export async function resolveOrDetermine<T>(
  source: string,
  lookup: () => Promise<T>,
  opts: { retries?: number; baseDelayMs?: number } = {}
): Promise<Determination<T>> {
  const retries = opts.retries ?? 2;
  const baseDelay = opts.baseDelayMs ?? 120;
  let lastReason = "unknown";

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const value = await lookup();
      // An empty array from a DNS resolver is an answer with no records.
      if (Array.isArray(value) && value.length === 0) return absent<T>(source);
      return observed(value, source);
    } catch (err) {
      const kind = classifyDnsError(err);
      if (kind === "absent") return absent<T>(source);
      lastReason = (err as { code?: string })?.code ?? (err instanceof Error ? err.message : String(err));
      if (attempt < retries - 1) {
        // Jittered backoff — a burst of parallel lookups against one resolver
        // is exactly the condition that produced the false negatives.
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * baseDelay;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  return notDetermined<T>(lastReason, source);
}

/**
 * HTTP equivalent. A 403 from a WAF is "blocked", not "missing" — and
 * aggressive bot protection is itself a positive maturity signal worth
 * recording rather than discarding.
 */
export async function fetchOrDetermine(
  source: string,
  url: string,
  opts: { timeoutMs?: number; headers?: Record<string, string> } = {}
): Promise<Determination<{ status: number; body: string; headers: Headers }>> {
  try {
    // safeFetch (odo-ssrf-guard.ts) — CRITICAL SSRF fix 2026-10-02: `url`
    // here is built from a visitor-submitted business domain throughout
    // this codebase's research pipeline, so a plain fetch() would request
    // whatever that domain actually resolves to — including an internal or
    // cloud-metadata address — and would follow a malicious redirect there
    // too. A thrown SsrfBlockedError is caught below exactly like a
    // timeout or any other fetch failure: it becomes "not determined",
    // never a crash.
    const res = await safeFetch(url, {
      headers: { "User-Agent": "ORAGROL-ODO/1.0 (+https://orgro.ca)", ...opts.headers },
      signal: AbortSignal.timeout(opts.timeoutMs ?? 10000),
    });
    if (res.status === 404 || res.status === 410) return absent(source);
    if (res.status === 403 || res.status === 429) {
      return notDetermined(`blocked by origin (HTTP ${res.status})`, source);
    }
    if (!res.ok) return notDetermined(`HTTP ${res.status}`, source);
    return observed({ status: res.status, body: await res.text(), headers: res.headers }, source);
  } catch (err) {
    const reason = err instanceof Error ? err.name === "TimeoutError" ? "timeout" : err.message : String(err);
    return notDetermined(reason, source);
  }
}

/** Reviewer-facing coverage summary. Surfaces gaps in ODO, not in the prospect. */
export function coverageReport(
  checks: Record<string, Determination<unknown>>
): { observed: string[]; absent: string[]; notDetermined: Array<{ check: string; reason: string }> } {
  const out = { observed: [] as string[], absent: [] as string[], notDetermined: [] as Array<{ check: string; reason: string }> };
  for (const [name, d] of Object.entries(checks)) {
    if (d.state === "observed") out.observed.push(name);
    else if (d.state === "absent") out.absent.push(name);
    else out.notDetermined.push({ check: name, reason: d.reason });
  }
  return out;
}
