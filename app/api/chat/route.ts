import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { getClientIp, rateLimit } from "../../lib/rate-limit";
import { chatRequestSchema } from "../../lib/chat-schema";
import { SYSTEM_PROMPT } from "../../lib/chat-knowledge";
import { syncChatLeadToHubSpot } from "../../lib/hubspot";

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
  return handleReply(parsed.data);
}

async function handleReply(data: { messages: { role: "visitor" | "oragrol"; text: string }[] }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[/api/chat] Missing ANTHROPIC_API_KEY");
    return NextResponse.json(
      { ok: false, error: "Chat isn't fully configured yet. Please email us at info@orgro.ca." },
      { status: 500 },
    );
  }

  // Convert message history to Anthropic format
  const messages: Anthropic.MessageParam[] = data.messages.map((m) => ({
    role: m.role === "visitor" ? "user" : "assistant",
    content: m.text,
  }));

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim()
        : null;

    if (!reply) {
      console.error("[/api/chat] Anthropic response had no text content");
      return NextResponse.json(
        { ok: false, error: "Could not generate a reply. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, reply });
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
    await syncChatLeadToHubSpot({ name: data.name, email: data.email, reason: data.reason, transcript });
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
