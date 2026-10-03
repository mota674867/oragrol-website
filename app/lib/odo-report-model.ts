// ORAGROL ODO — Model for the final report text (Master Reference §37, task: "Opus for the final report")
//
// The report narrative (SWOT + "what this means for you") is the one piece a
// prospect reads closely and judges ORAGROL by, so it is written by Opus.
// Everything else (interview turns, business profile) stays on Sonnet.
//
// Pricing verified 2026-10-03 at anthropic.com/claude/opus: Claude Opus 5.5,
// API id `claude-opus-5-5`, $4 / 1M input, $20 / 1M output (odo-cost.ts).
// If Opus is unavailable for any reason (model not enabled on the key,
// overloaded, timeout), the same request is retried once on Sonnet so a
// report is never lost to a model choice. Every call reports which model
// actually answered, so the per-scan cost stays exact.

import Anthropic from "@anthropic-ai/sdk";

export const REPORT_MODEL = "claude-opus-5-5";
export const REPORT_FALLBACK_MODEL = "claude-sonnet-4-6";

export type ReportUsage = { input_tokens: number; output_tokens: number; model: string };

export async function createReportText(
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, "model">,
  timeoutMs: number,
  /** The scan already reached its $2 cap (odo-spend.ts) — write the report on the cheaper model. */
  overSpendCap = false
): Promise<{ text: string; usage: ReportUsage }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  if (overSpendCap) {
    const res = await anthropic.messages.create({ ...params, model: REPORT_FALLBACK_MODEL }, { timeout: timeoutMs });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("").trim();
    return { text, usage: { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens, model: REPORT_FALLBACK_MODEL } };
  }
  let model = REPORT_MODEL;
  let res: Anthropic.Message;
  try {
    res = await anthropic.messages.create({ ...params, model }, { timeout: timeoutMs });
  } catch (err) {
    console.warn(`[ODO] ${REPORT_MODEL} unavailable for report text, retrying on ${REPORT_FALLBACK_MODEL}:`, err instanceof Error ? err.message : err);
    model = REPORT_FALLBACK_MODEL;
    res = await anthropic.messages.create({ ...params, model }, { timeout: timeoutMs });
  }
  const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("").trim();
  return { text, usage: { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens, model } };
}
