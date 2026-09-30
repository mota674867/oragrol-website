// ORAGROL ODO — Service matching against the 67-service catalog (C01–C15, incl. C10)
//
// Master Reference §6.1 confidence tiers, enforced in code:
//   Recommended     — score ≥ 0.75 AND at least one OBSERVED supporting fact
//   Worth exploring — score 0.50–0.74, or a high score backed only by INFERRED evidence
//   Not flagged     — below 0.50, or no supporting evidence at all
//   Custom-service  — separate flag: need is genuinely outside the whole catalog (C10 is
//                     now a normal recommendable category, not an escalation-only one)
//
// Evidence gate FIRST, Jev second: a service with zero supporting ledger
// entries is never sent to Jev and can never be flagged. Jev only refines
// services that already have evidence — so it cannot invent a need (§2 #5,
// "refuse to invent conclusions"), and it cannot promote an inferred-only
// match to Recommended (§6.1 hedged-answer disqualifier).
//
// Must be able to find nothing (§2 #9): if no service clears the bar, the
// outcome is "no major gaps found" — not a manufactured soft recommendation.

import { askJevChunked, askJev, scoreToUnit, jevConfigured, type JevQuestion } from "./jev";
import { SERVICE_CATALOG, SERVICE_BY_CODE, type CatalogService } from "./odo-services";
import { ledgerAsText, type Evidence } from "./odo-ledger";
import { ANSWER_EVIDENCE } from "./odo-questions";

export type MatchTier = "recommended" | "worth_exploring" | "not_flagged";

export type ServiceMatch = {
  code: string;
  simpleName: string;
  officialName: string;
  category: string;
  group: "security" | "automation";
  tier: MatchTier;
  score: number;
  scoredBy: "jev" | "rules";
  evidenceIds: string[];
  observedEvidenceIds: string[];
  counterEvidenceIds: string[];
  /** Plain reason, built from the cited facts — never free-form model text. */
  reason: string;
};

export type MatchingResult = {
  matches: ServiceMatch[];
  flagged: ServiceMatch[];
  customServiceFlag: { raised: boolean; notes: string[] };
  outcome: "gaps_found" | "no_major_gaps";
  jevUsed: boolean;
};

const SEV_WEIGHT: Record<Evidence["severity"], number> = { high: 0.85, medium: 0.78, low: 0.62, info: 0.55 };

/** Deterministic fallback score — used when Jev is unavailable for a service. */
function ruleScore(support: Evidence[], counters: Evidence[]): number {
  const observedGaps = support.filter((e) => e.tier === "observed" && e.polarity === "gap");
  const inferredOrContext = support.filter((e) => !(e.tier === "observed" && e.polarity === "gap"));
  const observedCounters = counters.filter((e) => e.tier === "observed");
  if (observedCounters.length && !observedGaps.length) return 0.2;
  if (observedGaps.length) {
    const top = Math.max(...observedGaps.map((e) => SEV_WEIGHT[e.severity]));
    const bonus = Math.min(0.1, 0.03 * (observedGaps.length - 1));
    return Math.min(0.95, top + bonus);
  }
  // Inferred gaps or context only → at most "worth exploring" territory.
  const inferredGaps = inferredOrContext.filter((e) => e.polarity === "gap");
  if (inferredGaps.length) return Math.min(0.68, 0.52 + 0.04 * inferredGaps.length);
  return inferredOrContext.length >= 2 ? 0.5 : 0.42;
}

function tierFor(score: number, observedSupport: number): MatchTier {
  if (score >= 0.75 && observedSupport > 0) return "recommended";
  if (score >= 0.5) return "worth_exploring";
  return "not_flagged";
}

function reasonFor(svc: CatalogService, support: Evidence[]): string {
  const gaps = support.filter((e) => e.polarity === "gap");
  const pick = (gaps.length ? gaps : support).slice(0, 3);
  return pick.map((e) => `${e.fact} [${e.id}]`).join(" ");
}

export async function matchServices(ledger: Evidence[], ctx: { industry: string | null; businessSize: string | null; answers: Record<string, string> }): Promise<MatchingResult> {
  const clientLedger = ledger.filter((e) => e.audience === "client");

  // 1) Evidence gate.
  const supportMap = new Map<string, Evidence[]>();
  const counterMap = new Map<string, Evidence[]>();
  for (const e of ledger) {
    for (const c of e.supports) if (SERVICE_BY_CODE[c]) (supportMap.get(c) ?? supportMap.set(c, []).get(c)!).push(e);
    for (const c of e.counters) if (SERVICE_BY_CODE[c]) (counterMap.get(c) ?? counterMap.set(c, []).get(c)!).push(e);
  }
  const candidates = SERVICE_CATALOG.filter((s) => (supportMap.get(s.code)?.length ?? 0) > 0);

  // 2) Jev refines candidates only.
  const levels = [
    "No real need shown by the evidence",
    "Weak signal — generic, could apply to any business",
    "Plausible need — some specific evidence",
    "Clear need — specific evidence points to it",
    "Strong, urgent need — multiple specific facts or a high-severity gap",
  ];
  let jevAnswers: Record<string, import("./jev").JevAnswer> = {};
  let jevUsed = false;
  if (candidates.length && jevConfigured()) {
    const qs: Record<string, JevQuestion> = {};
    for (const s of candidates) {
      const ids = supportMap.get(s.code)!.map((e) => e.id);
      const cids = (counterMap.get(s.code) ?? []).map((e) => e.id);
      qs[s.code.replace("-", "_")] = {
        type: "score",
        instructions:
          `Judge ONLY from the evidence in state. How strongly does this business need "${s.simpleName}" (${s.officialName}) — typical triggers: ${s.triggers}? ` +
          `Supporting evidence IDs: ${ids.join(", ")}.${cids.length ? ` Counter-evidence IDs: ${cids.join(", ")}.` : ""} ` +
          `Rules: facts tagged "inferred" (hedged answers, single incidents, category patterns) are weaker than "observed" facts. Context facts alone rarely show a clear need. Do not assume anything not stated.`,
        criteria: levels,
      };
    }
    const state = `Business: industry ${ctx.industry ?? "unknown"}, size ${ctx.businessSize ?? "unknown"}.\nEvidence ledger:\n${ledgerAsText(clientLedger, { includeInternal: false })}`;
    const res = await askJevChunked(state, qs, { label: "service-match", chunkSize: 20, timeoutMs: 15000 });
    if (res) { jevAnswers = res.answers; jevUsed = Object.keys(res.answers).length > 0; }
  }

  // 3) Tier with the §6.1 rules.
  const matches: ServiceMatch[] = SERVICE_CATALOG.map((s) => {
    const support = supportMap.get(s.code) ?? [];
    const counters = counterMap.get(s.code) ?? [];
    const observed = support.filter((e) => e.tier === "observed");
    if (!support.length) {
      return { code: s.code, simpleName: s.simpleName, officialName: s.officialName, category: s.category, group: s.group, tier: "not_flagged" as const, score: 0, scoredBy: "rules" as const, evidenceIds: [], observedEvidenceIds: [], counterEvidenceIds: counters.map((e) => e.id), reason: "" };
    }
    const jevScore = scoreToUnit(jevAnswers[s.code.replace("-", "_")], levels.length);
    const score = jevScore ?? ruleScore(support, counters);
    // An observed GAP is required for Recommended; stated context (e.g. "handles health records")
    // proves exposure, not a missing control — it may lift a match, never make it Recommended alone.
    const observedGaps = support.filter((e) => e.tier === "observed" && e.polarity === "gap");
    const tier = tierFor(score, observedGaps.length);
    return {
      code: s.code, simpleName: s.simpleName, officialName: s.officialName, category: s.category, group: s.group,
      tier, score: Math.round(score * 100) / 100, scoredBy: jevScore !== null ? "jev" as const : "rules" as const,
      evidenceIds: support.map((e) => e.id), observedEvidenceIds: observed.map((e) => e.id), counterEvidenceIds: counters.map((e) => e.id),
      reason: reasonFor(s, support),
    };
  });

  const flagged = matches
    .filter((m) => m.tier !== "not_flagged")
    .sort((a, b) => (a.tier === b.tier ? b.score - a.score : a.tier === "recommended" ? -1 : 1));

  // 4) Custom-service / escalation flag.
  const notes: string[] = [];
  for (const [qid, ans] of Object.entries(ctx.answers)) {
    for (const t of ANSWER_EVIDENCE[qid]?.[ans] ?? []) if (t.customFlag) notes.push(t.customFlag);
  }
  const openText = ctx.answers["q_open"];
  if (openText && openText.trim().length > 8 && jevConfigured()) {
    const r = await askJev(
      { statement: openText.slice(0, 1500), catalog_categories: [...new Set(SERVICE_CATALOG.map((s) => s.category))] },
      {
        outside_catalog: { type: "noul", instructions: "Does the statement describe a business need that none of the listed catalog categories would cover — note that penetration testing, SOC 2 audits, PCI-DSS assessments and forensic incident response ARE covered (Certified Specialist Services category), so only flag something genuinely uncovered or unrelated to cybersecurity, IT or business automation?" },
        urgent: { type: "noul", instructions: "Does the statement describe an active, urgent security incident happening now (e.g. currently hacked, ransomware now, money stolen)?" },
      },
      { label: "custom-flag", timeoutMs: 8000 }
    );
    const oc = r?.answers.outside_catalog;
    const ur = r?.answers.urgent;
    if (oc?.type === "noul" && oc.noul >= 0.6) notes.push(`Visitor described a need that may be outside the catalog: "${openText.slice(0, 200)}"`);
    if (ur?.type === "noul" && ur.noul >= 0.6) notes.push(`URGENT — visitor may be describing an active incident: "${openText.slice(0, 200)}"`);
  } else if (openText && /breach(ed)?|hacked|ransom|money stolen|under attack/i.test(openText)) {
    notes.push(`URGENT keyword escalation from free-text answer: "${openText.slice(0, 200)}"`);
  }

  return {
    matches,
    flagged,
    customServiceFlag: { raised: notes.length > 0, notes: [...new Set(notes)] },
    outcome: flagged.length ? "gaps_found" : "no_major_gaps",
    jevUsed,
  };
}
