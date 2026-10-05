// ORAGROL live chat — server-side chat saving + automatic close
// (Mohammad, 2026-10-05: "each transcript sends to the visitor 15 minutes
// after silence on the chat, closed automatically by ORAGROL, very politely").
//
// Every AI reply saves the conversation to Redis. Fifteen minutes after the
// last message, a timer (QStash when configured, plus a once-daily Vercel
// cron safety net on the free plan) closes the chat and emails the
// transcript — once. If the visitor comes back after it was sent, the next
// message starts a new segment and gets its own transcript later.
//
// Personal data (name, email): every record auto-deletes 30 days after it was
// last written; the emails and the CRM hold the permanent record.

import { chatRedis } from "./odo-redis";
import { sendChatTranscripts, type Msg } from "./chat-transcript";

export const CHAT_IDLE_MS = 15 * 60 * 1000;
const KEEP_SECONDS = 30 * 24 * 60 * 60;
const SESSION_PREFIX = "odo:chat:s:";
const PENDING_KEY = "odo:chat:pending";
const SENT_PREFIX = "odo:chat:sent:";
const MAX_STORED_MESSAGES = 80;
const SWEEP_BATCH = 50;

export type ChatContact = { name: string; email: string; company?: string; sendCopy: boolean };
export type ChatSession = ChatContact & {
  sessionId: string;
  messages: Msg[];
  escalated: boolean;
  lastActivityAt: number;
  /** Bumps on every saved turn — a timer only acts if it still matches (a newer message means a newer timer exists). */
  version: number;
  /** Increments each time the visitor returns after a transcript was sent. */
  segment: number;
  sent: boolean;
};

type IncomingTurn = {
  sessionId: string;
  contact: ChatContact;
  /** The messages the widget sent with this request (its last visitor message is the one being answered). */
  requestMessages: { role: "visitor" | "oragrol"; text: string }[];
  reply: string;
};

const toMsg = (role: "visitor" | "oragrol", text: string, now: number): Msg => ({ role: role === "visitor" ? "user" : "assistant", content: text, timestamp: now });

/** Pure: the session record after one more visitor message + reply. */
export function applyTurn(prev: ChatSession | null, turn: IncomingTurn, now: number): ChatSession {
  const lastVisitor = [...turn.requestMessages].reverse().find((m) => m.role === "visitor");
  const reply = toMsg("oragrol", turn.reply, now);
  let messages: Msg[];
  let segment = prev?.segment ?? 0;
  let escalated = prev?.escalated ?? false;
  if (!prev) {
    messages = [...turn.requestMessages.map((m) => toMsg(m.role, m.text, now)), reply];
  } else if (prev.sent) {
    // The visitor came back after their transcript went out: a fresh segment.
    segment += 1;
    escalated = false;
    messages = [...(lastVisitor ? [toMsg("visitor", lastVisitor.text, now)] : []), reply];
  } else {
    messages = [...prev.messages, ...(lastVisitor ? [toMsg("visitor", lastVisitor.text, now)] : []), reply];
  }
  return {
    ...turn.contact,
    sessionId: turn.sessionId,
    messages: messages.slice(-MAX_STORED_MESSAGES),
    escalated,
    lastActivityAt: now,
    version: (prev?.version ?? 0) + 1,
    segment,
    sent: false,
  };
}

/** Pure: has this chat been silent long enough to close? */
export function isDue(s: ChatSession, now: number, idleMs = CHAT_IDLE_MS): boolean {
  return !s.sent && now - s.lastActivityAt >= idleMs;
}

const sessionKey = (id: string) => `${SESSION_PREFIX}${id}`;
export const validSessionId = (id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{8,80}$/.test(id);

export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  return (await chatRedis().get<ChatSession>(sessionKey(sessionId))) ?? null;
}

async function putChatSession(s: ChatSession): Promise<void> {
  const r = chatRedis();
  await r.set(sessionKey(s.sessionId), s, { ex: KEEP_SECONDS });
  if (s.sent) await r.zrem(PENDING_KEY, s.sessionId);
  else await r.zadd(PENDING_KEY, { score: s.lastActivityAt, member: s.sessionId });
}

/** Save one answered turn. Returns the stored record (its `version` goes on the timer). */
export async function saveChatTurn(turn: IncomingTurn, now = Date.now()): Promise<ChatSession> {
  const next = applyTurn(await getChatSession(turn.sessionId), turn, now);
  await putChatSession(next);
  return next;
}

export async function markChatEscalated(sessionId: string): Promise<void> {
  const s = await getChatSession(sessionId);
  if (!s || s.sent) return;
  await putChatSession({ ...s, escalated: true });
}

/** Close + email one chat if it has been silent for 15 minutes. `expectVersion` makes a timer a no-op when a newer message arrived. */
export async function finalizeChatIfDue(sessionId: string, opts: { expectVersion?: number; now?: number } = {}): Promise<"sent" | "skipped"> {
  const now = opts.now ?? Date.now();
  const s = await getChatSession(sessionId);
  if (!s || !isDue(s, now)) return "skipped";
  if (opts.expectVersion !== undefined && s.version !== opts.expectVersion) return "skipped";
  // Exactly-once, even if the timer and the daily sweep race.
  const claimed = await chatRedis().set(`${SENT_PREFIX}${s.sessionId}:${s.segment}`, now, { nx: true, ex: KEEP_SECONDS });
  if (claimed !== "OK") return "skipped";
  await putChatSession({ ...s, sent: true });
  await sendChatTranscripts({
    sessionId: s.sessionId,
    visitorName: s.name,
    visitorEmail: s.email,
    visitorCompany: s.company,
    messages: s.messages,
    escalated: s.escalated,
    sendToVisitor: s.sendCopy,
    autoClosed: true,
  });
  return "sent";
}

/** Safety net for the free Vercel plan (one cron run a day): close every chat that has been silent 15+ minutes. */
export async function sweepPendingChats(now = Date.now()): Promise<{ checked: number; sent: number }> {
  const ids = (await chatRedis().zrange<string[]>(PENDING_KEY, 0, now - CHAT_IDLE_MS, { byScore: true, offset: 0, count: SWEEP_BATCH })) ?? [];
  let sent = 0;
  for (const id of ids) {
    if ((await finalizeChatIfDue(id, { now }).catch(() => "skipped")) === "sent") sent++;
  }
  return { checked: ids.length, sent };
}
