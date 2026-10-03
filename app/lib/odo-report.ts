// ORAGROL ODO — Report data model
//
// One object, two consumers:
//   - the client-facing PDF (odo-report-pdf.tsx) renders `client` fields only;
//   - ZM77 / Mohammad's review gets the whole thing, including `internal`.
// Nothing here is sent to the prospect directly. Every report is a DRAFT
// until Mohammad approves it through ZM77 (§28 approval gate — absolute).
//
// Fixed skeleton, free depth (§7): overview → findings → SWOT → priorities →
// next steps, same order every time, each section only as long as the
// evidence makes it. Built-in §34 trust counters: every finding carries its
// source, date and raw evidence; severity is graded honestly; informational
// items are labelled as such; inferred items are labelled as unconfirmed.

import { AREA_LABEL, type Evidence, type Area } from "./odo-ledger";
import type { MatchingResult, ServiceMatch } from "./odo-matching";
import type { Swot } from "./odo-swot";
import type { OutcomeNarrative } from "./odo-outcome";
import type { ResearchFindings } from "./odo-research";
import { ORGBOOK_ATTRIBUTION } from "./odo-orgbook";
import { SERVICE_BY_CODE, type Billing } from "./odo-services";
import { recommendSecurityLane, evaluateOrOneFlag, type SecurityLane } from "./odo-packages";
import { recommendAutomationLane, type AutomationRecommendation } from "./odo-automation-bundles";
import type { CostBreakdown } from "./odo-cost";
import type { Benchmark } from "./odo-benchmark";

export type ReportFinding = Pick<Evidence, "id" | "fact" | "raw" | "source" | "tier" | "severity" | "polarity" | "framework" | "collectedAt">;
// `simpleName` (e.g. "Trust Guard") is ODO's internal shorthand — never
// shown as the sole label on anything that also tells the client to go look
// the item up ("search by item name... on orgro.ca/services"), because the
// public services page lists these by `officialName` (e.g. "Zero Trust
// Access Security") only. Carrying both lets the PDF show the name that's
// actually searchable; FOUND 2026-10-02 from Mohammad's first live test —
// "Additional items to consider" was showing simpleName, so a client
// searching the exact name printed in their own report would find nothing.
export type ReportPriority = { code: string; simpleName: string; officialName: string; category: string; group: "security" | "automation"; tier: "recommended" | "worth_exploring"; billing: Billing; why: string; evidenceIds: string[] };
export type WebsitePointer = { label: string; path: string };

export type OdoReport = {
  version: 1;
  reference: string;
  status: "draft_pending_review";
  generatedAt: string;
  condition: "complete" | "insufficient_data";
  outcome: "gaps_found" | "no_major_gaps" | "insufficient_data";
  client: {
    company: string;
    website: string | null;
    industry: string | null;
    businessSize: string | null;
  };
  summary: string;
  headline: {
    confirmedGaps: number;
    highSeverity: number;
    recommended: number;
    worthExploring: number;
    strengths: number;
    /** §27 end-screen counts — real numbers from the evidence, never placeholders. */
    endScreen: { criticalSecurity: number; salesMarketingGaps: number; automationOpportunities: number };
  };
  findings: Array<{ area: Area; label: string; gaps: ReportFinding[]; strengths: ReportFinding[] }>;
  profile: ReportFinding[];
  swot: Swot;
  priorities: { recommended: ReportPriority[]; worthExploring: ReportPriority[] };
  /** Security lane (Mohammad, 2026-09-30 round 2): ONE primary pick — a package, or the Foundation default, or nothing — plus the items that are never sold inside a package and so are always offered by exact name regardless of the pick. Codes here are for ORAGROL's own/AI's clarity; the client-facing headline is always the plain product name. */
  securityLane: SecurityLane;
  /** Automation lane: ONE primary pick — OR ONE, a named BA bundle (Sales/Customer Service/Finance/IT/Marketing), or Tailored Automation (renamed from "Custom Job") when nothing bundle-sized fits. */
  automationLane: { recommendation: AutomationRecommendation };
  /** Plain-language closing section: situation now, security outlook, automation opportunity + benefits + illustrative savings estimate. */
  outcomeNarrative: OutcomeNarrative;
  /** Page-level pointers so the client can find current fees on the live site — never per-item deep links (none exist), never static prices in the report. */
  websitePointers: WebsitePointer[];
  coverage: { checksAnswered: number; notDetermined: string[]; note: string };
  attributions: string[];
  /** §37.7 one-line, aggregate competitor comparison — null unless solidly determined (odo-benchmark.ts). */
  benchmark: Benchmark | null;
  /** §37.7 the one free tip ODO gave during the scan, repeated so it isn't lost. */
  quickWin: string | null;
  /** §37.7 free re-check offer — the date 90 days after this report. */
  recheckFrom: string;
  /** §37.7 protection line, shown on the cover of every report. */
  protectionLine: string;
  internal: {
    customServiceFlag: MatchingResult["customServiceFlag"];
    internalEvidence: ReportFinding[];
    allMatches: ServiceMatch[];
    jevUsedForMatching: boolean;
    swotGeneratedBy: Swot["generatedBy"];
    swotDroppedPoints: number;
    questionsAsked: number;
    answers: Record<string, string>;
    questionMethod: string[];
    researchErrors: string[];
    /** Real per-scan AI cost — sums actual token usage from every Jev/Claude call this scan made against verified vendor pricing (odo-cost.ts). Never an estimate. */
    aiCost: CostBreakdown;
  };
};

const SECURITY_AREAS: Area[] = ["email", "web", "domain", "exposure", "privacy", "governance", "identity", "data", "people", "ai"];
// IT & cybersecurity first (the evidence public research can prove), then
// the four business areas in Mohammad's weighting order.
const AREA_ORDER: Area[] = ["email", "web", "exposure", "domain", "identity", "data", "governance", "people", "privacy", "ai", "marketing", "sales", "finance", "customer_service", "operations", "presence", "business"];
const SEV_RANK = { high: 0, medium: 1, low: 2, info: 3 } as const;

const COVERAGE_LABELS: Record<string, string> = {
  "email.spf": "SPF record", "email.dmarc": "DMARC record", "email.dkim": "DKIM signing",
  "mail.platform": "Mail platform", "identity.microsoft365": "Microsoft 365 tenant", "dns.delegation": "DNS provider",
  "dns.caa": "CAA record", "dns.mtaSts": "MTA-STS", "dns.tlsRpt": "TLS reporting", "dns.bimi": "BIMI",
  "page.homepage": "Homepage", "wellknown.robots": "robots.txt", "wellknown.sitemap": "Sitemap",
  "wellknown.securityTxt": "security.txt", "wellknown.privacyPolicy": "Privacy policy",
  "infra.registration": "Domain registration", "infra.hosting": "Hosting location", "infra.dnssec": "DNSSEC",
  "attackSurface.danglingCnames": "Subdomain takeover check", "compliance.jsLibraries": "JavaScript library versions",
  "research.waybackHistory": "Website history", "business.hiringSignal": "Careers page", "registry.orgbookBC": "BC business registry",
  "competitor.geoapify": "Local business discovery",
};

function toFinding(e: Evidence): ReportFinding {
  return { id: e.id, fact: e.fact, raw: e.raw, source: e.source, tier: e.tier, severity: e.severity, polarity: e.polarity, framework: e.framework, collectedAt: e.collectedAt };
}

function toPriority(m: ServiceMatch): ReportPriority {
  return { code: m.code, simpleName: m.simpleName, officialName: SERVICE_BY_CODE[m.code]?.officialName ?? m.simpleName, category: m.category, group: m.group, tier: m.tier as "recommended" | "worth_exploring", billing: SERVICE_BY_CODE[m.code]?.billing ?? "recurring", why: m.reason, evidenceIds: m.evidenceIds };
}

const WEBSITE_POINTERS: WebsitePointer[] = [
  { label: "Cybersecurity packages & à la carte services", path: "/services" },
  { label: "Business Automation services", path: "/business-automation" },
  { label: "OR ONE custom automation builder", path: "/or-one" },
];

export const PROTECTION_LINE =
  "This is a discovery review based on public information and the answers you gave — not a penetration test and not a compliance audit.";

export function makeReference(sessionId: string): string {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `ODO-${ymd}-${sessionId.slice(-6).toUpperCase()}`;
}

export async function buildReport(input: {
  sessionId: string;
  company: string;
  website: string | null;
  industry: string | null;
  businessSize: string | null;
  findings: ResearchFindings;
  ledger: Evidence[];
  matching: MatchingResult;
  swot: Swot;
  outcomeNarrative: OutcomeNarrative;
  condition: "complete" | "insufficient_data";
  answers: Record<string, string>;
  questionMethod: string[];
  aiCost: CostBreakdown;
  benchmark?: Benchmark | null;
  quickWin?: string | null;
}): Promise<OdoReport> {
  const { ledger, matching, swot, findings } = input;
  const client = ledger.filter((e) => e.audience === "client");
  const gaps = client.filter((e) => e.polarity === "gap");
  const observedGaps = gaps.filter((e) => e.tier === "observed");

  const byArea = new Map<Area, { gaps: ReportFinding[]; strengths: ReportFinding[] }>();
  for (const e of client) {
    if (e.polarity === "context") continue;
    const bucket = byArea.get(e.area) ?? byArea.set(e.area, { gaps: [], strengths: [] }).get(e.area)!;
    (e.polarity === "gap" ? bucket.gaps : bucket.strengths).push(toFinding(e));
  }
  const findingsSections = AREA_ORDER.filter((a) => byArea.has(a)).map((a) => {
    const b = byArea.get(a)!;
    b.gaps.sort((x, y) => SEV_RANK[x.severity] - SEV_RANK[y.severity] || (x.tier === "observed" ? -1 : 1));
    return { area: a, label: AREA_LABEL[a], gaps: b.gaps, strengths: b.strengths };
  });

  const recommended = matching.flagged.filter((m) => m.tier === "recommended").map(toPriority);
  const worthExploring = matching.flagged.filter((m) => m.tier === "worth_exploring").map(toPriority);

  const securityLane = recommendSecurityLane(
    matching.flagged.map((m) => ({ code: m.code, simpleName: m.simpleName, category: m.category, group: m.group, tier: m.tier as "recommended" | "worth_exploring", reason: m.reason })),
    SERVICE_BY_CODE
  );
  const orOneFlag = evaluateOrOneFlag(matching.flagged.map((m) => ({ code: m.code, category: m.category, tier: m.tier as "recommended" | "worth_exploring" })));
  const automationRecommendation = await recommendAutomationLane(
    matching.flagged.filter((m) => m.group === "automation").map((m) => ({ code: m.code, category: m.category, tier: m.tier as "recommended" | "worth_exploring", reason: m.reason })),
    orOneFlag
  );

  const cov = findings.coverage ?? { observed: [], absent: [], notDetermined: [] };
  const notDetermined = cov.notDetermined.map((n) => COVERAGE_LABELS[n.check] ?? n.check).filter((x, i, arr) => arr.indexOf(x) === i);

  const attributions: string[] = [];
  if (client.some((e) => e.source.startsWith("OrgBook BC"))) attributions.push(ORGBOOK_ATTRIBUTION);
  // Phase 4: broadened from an exact "Google Places" match to also catch the
  // named-competitor evidence (odo-ledger.ts), whose source is "Google Maps
  // (Google Places)" — same attribution requirement, one more place it can
  // come from.
  if (client.some((e) => e.source.startsWith("Google"))) attributions.push("Business rating data: Google.");

  const outcome: OdoReport["outcome"] = input.condition === "insufficient_data" ? "insufficient_data" : matching.outcome;

  return {
    version: 1,
    reference: makeReference(input.sessionId),
    status: "draft_pending_review",
    generatedAt: new Date().toISOString(),
    condition: input.condition,
    outcome,
    client: { company: input.company, website: input.website, industry: input.industry, businessSize: input.businessSize },
    summary: swot.summary,
    headline: {
      confirmedGaps: observedGaps.length,
      highSeverity: observedGaps.filter((e) => e.severity === "high").length,
      recommended: recommended.length,
      worthExploring: worthExploring.length,
      strengths: client.filter((e) => e.polarity === "strength").length,
      endScreen: {
        criticalSecurity: observedGaps.filter((e) => SECURITY_AREAS.includes(e.area) && e.severity === "high").length,
        salesMarketingGaps: gaps.filter((e) => e.area === "marketing" || e.area === "sales" || e.area === "presence" || (e.area === "operations" && e.supports.some((s) => s.startsWith("C15")))).length,
        automationOpportunities: matching.flagged.filter((m) => m.group === "automation").length,
      },
    },
    findings: findingsSections,
    profile: client.filter((e) => e.polarity === "context").map(toFinding),
    swot,
    priorities: { recommended, worthExploring },
    securityLane,
    automationLane: { recommendation: automationRecommendation },
    outcomeNarrative: input.outcomeNarrative,
    websitePointers: WEBSITE_POINTERS,
    coverage: {
      checksAnswered: cov.observed.length + cov.absent.length,
      notDetermined,
      note: notDetermined.length
        ? "Some checks could not be completed (the site blocked automated requests, a service timed out, or the data isn't public). These are gaps in what ODO could see — not findings about your business — and nothing here was scored against you."
        : "All automated checks completed.",
    },
    attributions,
    benchmark: input.benchmark ?? null,
    quickWin: input.quickWin ?? null,
    recheckFrom: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    protectionLine: PROTECTION_LINE,
    internal: {
      customServiceFlag: matching.customServiceFlag,
      internalEvidence: ledger.filter((e) => e.audience === "internal").map(toFinding),
      allMatches: matching.matches.filter((m) => m.evidenceIds.length > 0),
      jevUsedForMatching: matching.jevUsed,
      swotGeneratedBy: swot.generatedBy,
      swotDroppedPoints: swot.droppedPoints,
      questionsAsked: Object.keys(input.answers).length,
      answers: input.answers,
      questionMethod: input.questionMethod,
      researchErrors: findings.errors ?? [],
      aiCost: input.aiCost,
    },
  };
}
