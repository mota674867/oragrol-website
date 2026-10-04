// ORAGROL ODO — Outbound mode (Master Reference §37.9)
//
// The ABILITY only — how and when it is used is Mohammad's decision and
// lives outside ODO. Input: a company name + website supplied by ORAGROL.
// No visitor, so no interview. Output: a dossier for OCS —
//   - a company snapshot (what they do, focus, size, locations),
//   - up to 5 competitors (name, website, phone, email if publicly found,
//     and what they do) — wider and looser than the exactly-3,
//     confirmed/probable-only rule client reports use, because this is
//     internal targeting intel, never shown to the company itself,
//   - a posture-at-a-glance read (cybersecurity) and automation signals
//     (AI/automation tools visible on their public site),
//   - every finding with its proof (raw evidence + source + date),
//   - a confidence level on each (observed = high, inferred = medium),
//   - an explicit list of what could not be determined,
//   - and, from the second run on, what CHANGED since the previous run.
//
// Properties the dossier states on its face:
//   - Public evidence only, so it is thinner than a full scan.
//   - Passive only: the same public research a normal scan runs (DNS,
//     public pages, public registries). No intake email exists here, so the
//     consented breach check never runs. Nothing is sent to the company.
//
// Runs are kept in Redis per domain (last 6), so a re-run can report changes.

import { Redis } from "@upstash/redis";
import { evaluateOrOneFlag } from "./odo-packages";
import { recommendAutomationLane, TAILORED_AUTOMATION, type AutomationRecommendation } from "./odo-automation-bundles";
import { runParallelResearch, type ResearchFindings } from "./odo-research";
import { buildLedger, type Evidence, type Area } from "./odo-ledger";
import { normalizeDomain } from "./odo-dns";
import { computeCost, addClaudeUsage, addJevUsage, EMPTY_USAGE } from "./odo-cost";
import { recordScanSpend } from "./odo-spend";
import { jobDescriptionFromTypes, detectCountry, type CompetitorProfile } from "./odo-competitors";
import { matchServices } from "./odo-matching";
import { findSimilarBusinesses } from "./odo-outbound-leads";
import { safeFetch } from "./odo-ssrf-guard";
import { htmlToText } from "./odo-crawl";
import type { BusinessProfile } from "./odo-business-profile";

export type DossierFinding = {
  fact: string;
  proof: string | null;
  source: string;
  checkedAt: string;
  kind: "gap" | "strength" | "context";
  severity: Evidence["severity"];
  area: Evidence["area"];
  confidence: "high" | "medium";
  key: string;
};

export type DossierCompetitor = {
  name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  jobDescription: string;
  /** "verified" = confirmed/probable (Places-identity-verified + service overlap). "likely" = comparable_business — same space, not fully confirmed. "unverified" = named in public web-search results only (odo-outbound-leads.ts) — a lead to check, not a confirmed competitor. */
  confidence: "verified" | "likely" | "unverified";
};

export type Recommendation = {
  name: string;
  group: "security" | "automation";
  tier: "recommended" | "worth_exploring";
  reason: string;
};

/** The package-level pick for the automation side: OR ONE, a named Business Automation bundle, or Tailored Automation — same decision logic client reports use. */
export type AutomationLane = {
  kind: "or_one" | "bundle" | "tailored";
  name: string;
  tagline: string | null;
  reason: string;
};

export type CompanySnapshot = {
  description: string;
  focus: string;
  businessModel: string | null;
  priceLevel: string | null;
  locations: string[];
};

export type PostureSummary = {
  verdict: "weak" | "moderate" | "strong";
  summary: string;
  highlights: string[];
};

export type AutomationSignals = {
  detected: string[];
  note: string;
};

export type Dossier = {
  kind: "odo_outbound_dossier";
  version: 3;
  runAt: string;
  company: string;
  website: string;
  domain: string;
  notice: string;
  industry: string | null;
  businessSize: string | null;
  snapshot: CompanySnapshot | null;
  competitors: DossierCompetitor[];
  recommendations: Recommendation[];
  /** Absent on dossiers stored before this field existed; null when public evidence shows no clear automation package. */
  automationLane?: AutomationLane | null;
  posture: PostureSummary;
  automation: AutomationSignals;
  gaps: DossierFinding[];
  strengths: DossierFinding[];
  context: DossierFinding[];
  notDetermined: string[];
  changes: { previousRunAt: string; newGaps: string[]; resolvedGaps: string[]; newStrengths: string[]; lostStrengths: string[] } | null;
  aiCostUsd: number;
};

export const OUTBOUND_NOTICE =
  "Outbound dossier — built from PUBLIC evidence only (no interview, no answers from the company), so it is thinner than a full ODO scan. " +
  "Passive research only: public DNS, public web pages, public registries. Nothing was sent to or tested against the company.";

const HISTORY_PREFIX = "odo:outbound:";
const LOCK_PREFIX = "odo:outbound:lock:";
const KEEP_RUNS = 6;

// Outbound widens the client-report competitor rule (exactly 3,
// confirmed/probable only) to 5, allowing comparable_business to fill
// remaining slots — approved by Mohammad 2026-10-05. This is internal
// targeting intel, never shown to the company itself, so the stricter
// client-report bar doesn't apply here.
const OUTBOUND_COMPETITOR_OPTIONS = { targetCount: 5, allowComparable: true };

// IT/cybersecurity areas only — the four business areas (marketing, sales,
// finance, customer_service) and the context-only areas (operations,
// presence, business, ai) are excluded from the posture verdict; they're
// shown elsewhere in the dossier instead.
const IT_SECURITY_AREAS: Area[] = ["email", "web", "domain", "exposure", "privacy", "governance", "identity", "data", "people"];

// A business mentioning one of these on its public site is read as having
// visible AI/automation tooling. Deliberately modest — this only ever
// catches what's named on the site itself, never internal/private tool use.
const AUTOMATION_KEYWORDS = [
  "chatgpt", "openai", "claude", "copilot", "gemini", "ai agent", "ai assistant", "ai chatbot",
  "zapier", "make.com", "n8n", "hubspot", "salesforce", "intercom", "drift", "calendly",
  "marketing automation", "crm",
];

function redis(): Redis {
  const url = process.env.REDIS_KV_REST_API_URL;
  const token = process.env.REDIS_KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Redis is not configured.");
  return new Redis({ url, token });
}

/** Stable identity of a finding across runs — area + polarity + the wording without numbers/dates. */
function findingKey(e: Evidence): string {
  const words = e.fact.toLowerCase().replace(/[0-9]+/g, "#").replace(/[^a-z#\s]/g, " ").split(/\s+/).filter(Boolean).slice(0, 12);
  return `${e.area}|${e.polarity}|${words.join(" ")}`;
}

function toDossierFinding(e: Evidence): DossierFinding {
  return {
    fact: e.fact,
    proof: e.raw ?? null,
    source: e.source,
    checkedAt: e.collectedAt,
    kind: e.polarity,
    severity: e.severity,
    area: e.area,
    confidence: e.tier === "observed" ? "high" : "medium",
    key: findingKey(e),
  };
}

export function buildSnapshot(profile: BusinessProfile | null, businessSize: string | null): CompanySnapshot | null {
  if (!profile) return null;
  const bits: string[] = [];
  if (profile.summary) bits.push(profile.summary.trim());
  const extra: string[] = [];
  if (profile.whatTheySell) extra.push(`They sell: ${profile.whatTheySell}.`);
  if (profile.audienceDescription) extra.push(`Audience: ${profile.audienceDescription}.`);
  if (profile.businessModel && profile.businessModel !== "unclear") extra.push(`Model: ${profile.businessModel}.`);
  if (profile.priceLevel && profile.priceLevel !== "unclear") extra.push(`Price positioning: ${profile.priceLevel}.`);
  if (businessSize) extra.push(`Estimated size: ${businessSize}.`);
  if (profile.locations.length) extra.push(`Locations: ${profile.locations.join(", ")}.`);
  const description = [bits.join(" "), extra.join(" ")].filter(Boolean).join("\n\n");
  return {
    description: description || "No usable description — site text was too thin to summarize.",
    focus: profile.industryGuess ?? profile.whatTheySell ?? "Not determined",
    businessModel: profile.businessModel !== "unclear" ? profile.businessModel : null,
    priceLevel: profile.priceLevel !== "unclear" ? profile.priceLevel : null,
    locations: profile.locations,
  };
}

export function buildPosture(ledger: Evidence[]): PostureSummary {
  const itFindings = ledger.filter((e) => e.audience === "client" && IT_SECURITY_AREAS.includes(e.area));
  const gaps = itFindings.filter((e) => e.polarity === "gap");
  const strengths = itFindings.filter((e) => e.polarity === "strength");
  const high = gaps.filter((g) => g.severity === "high").length;
  const medium = gaps.filter((g) => g.severity === "medium").length;
  const low = gaps.filter((g) => g.severity === "low").length;

  const verdict: PostureSummary["verdict"] = high >= 1 ? "weak" : medium >= 1 || low >= 2 ? "moderate" : "strong";
  const parts = [high && `${high} high`, medium && `${medium} medium`, low && `${low} low`].filter(Boolean);
  const summary = `${verdict.toUpperCase()} — ${gaps.length} gap${gaps.length === 1 ? "" : "s"} found${parts.length ? ` (${parts.join(", ")})` : ""}, ${strengths.length} strength${strengths.length === 1 ? "" : "s"}.`;

  const bySeverityRank: Record<Evidence["severity"], number> = { high: 0, medium: 1, low: 2, info: 3 };
  const highlights = [
    ...[...gaps].sort((a, b) => bySeverityRank[a.severity] - bySeverityRank[b.severity]).slice(0, 4).map((g) => `✗ ${g.fact}`),
    ...strengths.slice(0, 2).map((s) => `✓ ${s.fact}`),
  ];

  return { verdict, summary, highlights };
}

export function buildAutomationSignals(profile: BusinessProfile | null, ledger: Evidence[]): AutomationSignals {
  const mentioned = profile?.toolsOrPlatformsMentioned ?? [];
  const detected = mentioned.filter((tool) =>
    AUTOMATION_KEYWORDS.some((kw) => tool.toLowerCase().includes(kw))
  );

  const marketingGaps = ledger.filter((e) => e.audience === "client" && e.polarity === "gap" && (e.area === "marketing" || e.area === "sales"));
  const csStrength = ledger.some((e) => e.audience === "client" && e.polarity === "strength" && e.area === "customer_service");

  const note = detected.length
    ? `Visible tooling found on their public site: ${detected.join(", ")}.`
    : marketingGaps.length || !csStrength
      ? "No AI or automation tooling visible on public surfaces — reads as a business still running mostly manual client intake. (This only covers what's publicly visible; private/internal tool use can't be seen this way.)"
      : "No AI or automation tooling named on public surfaces, though other signals look more automated than average. (Publicly-visible signal only.)";

  return { detected, note };
}

/** Best-effort public contact lookup on a business's own homepage — a cheap, non-AI fetch. Fails open to nulls; never blocks the dossier. */
export async function fetchPublicContact(website: string): Promise<{ email: string | null; phone: string | null }> {
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    const res = await Promise.race([
      safeFetch(url, { headers: { "User-Agent": "ORAGROL-ODO/1.0 (+https://orgro.ca)" } }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
    ]);
    if (!res) return { email: null, phone: null };
    return extractContact(await res.text());
  } catch {
    return { email: null, phone: null };
  }
}

/** Pure: first plausible business email and North-American phone number in page HTML. Exported for tests. */
export function extractContact(html: string): { email: string | null; phone: string | null } {
  const text = htmlToText(html);
  const junk = /wixpress|sentry|example\.com|godaddy|schema\.org|\.png|\.jpg|\.gif|placeholder/i;
  const email = (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? []).find((m) => !junk.test(m)) ?? null;
  const phone = text.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/)?.[0] ?? null;
  return { email, phone };
}

async function toDossierCompetitor(c: CompetitorProfile): Promise<DossierCompetitor> {
  const places = c.identity.state === "observed" ? c.identity.value : null;
  const website = places?.website ?? c.website ?? null;
  const found = website ? await fetchPublicContact(website) : { email: null, phone: null };
  return {
    name: c.name,
    website,
    phone: places?.phone ?? found.phone,
    email: found.email,
    jobDescription: places ? jobDescriptionFromTypes(places.types) || "Not specified by Google Places" : "Not specified",
    confidence: c.classification === "comparable_business" ? "likely" : "verified",
  };
}

export async function getOutboundHistory(website: string): Promise<Dossier[]> {
  const domain = normalizeDomain(website);
  if (!domain) return [];
  return (await redis().get<Dossier[]>(`${HISTORY_PREFIX}${domain}`)) ?? [];
}

const INDEX_KEY = "odo:outbound:index";
export type OutboundIndexEntry = { company: string; website: string; domain: string; lastRunAt: string; runs: number };

/** Every company researched so far, newest first — powers the "researched before" notice. */
export async function listOutboundIndex(): Promise<OutboundIndexEntry[]> {
  const all = (await redis().hgetall<Record<string, OutboundIndexEntry>>(INDEX_KEY).catch(() => null)) ?? {};
  return Object.values(all).sort((a, b) => b.lastRunAt.localeCompare(a.lastRunAt));
}

/** One run per domain at a time (research takes 1–2 minutes). */
export async function claimOutboundRun(website: string): Promise<boolean> {
  const domain = normalizeDomain(website);
  if (!domain) return false;
  return (await redis().set(`${LOCK_PREFIX}${domain}`, Date.now(), { nx: true, ex: 600 })) === "OK";
}

export async function runOutbound(company: string, website: string): Promise<Dossier> {
  const domain = normalizeDomain(website);
  if (!domain) throw new Error("Not a usable website.");
  try {
    const findings: ResearchFindings = await runParallelResearch(company, website, true, null, OUTBOUND_COMPETITOR_OPTIONS);
    const ledger = buildLedger(findings);
    const visible = ledger.filter((e) => e.audience === "client");
    const gaps = visible.filter((e) => e.polarity === "gap").map(toDossierFinding);
    const strengths = visible.filter((e) => e.polarity === "strength").map(toDossierFinding);
    const context = visible.filter((e) => e.polarity === "context").map(toDossierFinding);
    const notDetermined = (findings.coverage?.notDetermined ?? []).map((n) => `${n.check}${n.reason ? ` — ${n.reason}` : ""}`);

    const snapshot = buildSnapshot(findings.businessProfile, findings.businessSize);
    const posture = buildPosture(ledger);
    const automation = buildAutomationSignals(findings.businessProfile, ledger);
    const competitors = await Promise.all((findings.competitorProfiles ?? []).map(toDossierCompetitor));

    // Open the area: fewer than 5 verified -> pull similar businesses named in public web results (labelled unverified).
    const profile = findings.businessProfile;
    const city = profile?.locations[0]?.split(",")[0]?.trim() || null;
    const region = detectCountry(domain, profile?.locations ?? []) === "CA" ? "in Canada" : profile?.locations[0] ?? "nearby";
    const extra = await findSimilarBusinesses({
      company,
      domain,
      category: profile?.industryGuess ?? profile?.whatTheySell ?? findings.industry ?? null,
      city,
      region,
      excludeDomains: competitors.map((c) => (c.website ? normalizeDomain(c.website) : "")).filter(Boolean),
      need: 5 - competitors.length,
    });
    const leads = await Promise.all(
      extra.leads.map(async (l): Promise<DossierCompetitor> => {
        const found = l.website ? await fetchPublicContact(l.website) : { email: null, phone: null };
        return { name: l.name, website: l.website, phone: found.phone, email: found.email, jobDescription: l.whatTheyDo || "Not stated in the search results", confidence: "unverified" };
      }),
    );
    const allCompetitors = [...competitors, ...leads].slice(0, 5);

    // Best-matching ORAGROL services, from the same evidence-gated matcher client scans use.
    const matching = await matchServices(ledger, { industry: findings.industry ?? null, businessSize: findings.businessSize ?? null });
    const recommendations: Recommendation[] = matching.flagged
      .filter((m): m is typeof m & { tier: "recommended" | "worth_exploring" } => m.tier !== "not_flagged")
      .slice(0, 5)
      .map((m) => ({ name: m.simpleName, group: m.group, tier: m.tier, reason: m.reason }));

    const orOneFlag = evaluateOrOneFlag(matching.flagged.map((m) => ({ code: m.code, category: m.category, tier: m.tier as "recommended" | "worth_exploring" })));
    const lane = await recommendAutomationLane(
      matching.flagged.filter((m) => m.group === "automation").map((m) => ({ code: m.code, category: m.category, tier: m.tier as "recommended" | "worth_exploring", reason: m.reason })),
      orOneFlag,
    ).catch((): AutomationRecommendation => ({ kind: "none" }));
    const automationLane = toAutomationLane(lane);

    const history = await getOutboundHistory(website).catch(() => [] as Dossier[]);
    const prev = history[0];
    const diff = (a: DossierFinding[], b: DossierFinding[]) => a.filter((x) => !b.some((y) => y.key === x.key)).map((x) => x.fact);
    const changes = prev
      ? {
          previousRunAt: prev.runAt,
          newGaps: diff(gaps, prev.gaps),
          resolvedGaps: diff(prev.gaps, gaps),
          newStrengths: diff(strengths, prev.strengths),
          lostStrengths: diff(prev.strengths, strengths),
        }
      : null;

    const cost = computeCost(addJevUsage(addClaudeUsage(addClaudeUsage(EMPTY_USAGE, findings.businessProfileUsage), extra.usage), matching.jevUsage));
    await recordScanSpend(cost.totalCostUsd).catch(() => {});

    const dossier: Dossier = {
      kind: "odo_outbound_dossier",
      version: 3,
      runAt: new Date().toISOString(),
      company,
      website,
      domain,
      notice: OUTBOUND_NOTICE,
      industry: findings.industry ?? null,
      businessSize: findings.businessSize ?? null,
      snapshot,
      competitors: allCompetitors,
      recommendations,
      automationLane,
      posture,
      automation,
      gaps,
      strengths,
      context,
      notDetermined,
      changes,
      aiCostUsd: cost.totalCostUsd,
    };
    await redis().set(`${HISTORY_PREFIX}${domain}`, [dossier, ...history].slice(0, KEEP_RUNS));
    await redis().hset(INDEX_KEY, { [domain]: { company, website, domain, lastRunAt: dossier.runAt, runs: history.length + 1 } satisfies OutboundIndexEntry }).catch(() => {});
    return dossier;
  } finally {
    await redis().del(`${LOCK_PREFIX}${domain}`).catch(() => {});
  }
}

/** Maps the shared lane decision onto the dossier's own simple shape. Real product names only (OR ONE, the five BA bundles, Tailored Automation). */
export function toAutomationLane(r: AutomationRecommendation): AutomationLane | null {
  if (r.kind === "or_one") return { kind: "or_one", name: "OR ONE", tagline: null, reason: r.reason };
  if (r.kind === "bundle") return { kind: "bundle", name: `Business Automation: ${r.bundle.name}`, tagline: r.bundle.tagline, reason: r.reason };
  if (r.kind === "tailored") return { kind: "tailored", name: TAILORED_AUTOMATION.name, tagline: TAILORED_AUTOMATION.tagline, reason: r.reason };
  return null;
}

/** Plain-text dossier for the OCS hand-off email. */
export function dossierAsText(d: Dossier): string {
  const line = (f: DossierFinding) =>
    `• [${f.severity.toUpperCase()} · confidence ${f.confidence}] ${f.fact}\n    Proof: ${f.proof ?? "—"}\n    Source: ${f.source} · checked ${f.checkedAt.slice(0, 10)}`;
  const competitorLine = (c: DossierCompetitor) =>
    `• ${c.name} [${c.confidence === "verified" ? "VERIFIED" : c.confidence === "likely" ? "LIKELY — not fully confirmed" : "UNVERIFIED — named in public search results, check before use"}]\n` +
    `    What they do: ${c.jobDescription}\n` +
    `    Website: ${c.website ?? "—"} · Phone: ${c.phone ?? "—"} · Email: ${c.email ?? "not found publicly"}`;

  return [
    d.notice,
    "",
    `Company: ${d.company}`,
    `Website: ${d.website}`,
    `Industry (detected): ${d.industry ?? "unknown"} · Size: ${d.businessSize ?? "unknown"}`,
    `Run: ${d.runAt} · AI cost: $${d.aiCostUsd.toFixed(4)}`,
    "",
    `════ COMPANY SNAPSHOT ════`,
    d.snapshot
      ? [d.snapshot.description, "", `Primary focus: ${d.snapshot.focus}`].join("\n")
      : "Not enough site text to build a snapshot.",
    "",
    `════ COMPETITORS (${d.competitors.length} found) ════`,
    ...(d.competitors.length ? d.competitors.map(competitorLine) : ["none found near this business"]),
    "",
    `════ BEST-MATCHING ORAGROL SERVICES ════`,
    ...(d.recommendations.length
      ? d.recommendations.map((r, i) => `${i + 1}. ${r.name} [${r.group === "security" ? "Security" : "Automation"} · ${r.tier === "recommended" ? "RECOMMENDED" : "worth exploring"}]\n    Why: ${r.reason}`)
      : ["No strong match from public evidence alone — a discovery conversation would be needed."]),
    "",
    `════ BEST-MATCHING PACKAGE (Business Automation / OR ONE) ════`,
    d.automationLane
      ? `${d.automationLane.name}${d.automationLane.tagline ? ` — ${d.automationLane.tagline}` : ""}\n    Why: ${d.automationLane.reason}`
      : "No clear automation package from public evidence alone — discovery conversation needed.",
    "",
    `════ POSTURE & AUTOMATION AT A GLANCE ════`,
    `Cybersecurity posture: ${d.posture.summary}`,
    ...d.posture.highlights.map((h) => `  ${h}`),
    "",
    `AI / automation: ${d.automation.detected.length ? d.automation.detected.join(", ") : "none found"}`,
    `  ${d.automation.note}`,
    "",
    d.changes
      ? [
          `════ CHANGES SINCE ${d.changes.previousRunAt.slice(0, 10)} ════`,
          `New gaps: ${d.changes.newGaps.length ? "\n  - " + d.changes.newGaps.join("\n  - ") : "none"}`,
          `Resolved gaps: ${d.changes.resolvedGaps.length ? "\n  - " + d.changes.resolvedGaps.join("\n  - ") : "none"}`,
          `New strengths: ${d.changes.newStrengths.length ? "\n  - " + d.changes.newStrengths.join("\n  - ") : "none"}`,
          `Strengths no longer seen: ${d.changes.lostStrengths.length ? "\n  - " + d.changes.lostStrengths.join("\n  - ") : "none"}`,
          "",
        ].join("\n")
      : "First run for this company — no earlier dossier to compare.\n",
    `════ GAPS (${d.gaps.length}) ════`,
    ...(d.gaps.length ? d.gaps.map(line) : ["none found in public evidence"]),
    "",
    `════ STRENGTHS (${d.strengths.length}) ════`,
    ...(d.strengths.length ? d.strengths.map(line) : ["none recorded"]),
    "",
    `════ CONTEXT ════`,
    ...(d.context.length ? d.context.map((f) => `• ${f.fact}`) : ["none"]),
    "",
    `════ COULD NOT BE DETERMINED (${d.notDetermined.length}) ════`,
    ...(d.notDetermined.length ? d.notDetermined.map((n) => `• ${n}`) : ["everything checked returned an answer"]),
  ].join("\n");
}
