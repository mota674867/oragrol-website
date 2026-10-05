import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { getClientIp, rateLimit } from "../../lib/rate-limit";
import { chatRequestSchema } from "../../lib/chat-schema";
import { SYSTEM_PROMPT, HANDOFF_MARKER } from "../../lib/chat-knowledge";
import { chatCapReached, recordChatSpend, CHAT_CAP_REPLY } from "../../lib/chat-spend";
import { checkChatIpDaily } from "../../lib/odo-redis";
import { syncChatLeadToHubSpot } from "../../lib/hubspot";
import { saveChatTurn, markChatEscalated, type ChatContact } from "../../lib/chat-session";
import { scheduleChatSweep } from "../../lib/chat-qstash";

/**
 * POST /api/chat — ORAGROL chat widget backend
 *
 * mode "reply": visitor message → Anthropic Claude Sonnet → AI reply
 * mode "escalate": urgent/human-request detected client-side → email Mohammad
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY  — for mode "reply"
 *   RESEND_API_KEY + CONTACT_TO_EMAIL — for mode "escalate"
 *   HUBSPOT_ACCESS_TOKEN — optional, best-effort CRM sync
 */

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`chat:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  if (parsed.data.mode === "escalate") {
    return handleEscalate(parsed.data);
  }
  return handleReply(parsed.data, ip, new URL(request.url).origin);
}

function getBusinessHoursContext(): string {
  const now = new Date();
  const etHour = (now.getUTCHours() - 5 + 24) % 24;
  const etDay = now.toLocaleDateString("en-CA", { weekday: "long", timeZone: "America/Toronto" });
  const etTime = now.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/Toronto" });
  const utcDay = now.getUTCDay();
  const isWeekday = utcDay >= 1 && utcDay <= 5;
  const isBusinessHours = isWeekday && etHour >= 9 && etHour < 18;
  return isBusinessHours
    ? `\n\nCURRENT TIME CONTEXT: It is currently ${etDay} ${etTime} ET — business hours. A real person is available right now if needed.`
    : `\n\nCURRENT TIME CONTEXT: It is currently ${etDay} ${etTime} ET — outside business hours (Mon–Fri 9am–6pm ET). No one is available to respond live right now. If a visitor needs a person, tell them to use the contact page (/contact) or that the team will follow up next business day.`;
}

const MAX_VISITOR_CHARS = 1000;
const HISTORY_MESSAGES = 12;
const MAX_REPLY_TOKENS = 600;
const IP_DAILY_MESSAGES = 60;

async function handleReply(data: { messages: { role: "visitor" | "oragrol"; text: string }[]; sessionId?: string; contact?: ChatContact }, ip: string, origin: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[/api/chat] Missing ANTHROPIC_API_KEY");
    return NextResponse.json(
      { ok: false, error: "Chat isn't fully configured yet. Please use our contact page." },
      { status: 500 },
    );
  }

  const last = data.messages[data.messages.length - 1];
  if (last.role === "visitor" && last.text.length > MAX_VISITOR_CHARS) {
    return NextResponse.json({ ok: false, error: `Please keep each message under ${MAX_VISITOR_CHARS} characters.` }, { status: 400 });
  }

  // Daily per-IP ceiling (shared across serverless instances). Fails open on a Redis error.
  try {
    const daily = await checkChatIpDaily(ip, IP_DAILY_MESSAGES);
    if (!daily.ok) {
      return NextResponse.json({ ok: true, reply: CHAT_CAP_REPLY, handoff: true, capped: true });
    }
  } catch (err) {
    console.error("[/api/chat] IP daily check failed — failing open:", err);
  }

  // $5/day ceiling on the whole chat: stop answering, point to contact, email Mohammad once.
  if (await chatCapReached()) {
    return NextResponse.json({ ok: true, reply: CHAT_CAP_REPLY, handoff: true, capped: true });
  }

  // Only the most recent turns go to the model, so cost stays flat in long chats.
  const messages: Anthropic.MessageParam[] = data.messages.slice(-HISTORY_MESSAGES).map((m) => ({
    role: m.role === "visitor" ? "user" : "assistant",
    content: m.text,
  }));
  // The API requires the conversation to start with a user turn.
  while (messages.length > 1 && messages[0].role !== "user") messages.shift();

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: MAX_REPLY_TOKENS,
      temperature: 0.8,
      system: [
        // The big, stable knowledge block is cached (~90% cheaper on re-reads); the clock context after it changes every minute.
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        { type: "text", text: getBusinessHoursContext().trim() },
      ],
      messages,
    });

    void recordChatSpend({
      input: response.usage.input_tokens ?? 0,
      output: response.usage.output_tokens ?? 0,
      cacheRead: response.usage.cache_read_input_tokens ?? 0,
      cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
    });

    const raw =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim()
        : null;

    if (!raw) {
      console.error("[/api/chat] Anthropic response had no text content");
      return NextResponse.json(
        { ok: false, error: "Could not generate a reply. Please try again." },
        { status: 502 },
      );
    }

    // The hand-off marker is a hidden signal to the widget — never shown to the visitor.
    const handoff = raw.includes(HANDOFF_MARKER);
    const reply = raw.split(HANDOFF_MARKER).join("").trim();

    // Save the chat server-side and set the 15-minutes-of-silence close. Never blocks or fails the reply.
    if (data.sessionId && data.contact) {
      const { sessionId, contact } = data;
      try {
        const saved = await saveChatTurn({ sessionId, contact, requestMessages: data.messages, reply });
        void scheduleChatSweep(origin, sessionId, saved.version);
      } catch (err) {
        console.error("[/api/chat] Saving the chat failed (the reply still goes out):", err);
      }
    }

    return NextResponse.json({ ok: true, reply, handoff });
  } catch (err) {
    console.error("[/api/chat] Anthropic error:", err);
    return NextResponse.json(
      { ok: false, error: "Could not generate a reply. Please try again." },
      { status: 500 },
    );
  }
}

async function handleEscalate(data: {
  name: string;
  email: string;
  sessionId?: string;
  reason: "urgent" | "human-requested";
  transcript?: { role: "visitor" | "oragrol"; text: string }[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) {
    console.error("[/api/chat] Missing RESEND_API_KEY or CONTACT_TO_EMAIL for escalation");
    return NextResponse.json(
      { ok: false, error: "Could not send this to the team right now. Please email us directly." },
      { status: 500 },
    );
  }

  const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Oragrol <onboarding@resend.dev>";
  const transcript = data.transcript ?? [];
  const reasonLabel = data.reason === "urgent" ? "URGENT — possible incident" : "Visitor requested a human";

  const html = [
    `<p><strong>Chat escalation — ${reasonLabel}</strong></p>`,
    `<p><strong>Name:</strong> ${escapeHtml(data.name)} — <strong>Email:</strong> ${escapeHtml(data.email)}</p>`,
    transcript.length
      ? `<p><strong>Conversation:</strong></p><p>${transcript
          .map((m) => `${m.role === "visitor" ? "Visitor" : "ORAGROL"}: ${escapeHtml(m.text)}`)
          .join("<br />")}</p>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (data.sessionId) await markChatEscalated(data.sessionId).catch(() => {});

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: data.email,
      subject: `[Chat ${data.reason === "urgent" ? "URGENT" : "priority"}] ${data.name}`,
      html,
    });
    if (error) {
      console.error("[/api/chat] Resend error:", error);
      return NextResponse.json(
        { ok: false, error: "Could not send this to the team. Please try again." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[/api/chat] Escalation email error:", err);
    return NextResponse.json(
      { ok: false, error: "Could not send this to the team. Please try again." },
      { status: 500 },
    );
  }

  // Best-effort HubSpot sync
  try {
    await syncChatLeadToHubSpot({ name: data.name, email: data.email, reason: data.reason, transcript: [] });
  } catch (err) {
    console.error("[/api/chat] HubSpot sync error:", err);
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
