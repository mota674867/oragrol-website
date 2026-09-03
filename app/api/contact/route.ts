import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactEnquirySchema, generalInquirySchema } from "../../lib/contact-schema";
import { getClientIp, rateLimit } from "../../lib/rate-limit";
import { SITE_DOMAIN } from "../../lib/site-config";

/**
 * POST /api/contact — handles two forms that both live under "Contact":
 * GPT's redesigned Contact page enquiry form (app/contact/contact-client.tsx,
 * validated by `contactEnquirySchema`) and the older "General Inquiry"
 * component (`generalInquirySchema`) kept for back-compat even though it's
 * currently unused by any routed page. The request body is matched against
 * `contactEnquirySchema` first (that's the live form), falling back to
 * `generalInquirySchema`.
 *
 * Sends a real email via Resend (no n8n/HubSpot integration, per explicit
 * instruction) — chosen over SendGrid for less config: one API key, one
 * `resend.emails.send()` call, no separate sender-identity/template setup
 * required to send a first test email through Resend's own
 * `onboarding@resend.dev` sender.
 *
 * Required env vars: `RESEND_API_KEY` and `CONTACT_TO_EMAIL` (both
 * secret — gitignored via `.env*` already in `.gitignore`, never
 * hardcoded here). `CONTACT_TO_EMAIL` has no fallback: orgro.ca's own
 * mailbox isn't active yet (Cloudflare Email Routing pending), so a
 * placeholder @orgro.ca or @oragrolglobal.com address would silently
 * bounce every submission. Until that mailbox is live, set
 * `CONTACT_TO_EMAIL` to a real inbox you control (see
 * `.env.local.example`). Missing it is treated exactly like a missing
 * `RESEND_API_KEY` — a real, reported failure, never a silent send into
 * the void.
 *
 * This route is the ONLY place the real send happens — the client
 * component never calls Resend directly (no API key in the browser
 * bundle), and never fakes a success state; a failed/misconfigured send
 * always surfaces as a real error to the caller.
 */

// Resend's own sandbox sender — works out of the box with just an API
// key, no domain verification needed, which is why it's the default.
// Once a sending domain is verified in Resend, set CONTACT_FROM_EMAIL to
// an address on it (e.g. `Oragrol Contact Form <contact@${SITE_DOMAIN}>`)
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

function row(label: string, value: string | undefined) {
  if (!value) return "";
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
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

  const enquiry = contactEnquirySchema.safeParse(body);

  let replyTo: string;
  let subject: string;
  let html: string;

  if (enquiry.success) {
    const d = enquiry.data;
    replyTo = d.email;
    subject = `New ${d.conversation.toLowerCase()} enquiry from ${d.firstName} ${d.lastName}`;
    html = [
      row("Name", `${d.firstName} ${d.lastName}`),
      row("Email", d.email),
      row("Company", d.company),
      row("Job title", d.jobTitle),
      row("Company size", d.companySize),
      row("Conversation", d.conversation),
      row("Preferred contact method", d.contactMethod),
      row("Preferred time", d.preferredTime),
      row("Scope attached", d.scopeSummary),
      `<p><strong>What they'd like to achieve:</strong></p><p>${escapeHtml(d.context).replace(/\n/g, "<br />")}</p>`,
    ]
      .filter(Boolean)
      .join("\n");
  } else {
    const general = generalInquirySchema.safeParse(body);
    if (!general.success) {
      return NextResponse.json(
        { ok: false, error: general.error.issues[0]?.message ?? "Invalid submission." },
        { status: 400 },
      );
    }
    const d = general.data;
    replyTo = d.email;
    subject = `New general inquiry from ${d.name}`;
    html = [
      row("Name", d.name),
      row("Email", d.email),
      row("Company", d.company || "—"),
      `<p><strong>Message:</strong></p><p>${escapeHtml(d.message).replace(/\n/g, "<br />")}</p>`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) {
    // A missing key/recipient is a real, reportable failure — never
    // pretend the email sent when it didn't (explicit instruction: "do
    // not fake the submission"). Logged server-side with the exact env
    // var name(s) so whoever's running this can fix it immediately.
    console.error(
      `[/api/contact] Missing required env var(s): ${[
        !apiKey && "RESEND_API_KEY",
        !toEmail && "CONTACT_TO_EMAIL",
      ]
        .filter(Boolean)
        .join(", ")} — cannot send. See .env.local.example.`,
    );
    return NextResponse.json(
      { ok: false, error: `Email sending isn't configured yet. Please try again shortly or reach us via ${SITE_DOMAIN}.` },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo,
      subject,
      html: html.trim(),
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
