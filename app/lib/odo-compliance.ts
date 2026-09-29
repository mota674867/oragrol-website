// ORAGROL ODO — Compliance signals: accessibility, pre-consent trackers, JS-library CVEs
//
// Section 33, Area 7 (JS-library → known-vulnerability mapping) and Area 8
// ("Compliance ... strongest new commercial area"). All three ride on ONE
// Google PageSpeed Insights call ODO already has a key for — this just asks
// for one more Lighthouse category and reads more of the same JSON, rather
// than adding a new paid source.
//
// PROVENANCE CHECK (2026-09-29) — the master spec's assumption here needed
// verifying, the same way `@mdn/mdn-http-observatory` turned out not to be
// what it sounded like. Checked against developer.chrome.com/docs/lighthouse:
//   - Lighthouse's own "no-vulnerable-libraries" audit (which used to cross-
//     reference detected libraries against Snyk's DB for you) WAS REMOVED in
//     Lighthouse v10.0.0 (2023-02-09). PageSpeed does NOT hand back a
//     ready-made vulnerable-libraries verdict any more.
//   - The "js-libraries" diagnostic audit is still live and still lists each
//     detected front-end library with its version — that part of the master
//     spec holds up. ODO has to do the CVE cross-referencing itself now,
//     which is exactly what "feed js-libraries to retire.js" meant.
// So: this module fetches the same public vulnerability database the
// `retire` npm package itself downloads at scan time
// (RetireJS/retire.js's jsrepository.json on GitHub, MIT-style open data,
// no key) and matches it against PageSpeed's js-libraries output natively —
// same reasoning as odo-page.ts's header-hardening module: importing the
// `retire` CLI package would pull in a directory-walking, disk-caching tool
// built to scan a local checkout, not a "look up this name+version" library,
// for a serverless function that has neither a checkout nor a durable disk.
//
// EVIDENCE RULE: the one finding here that behaves like a security claim —
// "this site is running a JS library with a known CVE" — is wrapped in a
// Determination. A failed fetch of the vulnerability database must never
// read as "no vulnerable libraries found"; that is the exact class of bug
// fixed in odo-evidence.ts (Pending Item #20). Accessibility score and
// pre-consent-tracker detection are informational lists in the same spirit
// as odo-page.ts's SeoHealth — no vendor grade is claimed, just what was
// found.

import { type Determination, observed, notDetermined, fetchOrDetermine } from "./odo-evidence";

// ---------------------------------------------------------------------------
// Shared PageSpeed fetch (performance + accessibility categories)
// ---------------------------------------------------------------------------

type LighthouseAudit = {
  score?: number | null;
  title?: string;
  description?: string;
  details?: { items?: Array<Record<string, unknown>> };
};

export type PageSpeedRaw = {
  lighthouseResult?: {
    categories?: Record<string, { score?: number | null; auditRefs?: Array<{ id: string }> }>;
    audits?: Record<string, LighthouseAudit>;
  };
};

const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

/**
 * Requests both categories in one call — accessibility is NOT included by
 * default (PageSpeed only runs "performance" unless told otherwise), so the
 * plain performance-score fetch elsewhere in odo-research.ts happens to
 * already contain everything this module needs except the accessibility
 * category audits. Task: consolidate to one shared call rather than two
 * PageSpeed requests per scan (tracked separately — see odo-research.ts).
 */
export async function fetchPageSpeedCompliance(url: string): Promise<Determination<PageSpeedRaw>> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const params = new URLSearchParams({ url, strategy: "mobile" });
  params.append("category", "performance");
  params.append("category", "accessibility");
  if (apiKey) params.append("key", apiKey);

  const res = await fetchOrDetermine("pagespeed:compliance", `${PAGESPEED_ENDPOINT}?${params.toString()}`, {
    timeoutMs: 25000,
  });
  if (res.state !== "observed") return res as Determination<PageSpeedRaw>;
  try {
    return observed(JSON.parse(res.value.body) as PageSpeedRaw, "pagespeed:compliance");
  } catch {
    return notDetermined<PageSpeedRaw>("malformed PageSpeed response", "pagespeed:compliance");
  }
}

// ---------------------------------------------------------------------------
// Accessibility — full axe-core run via Lighthouse's accessibility category
//
// Legal hook: AODA requires WCAG 2.0 Level AA for Ontario private/non-profit
// organizations with 50+ employees (deadline was 2021-01-01) — squarely
// inside ODO's 20-500-employee ICP. ODO does not itself know the prospect's
// employee count reliably, so this reports the finding; whether the AODA
// threshold applies to a specific prospect is a judgment call for whoever
// reviews the scan, not something ODO asserts on its own.
// ---------------------------------------------------------------------------

export type AccessibilityFinding = {
  /** Lighthouse's accessibility category score, 0-100. This is Lighthouse's own axe-core-based score — not a claim of formal WCAG certification. */
  score: number | null;
  failingAudits: Array<{ id: string; title: string; description: string }>;
};

function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
}

export function analyzeAccessibility(raw: PageSpeedRaw): AccessibilityFinding | null {
  const category = raw.lighthouseResult?.categories?.accessibility;
  const audits = raw.lighthouseResult?.audits;
  if (!category || typeof category.score !== "number" || !audits) return null;

  // Only audits actually belonging to the accessibility category's own
  // auditRefs — several performance/diagnostic audits also use a 0/1 score,
  // and counting those here would misattribute them as accessibility issues.
  const accessibilityAuditIds = new Set((category.auditRefs ?? []).map((r) => r.id));
  const failingAudits: AccessibilityFinding["failingAudits"] = [];
  for (const id of accessibilityAuditIds) {
    const audit = audits[id];
    if (audit && audit.score === 0 && audit.title) {
      failingAudits.push({ id, title: audit.title, description: stripMarkdownLinks(audit.description ?? "") });
    }
  }

  return { score: Math.round(category.score * 100), failingAudits };
}

// ---------------------------------------------------------------------------
// Pre-consent trackers
//
// Legal hook: Quebec Law 25. Lighthouse loads the page exactly once, cold,
// with no interaction — so any known analytics/ad-pixel request captured in
// its network log is, by construction, one that fired before any consent
// banner could have been clicked. A cookie banner that loads GA4 or Meta
// Pixel before consent is a demonstrable violation, not an opinion — this
// only reports what fired, not a legal conclusion about the prospect.
// ---------------------------------------------------------------------------

export type PreConsentTracker = { host: string; label: string };

export type PreConsentTrackers = {
  trackers: PreConsentTracker[];
  /**
   * Best-effort HTML pattern match for a known consent-management platform.
   * Not authoritative — a custom-built banner won't match, and this must
   * never be read as "no CMP" just because none of these strings appeared.
   */
  cmpDetected: string | null;
};

const TRACKER_HOST_PATTERNS: Array<[RegExp, string]> = [
  [/(^|\.)google-analytics\.com$/i, "Google Analytics (Universal Analytics)"],
  [/(^|\.)analytics\.google\.com$/i, "Google Analytics 4"],
  [/(^|\.)googletagmanager\.com$/i, "Google Tag Manager"],
  [/(^|\.)connect\.facebook\.net$/i, "Meta Pixel"],
  [/(^|\.)facebook\.com$/i, "Meta (Facebook) tracking pixel"],
  [/(^|\.)analytics\.tiktok\.com$/i, "TikTok Pixel"],
  [/(^|\.)snap\.licdn\.com$/i, "LinkedIn Insight Tag"],
  [/(^|\.)px\.ads\.linkedin\.com$/i, "LinkedIn Ads Pixel"],
  [/(^|\.)static\.hotjar\.com$/i, "Hotjar"],
  [/(^|\.)script\.hotjar\.com$/i, "Hotjar"],
  [/(^|\.)clarity\.ms$/i, "Microsoft Clarity"],
  [/(^|\.)ct\.pinterest\.com$/i, "Pinterest Tag"],
  [/(^|\.)sc-static\.net$/i, "Snapchat Pixel"],
  [/(^|\.)bat\.bing\.com$/i, "Microsoft (Bing) Ads UET"],
];

const CMP_PATTERNS: Array<[RegExp, string]> = [
  [/cookiebot/i, "Cookiebot"],
  [/cookieyes/i, "CookieYes"],
  [/onetrust/i, "OneTrust"],
  [/usercentrics/i, "Usercentrics"],
  [/termly/i, "Termly"],
  [/iubenda/i, "iubenda"],
  [/cookie-?consent/i, "Generic cookie-consent script"],
];

export function analyzePreConsentTrackers(raw: PageSpeedRaw, html: string | null): PreConsentTrackers | null {
  const items = raw.lighthouseResult?.audits?.["network-requests"]?.details?.items;
  if (!Array.isArray(items)) return null;

  const hosts = new Set<string>();
  for (const item of items) {
    const url = item.url;
    if (typeof url !== "string") continue;
    try {
      hosts.add(new URL(url).hostname);
    } catch {
      /* skip malformed URL */
    }
  }

  const trackers: PreConsentTracker[] = [];
  for (const host of hosts) {
    const match = TRACKER_HOST_PATTERNS.find(([re]) => re.test(host));
    if (match) trackers.push({ host, label: match[1] });
  }

  const cmpMatch = html ? CMP_PATTERNS.find(([re]) => re.test(html)) : null;

  return { trackers, cmpDetected: cmpMatch?.[1] ?? null };
}

// ---------------------------------------------------------------------------
// JS library → known vulnerability mapping (retire.js public database)
// ---------------------------------------------------------------------------

export type VulnerableLibrary = {
  name: string;
  version: string;
  severity: string;
  cve: string[];
  summary: string | null;
  info: string[];
};

export type JsLibraryScan = {
  detected: Array<{ name: string; version: string | null }>;
  vulnerable: VulnerableLibrary[];
};

const RETIRE_JS_REPO_URL = "https://raw.githubusercontent.com/RetireJS/retire.js/master/repository/jsrepository.json";

type RetireVuln = {
  below: string;
  atOrAbove?: string;
  excludes?: string[];
  severity: string;
  identifiers?: { CVE?: string[]; summary?: string };
  info?: string[];
};
type RetireEntry = { bowername?: string[]; npmname?: string; vulnerabilities: RetireVuln[] };
export type RetireRepo = Record<string, RetireEntry>;

export async function fetchRetireRepo(): Promise<Determination<RetireRepo>> {
  const res = await fetchOrDetermine("retire:repo", RETIRE_JS_REPO_URL, { timeoutMs: 10000 });
  if (res.state !== "observed") return res as Determination<RetireRepo>;
  try {
    return observed(JSON.parse(res.value.body) as RetireRepo, "retire:repo");
  } catch {
    return notDetermined<RetireRepo>("malformed retire.js repository JSON", "retire:repo");
  }
}

/** Numeric, dot/dash-segment version comparison. Good enough for the x.y.z strings these libraries publish; not a full semver/pre-release parser. */
function compareVersions(a: string, b: string): number {
  const pa = a.split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  const pb = b.split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function isVulnerable(version: string, vuln: RetireVuln): boolean {
  if (compareVersions(version, vuln.below) >= 0) return false;
  if (vuln.atOrAbove && compareVersions(version, vuln.atOrAbove) < 0) return false;
  if (vuln.excludes?.includes(version)) return false;
  return true;
}

function normalizeLibName(name: string): string {
  return name.toLowerCase().replace(/\.js$/, "").replace(/[^a-z0-9]/g, "");
}

export function scanJsLibraries(raw: PageSpeedRaw, repo: RetireRepo): JsLibraryScan {
  const items = raw.lighthouseResult?.audits?.["js-libraries"]?.details?.items ?? [];

  const aliasToKey = new Map<string, string>();
  for (const [key, entry] of Object.entries(repo)) {
    aliasToKey.set(normalizeLibName(key), key);
    for (const bn of entry.bowername ?? []) aliasToKey.set(normalizeLibName(bn), key);
    if (entry.npmname) aliasToKey.set(normalizeLibName(entry.npmname), key);
  }

  const detected: JsLibraryScan["detected"] = [];
  const vulnerable: VulnerableLibrary[] = [];

  for (const item of items) {
    const name = typeof item.name === "string" ? item.name : null;
    const version = typeof item.version === "string" ? item.version : null;
    const npm = typeof item.npm === "string" ? item.npm : null;
    if (!name) continue;
    detected.push({ name, version });
    if (!version) continue;

    const key = (npm && aliasToKey.get(normalizeLibName(npm))) || aliasToKey.get(normalizeLibName(name));
    if (!key) continue; // not in the retire.js database under any alias we know — not a claim it's safe, just unmatched

    for (const vuln of repo[key].vulnerabilities) {
      if (isVulnerable(version, vuln)) {
        vulnerable.push({
          name,
          version,
          severity: vuln.severity,
          cve: vuln.identifiers?.CVE ?? [],
          summary: vuln.identifiers?.summary ?? null,
          info: vuln.info ?? [],
        });
      }
    }
  }

  return { detected, vulnerable };
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export type ComplianceResearch = {
  accessibility: AccessibilityFinding | null;
  preConsentTrackers: PreConsentTrackers | null;
  /**
   * Determination, unlike the two above: "no vulnerable libraries" is a
   * security claim about the prospect, so a failed fetch of either the
   * PageSpeed data or the retire.js database must read as not_determined,
   * never as a clean bill of health.
   */
  jsLibraries: Determination<JsLibraryScan>;
};

/**
 * Pure — takes already-fetched PageSpeed/retire.js results and derives the
 * three findings. Split out from runComplianceResearch so odo-research.ts
 * can share ONE PageSpeed call (it also needs the performance score) instead
 * of this module making its own second, redundant PageSpeed request.
 */
export function deriveCompliance(
  pageSpeedRaw: Determination<PageSpeedRaw>,
  retireRepo: Determination<RetireRepo>,
  html: string | null
): ComplianceResearch {
  if (pageSpeedRaw.state !== "observed") {
    return { accessibility: null, preConsentTrackers: null, jsLibraries: pageSpeedRaw as Determination<JsLibraryScan> };
  }

  const accessibility = analyzeAccessibility(pageSpeedRaw.value);
  const preConsentTrackers = analyzePreConsentTrackers(pageSpeedRaw.value, html);
  const jsLibraries: Determination<JsLibraryScan> =
    retireRepo.state === "observed"
      ? observed(scanJsLibraries(pageSpeedRaw.value, retireRepo.value), "compliance:js-libraries")
      : (retireRepo as Determination<JsLibraryScan>);

  return { accessibility, preConsentTrackers, jsLibraries };
}

/** Standalone convenience wrapper — fetches both sources itself. Prefer `deriveCompliance` when the caller already has a PageSpeed result to share (see odo-research.ts). */
export async function runComplianceResearch(finalUrl: string, html: string | null): Promise<ComplianceResearch> {
  const [pageSpeedRaw, retireRepo] = await Promise.all([fetchPageSpeedCompliance(finalUrl), fetchRetireRepo()]);
  return deriveCompliance(pageSpeedRaw, retireRepo, html);
}
