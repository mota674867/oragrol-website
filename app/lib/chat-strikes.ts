/**
 * Off-topic strikes for the live chat.
 *
 * The model tags a reply with OFFTOPIC_MARKER when the visitor's message is truly unrelated to ORAGROL
 * (not general cybersecurity / IT questions — those are prospects). Strikes are counted per IP (hashed):
 *   1st → polite answer.   2nd → polite answer + "I'm here only for ORAGROL questions".
 *   3rd → chat closes, and that IP cannot use the chat for 7 days (the rest of the site stays open).
 * Strike counter lives 24h, so a shared office IP doesn't pile up strikes over weeks; the block lives 7 days.
 * Every Redis call fails open: if Redis is down, nobody is blocked.
 */
import { createHash } from "node:crypto";
import { chatRedis } from "./odo-redis";

export const OFFTOPIC_MARKER = "[[OFFTOPIC]]";
export const STRIKES_TO_CLOSE = 3;
export const STRIKE_WINDOW_SECONDS = 24 * 60 * 60;
export const BLOCK_SECONDS = 7 * 24 * 60 * 60;

export const CHAT_CLOSED_REPLY =
  "I'm here only to help with questions about ORAGROL, so I'm going to close this chat now. If you need us, please use our contact page. Thank you for your understanding.";
export const CHAT_BLOCKED_REPLY =
  "This chat is closed for now. If you need us, please use our contact page.";

export type StrikeOutcome = "polite" | "warn" | "close";

/** Pure: what happens at the Nth off-topic message (N = strike count including this one). */
export function strikeOutcome(count: number): StrikeOutcome {
  if (count >= STRIKES_TO_CLOSE) return "close";
  if (count === STRIKES_TO_CLOSE - 1) return "warn";
  return "polite";
}

const ipHash = (ip: string) => createHash("sha256").update(ip).digest("hex").slice(0, 24);
const strikeKey = (ip: string) => `odo:chat:strikes:${ipHash(ip)}`;
const blockKey = (ip: string) => `odo:chat:block:${ipHash(ip)}`;

export async function isChatBlocked(ip: string): Promise<boolean> {
  try {
    return (await chatRedis().get(blockKey(ip))) != null;
  } catch {
    return false;
  }
}

export async function getStrikes(ip: string): Promise<number> {
  try {
    return Number((await chatRedis().get<number>(strikeKey(ip))) ?? 0) || 0;
  } catch {
    return 0;
  }
}

/** Adds one strike; on the closing strike also sets the 7-day block. Returns the new count. */
export async function addStrike(ip: string): Promise<number> {
  try {
    const r = chatRedis();
    const n = await r.incr(strikeKey(ip));
    if (n === 1) await r.expire(strikeKey(ip), STRIKE_WINDOW_SECONDS);
    if (n >= STRIKES_TO_CLOSE) await r.set(blockKey(ip), 1, { ex: BLOCK_SECONDS });
    return n;
  } catch {
    return 0;
  }
}
