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
} from "../app/lib/odo-interviewer";
import { ENDING_NONSENSE, ENDING_SKIPS, VISITOR_QUESTION_LIMIT_REPLY } from "../app/lib/odo-playbook";
import { answerEvidence } from "../app/lib/odo-ledger";
import { matchServices } from "../app/lib/odo-matching";
import { runLiveCheck } from "../app/lib/odo-live-checks";
import { createReportText, REPORT_MODEL, REPORT_FALLBACK_MODEL } from "../app/lib/odo-report-model";
import { computeCost, addOpusUsage, EMPTY_USAGE } from "../app/lib/odo-cost";
import { industryPackFor } from "../app/lib/odo-industry-depth";

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
    const prev = proto.create;
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
    const prev = proto.create;
    proto.create = async function (params: { messages: Array<{ content: unknown }> }) {
      seenPrompts.push(JSON.stringify(params.messages[0]?.content ?? ""));
      return prev.apply(this, [params] as never);
    };
    script = [turn()];
    await open();
    proto.create = prev;
    check("clinic guidance reaches the interviewer for a dental clinic", seenPrompts.some((p) => p.includes("Industry depth")));
  }

  console.log(`\n${passed} passed, ${failed} failed (${calls} scripted model calls)\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
