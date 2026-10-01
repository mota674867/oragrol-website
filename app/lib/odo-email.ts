// ORAGROL ODO — internal admin copy of the finished report PDF, emailed
// straight to Mohammad.
//
// Added 2026-10-01 as an explicit stop-gap: ZM77 (the intended review/
// approval agent) doesn't exist yet, and the "only attach to HubSpot after
// Mohammad's approval" rework is deliberately on hold. Until either of
// those exists, this is the fastest real way for him to see a finished
// report without digging through sessionStorage/DevTools for a session_id.
//
// This is NOT client-facing delivery. Every report is still
// "draft_pending_review" per §28 — nothing here goes to the visitor, and
// this file has no code path that could ever send to anything but the
// fixed internal address below.
//
// Reuses the exact same Resend wiring already live in production for the
// My Scope PDF flow (see scope-email.ts) — same RESEND_API_KEY /
// CONTACT_FROM_EMAIL env vars, no new provider setup needed. Also reuses
// the exact same PDF renderer the client-facing download and the HubSpot
// attach use (odo-report-pdf.tsx), so this is byte-for-byte what
// GET /api/odo/scan/report?format=pdf would return.
//
// Best-effort and fire-and-forget by design, matching every other
// post-evaluation side effect in odo-pipeline.ts — a mail/PDF hiccup here
// must never fail or block an otherwise-successful scan.

import { Resend } from "resend";
import QRCode from "qrcode";
import { renderToBuffer } from "@react-pdf/renderer";
import { OdoReportPdf } from "./odo-report-pdf";
import type { OdoReport } from "./odo-report";
// Same approved cover/closing photos as the Cyber Health PDF — see
// odo-report-pdf.tsx's cover/closing-art comment and report/route.ts.
import { getCyberHealthReportPhotos } from "./cyber-health-photos";

const CONTACT_URL = "https://orgro.ca/contact";

// Temporary and intentionally hardcoded rather than env-configurable — this
// whole function exists to solve one specific, named problem (Mohammad
// needs to see the PDF right now) and should be deleted once ZM77 or the
// approval-gated HubSpot flow takes over report visibility. Override via
// ODO_ADMIN_EMAIL only if that address ever needs to change before then.
const ODO_ADMIN_EMAIL = process.env.ODO_ADMIN_EMAIL || "mota6748@gmail.com";

export type SendOdoAdminEmailResult =
  | { state: "sent"; providerId: string }
  | { state: "skipped"; reason: string }
  | { state: "failed"; error: string };

export async function sendOdoAdminReportEmail(params: {
  report: OdoReport;
  companyName: string;
  visitorEmail: string;
  sessionId: string;
  condition: "complete" | "insufficient_data";
}): Promise<SendOdoAdminEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey) return { state: "skipped", reason: "RESEND_API_KEY is not configured." };
  if (!from) return { state: "skipped", reason: "CONTACT_FROM_EMAIL is not configured." };

  try {
    const qrDataUri = await QRCode.toDataURL(CONTACT_URL, { margin: 1, width: 200 }).catch(() => undefined);
    const { cover: coverImageUri, closing: closingImageUri } = getCyberHealthReportPhotos();
    const pdf = await renderToBuffer(OdoReportPdf({ report: params.report, qrDataUri, coverImageUri, closingImageUri }));

    // ADDED 2026-10-01, UPDATED same day for the Phase 2 rebuild — surfaces,
    // on every scan, whether question selection actually ran through
    // Claude's dynamic interviewer (odo-interviewer.ts) or silently fell
    // back to the old fixed-question logic (odo-questions.ts's
    // nextQuestion(), Jev-scored or fixed-priority). This is the direct,
    // checkable answer to "ODO repeats the same question for every
    // business" — rather than Mohammad having to take my word for whether
    // the interviewer is configured in production, he can read it off the
    // very next scan. 0 Claude-sourced questions across several different
    // businesses in a row means ANTHROPIC_API_KEY is missing or the
    // interviewer is erroring on every call (writeNextQuestion() in
    // odo-interviewer.ts returns the old nextQuestion()'s result on any
    // failure and falls back silently by design — safe for the visitor, but
    // invisible unless logged somewhere like this). "jev"/"fallback" here
    // mean the OLD mechanism ran (odo-interviewer.ts's own fallback path) —
    // not Jev picking questions in normal operation, which Phase 2 already
    // ended.
    const methods = params.report.internal.questionMethod;
    const counts: Record<string, number> = { claude_custom: 0, claude_library: 0, jev: 0, fallback: 0 };
    for (const m of methods) counts[m] = (counts[m] ?? 0) + 1;
    const claudeCount = counts.claude_custom + counts.claude_library;
    const questionMethodLine = methods.length
      ? `Question selection: ${methods.length} asked — ${counts.claude_custom} Claude-written, ${counts.claude_library} Claude reused from the library, ${counts.jev} via legacy Jev scoring, ${counts.fallback} via fixed fallback order${claudeCount === 0 ? "  ⚠ Claude never picked a single question this scan — check ANTHROPIC_API_KEY / interviewer errors; the whole scan ran on the old fixed-question logic" : ""}`
      : `Question selection: 0 questions asked (research alone was sufficient)`;

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [ODO_ADMIN_EMAIL],
      replyTo: from,
      subject: `ODO scan report — ${params.companyName} (${params.report.reference})`,
      text: [
        `A new ODO scan just finished.`,
        ``,
        `Company: ${params.companyName}`,
        `Visitor email: ${params.visitorEmail}`,
        `Condition: ${params.condition}`,
        `Session ID: ${params.sessionId}`,
        `Report reference: ${params.report.reference}`,
        questionMethodLine,
        ``,
        `This is the draft report, pending your review — it has not been sent to the client. The PDF is attached.`,
      ].join("\n"),
      attachments: [{ filename: `ODO_Report_${params.report.reference}.pdf`, content: pdf }],
    });

    if (error) return { state: "failed", error: `Resend error: ${error.message ?? JSON.stringify(error)}`.slice(0, 500) };
    if (!data?.id) return { state: "failed", error: "Resend returned no email id." };
    return { state: "sent", providerId: data.id };
  } catch (err) {
    return { state: "failed", error: `Email send threw: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500) };
  }
}
