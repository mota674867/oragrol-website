// ORAGROL ODO — Plain-language outcome section
//
// Mohammad's request (2026-09-30): close the report in plain language —
// what the client's situation is now, what they can achieve on security and
// what damage they avoid, what part of their business can be automated and
// why that's valuable (24/7, no salary, no rest, no hiring, less KPI
// overhead), and an approximate staff-replacement savings estimate.
//
// Same split as the SWOT (odo-swot.ts): rules compute anything numeric —
// Claude never invents a dollar figure — Claude only writes the surrounding
// prose, grounded in the evidence ledger and the already-decided service
// matches, with the same banned-language and length guardrails. If Claude is
// unavailable or returns something unusable, a deterministic version is
// built straight from the ledger so the report never fails on prose.

import { createReportText, type ReportUsage } from "./odo-report-model";
import { ledgerAsText, type Evidence } from "./odo-ledger";
import type { MatchingResult } from "./odo-matching";
import { publicServiceLabels } from "./odo-public-names";

export type AutomationEstimate = {
  fteRangeLabel: string;
  monthlySavingsLow: number;
  monthlySavingsHigh: number;
  /** Discloses the benchmark this estimate is built on — always shown alongside the number. */
  assumptionNote: string;
};

export type OutcomeNarrative = {
  situationNow: string;
  securityOutlook: string;
  automationOpportunity: string | null;
  automationBenefits: string[];
  automationEstimate: AutomationEstimate | null;
  generatedBy: "claude" | "rules";
  generatedAt: string;
};


const AUTOMATION_BENEFITS = [
  "Runs 24/7 — nights, weekends and holidays included, with no shift gaps to cover",
  "No salary, benefits, payroll tax, or CPP/EI contributions",
  "No sick days, no burnout, and no turnover to recruit and retrain for",
  "Scales with volume instantly — no hiring lead time to add capacity",
  "Consistent output against clear KPIs, with far less day-to-day management overhead than a growing team",
];

/** Fully-loaded monthly cost ORAGROL plans around for one Toronto-area SMB admin/support/ops role — an illustrative planning benchmark, not a verified market survey. */
const FTE_MONTHLY_COST_LOW = 4500;
const FTE_MONTHLY_COST_HIGH = 5500;

const BANNED = /\$\s?\d|\bprice\b|\bpricing\b|\bguarantee|\b100%|\bwill be hacked\b|\bimminent\b|\bdisaster\b|\bpromise/i;

/** Rules-only: how many roles' worth of manual, repeatable work the flagged AUTOMATION opportunities represent, and what that's worth per month at the benchmark rate. Never touched by Claude. */
export function computeAutomationEstimate(matching: MatchingResult): AutomationEstimate | null {
  // C11 (AI Business Discovery & Transformation) is advisory/strategic — it doesn't itself
  // replace day-to-day manual work, so it's excluded from the headcount math.
  const operational = matching.flagged.filter((m) => m.group === "automation" && !m.code.startsWith("C11-"));
  const weighted = operational.reduce((n, m) => n + (m.tier === "recommended" ? 1 : 0.5), 0);
  if (weighted < 1) return null;

  let fteLow: number, fteHigh: number, fteRangeLabel: string;
  if (weighted < 2) { fteLow = 0.25; fteHigh = 0.5; fteRangeLabel = "roughly a quarter to half of one full-time role"; }
  else if (weighted < 3.5) { fteLow = 0.5; fteHigh = 1; fteRangeLabel = "roughly half to a full-time role"; }
  else if (weighted < 5.5) { fteLow = 1; fteHigh = 1.5; fteRangeLabel = "roughly one to one-and-a-half full-time roles"; }
  else { fteLow = 1.5; fteHigh = 2.5; fteRangeLabel = "roughly one-and-a-half to two-and-a-half full-time roles"; }

  const monthlySavingsLow = Math.round((fteLow * FTE_MONTHLY_COST_LOW) / 100) * 100;
  const monthlySavingsHigh = Math.round((fteHigh * FTE_MONTHLY_COST_HIGH) / 100) * 100;

  return {
    fteRangeLabel,
    monthlySavingsLow,
    monthlySavingsHigh,
    assumptionNote: `Illustrative only — based on the number and weight of automation opportunities identified above, and a planning benchmark of $${FTE_MONTHLY_COST_LOW.toLocaleString()}–$${FTE_MONTHLY_COST_HIGH.toLocaleString()}/month fully loaded (salary, benefits and payroll overhead) for one Toronto-area administrative/support role. Not a quote, audit or guaranteed outcome — your actual savings depend on which opportunities you act on and how they're implemented.`,
  };
}

function validateText(s: unknown, maxWords = 90): string {
  if (typeof s !== "string") return "";
  const t = s.trim();
  if (!t || t.length > maxWords * 10 || BANNED.test(t)) return "";
  return t;
}

/** Deterministic version — used when Claude is unavailable or returns something unusable. */
export function rulesOutcome(ledger: Evidence[], matching: MatchingResult, business: string, estimate: AutomationEstimate | null): OutcomeNarrative {
  const client = ledger.filter((e) => e.audience === "client");
  const gaps = client.filter((e) => e.polarity === "gap");
  const observedHigh = gaps.filter((e) => e.tier === "observed" && e.severity === "high");
  const recCount = matching.flagged.filter((m) => m.tier === "recommended" && m.group === "security").length;

  const situationNow = matching.outcome === "no_major_gaps"
    ? `Right now, ${business}'s public-facing security footprint and the answers provided look reasonably solid — this scan did not turn up a major gap that calls for immediate action.`
    : `Right now, ${business} has ${observedHigh.length} confirmed, higher-severity gap${observedHigh.length === 1 ? "" : "s"} in its security setup, alongside ${gaps.length - observedHigh.length} lower-severity item${gaps.length - observedHigh.length === 1 ? "" : "s"}. None of this means an incident has happened — it means specific, fixable gaps exist today.`;

  const securityOutlook = recCount
    ? `Closing the ${recCount} recommended item${recCount === 1 ? "" : "s"} above moves ${business} from these specific gaps to a documented, defensible security baseline. The practical upside is avoiding the costs that follow a real incident: business email compromise and wire fraud, ransomware-driven downtime, the cost and disclosure obligations of a data breach, and the reputational damage of customers finding out before you tell them.`
    : `${business}'s current setup does not show the kind of gap that typically leads to business email compromise, ransomware downtime, or a reportable data breach — the goal from here is to keep it that way as the business grows.`;

  const autoOpps = matching.flagged.filter((m) => m.group === "automation" && !m.code.startsWith("C11-"));
  const automationOpportunity = autoOpps.length
    ? `The research and answers point to manual, repeatable work in ${[...new Set(autoOpps.map((m) => m.category))].slice(0, 3).join(", ")} that is a strong candidate for automation — work that follows a consistent process today and doesn't need human judgment on every case.`
    : null;

  return {
    situationNow, securityOutlook, automationOpportunity,
    automationBenefits: autoOpps.length ? AUTOMATION_BENEFITS : [],
    automationEstimate: autoOpps.length ? estimate : null,
    generatedBy: "rules", generatedAt: new Date().toISOString(),
  };
}

export type OutcomeResult = { outcome: OutcomeNarrative; usage: ReportUsage | null };

export async function buildOutcomeNarrative(
  ledger: Evidence[],
  matching: MatchingResult,
  ctx: { business: string; industry: string | null; businessSize: string | null; overSpendCap?: boolean }
): Promise<OutcomeResult> {
  const estimate = computeAutomationEstimate(matching);
  const fallback = (): OutcomeResult => ({ outcome: rulesOutcome(ledger, matching, ctx.business, estimate), usage: null });
  if (!process.env.ANTHROPIC_API_KEY) return fallback();

  const clientLedger = ledger.filter((e) => e.audience === "client");
  const recSecurity = matching.flagged.filter((m) => m.tier === "recommended" && m.group === "security");
  const autoOpps = matching.flagged.filter((m) => m.group === "automation" && !m.code.startsWith("C11-"));

  const system = [
    "You write the closing 'where things stand' section of ORAGROL's business discovery report, for a small/medium business owner who is not technical. ORAGROL is a Canadian cybersecurity and business-automation provider.",
    "Hard rules:",
    "1. Use ONLY facts from the evidence ledger and the service matches given. Never invent a statistic, dollar figure, percentage, or claim not grounded in what's given — numbers are handled elsewhere, never write one yourself.",
    "2. No guarantees, no fear-mongering, no exclamation marks, no invented urgency. State severity honestly.",
    "3. Plain English, short sentences, a business owner reading this for the first time should fully understand it.",
    "4. 'situationNow': 2-3 sentences on where the business stands today, in plain terms.",
    "5. 'securityOutlook': 2-4 sentences — what the business can realistically achieve by acting on the recommended items, and what kind of damage (fraud, downtime, breach costs, reputational harm) that helps avoid. If there is nothing material to recommend, say the posture looks solid and name what to keep doing.",
    "6. 'automationOpportunity': 2-3 sentences on what part of the business the evidence suggests is a good candidate for automation, and why (repeatable, manual, no judgment call needed) — or null if no automation opportunity was flagged. Do not mention cost savings, headcount, or dollar amounts here.",
    "Return ONLY JSON: {\"situationNow\": string, \"securityOutlook\": string, \"automationOpportunity\": string | null}",
  ].join("\n");

  const user = [
    `Business: ${ctx.business}. Industry: ${ctx.industry ?? "unknown"}. Size: ${ctx.businessSize ?? "unknown"}.`,
    `Outcome: ${matching.outcome === "no_major_gaps" ? "NO MAJOR GAPS FOUND" : "gaps found"}.`,
    "Evidence ledger:",
    ledgerAsText(clientLedger),
    "",
    `Recommended security services (${recSecurity.length}): ${publicServiceLabels(recSecurity.map((m) => m.code)).join(", ") || "(none)"}`,
    `Flagged automation opportunities (${autoOpps.length}, excluding advisory-only discovery services): ${publicServiceLabels(autoOpps.map((m) => m.code)).join(", ") || "(none)"}`,
  ].join("\n");

  try {
    const { text, usage } = await createReportText({ max_tokens: 900, system, messages: [{ role: "user", content: user }] }, 45000, ctx.overSpendCap);
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as { situationNow?: unknown; securityOutlook?: unknown; automationOpportunity?: unknown };

    const situationNow = validateText(parsed.situationNow);
    const securityOutlook = validateText(parsed.securityOutlook);
    const automationOpportunity = autoOpps.length ? validateText(parsed.automationOpportunity) || null : null;
    if (!situationNow || !securityOutlook || (autoOpps.length > 0 && !automationOpportunity)) {
      return { outcome: rulesOutcome(ledger, matching, ctx.business, estimate), usage };
    }

    return {
      outcome: {
        situationNow, securityOutlook, automationOpportunity,
        automationBenefits: autoOpps.length ? AUTOMATION_BENEFITS : [],
        automationEstimate: autoOpps.length ? estimate : null,
        generatedBy: "claude", generatedAt: new Date().toISOString(),
      },
      usage,
    };
  } catch (err) {
    console.error("[ODO Outcome] Claude failed, using rules outcome:", err instanceof Error ? err.message : err);
    return fallback();
  }
}
