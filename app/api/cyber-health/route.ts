import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { Resend } from "resend";
import { CyberHealthPdf } from "../../cyber-health/pdf-report";
import { getClientIp, rateLimit } from "../../lib/rate-limit";
import { buildCyberHealthReport } from "../../lib/cyber-health-report";
import { cyberHealthSubmissionSchema } from "../../lib/cyber-health-schema";
import { syncCyberHealthLeadToHubSpot } from "../../lib/hubspot";
import { SITE_URL } from "../../lib/site-config";

/**
 * POST /api/cyber-health — the Cyber Health assessment's real completion
 * step (app/cyber-health/cyber-health-client.tsx, fired once someone
 * reaches the result screen). Recomputes the score/report entirely
 * server-side from the raw submission (never trusts the client's
 * computed score — see cyber-health-report.ts), generates the branded
 * PDF report, and:
 *   1. emails it to the person who completed the assessment (the
 *      primary deliverable — this is what "success" means here), and
 *   2. emails the full lead + report to CONTACT_TO_EMAIL for follow-up.
 * Also best-effort syncs the lead into HubSpot (see lib/hubspot.ts) —
 * a CRM hiccup never blocks the client's report from sending.
 *
 * Required env vars: `RESEND_API_KEY` and `CONTACT_TO_EMAIL` (same as
 * /api/contact — no fallback/default, a placeholder address would
 * silently swallow every submission). `HUBSPOT_ACCESS_TOKEN` is
 * optional; without it, CRM sync is skipped and logged, never blocking
 * the response.
 */

const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Oragrol Contact Form <onboarding@resend.dev>";
// No live booking link yet (explicit, as of this build) — the CTA in the
// PDF and the QR code both point at the Contact page instead of a
// placeholder/broken booking URL. Swap this for a real scheduling link
// (Calendly or similar) once one exists — see DECISIONS.md.
const BOOKING_URL = `${SITE_URL}/contact`;

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
  const limited = rateLimit(`cyber-health:${ip}`, { limit: 3, windowMs: 30 * 60 * 1000 });
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

  const parsed = cyberHealthSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) {
    console.error(
      `[/api/cyber-health] Missing required env var(s): ${[
        !apiKey && "RESEND_API_KEY",
        !toEmail && "CONTACT_TO_EMAIL",
      ]
        .filter(Boolean)
        .join(", ")} — cannot send. See .env.local.example.`,
    );
    return NextResponse.json(
      { ok: false, error: "Report delivery isn't configured yet. Please try again shortly." },
      { status: 500 },
    );
  }

  let report;
  try {
    report = buildCyberHealthReport(parsed.data);
  } catch (err) {
    console.error("[/api/cyber-health] Failed to build report:", err);
    return NextResponse.json({ ok: false, error: "Could not process your assessment. Please try again." }, { status: 500 });
  }

  let qrDataUri: string | null = null;
  try {
    qrDataUri = await QRCode.toDataURL(BOOKING_URL, { margin: 1, width: 200 });
  } catch (err) {
    console.error("[/api/cyber-health] QR code generation failed (non-fatal):", err);
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(CyberHealthPdf({ report, qrDataUri, bookingUrl: BOOKING_URL }));
  } catch (err) {
    console.error("[/api/cyber-health] PDF generation failed:", err);
    return NextResponse.json({ ok: false, error: "Could not generate your report. Please try again." }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const filename = `Oragrol-Cyber-Health-Report-${report.clientReference}.pdf`;
  const { profile } = report;

  // 1) Client's own copy — the primary deliverable. A failure here is a
  // real, reported failure (never a fake success).
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: profile.email,
      replyTo: toEmail,
      subject: `Your Cyber Health Assessment Report — ${report.score}/100`,
      html: `
        <p>Hi ${escapeHtml(profile.name.split(" ")[0] || profile.name)},</p>
        <p>Thanks for completing the ORAGROL Global Cyber Health Assessment for <strong>${escapeHtml(profile.company)}</strong>. Your report is attached.</p>
        <p><strong>Cyber Health Score:</strong> ${report.score}/100 (${escapeHtml(report.tier)} risk)</p>
        <p>If you'd like to walk through the findings with our team, just reply to this email or visit <a href="${BOOKING_URL}">${BOOKING_URL}</a>.</p>
        <p>— ORAGROL Global</p>
      `.trim(),
      attachments: [{ filename, content: pdfBuffer }],
    });
    if (error) {
      console.error("[/api/cyber-health] Resend error sending client report:", error);
      return NextResponse.json({ ok: false, error: "Could not send your report. Please try again." }, { status: 502 });
    }
  } catch (err) {
    console.error("[/api/cyber-health] Unexpected error sending client report:", err);
    return NextResponse.json({ ok: false, error: "Could not send your report. Please try again." }, { status: 500 });
  }

  // 2) Lead notification, to CONTACT_TO_EMAIL — secondary to the client
  // delivery above, but never silently dropped: any failure here is
  // logged loudly server-side even though the client's request still
  // succeeds (their report already sent).
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: profile.email,
      subject: `New Cyber Health lead: ${profile.company} (${report.score}/100, ${report.tier} risk)`,
      html: `
        <p><strong>Company:</strong> ${escapeHtml(profile.company)}</p>
        <p><strong>Contact:</strong> ${escapeHtml(profile.name)} — ${escapeHtml(profile.email)} — ${escapeHtml(profile.phone)}</p>
        <p><strong>Industry:</strong> ${escapeHtml(profile.industry)} · <strong>Size:</strong> ${escapeHtml(profile.employees)} · <strong>Platform:</strong> ${escapeHtml(profile.platform)}</p>
        <p><strong>Score:</strong> ${report.score}/100 — <strong>Risk tier:</strong> ${escapeHtml(report.tier)} — <strong>Recommended package:</strong> ${escapeHtml(report.recommendedPackage)}</p>
        <p><strong>Client reference:</strong> ${escapeHtml(report.clientReference)} — <strong>Report ID:</strong> ${escapeHtml(report.reportId)}</p>
        <p><strong>Top risks:</strong></p>
        <ul>${report.topRisks.map((f) => `<li>[${escapeHtml(f.severity)}] ${escapeHtml(f.title)}</li>`).join("") || "<li>None — all areas scored above the healthy threshold.</li>"}</ul>
        <p>Full report attached.</p>
      `.trim(),
      attachments: [{ filename, content: pdfBuffer }],
    });
    if (error) {
      console.error("[/api/cyber-health] Resend error sending lead notification (client report already sent successfully):", error);
    }
  } catch (err) {
    console.error("[/api/cyber-health] Unexpected error sending lead notification (client report already sent successfully):", err);
  }

  // 3) HubSpot sync — best-effort, never blocks the response's success.
  // Awaited (not fire-and-forget): a serverless function can be frozen
  // the instant it returns, so an un-awaited call here risks never
  // actually completing.
  try {
    const hubspotResult = await syncCyberHealthLeadToHubSpot(report);
    if (!hubspotResult.ok || hubspotResult.error) {
      console.error("[/api/cyber-health] HubSpot sync issue:", hubspotResult.error);
    }
  } catch (err) {
    console.error("[/api/cyber-health] HubSpot sync threw unexpectedly:", err);
  }

  return NextResponse.json({ ok: true, reportId: report.reportId, clientReference: report.clientReference });
}
