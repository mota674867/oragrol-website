// GET /api/odo/scan/report?session_id=...[&format=pdf]
//
// Returns the finished ODO report — JSON by default (full report, including
// `internal`, for Mohammad/ZM77 review), or the client-facing PDF with
// ?format=pdf (report.client/summary/headline/findings/swot/priorities/
// coverage/attributions ONLY — see odo-report-pdf.tsx, which never
// references `internal`).
//
// STORAGE — there is no Postgres/S3 provisioned for ODO yet, so the report
// is generated once at the end of evaluation (odo-pipeline.ts's
// runEvaluation) and stored on the session itself in Redis, same 48h TTL as
// everything else about the scan. The session_id is the same unguessable
// capability /api/odo/scan/status and /events already key off — nothing new
// to protect here, and nothing to build until report retention needs to
// outlive the 48h session window.
//
// Every report is "draft_pending_review" (§28 approval gate) regardless of
// which format is requested — this route only lets it be SEEN, not sent to
// the prospect. Nothing here emails or publishes anything.

import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSession } from "@/app/lib/odo-redis";
import { renderToBuffer } from "@react-pdf/renderer";
import { OdoReportPdf } from "@/app/lib/odo-report-pdf";
import type { OdoReport } from "@/app/lib/odo-report";
// Reuses the same approved monochrome cover/closing photos already shipped
// for the Cyber Health PDF (Mohammad, 2026-10-01: "both photo file are
// available on cyberhealth pdf report, we use them same there") — same two
// files, same loader, no new asset.
import { getCyberHealthReportPhotos } from "@/app/lib/cyber-health-photos";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

// Same ORAGROL QR target used across the other client-facing PDFs
// (scope-worker.ts/scope-pdf.tsx) — one consistent "talk to a human" link,
// per Mohammad's instruction to reuse ORAGROL's standard QR code.
const CONTACT_URL = "https://orgro.ca/contact";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ code: "missing_session_id" }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const session = await getSession(sessionId).catch(() => null);
  if (!session) {
    return NextResponse.json({ code: "session_not_found" }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const report = (session.findings as Record<string, unknown> | undefined)?._report as OdoReport | undefined;
  if (!report) {
    const pending = session.status === "researching" || session.status === "questioning" || session.status === "evaluating";
    return NextResponse.json(
      { code: pending ? "not_ready" : "no_report", status: session.status },
      { status: pending ? 202 : 404, headers: NO_STORE_HEADERS }
    );
  }

  const format = req.nextUrl.searchParams.get("format");
  if (format === "pdf") {
    const qrDataUri = await QRCode.toDataURL(CONTACT_URL, { margin: 1, width: 200 }).catch(() => undefined);
    const { cover: coverImageUri, closing: closingImageUri } = getCyberHealthReportPhotos();
    const buffer = await renderToBuffer(OdoReportPdf({ report, qrDataUri, coverImageUri, closingImageUri }));
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        ...NO_STORE_HEADERS,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ORAGROL_ODO_${report.reference}.pdf"`,
      },
    });
  }

  return NextResponse.json(report, { status: 200, headers: NO_STORE_HEADERS });
}
