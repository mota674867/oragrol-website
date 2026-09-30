// ORAGROL — Jev (TypeSafe) client
//
// Jev is a "System One" decision model: it answers typed questions only —
// noul (probabilistic yes/no), choice (pick one), score (ordered levels) —
// and returns calibrated probabilities. It never writes prose. Master
// Reference §6.1: "Jev makes the judgment call, Claude writes the prose."
//
// API verified against docs.typesafe.ai/api (2026-09-29):
//   POST https://api.typesafe.ai/v1/systemone
//   Authorization: Bearer <TYPESAFE_API_KEY>
//   { model: "jev-latest", state, questions: { key: {type, instructions, criteria?} } }
//   → { model, answers: { key: {...typed answer} }, usage }
//
// FAILURE RULE — Jev is never a single point of failure (§6.1 vendor
// caution). Every call returns null on any problem (no key, timeout, 4xx,
// 5xx, malformed answer). Callers MUST have a deterministic fallback and
// must treat null as "Jev didn't decide", never as a "no".
//
// PILOT STATUS — §6.1 production block: Jev is approved for pilot use. The
// state sent here is ODO's own evidence summary (business-level facts), not
// raw visitor PII: callers must not put the visitor's name or email in `state`.

const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
const MODEL = "jev-latest";

export type JevNoulQ = { type: "noul"; instructions: string; criteria?: { true: string; false: string } };
export type JevChoiceQ = { type: "choice"; instructions: string; criteria: Record<string, string> };
export type JevScoreQ = { type: "score"; instructions: string; criteria: string[] };
export type JevQuestion = JevNoulQ | JevChoiceQ | JevScoreQ;

export type JevNoulA = { type: "noul"; noul: number };
export type JevChoiceA = { type: "choice"; choice: string; probabilities: Record<string, number>; confidence: number };
export type JevScoreA = { type: "score"; score: number; legend?: Record<string, string>; probabilities: Record<string, number>; confidence: number };
export type JevAnswer = JevNoulA | JevChoiceA | JevScoreA;

export type JevResult = {
  answers: Record<string, JevAnswer>;
  usage: { input_tokens: number; output_tokens: number } | null;
  latencyMs: number;
};

export function jevConfigured(): boolean {
  return !!process.env.TYPESAFE_API_KEY;
}

function isValidAnswer(q: JevQuestion, a: unknown): a is JevAnswer {
  if (!a || typeof a !== "object") return false;
  const x = a as Record<string, unknown>;
  if (q.type === "noul") return typeof x.noul === "number" && x.noul >= 0 && x.noul <= 1;
  if (q.type === "choice") return typeof x.choice === "string" && x.choice in q.criteria;
  return typeof x.score === "number";
}

/**
 * Ask Jev a batch of questions about one `state`. Returns only the answers
 * that came back well-formed; a missing key in the result means "Jev didn't
 * decide this one" and the caller falls back for that key alone.
 */
export async function askJev(
  state: string | Record<string, unknown> | unknown[],
  questions: Record<string, JevQuestion>,
  opts: { timeoutMs?: number; label?: string } = {}
): Promise<JevResult | null> {
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) return null;
  const keys = Object.keys(questions);
  if (keys.length === 0) return { answers: {}, usage: null, latencyMs: 0 };

  const started = Date.now();
  const body = JSON.stringify({ model: MODEL, state, questions });

  // One retry with backoff on 429/529 (rate limit / overloaded) — per docs.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(opts.timeoutMs ?? 12000),
      });
      if ((res.status === 429 || res.status === 529) && attempt === 0) {
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
        continue;
      }
      if (!res.ok) {
        console.error(`[Jev] ${opts.label ?? "call"} HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
        return null;
      }
      const data = (await res.json()) as { answers?: Record<string, unknown>; usage?: JevResult["usage"] };
      const answers: Record<string, JevAnswer> = {};
      for (const k of keys) {
        const a = data.answers?.[k];
        if (isValidAnswer(questions[k], a)) answers[k] = a;
      }
      return { answers, usage: data.usage ?? null, latencyMs: Date.now() - started };
    } catch (err) {
      console.error(`[Jev] ${opts.label ?? "call"} failed:`, err instanceof Error ? err.message : err);
      return null;
    }
  }
  return null;
}

/**
 * Normalize a score answer onto 0..1. Uses the probability-weighted
 * expectation across levels when available (calibrated), else the argmax.
 */
export function scoreToUnit(a: JevAnswer | undefined, levels: number): number | null {
  if (!a || a.type !== "score" || levels < 2) return null;
  const probs = a.probabilities ?? {};
  let total = 0;
  let weighted = 0;
  for (const [k, p] of Object.entries(probs)) {
    const idx = Number(k);
    if (!Number.isFinite(idx) || typeof p !== "number") continue;
    weighted += idx * p;
    total += p;
  }
  const expected = total > 0 ? weighted / total : a.score;
  return Math.max(0, Math.min(1, expected / (levels - 1)));
}

/** Split a large question map into chunks so one malformed item can't sink a whole batch. */
export async function askJevChunked(
  state: string | Record<string, unknown> | unknown[],
  questions: Record<string, JevQuestion>,
  opts: { chunkSize?: number; timeoutMs?: number; label?: string } = {}
): Promise<JevResult | null> {
  const size = opts.chunkSize ?? 25;
  const entries = Object.entries(questions);
  const chunks: Array<Record<string, JevQuestion>> = [];
  for (let i = 0; i < entries.length; i += size) chunks.push(Object.fromEntries(entries.slice(i, i + size)));

  const results = await Promise.all(chunks.map((c, i) => askJev(state, c, { ...opts, label: `${opts.label ?? "batch"}#${i}` })));
  if (results.every((r) => r === null)) return null;

  const merged: JevResult = { answers: {}, usage: { input_tokens: 0, output_tokens: 0 }, latencyMs: 0 };
  for (const r of results) {
    if (!r) continue;
    Object.assign(merged.answers, r.answers);
    if (r.usage && merged.usage) {
      merged.usage.input_tokens += r.usage.input_tokens;
      merged.usage.output_tokens += r.usage.output_tokens;
    }
    merged.latencyMs = Math.max(merged.latencyMs, r.latencyMs);
  }
  return merged;
}
