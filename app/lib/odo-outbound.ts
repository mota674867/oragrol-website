// ORAGROL ODO — Outbound mode (Master Reference §37.9)
//
// The ABILITY only — how and when it is used is Mohammad's decision and
// lives outside ODO. Input: a company name + website supplied by ORAGROL.
// No visitor, so no interview. Output: a dossier for OCS —
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
import { runParallelResearch, type ResearchFindings } from "./odo-research";
import { buildLedger, type Evidence } from "./odo-ledger";
import { normalizeDomain } from "./odo-dns";
import { computeCost, addClaudeUsage, EMPTY_USAGE } from "./odo-cost";
import { recordScanSpend } from "./odo-spend";

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

export type Dossier = {
  kind: "odo_outbound_dossier";
  version: 1;
  runAt: string;
  company: string;
  website: string;
  domain: string;
  notice: string;
  industry: string | null;
  businessSize: string | null;
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

export async function getOutboundHistory(website: string): Promise<Dossier[]> {
  const domain = normalizeDomain(website);
  if (!domain) return [];
  return (await redis().get<Dossier[]>(`${HISTORY_PREFIX}${domain}`)) ?? [];
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
    const findings: ResearchFindings = await runParallelResearch(company, website, true, null);
    const ledger = buildLedger(findings);
    const visible = ledger.filter((e) => e.audience === "client");
    const gaps = visible.filter((e) => e.polarity === "gap").map(toDossierFinding);
    const strengths = visible.filter((e) => e.polarity === "strength").map(toDossierFinding);
    const context = visible.filter((e) => e.polarity === "context").map(toDossierFinding);
    const notDetermined = (findings.coverage?.notDetermined ?? []).map((n) => `${n.check}${n.reason ? ` — ${n.reason}` : ""}`);

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

    const cost = computeCost(addClaudeUsage(EMPTY_USAGE, findings.businessProfileUsage));
    await recordScanSpend(cost.totalCostUsd).catch(() => {});

    const dossier: Dossier = {
      kind: "odo_outbound_dossier",
      version: 1,
      runAt: new Date().toISOString(),
      company,
      website,
      domain,
      notice: OUTBOUND_NOTICE,
      industry: findings.industry ?? null,
      businessSize: findings.businessSize ?? null,
      gaps,
      strengths,
      context,
      notDetermined,
      changes,
      aiCostUsd: cost.totalCostUsd,
    };
    await redis().set(`${HISTORY_PREFIX}${domain}`, [dossier, ...history].slice(0, KEEP_RUNS));
    return dossier;
  } finally {
    await redis().del(`${LOCK_PREFIX}${domain}`).catch(() => {});
  }
}

/** Plain-text dossier for the OCS hand-off email. */
export function dossierAsText(d: Dossier): string {
  const line = (f: DossierFinding) =>
    `• [${f.severity.toUpperCase()} · confidence ${f.confidence}] ${f.fact}\n    Proof: ${f.proof ?? "—"}\n    Source: ${f.source} · checked ${f.checkedAt.slice(0, 10)}`;
  return [
    d.notice,
    "",
    `Company: ${d.company}`,
    `Website: ${d.website}`,
    `Industry (detected): ${d.industry ?? "unknown"} · Size: ${d.businessSize ?? "unknown"}`,
    `Run: ${d.runAt} · AI cost: $${d.aiCostUsd.toFixed(4)}`,
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
