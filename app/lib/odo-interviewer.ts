// ORAGROL ODO — Live interview engine (rebuilt 2026-10-03, Master Reference §37)
//
// One visitor message in → one Claude turn → ODO's reply + next move out.
// Claude (driven by odo-playbook.ts) judges the message and writes ODO's
// words; THIS file enforces every rule Mohammad set as a hard limit, in
// code, so no model output can talk its way past them:
//
//   - 15-question cap                              (§37.2)
//   - more than 6 "Prefer not to answer" → stop      (§37.2)
//   - nonsense once → polite warning; twice → stop   (§37.3)
//   - visitor may ask up to 6 questions, not counted  (§37.5)
//   - no finishing before a minimum of real answers
//   - contradictory / nonsense answers produce NO evidence
//   - AI unavailable → the scan stops honestly. There is NO fixed-question
//     fallback anywhere (§37.2: "no need a fix library at all").
//
// State lives on the session (findings._interview + findings._chat) and is
// versioned: every change a visitor could see bumps `version`, which is how
// the browser tells a fresh update from a stale one (the old UI's
// "answered question flashes back" bug class can't recur).

import Anthropic from "@anthropic-ai/sdk";
import {
  PLAYBOOK,
  OPENING_INSTRUCTION,
  MAX_INTERVIEW_QUESTIONS,
  MAX_SKIPS,
  MAX_VISITOR_QUESTIONS,
  MIN_ANSWERS_BEFORE_FINISH,
  ENDING_NONSENSE,
  ENDING_SKIPS,
  ENDING_JUDGED_INSUFFICIENT,
  NONSENSE_FALLBACK_REPLY,
  VISITOR_QUESTION_LIMIT_REPLY,
} from "./odo-playbook";
import type { AnswerEvidenceTemplate } from "./odo-questions";
import type { BusinessProfile } from "./odo-business-profile";
import type { ComplianceSignal } from "./odo-industry-rules";
import type { Area, Polarity, Severity } from "./odo-ledger";
import { SERVICE_BY_CODE } from "./odo-services";

const MODEL = "claude-sonnet-4-6";
const TURN_TIMEOUT_MS = 35_000;

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChatMessage = {
  id: string;
  role: "odo" | "visitor";
  /** opening/reply/question/closing = ODO; answer/skip = visitor. */
  kind: "opening" | "reply" | "question" | "closing" | "answer" | "skip";
  text: string;
  /** Example answer shown as the text box placeholder — ODO questions only. */
  hint?: string;
  at: string;
};

export type MessageType = "answer" | "visitor_question" | "answer_and_question" | "nonsense" | "skip";
export type AnswerQuality = "valid" | "unsure" | "contradictory" | "contradicts_public";

export type JudgedTurn = {
  questionId: string;
  question: string;
  visitorText: string;
  type: MessageType;
  quality?: AnswerQuality;
  note?: string;
  at: string;
};

export type InterviewEvidence = AnswerEvidenceTemplate & { questionId: string; raw: string };

export type InterviewState = {
  /** Bumped on every visitor-visible change — the browser's staleness guard. */
  version: number;
  /** True while ODO is working on a reply (the visitor's message is saved, ODO's isn't yet). */
  awaiting: boolean;
  pending: { id: string; text: string; hint?: string } | null;
  questionsAsked: number;
  answered: number;
  skips: number;
  nonsense: number;
  visitorQuestions: number;
  quickWinGiven: boolean;
  intentAsked: boolean;
  urgent: boolean;
  judged: JudgedTurn[];
  evidence: InterviewEvidence[];
  /** Internal one-line reasons per turn, for Mohammad's review email. */
  reasons: string[];
  ended?: { outcome: "finish" | "insufficient" | "failed"; reason: string; message: string };
};

export type InterviewContext = {
  company: string;
  website: string | null;
  industry: string | null;
  businessSize: string | null;
  profile: BusinessProfile | null;
  complianceSignals: ComplianceSignal[] | null;
  /** Client-audience research evidence as text (odo-ledger.ts ledgerAsText). */
  researchText: string;
};

export type Usage = { input_tokens: number; output_tokens: number };

export type TurnResult = {
  state: InterviewState;
  chat: ChatMessage[];
  usage: Usage | null;
  outcome: "continue" | "finish" | "insufficient" | "failed";
};

export function emptyInterviewState(): InterviewState {
  return {
    version: 0, awaiting: false, pending: null,
    questionsAsked: 0, answered: 0, skips: 0, nonsense: 0, visitorQuestions: 0,
    quickWinGiven: false, intentAsked: false, urgent: false,
    judged: [], evidence: [], reasons: [],
  };
}

// ─── Claude call ─────────────────────────────────────────────────────────────

type ModelTurn = {
  message_type: string;
  assessment: unknown;
  urgent: boolean;
  quick_win_given: boolean;
  intent_question_asked: boolean;
  reply: string;
  action: string;
  question: { text: string; hint: string } | null;
  reason: string;
};

const ACTIONS = new Set(["ask", "clarify", "reask", "finish", "insufficient"]);

/**
 * Real cost-equivalent input tokens. Prompt caching bills cache writes at
 * 1.25x and cache reads at 0.1x the normal input rate (Anthropic pricing);
 * folding them in at those weights keeps odo-cost.ts's single input price
 * accurate instead of over- or under-stating spend against the $2 cap.
 */
function billableUsage(u: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number | null; cache_creation_input_tokens?: number | null }): Usage {
  return {
    input_tokens: Math.ceil(u.input_tokens + 1.25 * (u.cache_creation_input_tokens ?? 0) + 0.1 * (u.cache_read_input_tokens ?? 0)),
    output_tokens: u.output_tokens,
  };
}

function parseModelJson(text: string): ModelTurn | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const p = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    if (typeof p.action !== "string" || !ACTIONS.has(p.action)) return null;
    const q = p.question as Record<string, unknown> | null | undefined;
    const question = q && typeof q.text === "string" && q.text.trim()
      ? { text: q.text.trim().slice(0, 320), hint: typeof q.hint === "string" ? q.hint.trim().slice(0, 180) : "" }
      : null;
    if ((p.action === "ask" || p.action === "clarify") && !question) return null;
    return {
      message_type: typeof p.message_type === "string" ? p.message_type : "answer",
      assessment: p.assessment ?? null,
      urgent: p.urgent === true,
      quick_win_given: p.quick_win_given === true,
      intent_question_asked: p.intent_question_asked === true,
      reply: typeof p.reply === "string" ? p.reply.trim().slice(0, 1200) : "",
      action: p.action,
      question,
      reason: typeof p.reason === "string" ? p.reason.slice(0, 400) : "",
    };
  } catch {
    return null;
  }
}

/** One Claude call, retried once on any failure. Null = AI genuinely unavailable. */
async function callModel(userContent: string): Promise<{ turn: ModelTurn; usage: Usage } | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[ODO Interview] ANTHROPIC_API_KEY not configured — interview cannot run.");
    return null;
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let usage: Usage = { input_tokens: 0, output_tokens: 0 };
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await anthropic.messages.create(
        {
          model: MODEL,
          max_tokens: 1200,
          system: [{ type: "text", text: PLAYBOOK, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: userContent }],
        },
        { timeout: TURN_TIMEOUT_MS }
      );
      const u = billableUsage(res.usage as Parameters<typeof billableUsage>[0]);
      usage = { input_tokens: usage.input_tokens + u.input_tokens, output_tokens: usage.output_tokens + u.output_tokens };
      const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
      const turn = parseModelJson(text);
      if (turn) return { turn, usage };
      console.error(`[ODO Interview] Unusable model output (attempt ${attempt}):`, text.slice(0, 400));
    } catch (err) {
      console.error(`[ODO Interview] Claude call failed (attempt ${attempt}):`, err instanceof Error ? err.message : err);
    }
  }
  return null;
}

// ─── Parsing the model's judgement ───────────────────────────────────────────

const AREAS: Area[] = ["email", "web", "domain", "exposure", "privacy", "governance", "identity", "data", "people", "ai", "operations", "presence", "business"];
const POLARITIES: Polarity[] = ["gap", "strength", "context"];
const SEVERITIES: Severity[] = ["high", "medium", "low", "info"];
const QUALITIES: AnswerQuality[] = ["valid", "unsure", "contradictory", "contradicts_public"];

function cleanCodes(v: unknown): string[] {
  return Array.isArray(v) ? [...new Set(v.filter((c): c is string => typeof c === "string" && !!SERVICE_BY_CODE[c]))] : [];
}

function parseAssessment(raw: unknown): { quality: AnswerQuality; note: string; evidence: AnswerEvidenceTemplate[] } | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  if (!QUALITIES.includes(a.quality as AnswerQuality)) return null;
  const quality = a.quality as AnswerQuality;
  const usable = quality === "valid" || quality === "unsure";
  const evidence: AnswerEvidenceTemplate[] = !usable ? [] : (Array.isArray(a.evidence) ? a.evidence : [])
    .slice(0, 3)
    .map((e): AnswerEvidenceTemplate | null => {
      if (!e || typeof e !== "object") return null;
      const r = e as Record<string, unknown>;
      const fact = typeof r.fact === "string" ? r.fact.trim().slice(0, 300) : "";
      const polarity = POLARITIES.includes(r.polarity as Polarity) ? (r.polarity as Polarity) : null;
      if (!fact || !polarity) return null;
      let severity: Severity = SEVERITIES.includes(r.severity as Severity) ? (r.severity as Severity) : "info";
      if (polarity !== "gap") severity = "info";
      else if (severity === "info") severity = "low";
      return {
        fact,
        // A hedged answer is never a confirmed fact (§6.1 calibration rule).
        tier: quality === "unsure" ? "inferred" : "observed",
        polarity,
        severity,
        area: AREAS.includes(r.area as Area) ? (r.area as Area) : "business",
        supports: polarity === "strength" ? [] : cleanCodes(r.supports),
        counters: polarity === "strength" ? cleanCodes(r.counters) : [],
      };
    })
    .filter((x): x is AnswerEvidenceTemplate => x !== null);
  return { quality, note: typeof a.note === "string" ? a.note.slice(0, 400) : "", evidence };
}

// ─── Prompt assembly ─────────────────────────────────────────────────────────

function profileText(p: BusinessProfile | null): string {
  if (!p) return "(could not be read from their website)";
  return [
    `What they sell: ${p.whatTheySell}`,
    `Business model: ${p.businessModel}. Price level: ${p.priceLevel}.`,
    `Audience: ${p.audienceDescription || "not stated"}`,
    `Locations: ${p.locations.join(", ") || "not stated"}`,
    `Size signals: ${p.sizeSignals.join(", ") || "none found"}`,
    `Sensitive data types seen on site: ${p.sensitiveDataTypes.join(", ") || "none found"}`,
    `Tools/platforms mentioned: ${p.toolsOrPlatformsMentioned.join(", ") || "none found"}`,
    `Still unknown from the site: ${p.unknowns.join("; ") || "none flagged"}`,
  ].join("\n");
}

function transcriptText(chat: ChatMessage[]): string {
  if (!chat.length) return "(conversation not started)";
  return chat
    .map((m) => {
      if (m.role === "visitor") return m.kind === "skip" ? "VISITOR: [pressed \"Prefer not to answer\"]" : `VISITOR: ${m.text}`;
      return `ODO${m.kind === "question" ? " (question)" : ""}: ${m.text}`;
    })
    .join("\n");
}

function buildUserContent(ctx: InterviewContext, state: InterviewState, chat: ChatMessage[], turnNote: string): string {
  const compliance = ctx.complianceSignals?.length
    ? ctx.complianceSignals.map((s) => `- ${s.framework}: ${s.trigger} — still unknown: ${s.unknowns.join("; ")}`).join("\n")
    : "(none flagged)";
  const judged = state.judged.length
    ? state.judged.map((j, i) => `${i + 1}. [${j.type}${j.quality ? `/${j.quality}` : ""}] Q: "${j.question}" → "${j.visitorText.slice(0, 300)}"${j.note ? ` (note: ${j.note})` : ""}`).join("\n")
    : "(none yet)";
  return [
    `BUSINESS: ${ctx.company}${ctx.website ? ` — ${ctx.website}` : ""}. Industry: ${ctx.industry ?? "unknown"}. Size: ${ctx.businessSize ?? "unknown"}.`,
    "",
    "=== Business profile (read from their own website) ===",
    profileText(ctx.profile),
    "",
    "=== Compliance signals ===",
    compliance,
    "",
    "=== What public research established (evidence ledger) ===",
    ctx.researchText || "(research returned little — be careful not to assume)",
    "",
    "=== Your judgements so far ===",
    judged,
    "",
    "=== Interview state ===",
    `Questions asked: ${state.questionsAsked} of max ${MAX_INTERVIEW_QUESTIONS}. Answers received: ${state.answered}. Skips: ${state.skips}. Nonsense so far: ${state.nonsense}. Visitor questions answered: ${state.visitorQuestions} of ${MAX_VISITOR_QUESTIONS}. Quick win given: ${state.quickWinGiven ? "yes" : "no"}. Buying-intent question asked: ${state.intentAsked ? "yes" : "no"}.`,
    state.pending ? `Pending question: "${state.pending.text}"` : "Pending question: none",
    "",
    "=== Full conversation so far ===",
    transcriptText(chat),
    "",
    "=== THIS TURN ===",
    turnNote,
  ].join("\n");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
let msgSeq = 0;
const msgId = () => `m${Date.now().toString(36)}${(msgSeq++).toString(36)}`;
const odo = (kind: ChatMessage["kind"], text: string, hint?: string): ChatMessage =>
  ({ id: msgId(), role: "odo", kind, text, ...(hint ? { hint } : {}), at: now() });

/** Cheap guard against a re-worded repeat slipping past the model: >70% word overlap with an earlier question. */
function isNearDuplicate(text: string, chat: ChatMessage[]): boolean {
  const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3));
  const a = words(text);
  if (a.size < 4) return false;
  return chat.some((m) => {
    if (m.kind !== "question") return false;
    const b = words(m.text);
    const shared = [...a].filter((w) => b.has(w)).length;
    return shared / Math.min(a.size, b.size) > 0.7;
  });
}

function end(state: InterviewState, chat: ChatMessage[], outcome: "finish" | "insufficient", reason: string, message: string, usage: Usage | null): TurnResult {
  return {
    state: { ...state, awaiting: false, pending: null, version: state.version + 1, ended: { outcome, reason, message } },
    chat: [...chat, odo("closing", message)],
    usage,
    outcome,
  };
}

function failed(state: InterviewState, chat: ChatMessage[], usage: Usage | null): TurnResult {
  return {
    state: { ...state, awaiting: false, version: state.version + 1, ended: { outcome: "failed", reason: "AI unavailable", message: "" } },
    chat,
    usage,
    outcome: "failed",
  };
}

function addUsage(a: Usage | null, b: Usage | null): Usage | null {
  if (!a) return b;
  if (!b) return a;
  return { input_tokens: a.input_tokens + b.input_tokens, output_tokens: a.output_tokens + b.output_tokens };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** The opening message plus the first question, written from the research. */
export async function openInterview(ctx: InterviewContext): Promise<TurnResult> {
  const state = emptyInterviewState();
  const res = await callModel(buildUserContent(ctx, state, [], OPENING_INSTRUCTION));
  if (!res || !res.turn.question || !res.turn.reply) return failed(state, [], res?.usage ?? null);
  const q = { id: "q1", text: res.turn.question.text, hint: res.turn.question.hint || undefined };
  return {
    state: { ...state, version: 1, pending: q, questionsAsked: 1, reasons: [res.turn.reason] },
    chat: [odo("opening", res.turn.reply), odo("question", q.text, q.hint)],
    usage: res.usage,
    outcome: "continue",
  };
}

/** Record the visitor's message immediately, before ODO replies — so a reload or a poll mid-turn shows it. */
export function recordVisitorMessage(state: InterviewState, chat: ChatMessage[], input: { kind: "message"; text: string } | { kind: "skip" }): { state: InterviewState; chat: ChatMessage[] } {
  const msg: ChatMessage = input.kind === "skip"
    ? { id: msgId(), role: "visitor", kind: "skip", text: "Prefer not to answer", at: now() }
    : { id: msgId(), role: "visitor", kind: "answer", text: input.text, at: now() };
  return { state: { ...state, awaiting: true, version: state.version + 1 }, chat: [...chat, msg] };
}

/**
 * One interview turn. `chat` must already contain the visitor's message
 * (recordVisitorMessage). Never throws.
 */
export async function runInterviewTurn(
  ctx: InterviewContext,
  state: InterviewState,
  chat: ChatMessage[],
  input: { kind: "message"; text: string } | { kind: "skip" },
  opts: { spendCapReached?: boolean } = {}
): Promise<TurnResult> {
  const pending = state.pending;
  if (!pending) return failed(state, chat, null);

  // ── Hard rule: skips ──────────────────────────────────────────────────────
  const s: InterviewState = { ...state };
  if (input.kind === "skip") {
    s.skips += 1;
    s.judged = [...s.judged, { questionId: pending.id, question: pending.text, visitorText: "(prefer not to answer)", type: "skip", at: now() }];
    if (s.skips > MAX_SKIPS) return end(s, chat, "insufficient", `more than ${MAX_SKIPS} questions skipped`, ENDING_SKIPS, null);
  }

  const atCap = s.questionsAsked >= MAX_INTERVIEW_QUESTIONS;
  const finalTurn = atCap || opts.spendCapReached === true;
  const turnNote = input.kind === "skip"
    ? `The visitor pressed "Prefer not to answer" on the pending question. Do not judge it, do not ask it again, and set message_type "none". ${finalTurn ? "FINAL TURN — no more questions are allowed: action must be finish or insufficient." : "Move to the next most valuable question, or finish if you already have enough."}`
    : `The visitor's latest message (judge it against the pending question): """${input.text}"""\n${finalTurn ? "FINAL TURN — no NEW questions are allowed: action must be reask (only if this message is a visitor question or nonsense), finish, or insufficient." : ""}`;

  const res = await callModel(buildUserContent(ctx, s, chat, turnNote));
  if (!res) return failed(s, chat, null);
  let usage: Usage | null = res.usage;
  let t = res.turn;

  // One retry if the model repeats an earlier topic despite the playbook.
  if ((t.action === "ask" || t.action === "clarify") && t.question && isNearDuplicate(t.question.text, chat)) {
    const retry = await callModel(buildUserContent(ctx, s, chat, turnNote + `\nYOUR PREVIOUS DRAFT REPEATED A TOPIC ALREADY ASKED ("${t.question.text}"). Ask about a different, still-unknown topic, or finish.`));
    usage = addUsage(usage, retry?.usage ?? null);
    if (retry && !(retry.turn.question && isNearDuplicate(retry.turn.question.text, chat))) t = retry.turn;
    else if (t.action === "ask") t = { ...t, action: s.answered >= MIN_ANSWERS_BEFORE_FINISH ? "finish" : "insufficient", question: null };
  }

  s.reasons = [...s.reasons, t.reason].slice(-40);
  if (t.urgent) s.urgent = true;
  if (t.quick_win_given) s.quickWinGiven = true;
  if (t.intent_question_asked) s.intentAsked = true;

  const newChat = [...chat];
  const type: MessageType = input.kind === "skip" ? "skip"
    : (["answer", "visitor_question", "answer_and_question", "nonsense"].includes(t.message_type) ? t.message_type as MessageType : "answer");

  if (input.kind === "message") {
    // ── Hard rule: nonsense ─────────────────────────────────────────────────
    if (type === "nonsense") {
      s.nonsense += 1;
      s.judged = [...s.judged, { questionId: pending.id, question: pending.text, visitorText: input.text, type, at: now() }];
      if (s.nonsense >= 2) return end(s, chat, "insufficient", "second nonsense answer", ENDING_NONSENSE, usage);
      newChat.push(odo("reply", t.reply || NONSENSE_FALLBACK_REPLY));
      newChat.push(odo("question", pending.text, pending.hint));
      return { state: { ...s, awaiting: false, version: s.version + 1 }, chat: newChat, usage, outcome: "continue" };
    }

    // ── Visitor asked ODO something ────────────────────────────────────────
    const askedSomething = type === "visitor_question" || type === "answer_and_question";
    if (askedSomething) {
      s.visitorQuestions += 1;
      if (s.visitorQuestions > MAX_VISITOR_QUESTIONS && type === "visitor_question") {
        s.judged = [...s.judged, { questionId: pending.id, question: pending.text, visitorText: input.text, type, note: "over visitor-question limit", at: now() }];
        newChat.push(odo("reply", VISITOR_QUESTION_LIMIT_REPLY));
        newChat.push(odo("question", pending.text, pending.hint));
        return { state: { ...s, awaiting: false, version: s.version + 1 }, chat: newChat, usage, outcome: "continue" };
      }
    }
    if (type === "visitor_question") {
      s.judged = [...s.judged, { questionId: pending.id, question: pending.text, visitorText: input.text, type, at: now() }];
      newChat.push(odo("reply", t.reply || "Good question."));
      newChat.push(odo("question", pending.text, pending.hint));
      return { state: { ...s, awaiting: false, version: s.version + 1 }, chat: newChat, usage, outcome: "continue" };
    }

    // ── A real answer (possibly with a question) — judge + extract evidence ─
    const a = parseAssessment(t.assessment) ?? { quality: "valid" as AnswerQuality, note: "", evidence: [] };
    s.answered += 1;
    s.judged = [...s.judged, { questionId: pending.id, question: pending.text, visitorText: input.text, type, quality: a.quality, note: a.note, at: now() }];
    s.evidence = [...s.evidence, ...a.evidence.map((e) => ({ ...e, questionId: pending.id, raw: `Q: "${pending.text}" → "${input.text.slice(0, 500)}"` }))];
  }

  // ── Decide the next move, with code-enforced limits ──────────────────────
  let action = t.action;
  if (action === "reask") action = finalTurn ? "finish" : "ask"; // a real answer/skip can't leave the same question pending
  if (finalTurn && (action === "ask" || action === "clarify")) action = "finish";
  if (action === "finish" && s.answered < MIN_ANSWERS_BEFORE_FINISH && !finalTurn && t.question) action = "ask";
  if (action === "finish" && s.answered < MIN_ANSWERS_BEFORE_FINISH && finalTurn) action = "insufficient";

  if (action === "insufficient") return end(s, [...newChat], "insufficient", t.reason || "too little reliable information", ENDING_JUDGED_INSUFFICIENT, usage);
  if (action === "finish") {
    const closing = t.reply || "Thank you — that gives me what I need.";
    return end(s, [...newChat], "finish", t.reason || "enough reliable evidence", `${closing} ORAGROL's team will review everything and your report will reach your inbox within 24 hours.`, usage);
  }

  if (!t.question) return failed(s, chat, usage);
  const q = { id: `q${s.questionsAsked + 1}`, text: t.question.text, hint: t.question.hint || undefined };
  if (t.reply) newChat.push(odo("reply", t.reply));
  newChat.push(odo("question", q.text, q.hint));
  return {
    state: { ...s, awaiting: false, pending: q, questionsAsked: s.questionsAsked + 1, version: s.version + 1 },
    chat: newChat,
    usage,
    outcome: "continue",
  };
}

/** What the browser is allowed to see — never judgements, notes, evidence or reasons. */
export function publicInterviewView(state: InterviewState | undefined, chat: ChatMessage[] | undefined) {
  const st = state ?? emptyInterviewState();
  return {
    chat: (chat ?? []).map(({ id, role, kind, text, hint }) => ({ id, role, kind, text, ...(hint ? { hint } : {}) })),
    chat_version: st.version,
    awaiting: st.awaiting,
    pending: st.pending ? { id: st.pending.id, hint: st.pending.hint ?? null } : null,
    progress: {
      questions_asked: st.questionsAsked,
      max_questions: MAX_INTERVIEW_QUESTIONS,
      visitor_questions_left: Math.max(0, MAX_VISITOR_QUESTIONS - st.visitorQuestions),
    },
  };
}
