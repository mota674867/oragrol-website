import {
  claimJob,
  completeJob,
  scheduleRetry,
  markReconciliationRequired,
  getAction,
  getActionJobs,
  storePdf,
  getPdf,
  getOrCreateEmailIdempotency,
  recordEmailProviderId,
  addFollowUpJob,
  type ScopeJobRecord,
} from "./scope-store";
import ScopePdf, { scopePdfWouldOverflowTwoPages, type ScopePdfGroup } from "./scope-pdf";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { sendScopeClientEmail, sendScopeInternalEmail } from "./scope-email";
import { syncScopeContact, syncScopeNote, findScopeNoteByActionId, buildScopeNoteBody } from "./hubspot";

/**
 * Processes exactly one claimed job. Called by app/api/scope/retry
 * (a single jobId from a QStash push) — never loops over multiple jobs
 * itself, so one slow/stuck job can't block others; each gets its own
 * QStash message and its own lease.
 *
 * Lease duration: 5 minutes. Must comfortably exceed any single
 * external call this file makes (PDF render, one email send, one
 * HubSpot call) with real safety margin, per Section C ("external call
 * timeouts must fit within the lease with safety margin").
 */
const LEASE_MS = 5 * 60_000;

export async function processJob(jobId: string): Promise<{ outcome: string }> {
  const claim = await claimJob(jobId, LEASE_MS);
  if (!claim.claimed) {
    return { outcome: `not claimed: ${claim.reason}` };
  }
  const { owner, job } = claim;

  try {
    switch (job.type) {
      case "pdf_generation":
        await runPdfGeneration(job, owner);
        break;
      case "client_email":
        await runClientEmail(job, owner);
        break;
      case "internal_email":
        await runInternalEmail(job, owner);
        break;
      case "hubspot_contact":
        await runHubspotContact(job, owner);
        break;
      case "hubspot_note":
        await runHubspotNote(job, owner);
        break;
      default: {
        const exhaustiveCheck: never = job.type;
        throw new Error(`Unknown job type: ${exhaustiveCheck}`);
      }
    }
    return { outcome: "processed" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await scheduleRetry(jobId, owner, message);
    return { outcome: `failed, retry scheduled: ${message}` };
  }
}

function groupSelections(action: NonNullable<Awaited<ReturnType<typeof getAction>>>): ScopePdfGroup[] {
  const byArea = new Map<ScopePdfGroup["area"], ScopePdfGroup["items"]>();
  for (const sel of action.selections) {
    const list = byArea.get(sel.area) ?? [];
    list.push({ code: sel.code, name: sel.name });
    byArea.set(sel.area, list);
  }
  return Array.from(byArea.entries()).map(([area, items]) => ({ area, items }));
}

async function runPdfGeneration(job: ScopeJobRecord, owner: string): Promise<void> {
  const action = await getAction(job.actionId);
  if (!action) throw new Error(`Action ${job.actionId} not found`);

  const groups = groupSelections(action);

  // Section 10 PDF acceptance test: "no more than two pages ... no
  // missing codes/items." Checked BEFORE rendering, not discovered
  // after — matches scope-pdf.tsx's own exported guard rather than
  // re-deriving the same logic here.
  if (scopePdfWouldOverflowTwoPages(groups)) {
    // A genuine content-policy case per the PDF handoff, not a
    // transient failure — retrying won't change the outcome, so this
    // goes straight to manual attention rather than consuming the
    // normal backoff schedule pointlessly.
    await markReconciliationRequired(
      job.jobId,
      owner,
      `Selection (${action.selections.length} items) exceeds the two-page compact layout's real capacity.`,
    );
    return;
  }

  const qrDataUri = await QRCode.toDataURL("https://orgro.ca/contact", { margin: 1, width: 200 });
  const buffer = await renderToBuffer(
    ScopePdf({
      data: {
        company: action.company,
        name: action.name,
        phone: action.phone,
        email: action.email,
        date: new Date(action.createdAt).toLocaleDateString("en-CA", { day: "2-digit", month: "short", year: "numeric" }),
        reference: action.reference,
        groups,
      },
      contactQrSrc: qrDataUri,
      sample: false,
    }),
  );

  await storePdf(action.actionId, buffer);
  await completeJob(job.jobId, owner);
}

async function requirePdf(actionId: string): Promise<Buffer> {
  const pdf = await getPdf(actionId);
  if (!pdf) throw new Error(`PDF for action ${actionId} not yet generated — pdf_generation job must complete first`);
  return pdf;
}

async function runClientEmail(job: ScopeJobRecord, owner: string): Promise<void> {
  const action = await getAction(job.actionId);
  if (!action) throw new Error(`Action ${job.actionId} not found`);
  const pdf = await requirePdf(action.actionId);

  const idem = await getOrCreateEmailIdempotency(action.actionId, "client", action.payloadHash);
  const result = await sendScopeClientEmail({
    intent: action.intent,
    reference: action.reference,
    clientEmail: action.email,
    clientName: action.name,
    pdf,
    idempotencyKey: idem.idempotencyKey,
  });

  if (result.state === "failed") throw new Error(result.error);
  await recordEmailProviderId(action.actionId, "client", result.providerId);
  await completeJob(job.jobId, owner, result.providerId);
}

async function runInternalEmail(job: ScopeJobRecord, owner: string): Promise<void> {
  const action = await getAction(job.actionId);
  if (!action) throw new Error(`Action ${job.actionId} not found`);
  const pdf = await requirePdf(action.actionId);

  const idem = await getOrCreateEmailIdempotency(action.actionId, "internal", action.payloadHash);
  const result = await sendScopeInternalEmail({
    intent: action.intent,
    reference: action.reference,
    client: { name: action.name, email: action.email, phone: action.phone, company: action.company },
    items: action.selections,
    sourcePath: action.sourcePath,
    context: action.context,
    timeframe: action.timeframe,
    submittedAt: action.createdAt,
    pdf,
    idempotencyKey: idem.idempotencyKey,
  });

  if (result.state === "failed") throw new Error(result.error);
  await recordEmailProviderId(action.actionId, "internal", result.providerId);
  await completeJob(job.jobId, owner, result.providerId);
}

async function runHubspotContact(job: ScopeJobRecord, owner: string): Promise<void> {
  const action = await getAction(job.actionId);
  if (!action) throw new Error(`Action ${job.actionId} not found`);

  const result = await syncScopeContact({
    name: action.name,
    email: action.email,
    phone: action.phone,
    company: action.company,
  });
  if (result.state === "failed") throw new Error(result.error);

  await completeJob(job.jobId, owner, result.contactId);
  // Only now — with a REAL, confirmed contact ID — does the note job
  // get created. Never created up front, so it can never race ahead of
  // an ID that doesn't exist yet (Section C).
  await addFollowUpJob(action.actionId, "hubspot_note");
}

async function runHubspotNote(job: ScopeJobRecord, owner: string): Promise<void> {
  const action = await getAction(job.actionId);
  if (!action) throw new Error(`Action ${job.actionId} not found`);

  const contactJob = (await getActionJobs(action.actionId)).find((j) => j.type === "hubspot_contact");
  const contactId = contactJob?.providerId;
  if (!contactId) throw new Error(`hubspot_contact has no recorded contact id for action ${action.actionId} yet`);

  const noteBody = buildScopeNoteBody({
    actionId: action.actionId,
    reference: action.reference,
    intent: action.intent,
    submittedAt: action.createdAt,
    sourcePath: action.sourcePath,
    client: { name: action.name, email: action.email, phone: action.phone, company: action.company },
    items: action.selections,
    context: action.context,
    timeframe: action.timeframe,
    disclosureVersion: action.disclosureVersion,
    acknowledgedAt: action.acknowledgedAt,
  });

  const result = await syncScopeNote(contactId, noteBody);
  if (result.state === "created") {
    await completeJob(job.jobId, owner, result.noteId);
    return;
  }

  // Section E: an ambiguous/lost response is NOT the same as a
  // confirmed failure — check whether the note actually landed before
  // deciding this needs a retry or a human.
  const existingNoteId = await findScopeNoteByActionId(contactId, action.actionId);
  if (existingNoteId) {
    await completeJob(job.jobId, owner, existingNoteId);
    return;
  }

  throw new Error(result.error);
}
