import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getClientIp, rateLimit } from "../../lib/rate-limit";
import { chatRequestSchema } from "../../lib/chat-schema";
import { SYSTEM_PROMPT } from "../../lib/chat-knowledge";
import { syncChatLeadToHubSpot } from "../../lib/hubspot";

/**
 * POST /api/chat — backend for the ORAGROL chat widget
 * (app/components/ChatWidget.tsx). Two things happen here, chosen by
 * `mode` in the request body:
 *
 * mode "reply": a normal visitor message. Calls the OpenAI API with
 * SYSTEM_PROMPT (chat-knowledge.ts) plus recent conversation history,
 * and returns a real generated reply. The widget's OWN local
 * urgent/human-request detector runs client-side BEFORE this is ever
 * called for those cases (see ChatWidget.tsx) — safety-critical
 * escalation wording never depends on the LLM cooperating.
 *
 * mode "escalate": the widget already detected an urgent/human-request
 * message and collected the visitor's name + email. This sends a real,
 * immediate email to CONTACT_TO_EMAIL (via Resend, same as
 * /api/contact and /api/cyber-health) and best-effort syncs the lead to
 * HubSpot — never a fake "I've notified the team" with nothing actually
 * sent.
 *
 * Required env vars: `OPENAI_API_KEY` for mode "reply";
 * `RESEND_API_KEY` + `CONTACT_TO_EMAIL` for mode "escalate".
 * `HUBSPOT_ACCESS_TOKEN` is optional (best-effort CRM sync, never
 * blocks a response). Missing required vars are always a real,
 * reported failure — never a silently faked success.
 */

const OPENAI_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-5-mini";

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[/api/chat] Missing OPENAI_API_KEY — cannot generate a reply. See .env.local.example.");
    return NextResponse.json(
      { ok: false, error: "Chat isn't fully configured yet. Please try again shortly or use the contact form." },
      { status: 500 },
    );
  }

  const openaiMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...data.messages.map((m) => ({
      role: m.role === "visitor" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    })),
  ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: openaiMessages,
        temperature: 0.4,
        max_tokens: 220,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[/api/chat] OpenAI error: ${res.status} ${text}`.slice(0, 500));
      return NextResponse.json(
        { ok: false, error: "Could not generate a reply. Please try again." },
        { status: 502 },
      );
    }

    const json = await res.json();
    const reply: string | undefined = json?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      console.error("[/api/chat] OpenAI response had no message content:", JSON.stringify(json).slice(0, 500));
      return NextResponse.json(
        { ok: false, error: "Could not generate a reply. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error("[/api/chat] Unexpected error calling OpenAI:", err);
    return NextResponse.json({ ok: false, error: "Could not generate a reply. Please try again." }, { status: 500 });
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
    console.error(
      `[/api/chat] Missing required env var(s) for escalation: ${[
        !apiKey && "RESEND_API_KEY",
        !toEmail && "CONTACT_TO_EMAIL",
      ]
        .filter(Boolean)
        .join(", ")}.`,
    );
    return NextResponse.json(
      { ok: false, error: "Could not send this to the team right now. Please email us directly instead." },
      { status: 500 },
    );
  }

  const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Oragrol Contact Form <onboarding@resend.dev>";
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
      console.error("[/api/chat] Resend error sending escalation:", error);
      return NextResponse.json({ ok: false, error: "Could not send this to the team. Please try again." }, { status: 502 });
    }
  } catch (err) {
    console.error("[/api/chat] Unexpected error sending escalation email:", err);
    return NextResponse.json({ ok: false, error: "Could not send this to the team. Please try again." }, { status: 500 });
  }

  // Best-effort CRM sync — never blocks the response; the real,
  // reported success above is the email actually sending.
  try {
    const hubspotResult = await syncChatLeadToHubSpot({
      name: data.name,
      email: data.email,
      reason: data.reason,
      transcript,
    });
    if (!hubspotResult.ok || hubspotResult.error) {
      console.error("[/api/chat] HubSpot sync issue:", hubspotResult.error);
    }
  } catch (err) {
    console.error("[/api/chat] HubSpot sync threw unexpectedly:", err);
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
