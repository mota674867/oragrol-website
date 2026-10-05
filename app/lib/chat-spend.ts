// ORAGROL live chat — spend guard (Mohammad, 2026-10-05: "max $5 enough; send
// me a notice email when the chat cap is over and stopped for today, refer to
// email or contact"). Mirrors odo-spend.ts: real vendor-reported usage, a
// once-per-day alert, fail-open on a Redis hiccup but closed on a confirmed breach.

import { Resend } from "resend";
import { getChatSpend, recordChatUsage, claimChatCapAlert } from "./odo-redis";

export const CHAT_DAILY_CAP_USD = 5;
const ADMIN_EMAIL = process.env.ODO_ADMIN_EMAIL || "mota6748@gmail.com";

// Claude Sonnet pricing, USD per million tokens. Cache writes cost 1.25x input, cache reads 0.1x.
const PRICE = { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 };

export type ChatUsage = { input: number; output: number; cacheRead: number; cacheWrite: number };

export function chatCostUsd(u: ChatUsage): number {
  return (u.input * PRICE.input + u.output * PRICE.output + u.cacheWrite * PRICE.cacheWrite + u.cacheRead * PRICE.cacheRead) / 1_000_000;
}

export const CHAT_CAP_REPLY =
  "Our chat has reached its limit for today. Please reach us through /contact and the team will get back to you. You can also run a free business scan at /scan anytime.";

/** True when today's chat spend has hit the cap. Sends the one-per-day alert email on the first breach. */
export async function chatCapReached(): Promise<boolean> {
  let spent = 0;
  try {
    spent = await getChatSpend();
  } catch (err) {
    console.error("[Chat Spend] read failed — failing open:", err);
    return false;
  }
  if (spent < CHAT_DAILY_CAP_USD) return false;
  claimChatCapAlert()
    .then((first) => (first ? sendCapAlert(spent) : undefined))
    .catch((err) => console.error("[Chat Spend] alert failed:", err));
  return true;
}

export async function recordChatSpend(u: ChatUsage): Promise<void> {
  await recordChatUsage(chatCostUsd(u), u).catch((err) => console.error("[Chat Spend] record failed:", err));
}

async function sendCapAlert(spent: number): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) return;
  await new Resend(apiKey).emails.send({
    from,
    to: [ADMIN_EMAIL],
    subject: "ORAGROL chat paused for today — daily AI cap reached",
    text:
      `The website chat has spent $${spent.toFixed(2)} today and hit its $${CHAT_DAILY_CAP_USD} daily cap, so it has stopped answering until tomorrow (Toronto time).\n\n` +
      `Visitors now see a message pointing them to /contact. Transcripts and lead capture keep working.\n\n` +
      `If this looks like a bot or abuse rather than real interest, check the chat usage log.`,
  });
}
