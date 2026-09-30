// ORAGROL ODO — SWOT + executive summary
//
// "Jev makes the judgment call, Claude writes the prose" (§6.1). Claude gets
// the evidence ledger and the tiers Jev/rules already decided, and only
// WORDS them. It does not decide anything:
//   - every SWOT point must cite ≥1 evidence ID that exists in the ledger,
//     or it is dropped (no uncited claims reach a report — §34 counter);
//   - no prices, no competitor names, no guarantees, no fear language
//     (§2 #10 competitor guardrail, §34 "severity inflation");
//   - inferred facts must be worded as possibilities, not facts.
// If Claude is unavailable or returns something unusable, a deterministic
// SWOT is built straight from the ledger — the scan never fails on prose.

import Anthropic from "@anthropic-ai/sdk";
import { ledgerAsText, type Evidence } from "./odo-ledger";
import type { MatchingResult } from "./odo-matching";

export type SwotPoint = { text: string; evidence: string[] };
export type Swot = {
  strengths: SwotPoint[];
  weaknesses: SwotPoint[];
  opportunities: SwotPoint[];
  threats: SwotPoint[];
  summary: string;
  generatedBy: "claude" | "rules";
  droppedPoints: number;
  generatedAt: string;
};

const MODEL = "claude-sonnet-4-6";
const QUADS = ["strengths", "weaknesses", "opportunities", "threats"] as const;

const BANNED = /\$\s?\d|\bprice\b|\bpricing\b|\bcost[s]? (only|just)\b|\bguarantee|\b100%|\bwill be hacked\b|\bimminent\b|\bdisaster\b/i;

function validate(
  raw: unknown,
  ledgerIds: Set<string>,
  forbiddenNames: string[]
): { swot: Omit<Swot, "generatedBy" | "generatedAt"> | null; dropped: number } {
  if (!raw || typeof raw !== "object") return { swot: null, dropped: 0 };
  const r = raw as Record<string, unknown>;
  let dropped = 0;
  const lowerNames = forbiddenNames.map((n) => n.toLowerCase()).filter((n) => n.length > 3);
  const clean = (arr: unknown): SwotPoint[] => {
    if (!Array.isArray(arr)) return [];
    const out: SwotPoint[] = [];
    for (const item of arr) {
      const it = item as { text?: unknown; evidence?: unknown };
      const text = typeof it?.text === "string" ? it.text.trim() : "";
      const ev = Array.isArray(it?.evidence) ? it.evidence.filter((x): x is string => typeof x === "string" && ledgerIds.has(x)) : [];
      const bad = !text || text.length > 320 || ev.length === 0 || BANNED.test(text) || lowerNames.some((n) => text.toLowerCase().includes(n));
      if (bad) { dropped++; continue; }
      out.push({ text, evidence: [...new Set(ev)] });
    }
    return out.slice(0, 6);
  };
  const summary = typeof r.summary === "string" && r.summary.trim().length > 20 && !BANNED.test(r.summary) ? r.summary.trim().slice(0, 900) : "";
  const swot = {
    strengths: clean(r.strengths), weaknesses: clean(r.weaknesses),
    opportunities: clean(r.opportunities), threats: clean(r.threats),
    summary, droppedPoints: 0,
  };
  const total = QUADS.reduce((n, q) => n + swot[q].length, 0);
  if (total === 0 || !summary) return { swot: null, dropped };
  return { swot: { ...swot, droppedPoints: dropped }, dropped };
}

/** Deterministic SWOT straight from the ledger — used when Claude is unavailable. */
export function rulesSwot(ledger: Evidence[], matching: MatchingResult, business: string): Swot {
  const client = ledger.filter((e) => e.audience === "client");
  const sevRank = { high: 0, medium: 1, low: 2, info: 3 } as const;
  const strengths = client.filter((e) => e.polarity === "strength").slice(0, 5).map((e) => ({ text: e.fact, evidence: [e.id] }));
  const gaps = client.filter((e) => e.polarity === "gap").sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
  const weaknesses = gaps.filter((e) => e.tier === "observed").slice(0, 5).map((e) => ({ text: e.fact, evidence: [e.id] }));
  const opportunities = matching.flagged.slice(0, 5).map((m) => ({
    text: `${m.simpleName}: ${m.tier === "recommended" ? "addresses" : "may address"} ${m.reason.replace(/\s*\[[AE]\d+\]/g, "").split(". ")[0].toLowerCase()}`,
    evidence: m.evidenceIds.slice(0, 3),
  }));
  const threats = gaps
    .filter((e) => e.severity === "high" || e.framework)
    .slice(0, 4)
    .map((e) => ({ text: e.tier === "inferred" ? `Possible exposure: ${e.fact}` : `Exposure: ${e.fact}`, evidence: [e.id] }));
  const rec = matching.flagged.filter((m) => m.tier === "recommended").length;
  const worth = matching.flagged.length - rec;
  const summary = matching.outcome === "no_major_gaps"
    ? `Based on public research and your answers, ${business} looks reasonably solid — ODO found no major gaps that call for a specific service right now.`
    : `ODO reviewed ${business}'s public footprint and your answers and found ${gaps.filter((e) => e.tier === "observed").length} confirmed gap(s). ${rec ? `${rec} area(s) are recommended for action` : "No area reached the 'recommended' bar"}${worth ? ` and ${worth} are worth a conversation` : ""}.`;
  return { strengths, weaknesses, opportunities, threats, summary, generatedBy: "rules", droppedPoints: 0, generatedAt: new Date().toISOString() };
}

export async function buildSwot(
  ledger: Evidence[],
  matching: MatchingResult,
  ctx: { business: string; industry: string | null; businessSize: string | null; competitorNames: string[] }
): Promise<Swot> {
  const fallback = () => rulesSwot(ledger, matching, ctx.business);
  if (!process.env.ANTHROPIC_API_KEY) return fallback();

  const clientLedger = ledger.filter((e) => e.audience === "client");
  const flaggedText = matching.flagged.length
    ? matching.flagged.map((m) => `- ${m.simpleName} (${m.tier === "recommended" ? "Recommended" : "Worth exploring"}) — evidence ${m.evidenceIds.join(", ")}`).join("\n")
    : "(none — no service cleared the bar; say so honestly)";

  const system = [
    "You write the SWOT section and a short executive summary for ORAGROL's business discovery report. ORAGROL is a Canadian cybersecurity and business-automation provider. The reader is a small/medium business owner, not a technical person.",
    "Hard rules:",
    "1. Use ONLY facts from the evidence ledger. Every point must list the evidence IDs it rests on (e.g. [\"E3\",\"A2\"]). No ID, no point.",
    "2. Facts tagged 'inferred' must be worded as possibilities (\"may\", \"appears\", \"worth confirming\"), never as confirmed facts.",
    "3. No prices, no competitor names, no guarantees, no fear language, no exclamation marks. Grade severity honestly — informational items are not threats.",
    "4. Opportunities describe what the business could gain by closing gaps or automating work — name ORAGROL services only from the provided list, by their simple name.",
    "5. If there are few gaps, say the business looks solid. Do not pad quadrants: 0–5 points each, only what the evidence supports.",
    "6. Plain English, short sentences, each point under 40 words. Summary: 2–4 sentences.",
    "Return ONLY JSON: {\"summary\": string, \"strengths\": [{\"text\": string, \"evidence\": [ids]}], \"weaknesses\": [...], \"opportunities\": [...], \"threats\": [...]}",
  ].join("\n");

  const user = [
    `Business: ${ctx.business}. Industry: ${ctx.industry ?? "unknown"}. Size: ${ctx.businessSize ?? "unknown"}.`,
    `Outcome: ${matching.outcome === "no_major_gaps" ? "NO MAJOR GAPS FOUND" : "gaps found"}.`,
    "Evidence ledger:",
    ledgerAsText(clientLedger),
    "",
    "Service matches already decided (do not change tiers):",
    flaggedText,
  ].join("\n");

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1800,
      system,
      messages: [{ role: "user", content: user }],
    }, { timeout: 45000 });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("").trim();
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as unknown;
    const { swot } = validate(parsed, new Set(clientLedger.map((e) => e.id)), ctx.competitorNames);
    if (!swot) return fallback();
    return { ...swot, generatedBy: "claude", generatedAt: new Date().toISOString() };
  } catch (err) {
    console.error("[ODO SWOT] Claude failed, using rules SWOT:", err instanceof Error ? err.message : err);
    return fallback();
  }
}
