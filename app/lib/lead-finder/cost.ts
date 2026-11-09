// ORAGROL Lead Finder (pilot) — cost of the cheap model (Haiku) and the planning exchange rate.
//
// Kept here, not in odo-cost.ts, so the live ODO scan's cost tracking does not change.
// Re-verify periodically: update the numbers and bump `verifiedAt`.

export const HAIKU_PRICING = {
  inputPerM: 0.1,   // $ per 1M input tokens, prompts up to 100,000 tokens
  outputPerM: 0.5,  // $ per 1M output tokens
  verifiedAt: "2026-11-09",
  source: "Anthropic API pricing for Claude Haiku 5.5 as reported in Nov 2026 — NEEDS VERIFICATION against the Claude pricing page",
} as const;

/** Planning rate only (CAD per USD). Not a bank rate. */
export const USD_TO_CAD = 1.4;

export type Usage = { input_tokens: number; output_tokens: number };

export function haikuCostUsd(u: Usage | null | undefined): number {
  if (!u) return 0;
  return (u.input_tokens * HAIKU_PRICING.inputPerM + u.output_tokens * HAIKU_PRICING.outputPerM) / 1_000_000;
}
