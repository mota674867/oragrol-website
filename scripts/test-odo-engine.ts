// ODO interview engine — rule tests (Master Reference §37)
//
// Run: npx tsx scripts/test-odo-engine.ts
//
// Feeds the live interview engine SCRIPTED model replies (no API key, no
// cost) and checks that every hard rule Mohammad set holds in code, no
// matter what the model says: the 15-question cap, the skip limit, the
// two-strike nonsense rule, the visitor-question limit, no evidence from
// bad answers, no finishing early, no leaking judgements to the browser.
// This is the rules layer only — whether ODO's QUESTIONS are smart is what
// the persona tests on the preview link are for.

import Anthropic from "@anthropic-ai/sdk";
import {
  openInterview,
  recordVisitorMessage,
  runInterviewTurn,
  publicInterviewView,
  type InterviewContext,
  type InterviewState,
  type ChatMessage,
  type TurnResult,
  uncoveredAreas,
  mostUnderCovered,
  offPlanReason,
} from "../app/lib/odo-interviewer";
import { ENDING_NONSENSE, ENDING_SKIPS, VISITOR_QUESTION_LIMIT_REPLY, AREA_WEIGHTS, AREA_TARGETS, MAX_INTERVIEW_QUESTIONS } from "../app/lib/odo-playbook";
import { answerEvidence } from "../app/lib/odo-ledger";
import { matchServices } from "../app/lib/odo-matching";
import { runLiveCheck } from "../app/lib/odo-live-checks";
import { createReportText, REPORT_MODEL, REPORT_FALLBACK_MODEL } from "../app/lib/odo-report-model";
import { computeCost, addOpusUsage, EMPTY_USAGE } from "../app/lib/odo-cost";
import { industryPackFor } from "../app/lib/odo-industry-depth";
import { jobDescriptionFromTypes, reportableForOptions, type CompetitorProfile } from "../app/lib/odo-competitors";
import { buildSnapshot, buildPosture, buildAutomationSignals, dossierAsText, extractContact, toAutomationLane, type Dossier } from "../app/lib/odo-outbound";
import { coldEmailObservations, coldEmailRecommendation } from "../app/lib/odo-outbound-coldemail";
import { pageServiceName, publicServiceLabel, publicServiceLabels, PAGE_SERVICE_NAMES } from "../app/lib/odo-public-names";
import { buildServiceRecommendations } from "../app/lib/odo-outbound";
import { SERVICE_CATALOG } from "../app/lib/odo-services";
import { SYSTEM_PROMPT, HANDOFF_MARKER, BUSINESS_AUTOMATION_SECTION } from "../app/lib/chat-knowledge";
import { chatCostUsd, CHAT_DAILY_CAP_USD } from "../app/lib/chat-spend";
import { strikeOutcome, OFFTOPIC_MARKER, CHAT_CLOSED_REPLY, CHAT_BLOCKED_REPLY, BLOCK_SECONDS } from "../app/lib/chat-strikes";
import { SERVICE_PACKAGES, INDIVIDUAL_SERVICES, SPECIALIST_ENGAGEMENTS } from "../app/[locale]/services/services-catalog";
import en from "../messages/en.json";
import { readFileSync } from "fs";
import { applyTurn, isDue, CHAT_IDLE_MS, type ChatSession } from "../app/lib/chat-session";
import { verifyQstashSignature } from "../app/lib/chat-qstash";
import { createHash, createHmac } from "node:crypto";
import { renderOutboundDocx } from "../app/lib/odo-outbound-docx";
import { filterLeads } from "../app/lib/odo-outbound-leads";
import type { Evidence } from "../app/lib/odo-ledger";
import type { BusinessProfile } from "../app/lib/odo-business-profile";
import { observed } from "../app/lib/odo-evidence";

process.env.ANTHROPIC_API_KEY = "test-key";

// ── Scripted model ───────────────────────────────────────────────────────────
let script: Array<Record<string, unknown> | "fail" | "garbage"> = [];
let calls = 0;
const proto = (Anthropic as unknown as { Messages: { prototype: Record<string, unknown> } }).Messages.prototype;
proto.create = async function () {
  calls++;
  const next = script.shift();
  if (next === undefined) throw new Error("script exhausted");
  if (next === "fail") throw new Error("simulated API outage");
  if (next !== "garbage" && (next as Record<string, unknown>).__tool) {
    const t = next as { __tool: string; input: Record<string, unknown> };
    return { content: [{ type: "tool_use", id: `tu_${calls}`, name: t.__tool, input: t.input }], stop_reason: "tool_use", usage: { input_tokens: 1000, output_tokens: 50 } };
  }
  const text = next === "garbage" ? "sorry, I can't do JSON today" : JSON.stringify(next);
  return { content: [{ type: "text", text }], stop_reason: "end_turn", usage: { input_tokens: 1000, output_tokens: 200, cache_read_input_tokens: 4000 } };
};

const ctx: InterviewContext = {
  company: "Maple Dental", website: "https://mapledental.example", industry: "Healthcare", businessSize: "small",
  profile: null, complianceSignals: null, researchText: "[E1] (observed, gap, high) No DMARC record published for mapledental.example.",
};

const turn = (over: Record<string, unknown> = {}) => ({
  message_type: "answer",
  assessment: { quality: "valid", note: "", evidence: [{ fact: "Nobody owns IT.", polarity: "gap", severity: "high", area: "governance", supports: ["C01-S04", "NOT-A-CODE"], counters: [] }] },
  urgent: false, quick_win_given: false, intent_question_asked: false,
  reply: "Got it.", action: "ask", question: { text: `Fresh question ${Math.random().toString(36).slice(2)} about ${Math.random().toString(36).slice(2)} topic`, hint: "e.g. something" },
  reason: "test", ...over,
});

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}

async function open(): Promise<{ state: InterviewState; chat: ChatMessage[] }> {
  script = [{ ...turn({ message_type: "none", assessment: null, reply: "I looked at Maple Dental — two clinics in Mississauga.", question: { text: "Who looks after IT for the clinics today?", hint: "e.g. our office manager" } }) }];
  const r = await openInterview(ctx);
  return { state: r.state, chat: r.chat };
}

async function send(st: { state: InterviewState; chat: ChatMessage[] }, input: { kind: "message"; text: string } | { kind: "skip" }, scripted: Array<Record<string, unknown> | "fail" | "garbage">): Promise<TurnResult> {
  script = scripted;
  const rec = recordVisitorMessage(st.state, st.chat, input);
  return runInterviewTurn(ctx, rec.state, rec.chat, input);
}

async function main() {
  console.log("\n1. Opening");
  {
    const s = await open();
    check("opening + first question in the thread", s.chat.length === 2 && s.chat[0].kind === "opening" && s.chat[1].kind === "question");
    check("question 1 pending, counted", s.state.pending?.id === "q1" && s.state.questionsAsked === 1);
    check("version starts at 1", s.state.version === 1);
  }

  console.log("\n2. A valid answer");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "Nobody really, my nephew helps sometimes." }, [turn()]);
    check("continues to question 2", r.outcome === "continue" && r.state.pending?.id === "q2" && r.state.questionsAsked === 2);
    check("evidence recorded as observed", r.state.evidence.length === 1 && r.state.evidence[0].tier === "observed");
    check("invalid catalog codes are stripped", JSON.stringify(r.state.evidence[0].supports) === JSON.stringify(["C01-S04"]));
    check("version moved forward by 2 (visitor msg + ODO reply)", r.state.version === 3);
  }

  console.log("\n3. An unsure answer");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "Not sure, I think so?" }, [turn({ assessment: { quality: "unsure", note: "", evidence: [{ fact: "MFA possibly enabled.", polarity: "strength", severity: "info", area: "identity", supports: [], counters: ["C05-S02"] }] } })]);
    check("hedged answer is never a confirmed fact (tier inferred)", r.state.evidence[0]?.tier === "inferred");
  }

  console.log("\n4. Contradictory answer");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "Everyone uses MFA." }, [turn({ assessment: { quality: "contradictory", note: "earlier said nobody manages IT", evidence: [{ fact: "x", polarity: "strength", severity: "info", area: "identity", supports: [], counters: ["C05-S02"] }] }, action: "clarify" })]);
    check("contradiction produces NO evidence", r.state.evidence.length === 0);
    check("clarifying question is asked and counted", r.state.pending?.id === "q2" && r.state.questionsAsked === 2);
  }

  console.log("\n5. Nonsense — first strike warns, second strike stops");
  {
    const s = await open();
    const r1 = await send(s, { kind: "message", text: "asdfgh" }, [turn({ message_type: "nonsense", assessment: null, action: "reask", question: null, reply: "That doesn't quite answer my question." })]);
    check("1st nonsense: same question re-asked", r1.outcome === "continue" && r1.state.pending?.id === "q1" && r1.state.questionsAsked === 1);
    check("1st nonsense: no evidence", r1.state.evidence.length === 0);
    check("1st nonsense: question shown again in thread", r1.chat[r1.chat.length - 1].kind === "question");
    const r2 = await send({ state: r1.state, chat: r1.chat }, { kind: "message", text: "lol test" }, [turn({ message_type: "nonsense", assessment: null, action: "reask", question: null })]);
    check("2nd nonsense: stops immediately as insufficient", r2.outcome === "insufficient");
    check("2nd nonsense: polite stop message shown", r2.chat[r2.chat.length - 1].text === ENDING_NONSENSE);
    check("2nd nonsense: nothing pending", r2.state.pending === null);
  }

  console.log("\n6. Model calls nonsense 'valid' twice? Code still enforces its own count");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "?" }, [turn({ message_type: "nonsense", assessment: null, action: "ask" })]);
    check("model's 'ask' overridden to re-ask after nonsense", r.state.pending?.id === "q1");
  }

  console.log("\n7. Visitor asks ODO a question");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "Why do you need to know that?" }, [turn({ message_type: "visitor_question", assessment: null, action: "reask", question: null, reply: "Because who owns IT decides everything else." })]);
    check("pending question kept (not counted)", r.state.pending?.id === "q1" && r.state.questionsAsked === 1);
    check("visitor question counted", r.state.visitorQuestions === 1);
    check("no evidence from a question", r.state.evidence.length === 0);
  }

  console.log("\n8. Visitor question limit (6)");
  {
    let s = await open();
    for (let i = 0; i < 6; i++) {
      const r = await send(s, { kind: "message", text: `Question ${i}?` }, [turn({ message_type: "visitor_question", assessment: null, action: "reask", question: null })]);
      s = { state: r.state, chat: r.chat };
    }
    const r7 = await send(s, { kind: "message", text: "One more question?" }, [turn({ message_type: "visitor_question", assessment: null, action: "reask", question: null, reply: "Sure, here's a long answer…" })]);
    check("7th visitor question gets the limit reply", r7.chat[r7.chat.length - 2].text === VISITOR_QUESTION_LIMIT_REPLY);
    check("still on question 1", r7.state.pending?.id === "q1");
  }

  console.log("\n9. Skips — more than 6 ends the scan");
  {
    let s = await open();
    let last: TurnResult | null = null;
    let callsBefore7th = 0;
    for (let i = 0; i < 7; i++) {
      if (i === 6) callsBefore7th = calls;
      last = await send(s, { kind: "skip" }, [turn({ message_type: "none", assessment: null })]);
      s = { state: last.state, chat: last.chat };
      if (last.outcome !== "continue") break;
    }
    check("6 skips allowed, 7th stops as insufficient", last?.outcome === "insufficient" && last.state.skips === 7);
    check("skip-ending message shown", last?.chat[last.chat.length - 1].text === ENDING_SKIPS);
    check("skips never create evidence", (last?.state.evidence.length ?? 1) === 0);
    check("7th skip made no AI call (no money spent ending it)", calls === callsBefore7th);
  }

  console.log("\n10. No finishing before 4 real answers");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "We have an office manager." }, [turn({ action: "finish" })]);
    check("early 'finish' converted to the next question", r.outcome === "continue" && r.state.pending?.id === "q2");
  }

  console.log("\n11. 15-question cap");
  {
    let s = await open();
    let last: TurnResult | null = null;
    for (let i = 0; i < 20; i++) {
      last = await send(s, { kind: "message", text: `Real answer number ${i}` }, [turn()]);
      s = { state: last.state, chat: last.chat };
      if (last.outcome !== "continue") break;
    }
    check("never more than 15 questions", (last?.state.questionsAsked ?? 99) <= 15, `asked ${last?.state.questionsAsked}`);
    check("ends after the 15th answer with finish", last?.outcome === "finish" && last.state.answered === 15);
  }

  console.log("\n12. Final turn too thin → insufficient, not a forced report");
  {
    let s = await open();
    for (let i = 0; i < 14; i++) {
      const r = await send(s, { kind: "skip" }, [turn({ message_type: "none", assessment: null })]);
      s = { state: r.state, chat: r.chat };
      if (r.outcome !== "continue") { s = { state: r.state, chat: r.chat }; break; }
    }
    check("too many skips already ended it honestly", s.state.ended?.outcome === "insufficient");
  }

  console.log("\n13. AI outage → stops honestly, no fallback questions");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "Our IT company handles it." }, ["fail", "fail"]);
    check("outcome failed after one retry", r.outcome === "failed");
    check("no fixed question was injected", r.chat[r.chat.length - 1].role === "visitor");
    const r2 = await send(s, { kind: "message", text: "Our IT company handles it." }, ["garbage", turn()]);
    check("one garbage reply is retried and recovers", r2.outcome === "continue" && r2.state.pending?.id === "q2");
  }

  console.log("\n14. Repeated topic → retried, never shown twice");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "An outside IT company." }, [
      turn({ question: { text: "Who looks after IT for the clinics today?", hint: "" } }),
      turn({ question: { text: "When someone leaves the clinic, who removes their email access?", hint: "" } }),
    ]);
    check("near-duplicate question replaced by a new topic", r.state.pending?.text.startsWith("When someone leaves") === true);
  }

  console.log("\n15. Urgent incident → flagged and reaches the evidence");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "We got ransomware last week." }, [turn({ urgent: true })]);
    const ev = answerEvidence({ _interview: r.state } as never);
    check("urgent flag set", r.state.urgent === true);
    check("forensic-IR evidence added to ledger", ev.some((e) => e.supports?.includes("C10-S04") && e.severity === "high"));
  }

  console.log("\n16. Browser never sees ODO's judgements");
  {
    const s = await open();
    const r = await send(s, { kind: "message", text: "Nobody owns IT." }, [turn()]);
    const pub = JSON.stringify(publicInterviewView(r.state, r.chat));
    check("no evidence, notes, quality or reasons leak", !/evidence|quality|"note"|reasons|judged|Nobody owns IT\.\"/.test(pub.replace(/"text":"[^"]*"/g, "")));
    check("chat + version + progress present", pub.includes("chat_version") && pub.includes("max_questions"));
  }

  console.log("\n17. Recommendations only for CONFIRMED gaps (no fake offers)");
  {
    delete process.env.JEV_API_KEY;
    delete process.env.TYPESAFE_API_KEY;
    const base = { supports: [] as string[], counters: [] as string[], audience: "client" as const, collectedAt: "x", source: "test" };
    const guessOnly = [
      { ...base, id: "A1", fact: "Visitor unsure whether backups exist.", tier: "inferred" as const, polarity: "gap" as const, severity: "medium" as const, area: "data" as const, supports: ["C08-S01"] },
      { ...base, id: "E1", fact: "Handles patient records.", tier: "observed" as const, polarity: "context" as const, severity: "info" as const, area: "data" as const, supports: ["C08-S03", "C01-S02"] },
    ];
    const m1 = await matchServices(guessOnly, { industry: "Healthcare", businessSize: "small" });
    check("hedged gap + context only → nothing recommended", m1.flagged.length === 0);
    check("…and the outcome is 'no major gaps'", m1.outcome === "no_major_gaps");
    const confirmed = [...guessOnly, { ...base, id: "A2", fact: "No backups exist.", tier: "observed" as const, polarity: "gap" as const, severity: "high" as const, area: "data" as const, supports: ["C08-S01"] }];
    const m2 = await matchServices(confirmed, { industry: "Healthcare", businessSize: "small" });
    check("a confirmed gap → that service is recommended", m2.flagged.some((f) => f.code === "C08-S01" && f.tier === "recommended"));
    check("context alone still never flags anything", !m2.flagged.some((f) => f.code === "C08-S03" || f.code === "C01-S02"));
  }

  console.log("\n18. Live check mid-interview (§37.3)");
  {
    const s = await open();
    const activities: string[] = [];
    script = [{ __tool: "check_email_security", input: {} }, turn()];
    const rec = recordVisitorMessage(s.state, s.chat, { kind: "message", text: "We set up DMARC last week." });
    const r = await runInterviewTurn(ctx, rec.state, rec.chat, { kind: "message", text: "We set up DMARC last week." }, { onActivity: (a) => { activities.push(a); } });
    check("turn completes after the check", r.outcome === "continue" && r.state.pending?.id === "q2");
    check("visitor saw what ODO was doing", activities[0] === "ODO is checking your email security records…");
    check("check recorded for the reviewer", r.state.liveChecks?.length === 1 && r.state.liveChecks[0].tool === "check_email_security");
    check("activity cleared once ODO replies", r.state.activity === null);
  }

  console.log("\n19. Live checks can't be steered at someone else's domain");
  {
    const out1 = await runLiveCheck("check_email_security", { domain: "competitor-clinic.example" }, { website: "https://mapledental.example", visitorText: "We use Jane App." });
    check("unmentioned third-party domain refused", out1.startsWith("Refused"));
    const out2 = await runLiveCheck("read_own_site_page", { url: "https://evil.example/admin" }, { website: "https://mapledental.example", visitorText: "see evil.example" });
    check("page reads limited to their own site, even if mentioned", out2.startsWith("Refused"));
    const out3 = await runLiveCheck("read_own_site_page", { url: "http://169.254.169.254/latest/meta-data" }, { website: "https://mapledental.example", visitorText: "" });
    check("cloud-metadata address refused", out3.startsWith("Refused"));
    const out4 = await runLiveCheck("check_email_security", { domain: "mail.mapledental.example" }, { website: "https://mapledental.example", visitorText: "" });
    check("own subdomain allowed (no refusal)", !out4.startsWith("Refused"));
  }

  console.log("\n20. Check budget: model can't loop on tools forever");
  {
    const s = await open();
    script = [{ __tool: "web_search", input: { query: "a" } }, { __tool: "web_search", input: { query: "b" } }, { __tool: "web_search", input: { query: "c" } }, turn()];
    const rec = recordVisitorMessage(s.state, s.chat, { kind: "message", text: "We use Jane App." });
    const r = await runInterviewTurn(ctx, rec.state, rec.chat, { kind: "message", text: "We use Jane App." });
    check("at most 2 rounds of checks, then a forced answer", (r.state.liveChecks?.length ?? 0) <= 2 && r.outcome === "continue");
  }

  console.log("\n21. Quick win is kept for the report");
  {
    const s = await open();
    script = [turn({ quick_win_given: true, quick_win: "Turn on MFA for the admin mailbox first." }), turn({ quick_win_given: true, quick_win: "A second tip." })];
    let rec = recordVisitorMessage(s.state, s.chat, { kind: "message", text: "Nobody really owns IT here." });
    let r = await runInterviewTurn(ctx, rec.state, rec.chat, { kind: "message", text: "Nobody really owns IT here." });
    check("first quick win stored", r.state.quickWin === "Turn on MFA for the admin mailbox first.");
    rec = recordVisitorMessage(r.state, r.chat, { kind: "message", text: "We use Microsoft 365 for email." });
    r = await runInterviewTurn(ctx, rec.state, rec.chat, { kind: "message", text: "We use Microsoft 365 for email." });
    check("only ONE quick win per scan (second ignored)", r.state.quickWin === "Turn on MFA for the admin mailbox first.");
  }

  console.log("\n22. Report text: Opus first, Sonnet if Opus is unavailable, cheap when over the $2 cap");
  {
    const seen: string[] = [];
    const prev = proto.create as (...args: unknown[]) => Promise<unknown>;
    proto.create = async function (params: { model: string }) {
      seen.push(params.model);
      if (params.model === REPORT_MODEL && seen.length === 1) throw new Error("model not available");
      return { content: [{ type: "text", text: "{}" }], usage: { input_tokens: 100, output_tokens: 10 } };
    };
    const a = await createReportText({ max_tokens: 10, messages: [{ role: "user", content: "x" }] }, 1000);
    check("falls back to Sonnet when Opus fails", a.usage.model === REPORT_FALLBACK_MODEL && seen[0] === REPORT_MODEL);
    const b = await createReportText({ max_tokens: 10, messages: [{ role: "user", content: "x" }] }, 1000);
    check("uses Opus when available", b.usage.model === REPORT_MODEL);
    const c = await createReportText({ max_tokens: 10, messages: [{ role: "user", content: "x" }] }, 1000, true);
    check("over the $2 cap → Sonnet, no Opus call", c.usage.model === REPORT_FALLBACK_MODEL && seen[seen.length - 1] === REPORT_FALLBACK_MODEL);
    proto.create = prev;
    const cost = computeCost(addOpusUsage(EMPTY_USAGE, { input_tokens: 1_000_000, output_tokens: 1_000_000 }));
    check("Opus priced at $4 in + $20 out per 1M", cost.totalCostUsd === 24);
  }

  console.log("\n23. Industry depth packs");
  {
    check("dental clinic → clinic pack", industryPackFor("Dental clinic")?.id === "clinic");
    check("law firm → law pack", industryPackFor("Law firm")?.id === "law");
    check("bookkeeping (from what they sell) → accounting pack", industryPackFor(null, "Bookkeeping and payroll for small businesses")?.id === "accounting");
    check("bakery → no pack (general interview)", industryPackFor("Bakery", "Fresh bread and cakes") === null);
    check("'lawn care' is not a law firm", industryPackFor("Lawn care") === null);
    const seenPrompts: string[] = [];
    const prev = proto.create as (...args: unknown[]) => Promise<unknown>;
    proto.create = async function (params: { messages: Array<{ content: unknown }> }) {
      seenPrompts.push(JSON.stringify(params.messages[0]?.content ?? ""));
      return prev.call(this, params);
    };
    script = [turn()];
    await open();
    proto.create = prev;
    check("clinic guidance reaches the interviewer for a dental clinic", seenPrompts.some((p) => p.includes("Industry depth")));
  }

  console.log("\n24. Five areas: the split itself");
  {
    const w = Object.values(AREA_WEIGHTS).reduce((a, b) => a + b, 0);
    check("weights are IT 35 / Marketing 25 / Sales 15 / Finance 15 / CS 10", AREA_WEIGHTS.it === 0.35 && AREA_WEIGHTS.marketing === 0.25 && AREA_WEIGHTS.sales === 0.15 && AREA_WEIGHTS.finance === 0.15 && AREA_WEIGHTS.customer_service === 0.1 && Math.abs(w - 1) < 1e-9);
    const t = Object.values(AREA_TARGETS).reduce((a, b) => a + b, 0);
    check("area budgets + 1 buying-intent question = the 15-question cap", t + 1 === MAX_INTERVIEW_QUESTIONS);
  }

  console.log("\n25. Five areas: every question is counted in its area");
  {
    script = [turn({ message_type: "none", assessment: null, reply: "Hello.", question: { text: "Who looks after IT today?", hint: "", area: "it" } })];
    const o = await openInterview(ctx);
    check("opening question counted in IT", o.state.areaCounts?.it === 1);
    const rec = recordVisitorMessage(o.state, o.chat, { kind: "message", text: "Our office manager does." });
    script = [turn({ question: { text: "When a new patient finds you, how did they usually hear about you?", hint: "", area: "marketing" } })];
    const r = await runInterviewTurn(ctx, rec.state, rec.chat, { kind: "message", text: "Our office manager does." });
    check("next question counted in Marketing", r.state.areaCounts?.marketing === 1 && r.state.areaCounts?.it === 1);
    check("area recorded on the pending question", r.state.pending?.area === "marketing");
    const seen: string[] = [];
    const prev = proto.create as (...args: unknown[]) => Promise<unknown>;
    proto.create = async function (params: { messages: Array<{ content: unknown }> }) {
      seen.push(JSON.stringify(params.messages[0]?.content ?? ""));
      return prev.call(this, params);
    };
    const rec2 = recordVisitorMessage(r.state, r.chat, { kind: "message", text: "Mostly Google and referrals." });
    script = [turn({ question: { text: "Walk me through what happens after someone asks for a quote.", hint: "", area: "sales" } })];
    await runInterviewTurn(ctx, rec2.state, rec2.chat, { kind: "message", text: "Mostly Google and referrals." });
    proto.create = prev;
    check("ODO is shown the coverage each turn", seen.some((p) => p.includes("Area coverage") && p.includes("No question yet")));
  }

  console.log("\n26. Five areas: an area can't take more than its share");
  {
    const base = { ...(await open()).state, questionsAsked: 5, areaCounts: { it: 5 } };
    check("6th IT question is off-plan", offPlanReason(base, "it", "ask") !== null);
    check("a Marketing question is fine", offPlanReason(base, "marketing", "ask") === null);
    check("a clarification is exempt from the share limit", offPlanReason(base, "it", "clarify") === null);
    check("the buying-intent question counts toward no area", offPlanReason(base, "general", "ask") === null);
    check("most under-covered after 5 IT questions is Marketing", mostUnderCovered(base) === "marketing");

    const st = await open();
    const s5 = { ...st.state, questionsAsked: 5, areaCounts: { it: 5 } };
    const rec = recordVisitorMessage(s5, st.chat, { kind: "message", text: "We back up to a USB drive on Fridays." });
    script = [
      turn({ question: { text: "Who has admin rights on the clinic computers?", hint: "", area: "it" } }),
      turn({ question: { text: "How do new patients usually find you?", hint: "", area: "marketing" } }),
    ];
    const r = await runInterviewTurn(ctx, rec.state, rec.chat, { kind: "message", text: "We back up to a USB drive on Fridays." });
    check("over-share IT draft is replaced by a Marketing question", r.state.pending?.area === "marketing" && r.state.areaCounts?.it === 5 && r.state.areaCounts?.marketing === 1);
  }

  console.log("\n27. Five areas: no finishing while an area has had no question");
  {
    const st = await open();
    const s6 = { ...st.state, questionsAsked: 6, answered: 5, areaCounts: { it: 3, marketing: 2, sales: 1 } };
    check("uncovered areas are Finance and Customer service", JSON.stringify(uncoveredAreas(s6)) === JSON.stringify(["finance", "customer_service"]));
    let rec = recordVisitorMessage(s6, st.chat, { kind: "message", text: "We use a spreadsheet for leads." });
    script = [
      turn({ action: "finish", question: null, reply: "Thanks, that's everything." }),
      turn({ message_type: "none", assessment: null, action: "ask", reply: "One more area.", question: { text: "How do invoices go out and get chased today?", hint: "", area: "finance" } }),
    ];
    let r = await runInterviewTurn(ctx, rec.state, rec.chat, { kind: "message", text: "We use a spreadsheet for leads." });
    check("early finish turned into a Finance question", r.outcome === "continue" && r.state.pending?.area === "finance");
    check("the closing line was not sent to the visitor", !r.chat.some((m) => m.text.includes("that's everything")));

    rec = recordVisitorMessage(s6, st.chat, { kind: "message", text: "We use a spreadsheet for leads." });
    script = [turn({ action: "finish", question: null }), turn({ action: "finish", question: null })];
    r = await runInterviewTurn(ctx, rec.state, rec.chat, { kind: "message", text: "We use a spreadsheet for leads." });
    check("if ODO still won't continue, it finishes — never loops", r.outcome === "finish");
    check("…and the gap is logged for your review", r.state.reasons.some((x) => x.includes("uncovered areas")));

    const s14 = { ...st.state, questionsAsked: 14, answered: 13, areaCounts: { it: 5, marketing: 4, sales: 2, finance: 2 } };
    check("last slots are reserved for an uncovered area", offPlanReason(s14, "it", "clarify") !== null && offPlanReason(s14, "customer_service", "ask") === null);
  }

  console.log("\n28. Outbound: company snapshot, widened competitors, posture & automation");
  {
    const ev = (p: Partial<Evidence> & Pick<Evidence, "fact" | "polarity" | "severity" | "area">): Evidence => ({
      id: "E0", source: "test", tier: "observed", supports: [], counters: [], audience: "client", collectedAt: new Date().toISOString(), ...p,
    });

    check("jobDescriptionFromTypes strips generic types and formats the rest", jobDescriptionFromTypes(["point_of_interest", "establishment", "accounting", "finance"]) === "Accounting, Finance");
    check("jobDescriptionFromTypes is empty when only generic types given", jobDescriptionFromTypes(["point_of_interest", "establishment"]) === "");

    const confirmed: CompetitorProfile = { name: "Riverside Tax", website: null, discoverySources: ["tavily"], identity: observed({ rating: 4.5, reviewCount: 10, address: null, businessStatus: null, types: [], phone: null, website: null }, "places"), serviceOverlap: { matchedKeywords: ["tax"], score: 1 }, geographicOverlap: true, classification: "confirmed_competitor", reasoning: "" };
    const comparable1: CompetitorProfile = { ...confirmed, name: "Clearview Financial", classification: "comparable_business" };
    const comparable2: CompetitorProfile = { ...confirmed, name: "GTA Numbers", classification: "comparable_business" };
    const irrelevant: CompetitorProfile = { ...confirmed, name: "Random Cafe", classification: "irrelevant_candidate" };
    const pool = [confirmed, comparable1, comparable2, irrelevant];

    check("default options (3, strict) never include comparable_business", reportableForOptions(pool, { targetCount: 3, allowComparable: false }).every((p) => p.classification !== "comparable_business"));
    check("allowComparable fills remaining slots after confirmed/probable", reportableForOptions(pool, { targetCount: 5, allowComparable: true }).length === 3 && reportableForOptions(pool, { targetCount: 5, allowComparable: true }).some((p) => p.classification === "comparable_business"));
    check("irrelevant_candidate never reaches the dossier either way", !reportableForOptions(pool, { targetCount: 5, allowComparable: true }).some((p) => p.name === "Random Cafe"));

    const highGapLedger: Evidence[] = [ev({ fact: "No DMARC record published.", polarity: "gap", severity: "high", area: "email" })];
    check("one high-severity IT gap reads as WEAK", buildPosture(highGapLedger).verdict === "weak" && buildPosture(highGapLedger).summary.startsWith("WEAK"));

    const cleanLedger: Evidence[] = [ev({ fact: "Valid SSL/TLS on all pages.", polarity: "strength", severity: "info", area: "web" }), ev({ fact: "MFA enforced.", polarity: "strength", severity: "info", area: "identity" })];
    check("no gaps, strengths present reads as STRONG", buildPosture(cleanLedger).verdict === "strong");
    check("posture is computed from IT/security areas only, not marketing", buildPosture([ev({ fact: "No CRM visible.", polarity: "gap", severity: "low", area: "marketing" })]).verdict === "strong");

    const profileWithTools: BusinessProfile = { whatTheySell: "Bookkeeping", businessModel: "B2B", priceLevel: "mid-market", audienceDescription: "small businesses", locations: ["Mississauga, ON"], sizeSignals: [], sensitiveDataTypes: [], toolsOrPlatformsMentioned: ["HubSpot CRM", "Calendly"], industryGuess: "Accounting & bookkeeping", unknowns: [], summary: "A boutique bookkeeping firm.", pagesRead: [], generatedBy: "claude" };
    const autoWithTools = buildAutomationSignals(profileWithTools, []);
    check("known automation tools are detected from the business profile", autoWithTools.detected.length === 2);
    check("automation note says tooling was found", autoWithTools.note.includes("Visible tooling found"));

    const profileNoTools: BusinessProfile = { ...profileWithTools, toolsOrPlatformsMentioned: [] };
    const autoNoTools = buildAutomationSignals(profileNoTools, []);
    check("no tools mentioned -> nothing detected", autoNoTools.detected.length === 0);
    check("automation note is honest about public-only visibility", autoNoTools.note.includes("publicly visible") || autoNoTools.note.includes("Publicly-visible"));

    const snap = buildSnapshot(profileWithTools, "small");
    check("snapshot focus uses the industry guess", snap?.focus === "Accounting & bookkeeping");
    check("snapshot description includes the AI-written summary", (snap?.description ?? "").includes("A boutique bookkeeping firm."));
    check("snapshot is null when there's no business profile", buildSnapshot(null, null) === null);

    const fakeDossier: Dossier = {
      kind: "odo_outbound_dossier", version: 3, runAt: new Date().toISOString(), company: "Maple Ridge Bookkeeping", website: "mapleridgebooks.ca", domain: "mapleridgebooks.ca",
      notice: "notice text", industry: "Accounting", businessSize: "small", snapshot: snap,
      competitors: [{ name: "Riverside Tax & Accounting", website: "riversidetax.ca", phone: "416-555-0100", email: "info@riversidetax.ca", jobDescription: "Accounting firm, Tax preparation service", confidence: "verified" }],
      recommendations: [{ name: "Email protection setup", group: "security", tier: "recommended", reason: "No DMARC record published for the domain." }],
      posture: buildPosture(highGapLedger), automation: autoWithTools,
      gaps: [], strengths: [], context: [], notDetermined: [], changes: null, aiCostUsd: 0.31,
    };
    const text = dossierAsText(fakeDossier);
    check("dossier text includes the Company Snapshot section", text.includes("COMPANY SNAPSHOT") && text.includes("Accounting & bookkeeping"));
    check("dossier text includes competitors with contact details", text.includes("Riverside Tax & Accounting") && text.includes("riversidetax.ca") && text.includes("416-555-0100") && text.includes("info@riversidetax.ca"));
    check("dossier text names the best-matching ORAGROL services", text.includes("BEST-MATCHING ORAGROL SECURITY SERVICES") && text.includes("Email protection setup") && text.includes("RECOMMENDED"));
    check("dossier text includes posture & automation at a glance", text.includes("POSTURE & AUTOMATION AT A GLANCE") && text.includes("WEAK") && text.includes("HubSpot CRM"));
  }

  console.log("\n29. Outbound: open-area leads, contact extraction, labels");
  {
    const hits = [
      { title: "Top accountants in Toronto", url: "https://directory.example/top", content: "Brightline Bookkeeping, Riverside Tax" },
      { title: "Brightline Bookkeeping", url: "https://www.brightlinebooks.ca/", content: "Bookkeeping for small business" },
    ];
    const leads = filterLeads(
      [
        { name: "Brightline Bookkeeping", website: "https://brightlinebooks.ca", whatTheyDo: "Bookkeeping for small business" },
        { name: "Riverside Tax", website: "https://riversidetax.ca", whatTheyDo: "Tax prep" },
        { name: "Target Co", website: "https://target.ca", whatTheyDo: "the target itself" },
        { name: "brightline bookkeeping", website: null, whatTheyDo: "duplicate name" },
        { name: "", website: null, whatTheyDo: "nameless" },
      ],
      hits.concat([{ title: "Target", url: "https://target.ca/", content: "" }]),
      ["target.ca"],
      5,
    );
    check("a website that really appeared in the results is kept", leads.find((l) => l.name === "Brightline Bookkeeping")?.website === "https://brightlinebooks.ca");
    check("a website NOT in the results is dropped to null, never guessed", leads.find((l) => l.name === "Riverside Tax")?.website === null);
    check("the target company itself is excluded", !leads.some((l) => l.name === "Target Co"));
    check("duplicate and nameless entries are dropped", leads.length === 2);
    check("the limit is respected", filterLeads([{ name: "A" }, { name: "B" }, { name: "C" }], [], [], 2).length === 2);

    const c = extractContact('<p>Call us (416) 555-0100 or write <a href="mailto:hello@brightlinebooks.ca">hello@brightlinebooks.ca</a></p><img src="logo@2x.png">');
    check("public email is extracted, image filenames ignored", c.email === "hello@brightlinebooks.ca");
    check("North American phone number is extracted", c.phone === "(416) 555-0100");
    check("no contact on the page gives nulls", extractContact("<p>Nothing here</p>").email === null && extractContact("<p>Nothing here</p>").phone === null);

    const pdfDossier: Dossier = {
      kind: "odo_outbound_dossier", version: 3, runAt: new Date().toISOString(), company: "Maple Ridge Bookkeeping", website: "mapleridgebooks.ca", domain: "mapleridgebooks.ca",
      notice: "notice", industry: "Accounting", businessSize: "small", snapshot: null,
      competitors: [{ name: "Brightline Bookkeeping", website: null, phone: null, email: null, jobDescription: "Bookkeeping", confidence: "unverified" }],
      recommendations: [{ name: "Email protection setup", group: "security", tier: "recommended", reason: "No DMARC record." }],
      posture: buildPosture([]), automation: { detected: [], note: "none" },
      gaps: [{ fact: "No DMARC \u2717 record published.", proof: "dmarc absent", source: "DNS", checkedAt: new Date().toISOString(), kind: "gap", severity: "high", area: "email", confidence: "high", key: "k" }],
      strengths: [], context: [], notDetermined: [], changes: null, aiCostUsd: 0.2,
    };
    check("unverified competitors are labelled in the text report", dossierAsText(pdfDossier).includes("UNVERIFIED"));

    // 30. Package pick (OR ONE / BA bundle / Tailored) + Word file
    const orOne = toAutomationLane({ kind: "or_one", reason: "broad need" });
    check("OR ONE lane keeps the real name", orOne?.name === "OR ONE" && orOne.kind === "or_one");
    const bundle = toAutomationLane({ kind: "bundle", bundle: { id: "finance", name: "Finance", tagline: "Know Your Numbers" }, matchedCodes: ["C13-S01"], reason: "r" });
    check("bundle lane uses the BA bundle name + tagline", bundle?.name === "Business Automation: Finance" && bundle.tagline === "Know Your Numbers");
    check("tailored lane named Tailored Automation", toAutomationLane({ kind: "tailored", matchedCodes: [], reason: "r" })?.name === "Tailored Automation");
    check("no lane when nothing to recommend", toAutomationLane({ kind: "none" }) === null);
    const withLane: Dossier = { ...pdfDossier, automationLane: bundle };
    check("text report shows the package section", dossierAsText(withLane).includes("Business Automation: Finance"));
    const docxBuf = await renderOutboundDocx(withLane);
    const obsList = coldEmailObservations(withLane);
    check("cold-email PDF uses only observed high-confidence gaps, glyph-clean", obsList.length === 1 && !obsList[0].includes("\u2717"));
    check("cold-email PDF names the package pick, never competitors", coldEmailRecommendation(withLane)?.name === "Business Automation: Finance");
    // 31. Public names only
    const secCodes = SERVICE_CATALOG.filter((x) => x.group === "security" && x.code !== "C01-S01");
    check("every security code (C02-C10) has a name on the live Services page", secCodes.every((x) => { const n = pageServiceName(x.code); return n !== null && PAGE_SERVICE_NAMES.has(n); }));
    check("C02-S01 reads 'Security Weakness Check', not 'Vuln Watch'", pageServiceName("C02-S01") === "Security Weakness Check");
    check("C05-S05 reads the page name, not 'Trust Guard'", pageServiceName("C05-S05") === "Zero Trust Access Security");
    check("automation items surface only as a BA bundle or OR ONE", SERVICE_CATALOG.filter((x) => x.group === "automation").every((x) => /^(Business Automation: (Sales|Customer Service|Finance|IT|Marketing)|OR ONE)$/.test(publicServiceLabel(x.code))));
    check("labels are de-duplicated", publicServiceLabels(["C14-S01", "C14-S02", "C12-S01"]).length === 1);
    const flaggedSample = ["C04-S02", "C05-S05", "C02-S01", "C12-S01"].map((code) => { const x = SERVICE_CATALOG.find((y) => y.code === code)!; return { code, simpleName: x.simpleName, category: x.category, group: x.group, tier: "recommended" as const, reason: "r [E1]" }; });
    const recs = buildServiceRecommendations(flaggedSample);
    check("outbound picks ONE security package, Foundation for a small spread", recs[0].name === "Foundation package");
    const internal = SERVICE_CATALOG.filter((x) => pageServiceName(x.code) !== x.simpleName && x.simpleName !== x.officialName).map((x) => x.simpleName);
    check("no internal shorthand appears in outbound recommendations", recs.every((r) => !internal.includes(r.name) && !r.reason.includes("[E1]")));
    check("automation items are never listed individually in outbound", recs.every((r) => r.group === "security"));
    // 32. Live chat knowledge follows the site
    check("chat knows all 4 packages with live prices", SERVICE_PACKAGES.every((p) => SYSTEM_PROMPT.includes(p.name) && SYSTEM_PROMPT.includes(p.price.toLocaleString("en-CA"))));
    check("chat knows every individual service and specialist engagement", INDIVIDUAL_SERVICES.every((x) => SYSTEM_PROMPT.includes(x.name)) && SPECIALIST_ENGAGEMENTS.every((x) => SYSTEM_PROMPT.includes(x.name)));
    const faqItems = (en as unknown as { Faq: { groups: { items: { q: string }[] }[] } }).Faq.groups.flatMap((g) => g.items);
    check(`chat carries every live FAQ question (${faqItems.length})`, faqItems.length >= 30 && faqItems.every((i) => SYSTEM_PROMPT.includes(i.q)));
    check("chat offers ODO at /scan and has the hand-off marker", SYSTEM_PROMPT.includes("/scan") && SYSTEM_PROMPT.includes("OR Discovery & Opportunity Agent") && SYSTEM_PROMPT.includes(HANDOFF_MARKER));
    check("old stale chat figures are gone", !SYSTEM_PROMPT.includes("Risk Check $4,500") && !SYSTEM_PROMPT.includes("42 services across 10"));
    check("chat says English only", /English only/.test(SYSTEM_PROMPT));
    const baSrc = readFileSync("app/[locale]/business-automation/ba-client.tsx", "utf8");
    const builds = [...baSrc.matchAll(/buildCAD:\s*(\d+)/g)].map((m) => Number(m[1])).filter((n) => n > 0);
    const monthly = [...baSrc.matchAll(/monthlyLabel:\s*\{\s*en:\s*"(\$[\d,]+)/g)].map((m) => m[1]);
    check("chat's Business Automation numbers match ba-client.tsx", builds.length === 5 && builds.every((b) => BUSINESS_AUTOMATION_SECTION.includes("$" + b.toLocaleString("en-CA"))) && monthly.length === 5 && monthly.every((mm) => BUSINESS_AUTOMATION_SECTION.includes(mm)));
    check("chat cost math: 10k in + 200 out ~ $0.033", Math.abs(chatCostUsd({ input: 10000, output: 200, cacheRead: 0, cacheWrite: 0 }) - 0.033) < 1e-9);
    check("daily chat cap is $5", CHAT_DAILY_CAP_USD === 5);
    // 32. Chat saving + 15-minute silent close
    const contact = { name: "Sam Lee", email: "sam@example.ca", company: "Lee Co", sendCopy: true };
    const t0 = 1_000_000;
    const first = applyTurn(null, { sessionId: "chat_abc12345", contact, requestMessages: [{ role: "oragrol", text: "Hi Sam" }, { role: "visitor", text: "What is Foundation?" }], reply: "Foundation is our entry package." }, t0);
    check("first turn saves greeting, question and reply in order", first.messages.map((m) => m.content).join("|") === "Hi Sam|What is Foundation?|Foundation is our entry package." && first.version === 1);
    const second = applyTurn(first, { sessionId: "chat_abc12345", contact, requestMessages: [{ role: "visitor", text: "And Advanced?" }], reply: "Advanced adds six services." }, t0 + 60_000);
    check("next turn appends exactly the new visitor message + reply, version bumps", second.messages.length === 5 && second.version === 2 && second.messages[3].content === "And Advanced?");
    check("not due before 15 minutes of silence", !isDue(second, t0 + 60_000 + CHAT_IDLE_MS - 1));
    check("due at 15 minutes of silence", isDue(second, t0 + 60_000 + CHAT_IDLE_MS));
    check("a chat already sent is never due again", !isDue({ ...second, sent: true } as ChatSession, t0 + 10 * CHAT_IDLE_MS));
    const back = applyTurn({ ...second, sent: true, escalated: true }, { sessionId: "chat_abc12345", contact, requestMessages: [{ role: "visitor", text: "One more thing" }], reply: "Of course." }, t0 + 3_600_000);
    check("returning after a sent transcript starts a fresh segment", back.segment === 1 && back.messages.length === 2 && !back.sent && !back.escalated);

    const KEY = "test-signing-key";
    const b64 = (x: Buffer | string) => Buffer.from(x).toString("base64url");
    const sign = (body: string, over: Record<string, unknown> = {}, key = KEY) => {
      const h = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const p = b64(JSON.stringify({ iss: "Upstash", sub: "https://orgro.ca/api/chat-sweep", exp: 2_000_000_000, nbf: 1, body: createHash("sha256").update(body).digest("base64url"), ...over }));
      return `${h}.${p}.${createHmac("sha256", key).update(`${h}.${p}`).digest("base64url")}`;
    };
    const now = 1_700_000_000;
    const body = JSON.stringify({ sessionId: "chat_abc12345", version: 2 });
    check("QStash signature accepted (current or next key)", verifyQstashSignature(sign(body), body, ["other", KEY], now) && verifyQstashSignature(sign(body), body, [undefined, KEY], now));
    check("QStash signature rejects a tampered body", !verifyQstashSignature(sign(body), body.replace("2", "3"), [KEY], now));
    check("QStash signature rejects the wrong key, expiry, and a different endpoint", !verifyQstashSignature(sign(body, {}, "bad"), body, [KEY], now) && !verifyQstashSignature(sign(body, { exp: 5 }), body, [KEY], now) && !verifyQstashSignature(sign(body, { sub: "https://orgro.ca/api/other" }), body, [KEY], now));
    check("QStash signature rejects a missing header", !verifyQstashSignature(null, body, [KEY], now));

    check("Chat quotes the exact public OR ONE tier prices (100 = $75,000 + $3,999/mo)", /OR ONE 100[^\n]*\$75,000[^\n]*\$3,999/.test(SYSTEM_PROMPT) && /OR ONE Starter[^\n]*\$22,000[^\n]*\$999/.test(SYSTEM_PROMPT) && /OR ONE 400[^\n]*\$220,000[^\n]*\$8,999/.test(SYSTEM_PROMPT) && !/never state an exact OR ONE number/.test(SYSTEM_PROMPT));
    check("Off-topic strikes: 1st polite, 2nd warns, 3rd closes", strikeOutcome(1) === "polite" && strikeOutcome(2) === "warn" && strikeOutcome(3) === "close" && strikeOutcome(5) === "close");
    check("Off-topic block lasts 7 days; closing/blocked messages show no email and point to the contact page", BLOCK_SECONDS === 7 * 86400 && !/@/.test(CHAT_CLOSED_REPLY + CHAT_BLOCKED_REPLY) && /contact page/.test(CHAT_CLOSED_REPLY) && /contact page/.test(CHAT_BLOCKED_REPLY));
    check("Chat prompt teaches the unrelated-message marker and says on-topic cyber/IT questions don't count", SYSTEM_PROMPT.includes(OFFTOPIC_MARKER) && /General cybersecurity, IT or business questions are NOT unrelated/.test(SYSTEM_PROMPT));

    check("Word file is a real .docx (zip)", docxBuf.length > 2000 && docxBuf[0] === 0x50 && docxBuf[1] === 0x4b);
  }

  console.log(`\n${passed} passed, ${failed} failed (${calls} scripted model calls)\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
