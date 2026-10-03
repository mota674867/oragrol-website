// ORAGROL ODO — Real per-scan AI cost tracking
//
// Every AI vendor ODO calls (Jev/TypeSafe, Claude/Anthropic) already returns
// real token usage on every response. Until now that usage was read and then
// thrown away. This module turns it into an actual dollar figure per scan —
// not an estimate, not a guess: it only ever sums numbers the vendors
// themselves returned for THIS scan, multiplied by their published price.
//
// PRICING — verified 2026-09-30 against each vendor's own published rate.
// Re-verify periodically: a vendor can change pricing without telling us,
// and nothing here detects that on its own. Update the two numbers below and
// bump `verifiedAt` when you do.
export const PRICING = {
  jev: {
    inputPerM: 0.042,   // $ per 1M input tokens
    outputPerM: 0,      // $ per 1M output tokens
    verifiedAt: "2026-09-30",
    source: "openrouter.ai/typesafe/jev-1.13",
  },
  claude: {
    inputPerM: 3,       // $ per 1M input tokens (Claude Sonnet 4.6)
    outputPerM: 15,      // $ per 1M output tokens
    verifiedAt: "2026-09-30",
    source: "openrouter.ai/anthropic/claude-sonnet-4.6",
  },
  // Report narrative only (odo-report-model.ts).
  opus: {
    inputPerM: 4,       // $ per 1M input tokens (Claude Opus 5.5, standard mode)
    outputPerM: 20,     // $ per 1M output tokens
    verifiedAt: "2026-10-03",
    source: "anthropic.com/claude/opus",
  },
} as const;

export type RawUsage = { input_tokens: number; output_tokens: number };

export type AiUsageTotals = {
  jevInputTokens: number;
  jevOutputTokens: number;
  jevCalls: number;
  claudeInputTokens: number;
  claudeOutputTokens: number;
  claudeCalls: number;
  /** Opus (report narrative). Optional — sessions saved before 2026-10-03 don't carry it. */
  opusInputTokens?: number;
  opusOutputTokens?: number;
  opusCalls?: number;
};

export const EMPTY_USAGE: AiUsageTotals = {
  jevInputTokens: 0, jevOutputTokens: 0, jevCalls: 0,
  claudeInputTokens: 0, claudeOutputTokens: 0, claudeCalls: 0,
};

export function addJevUsage(totals: AiUsageTotals, usage: RawUsage | null | undefined): AiUsageTotals {
  if (!usage) return totals;
  return {
    ...totals,
    jevInputTokens: totals.jevInputTokens + (usage.input_tokens || 0),
    jevOutputTokens: totals.jevOutputTokens + (usage.output_tokens || 0),
    jevCalls: totals.jevCalls + 1,
  };
}

export function addClaudeUsage(totals: AiUsageTotals, usage: RawUsage | null | undefined): AiUsageTotals {
  if (!usage) return totals;
  return {
    ...totals,
    claudeInputTokens: totals.claudeInputTokens + (usage.input_tokens || 0),
    claudeOutputTokens: totals.claudeOutputTokens + (usage.output_tokens || 0),
    claudeCalls: totals.claudeCalls + 1,
  };
}

export function addOpusUsage(totals: AiUsageTotals, usage: RawUsage | null | undefined): AiUsageTotals {
  if (!usage) return totals;
  return {
    ...totals,
    opusInputTokens: (totals.opusInputTokens ?? 0) + (usage.input_tokens || 0),
    opusOutputTokens: (totals.opusOutputTokens ?? 0) + (usage.output_tokens || 0),
    opusCalls: (totals.opusCalls ?? 0) + 1,
  };
}

export function mergeUsage(a: AiUsageTotals, b: AiUsageTotals): AiUsageTotals {
  return {
    opusInputTokens: (a.opusInputTokens ?? 0) + (b.opusInputTokens ?? 0),
    opusOutputTokens: (a.opusOutputTokens ?? 0) + (b.opusOutputTokens ?? 0),
    opusCalls: (a.opusCalls ?? 0) + (b.opusCalls ?? 0),
    jevInputTokens: a.jevInputTokens + b.jevInputTokens,
    jevOutputTokens: a.jevOutputTokens + b.jevOutputTokens,
    jevCalls: a.jevCalls + b.jevCalls,
    claudeInputTokens: a.claudeInputTokens + b.claudeInputTokens,
    claudeOutputTokens: a.claudeOutputTokens + b.claudeOutputTokens,
    claudeCalls: a.claudeCalls + b.claudeCalls,
  };
}

export type CostBreakdown = {
  jevCostUsd: number;
  claudeCostUsd: number;
  totalCostUsd: number;
  usage: AiUsageTotals;
  pricingVerifiedAt: { jev: string; claude: string };
};

/** Real dollar cost for this scan — sums real usage × verified per-vendor pricing. Never an estimate. */
export function computeCost(totals: AiUsageTotals): CostBreakdown {
  const jevCostUsd =
    (totals.jevInputTokens / 1_000_000) * PRICING.jev.inputPerM +
    (totals.jevOutputTokens / 1_000_000) * PRICING.jev.outputPerM;
  // "claudeCostUsd" covers every Anthropic model: Sonnet + Opus.
  const claudeCostUsd =
    (totals.claudeInputTokens / 1_000_000) * PRICING.claude.inputPerM +
    (totals.claudeOutputTokens / 1_000_000) * PRICING.claude.outputPerM +
    ((totals.opusInputTokens ?? 0) / 1_000_000) * PRICING.opus.inputPerM +
    ((totals.opusOutputTokens ?? 0) / 1_000_000) * PRICING.opus.outputPerM;
  return {
    jevCostUsd: Math.round(jevCostUsd * 1_000_000) / 1_000_000,
    claudeCostUsd: Math.round(claudeCostUsd * 1_000_000) / 1_000_000,
    totalCostUsd: Math.round((jevCostUsd + claudeCostUsd) * 1_000_000) / 1_000_000,
    usage: totals,
    pricingVerifiedAt: { jev: PRICING.jev.verifiedAt, claude: PRICING.claude.verifiedAt },
  };
}
