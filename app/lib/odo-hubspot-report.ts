// ORAGROL ODO — attach the finished PDF report to the contact's HubSpot record
//
// Wired 2026-09-30 per Mohammad's decision: every ODO contact in HubSpot
// should carry the actual report, not just a status field.
//
// Reuses the exact same PDF renderer the client-facing download uses
// (odo-report-pdf.tsx / GET /api/odo/scan/report?format=pdf), so the copy
// that lands in HubSpot is byte-for-byte what a downloaded report looks
// like. This also closes a real gap: the report route only ever serves the
// PDF from the session stored in Redis, which expires after 48h. Without
// this, the report becomes unrecoverable the moment that session expires.
// Once it's uploaded here, it lives in HubSpot's file storage permanently,
// independent of the scan session's TTL.
//
// Best-effort throughout, matching every other ODO->HubSpot call in this
// codebase — a failure here must never block or fail the scan itself.

import QRCode from "qrcode";
import { renderToBuffer } from "@react-pdf/renderer";
import { OdoReportPdf } from "./odo-report-pdf";
import type { OdoReport } from "./odo-report";
// Same approved cover/closing photos as the Cyber Health PDF — see
// odo-report-pdf.tsx's cover/closing-art comment and report/route.ts.
import { getCyberHealthReportPhotos } from "./cyber-health-photos";

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

// Same ORAGROL QR target used across the client-facing PDF (report/route.ts).
const CONTACT_URL = "https://orgro.ca/contact";

async function uploadFileToHubSpot(buffer: Buffer, filename: string): Promise<string | null> {
  if (!HUBSPOT_TOKEN) return null;
  try {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(buffer)], { type: "application/pdf" }), filename);
    form.append(
      "options",
      JSON.stringify({ access: "PRIVATE", overwrite: false, duplicateValidationStrategy: "NONE" })
    );
    form.append("folderPath", "/ODO Reports");

    const res = await fetch("https://api.hubapi.com/files/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` },
      body: form,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id?: string };
    return data.id ?? null;
  } catch {
    return null;
  }
}

async function addNoteWithAttachment(contactId: string, fileId: string, body: string): Promise<void> {
  if (!HUBSPOT_TOKEN || !contactId) return;
  try {
    const noteRes = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
      method: "POST",
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: {
          hs_note_body: body,
          hs_timestamp: Date.now().toString(),
          hs_attachment_ids: fileId,
        },
      }),
    });
    if (!noteRes.ok) return;
    const note = (await noteRes.json()) as { id: string };
    await fetch(
      `https://api.hubapi.com/crm/v3/objects/notes/${note.id}/associations/contact/${contactId}/note_to_contact`,
      { method: "PUT", headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
  } catch {
    /* best effort */
  }
}

/**
 * Renders the finished report to PDF, uploads it to HubSpot's file storage
 * under /ODO Reports, and attaches it to the contact via a timeline note.
 * Call this from runEvaluation with .catch(() => {}) same as the other
 * best-effort HubSpot calls there — never let this block scan completion.
 */
export async function attachReportPdfToHubSpot(
  hubspotContactId: string | null,
  report: OdoReport,
  serviceMatchesSummary: string
): Promise<void> {
  if (!hubspotContactId || !HUBSPOT_TOKEN) return;
  try {
    const qrDataUri = await QRCode.toDataURL(CONTACT_URL, { margin: 1, width: 200 }).catch(() => undefined);
    const { cover: coverImageUri, closing: closingImageUri } = getCyberHealthReportPhotos();
    const pdfBuffer = await renderToBuffer(OdoReportPdf({ report, qrDataUri, coverImageUri, closingImageUri }));
    const filename = `ORAGROL_ODO_${report.reference}.pdf`;

    const fileId = await uploadFileToHubSpot(Buffer.from(pdfBuffer), filename);
    if (!fileId) return;

    const noteBody =
      `ODO scan report — ${filename}\n` +
      `Condition: ${report.condition}\n` +
      `Services flagged: ${serviceMatchesSummary || "none"}`;

    await addNoteWithAttachment(hubspotContactId, fileId, noteBody);
  } catch {
    /* best effort — never blocks scan completion */
  }
}
