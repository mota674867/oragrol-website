import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generalInquirySchema } from "../../lib/contact-schema";
import { getClientIp, rateLimit } from "../../lib/rate-limit";

/**
 * POST /api/contact — General Inquiry form submission (Contact page,
 * "Not sure which path fits? Just ask."). Sends a real email via Resend
 * (no n8n/HubSpot integration, per explicit instruction) — chosen over
 * SendGrid for less config: one API key, one `resend.emails.send()`
 * call, no separate sender-identity/template setup required to send a
 * first test email through Resend's own `onboarding@resend.dev` sender.
 *
 * Required env var: `RESEND_API_KEY` (secret — get one at
 * https://resend.com/api-keys, gitignored via `.env*` already in
 * `.gitignore`; never hardcoded here). See `.env.local.example` in the
 * repo root for the full list, including the two optional overrides
 * below.
 *
 * This route is the ONLY place the real send happens — the client
 * component never calls Resend directly (no API key in the browser
 * bundle), and never fakes a success state; a failed/misconfigured send
 * always surfaces as a real error to the caller.
 */

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info@oragrolglobal.com";
// Resend's own sandbox sender — works out of the box with just an API
// key, no domain verification needed, which is why it's the default.
// Once a sending domain is verified in Resend, set CONTACT_FROM_EMAIL to
// an address on it (e.g. "Oragrol Contact Form <contact@oragrolglobal.com>")
// so the "From" address matches the brand instead of Resend's own domain.
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Oragrol Contact Form <onboarding@resend.dev>";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = generalInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 },
    );
  }
  const { name, email, company, message } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // A missing key is a real, reportable failure — never pretend the
    // email sent when it didn't (explicit instruction: "do not fake the
    // submission"). Logged server-side with the exact env var name so
    // whoever's running this can fix it immediately.
    console.error(
      "[/api/contact] RESEND_API_KEY is not set — cannot send. Add it to .env.local (see .env.local.example).",
    );
    return NextResponse.json(
      { ok: false, error: "Email sending isn't configured yet. Please email info@oragrolglobal.com directly." },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New general inquiry from ${name}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company || "—")}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `.trim(),
    });

    if (error) {
      console.error("[/api/contact] Resend returned an error:", error);
      return NextResponse.json({ ok: false, error: "Could not send your message. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error("[/api/contact] Unexpected error sending email:", err);
    return NextResponse.json({ ok: false, error: "Could not send your message. Please try again." }, { status: 500 });
  }
}
