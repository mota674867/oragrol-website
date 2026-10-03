// ORAGROL ODO — Live checks during the interview (Master Reference §37.3)
//
// "Research continues during the interview": when a visitor says something
// public evidence can confirm or contradict — "we just set up email
// protection", "we're on Microsoft 365", "we use Jane App" — ODO checks it
// right there instead of taking the claim on faith, and the visitor sees
// what it's doing ("ODO is checking your email security records…").
//
// PASSIVE ONLY, by design and by code:
//   - DNS lookups and public web pages — exactly what any mail server or
//     browser sees. Nothing is scanned, probed or logged into.
//   - Domain checks are limited to the visitor's own domain (and its
//     subdomains) or a domain the visitor literally typed in this
//     conversation. ODO cannot be steered into researching a third party.
//   - Page reads are limited to the visitor's own site, through the same
//     SSRF-guarded fetch every other ODO request uses (odo-ssrf-guard.ts).
//   - Web search never receives the visitor's personal data — the playbook
//     restricts it to tools, vendors and products they named.
// Every check fails soft: an error is returned to the model as "could not
// be determined", never thrown, and is never treated as a finding.

import type Anthropic from "@anthropic-ai/sdk";
import { checkSpf, checkDmarc, checkDkim, checkMailPlatform, checkMicrosoft365, normalizeDomain } from "./odo-dns";
import { fetchOrDetermine } from "./odo-evidence";
import { htmlToText } from "./odo-crawl";

export type LiveCheckContext = {
  /** The visitor's own website, as submitted. */
  website: string | null;
  /** Everything the visitor has typed so far — the only other domains ODO may check. */
  visitorText: string;
};

export const LIVE_CHECK_TOOLS: Anthropic.Tool[] = [
  {
    name: "check_email_security",
    description:
      "Fresh public DNS check of a domain's email anti-spoofing records (SPF, DKIM, DMARC). Use when the visitor says something about their email protection that the research doesn't already settle, or says they changed it recently. Domain must be the visitor's own, or one they typed in this conversation.",
    input_schema: { type: "object", properties: { domain: { type: "string", description: "e.g. example.com — omit to use the visitor's own domain" } } },
  },
  {
    name: "check_mail_platform",
    description:
      "Public check of who hosts a domain's email (Microsoft 365, Google Workspace, other) and whether a security gateway sits in front of it. Use when the visitor names their email/office platform and research doesn't already confirm it.",
    input_schema: { type: "object", properties: { domain: { type: "string", description: "omit to use the visitor's own domain" } } },
  },
  {
    name: "read_own_site_page",
    description:
      "Read the text of one page on the visitor's OWN website (e.g. their privacy policy or a booking page they mention). Only URLs on their own domain are allowed.",
    input_schema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
  },
  {
    name: "web_search",
    description:
      "Search the public web for facts about a tool, vendor or product the visitor named (e.g. 'Jane App data security', 'QuickBooks Online MFA'). Never include the visitor's name, email, company name or any personal data in the query.",
    input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
];

const ACTIVITY: Record<string, string> = {
  check_email_security: "ODO is checking your email security records…",
  check_mail_platform: "ODO is checking which email platform you're on…",
  read_own_site_page: "ODO is reading a page on your website…",
  web_search: "ODO is looking that up…",
};

export function activityFor(toolName: string): string {
  return ACTIVITY[toolName] ?? "ODO is checking something…";
}

const DOMAIN_RE = /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24})\b/gi;

/** The visitor's own domain or a subdomain of it, or a domain they typed — nothing else. */
function allowedDomain(requested: string | undefined, ctx: LiveCheckContext): string | null {
  const own = ctx.website ? normalizeDomain(ctx.website) : "";
  const d = normalizeDomain(requested || own || "");
  if (!d || !d.includes(".") || d.length > 253) return null;
  if (own && (d === own || d.endsWith(`.${own}`))) return d;
  const typed = new Set((ctx.visitorText.match(DOMAIN_RE) ?? []).map((x) => normalizeDomain(x)));
  return typed.has(d) ? d : null;
}

function fmt<T>(d: { state: string; value?: T; reason?: string }, describe: (v: T) => string): string {
  if (d.state === "observed" && d.value !== undefined) return describe(d.value);
  if (d.state === "absent") return "NOT PUBLISHED (looked, and it is genuinely absent)";
  return `could not be determined (${d.reason ?? "lookup failed"}) — not a finding`;
}

async function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);
}

async function run(name: string, input: Record<string, unknown>, ctx: LiveCheckContext): Promise<string> {
  if (name === "check_email_security") {
    const domain = allowedDomain(typeof input.domain === "string" ? input.domain : undefined, ctx);
    if (!domain) return "Refused: that domain is not the visitor's own and was not mentioned by the visitor.";
    const [spf, dkim, dmarc] = await Promise.all([checkSpf(domain), checkDkim(domain), checkDmarc(domain)]);
    return [
      `Live DNS check of ${domain} (${new Date().toISOString()}):`,
      `SPF: ${fmt(spf, (v) => `published, ends ${v.qualifier ?? "with no all-mechanism"}${v.exceedsLookupLimit ? ", over the 10-lookup limit (broken)" : ""}`)}`,
      `DKIM: ${fmt(dkim, (v) => (v.selectorsFound.length ? `found for ${v.selectorsFound.map((s) => s.platform).join(", ")}` : "no common selectors found"))}`,
      `DMARC: ${fmt(dmarc, (v) => `published, policy p=${v.policy}${v.isMonitorOnly ? " (monitor only — enforces nothing)" : ""}`)}`,
    ].join("\n");
  }
  if (name === "check_mail_platform") {
    const domain = allowedDomain(typeof input.domain === "string" ? input.domain : undefined, ctx);
    if (!domain) return "Refused: that domain is not the visitor's own and was not mentioned by the visitor.";
    const [platform, m365] = await Promise.all([checkMailPlatform(domain), checkMicrosoft365(domain)]);
    return [
      `Live mail-platform check of ${domain}:`,
      `Mail routing: ${fmt(platform, (v) => `provider ${v.provider ?? "unknown"}${v.gateway ? `, behind a ${v.gateway} security gateway` : ""}`)}`,
      `Microsoft 365: ${fmt(m365, (v) => (v.isMicrosoft365 ? `yes${v.exchangeOnline ? ", Exchange Online" : ""}${v.deviceRegistration ? ", device registration enabled" : ""}` : "no Microsoft 365 tenant found"))}`,
    ].join("\n");
  }
  if (name === "read_own_site_page") {
    const raw = typeof input.url === "string" ? input.url.trim() : "";
    let url: URL;
    try { url = new URL(raw.startsWith("http") ? raw : `https://${raw}`); } catch { return "Refused: not a valid URL."; }
    if (url.protocol !== "https:" && url.protocol !== "http:") return "Refused: only web pages can be read.";
    if (!allowedDomain(url.hostname, { ...ctx, visitorText: "" })) return "Refused: only pages on the visitor's own website can be read.";
    const page = await fetchOrDetermine("live:page", url.toString(), { timeoutMs: 10000 });
    if (page.state !== "observed") return page.state === "absent" ? "That page does not exist (404)." : `Could not read the page (${page.reason}).`;
    return `Text of ${url.toString()}:\n${htmlToText(page.value.body).slice(0, 4000)}`;
  }
  if (name === "web_search") {
    const query = typeof input.query === "string" ? input.query.trim().slice(0, 200) : "";
    if (!query) return "Refused: empty query.";
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return "Web search is not available right now.";
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, query, search_depth: "basic", max_results: 3 }),
        signal: AbortSignal.timeout(15000),
      });
      const data = (await res.json()) as { results?: Array<{ title: string; url: string; content: string }> };
      const results = data.results ?? [];
      if (!results.length) return "No results found.";
      return results.map((r, i) => `${i + 1}. ${r.title} (${r.url})\n${(r.content || "").slice(0, 600)}`).join("\n\n");
    } catch (err) {
      return `Search failed (${err instanceof Error ? err.message : "error"}) — not a finding.`;
    }
  }
  return "Unknown tool.";
}

/** Run one tool call, never throwing and never exceeding its time budget. */
export async function runLiveCheck(name: string, input: unknown, ctx: LiveCheckContext): Promise<string> {
  const args = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  try {
    return await withTimeout(run(name, args, ctx), 25_000, "The check took too long and was stopped — not a finding.");
  } catch (err) {
    return `The check failed (${err instanceof Error ? err.message : "error"}) — not a finding.`;
  }
}
