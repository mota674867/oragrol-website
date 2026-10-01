// ORAGROL ODO — Spending guards
//
// ADDED 2026-10-01 — Mohammad, approving the ODO brain rebuild: "a 2$ is
// not less money for each scan... need only real visitor use it, not a
// person for fun" and separately approved a $25/day global ceiling with
// auto-pause + an alert email. This module is the two money-side limits
// that sit on top of the entry gate (odo-gate.ts):
//
//   1. PER-SCAN cap ($2) — checked mid-scan in /api/odo/scan/answer, using
//      the running AiUsageTotals that already accumulates across the whole
//      scan (odo-cost.ts, findings._aiUsage). If a single scan's real
//      spend reaches the cap, questioning stops immediately — same code
//      path as hitting the question-count cap — and evaluation runs with
//      whatever evidence exists so far.
//   2. DAILY GLOBAL ceiling ($25) — checked at the very start of every new
//      scan (/api/odo/scan/start), before any paid AI call is made. Once
//      crossed, ODO refuses new scans until the next day (Toronto time)
//      and emails Mohammad once per day the moment it happens, so a
//      runaway bot or a bug gets caught the same day, not discovered a
//      week later in a vendor invoice.
//
// Both are READ from real vendor-reported usage (odo-cost.ts) — never an
// estimate — same provenance rule as recordLifetimeAiCost.

import { Resend } from "resend";
import { computeCost, type AiUsageTotals } from "./odo-cost";
import { getDailySpend, recordDailySpend, claimDailyCapAlert } from "./odo-redis";

export const PER_SCAN_SPEND_CAP_USD = 2.0;
export const DAILY_SPEND_CAP_USD = 25.0;

const ODO_ADMIN_EMAIL = process.env.ODO_ADMIN_EMAIL || "mota6748@gmail.com";

/** True once a single scan's real, measured AI spend has reached the per-scan cap. */
export function isScanOverCap(usage: AiUsageTotals): boolean {
  return computeCost(usage).totalCostUsd >= PER_SCAN_SPEND_CAP_USD;
}

/**
 * Call once at the end of every scan (runEvaluation) with that scan's final
 * total cost, so the daily counter reflects real spend as it happens rather
 * than only being checked at the next scan's start.
 */
export async function recordScanSpend(costUsd: number): Promise<void> {
  await recordDailySpend(costUsd).catch((err) => {
    console.error("[ODO Spend] Failed to record daily spend:", err);
  });
}

export type DailyGateResult = { paused: boolean; spentToday: number };

/**
 * Call at the very start of every scan, before any paid AI work. Fails open
 * on a Redis error (same philosophy as every other best-effort ODO check —
 * a monitoring hiccup must never be what blocks a real visitor), but fails
 * CLOSED (paused) on an actual confirmed cap breach, since that's the one
 * case this function exists to catch.
 */
export async function checkDailySpendGate(): Promise<DailyGateResult> {
  let spentToday = 0;
  try {
    spentToday = await getDailySpend();
  } catch (err) {
    console.error("[ODO Spend] Failed to read daily spend — failing open:", err);
    return { paused: false, spentToday: 0 };
  }

  if (spentToday < DAILY_SPEND_CAP_USD) {
    return { paused: false, spentToday };
  }

  // Crossed the cap. Alert Mohammad once per day (claimDailyCapAlert is an
  // NX flag — only the first caller on a given day gets `true`), then stay
  // paused for every subsequent call today regardless.
  claimDailyCapAlert()
    .then((shouldAlert) => {
      if (shouldAlert) return sendDailyCapAlert(spentToday);
    })
    .catch((err) => console.error("[ODO Spend] Daily cap alert failed:", err));

  return { paused: true, spentToday };
}

async function sendDailyCapAlert(spentToday: number): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("[ODO Spend] Daily cap crossed but RESEND_API_KEY/CONTACT_FROM_EMAIL not configured — alert email NOT sent.");
    return;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: [ODO_ADMIN_EMAIL],
      replyTo: from,
      subject: `ODO — daily $${DAILY_SPEND_CAP_USD.toFixed(2)} spend cap reached`,
      text: [
        `ODO's daily AI spend cap has been reached and new scans are now paused until tomorrow (Toronto time).`,
        ``,
        `Spent today: $${spentToday.toFixed(4)}`,
        `Cap: $${DAILY_SPEND_CAP_USD.toFixed(2)}`,
        ``,
        `This resets automatically at midnight America/Toronto. If this happened faster than expected, check for unusual traffic on /scan — the entry gate (captcha, URL validation, per-IP daily limit) should already be blocking most abuse before it reaches this point, so a fast cap-out can mean something is getting through.`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("[ODO Spend] Failed to send daily cap alert email:", err);
  }
}
